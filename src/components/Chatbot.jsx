import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Mic, MicOff, Power, Volume2, Type } from 'lucide-react';
import { useLiveAPIContext, LiveAPIProvider } from '../contexts/LiveAPIContext';
import { AudioRecorder } from '../lib/audio-recorder';
import { supabase } from '../supabaseClient';
import { useAuthStore } from '../store/authStore';

// The inner component that handles the chat interface and logic
const ChatbotContent = () => {
  // State for toggling the chat window
  const [isOpen, setIsOpen] = useState(false);
  // State for storing chat messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am your AI fitness assistant. Click the power button to connect, then the microphone to speak with me!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  // Ref to scroll to the bottom of the message list
  const messagesEndRef = useRef(null);
  // Get the current user from the auth store
  const { user } = useAuthStore();
  
  // Get the live API client and state from the context
  const { client, connected, connect, disconnect, volume, setConfig, config } = useLiveAPIContext();
  // State for recording status
  const [isRecording, setIsRecording] = useState(false);
  // Ref for the audio recorder
  const audioRecorderRef = useRef(new AudioRecorder());
  // State for text input
  const [input, setInput] = useState('');
  // State for toggling between text and audio mode
  const [textMode, setTextMode] = useState(false);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages change or the chat window opens
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Text Response from AI - DISABLED in favor of tool-based messaging to avoid "thinking" text
  /*
  useEffect(() => {
    const onContent = (content) => {
        // Handle modelTurn content (user text response)
        if (content.modelTurn && content.modelTurn.parts) {
            // Find the text part
            const textPart = content.modelTurn.parts.find((p) => p.text);
            
            // Only display if it exists and doesn't look like "thinking"
            if (textPart && textPart.text) {
                setMessages(prev => {
                    // Avoid duplicate messages if the same content event fires multiple times
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.sender === 'bot' && lastMsg.text === textPart.text) {
                        return prev;
                    }
                    
                    return [...prev, {
                        id: Date.now().toString(),
                        text: textPart.text,
                        sender: 'bot',
                        timestamp: new Date()
                    }];
                });
            }
        }
    };
    
    // Listen for content events from the AI client
    client.on('content', onContent);
    return () => {
        client.off('content', onContent);
    }
  }, [client]);
  */


  // Helper function to generate a 6-character ID
  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Handle Tool Calls from the AI
  useEffect(() => {
    const onToolCall = async (toolCall) => {
      console.log('Tool call received:', toolCall);
      const functionCalls = toolCall.functionCalls;
      const functionResponses = [];

      // Iterate through each function call requested by the AI
      for (const call of functionCalls) {
        let response = {};
        try {
          // Handle specific function calls based on name
          if (call.name === 'get_classes') {
            // Check if user provided a specific date
            const { date } = call.args;
            
            if (!date) {
                // If no date provided, ask user for one
                response = { error: "Please provide a date to check for classes (e.g., 'today', 'tomorrow', or a specific date like '2024-05-25')." };
            } else {
                // Determine start and end of the requested date
                // Note: The AI might pass 'today', 'tomorrow' or 'YYYY-MM-DD'
                // Ideally we let the AI normalize this to ISO string, but let's handle basic natural language here or expect ISO from AI
                // For simplicity, we'll assume the AI is smart enough to convert "next tuesday" to a date string if we update the tool definition.
                
                // Let's update the tool definition to require 'date' string in ISO format or similar
                // But for now, let's just use the logic:
                
                // Fetch classes from Supabase for that date range
                // We'll filter in JS for flexibility if the date format is loose
                
                const { data, error } = await supabase
                  .from('classes')
                  .select('*, bookings(count)')
                  .gte('schedule_time', new Date().toISOString()); // Still fetch future only
                
                if (error) throw error;
                
                // Simple date filtering in memory (assuming 'date' arg is somewhat standard or we search for string match)
                // A better approach is to ask AI to provide ISO date start/end.
                // Let's update the System Instruction to force AI to ask for date first.
                
                // FILTER logic:
                // If the AI passed a date string, we filter the results
                const targetDate = new Date(date);
                const isValidDate = !isNaN(targetDate.getTime());
                
                let filteredClasses = [];
                
                if (isValidDate) {
                    const startOfDay = new Date(targetDate);
                    startOfDay.setHours(0,0,0,0);
                    
                    const endOfDay = new Date(targetDate);
                    endOfDay.setHours(23,59,59,999);
                    
                    filteredClasses = data.filter(c => {
                        const cDate = new Date(c.schedule_time);
                        return cDate >= startOfDay && cDate <= endOfDay;
                    });
                } else {
                    // If date is invalid, do NOT return all classes. Return an error asking for clarification.
                    response = { error: "The date provided could not be understood. Please ask the user for a specific date (e.g., 'today', 'tomorrow', 'next Monday')." };
                    // We must return early or set a flag to skip the rest of the processing
                    // Let's use a function return pattern or structured flow
                }

                if (isValidDate) {
                    // Process data to include capacity
                    const classesWithAvailability = filteredClasses.map(cls => ({
                        ...cls,
                        current_bookings: cls.bookings[0]?.count || 0,
                        is_full: (cls.bookings[0]?.count || 0) >= (cls.max_capacity || 20)
                    }));
                    
                    // Sort by schedule_time
                    classesWithAvailability.sort((a, b) => new Date(a.schedule_time) - new Date(b.schedule_time));

                    // Add formatted time for the AI to read naturally
                    const classesForAI = classesWithAvailability.map(c => ({
                        ...c,
                        formatted_schedule: new Date(c.schedule_time).toLocaleString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: 'numeric'
                        })
                    }));

                    response = { classes: classesForAI };
                    
                    // Add a system message to display these classes in the UI
                    if (classesForAI.length > 0) {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            text: '', // Empty text so only the UI card is shown. AI will speak/display its own text.
                            sender: 'bot',
                            classes: classesWithAvailability, // Keep original data for UI rendering
                            timestamp: new Date()
                        }]);
                    } else {
                        // IF NO CLASSES FOUND:
                        // Find the next available class date
                        const { data: nextClassData, error: nextClassError } = await supabase
                            .from('classes')
                            .select('schedule_time')
                            .gte('schedule_time', new Date().toISOString()) // Future classes
                            .order('schedule_time', { ascending: true })
                            .limit(1);

                        let suggestionText = `No classes found for ${date}.`;
                        
                        if (nextClassData && nextClassData.length > 0) {
                            const nextDate = new Date(nextClassData[0].schedule_time);
                            const nextDateString = nextDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                            suggestionText += ` The next available class is on ${nextDateString}. Please ask the user if they would like to see the schedule for that day.`;
                        } else {
                            suggestionText += " There are no upcoming classes scheduled at the moment.";
                        }

                        // Return a clear message to the AI so it knows to ask for confirmation
                        response = { 
                            message: suggestionText,
                            classes: [] // Empty classes array prevents the UI from rendering an empty list
                        };
                    }
                }
            }
            
          } else if (call.name === 'book_class') {
            // Book a class for the user
            if (!user) {
              response = { error: 'User must be logged in to book a class' };
            } else {
              const { class_id, booking_date } = call.args;
              // Default to today if no date provided, or handle as needed
              const date = booking_date || new Date().toISOString();
              
              // Insert booking without explicit ID, letting Supabase generate it
              const { data, error } = await supabase
                .from('bookings')
                .insert([
                  { 
                      user_id: user.id, 
                      class_id, 
                      booking_date: date, 
                      status: 'confirmed' 
                  }
                ])
                .select();
              
              if (error) {
                  // Handle the trigger error for capacity
                  if (error.message.includes('Class is fully booked')) {
                      response = { error: "This class is fully booked." };
                  } else {
                      throw error;
                  }
              } else {
                  response = { success: true, booking: data[0] };
              }
            }
          } else if (call.name === 'cancel_booking') {
             // Cancel a booking for the user
             if (!user) {
              response = { error: 'User must be logged in to cancel a booking' };
            } else {
              const { booking_id } = call.args;
              const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', booking_id)
                .eq('user_id', user.id); // Security check
              
              if (error) throw error;
              response = { success: true };
            }
          } else if (call.name === 'get_user_bookings') {
             // Get all bookings for the current user
             if (!user) {
              response = { error: 'User must be logged in to view bookings' };
            } else {
              const { data, error } = await supabase
                .from('bookings')
                .select(`
                  *,
                  classes (
                    name,
                    instructor,
                    duration_minutes,
                    schedule_time
                  )
                `)
                .eq('user_id', user.id);
              
              if (error) throw error;
              
              // Format times for the AI
              const bookingsWithFormattedTime = data.map(b => ({
                  ...b,
                  class_details: {
                      ...b.classes,
                      formatted_time: b.classes?.schedule_time ? new Date(b.classes.schedule_time).toLocaleString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: 'numeric'
                    }) : 'Unknown Time'
                  }
              }));

              response = { bookings: bookingsWithFormattedTime };
            }
          } else if (call.name === 'display_message') {
              // Tool to strictly display a message in the chat UI
              // This bypasses the noisy text stream
              const { message } = call.args;
              setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  text: message,
                  sender: 'bot',
                  timestamp: new Date()
              }]);
              response = { success: true };
          } else {
            response = { error: `Unknown function ${call.name}` };
          }
        } catch (err) {
          console.error(`Error executing ${call.name}:`, err);
          response = { error: err.message };
        }

        // Add the response to the list of function responses
        functionResponses.push({
          response,
          id: call.id,
          name: call.name,
        });
      }

      // Send the tool responses back to the AI client
      client.sendToolResponse({ functionResponses });
    };

    // Listen for toolcall events
    client.on('toolcall', onToolCall);
    return () => {
      client.off('toolcall', onToolCall);
    };
  }, [client, user]);

  // Audio Recording Setup
  useEffect(() => {
    // Callback when audio data is received from the recorder
    const onData = (base64) => {
      // Send audio data to the AI client
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };

    const recorder = audioRecorderRef.current;
    recorder.on("data", onData);

    return () => {
      recorder.off("data", onData);
    };
  }, [client]);

  // Toggle connection to the AI service
  const toggleConnection = async () => {
    if (connected) {
      await disconnect();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Disconnected from AI Assistant.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } else {
      try {
        await connect();
         setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Connected! You can now speak with me.',
          sender: 'bot',
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error("Connection failed", err);
         setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'Failed to connect. Please check your API key.',
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    }
  };

  // Toggle audio recording
  const toggleRecord = async () => {
    if (isRecording) {
      audioRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        await audioRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording", err);
      }
    }
  };

  // Toggle between text and audio modality
  const toggleModality = () => {
      const newModality = textMode ? "AUDIO" : "TEXT";
      setTextMode(!textMode);
      
      // Update config to switch between audio and text responses
      // When in TEXT mode, we want TEXT response
      // When in AUDIO mode, we want AUDIO response (and we can still get text transcript if available)
      if (config && config.generationConfig) {
          setConfig({
              ...config,
              generationConfig: {
                  ...config.generationConfig,
                  responseModalities: newModality
              }
          });
      }
  };

  // Handle sending text message
  const handleSendText = () => {
      if (!input.trim() || !connected) return;

      const userMessage = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      client.send([{ text: input }]);
      setInput('');
  };

  // Handle Enter key press in text input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendText();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF6B35] text-white p-4 rounded-full shadow-lg hover:bg-[#e55a2b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35]"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200">
          {/* Header */}
          <div className="bg-[#1A1A2E] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <h3 className="font-bold">Elevate Fitness AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.text && (
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#FF6B35] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                {msg.classes && msg.classes.length > 0 && (
                    <div className="mt-2 w-full max-w-[90%]">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-2 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700">
                                Available Sessions for {new Date(msg.classes[0].schedule_time).toLocaleDateString()}
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {msg.classes.map(cls => (
                                    <div key={cls.id} className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-gray-800">{cls.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(cls.schedule_time).toLocaleDateString()} at {new Date(cls.schedule_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {cls.instructor}
                                            </div>
                                            <div className={`text-[10px] font-medium mt-1 ${cls.is_full ? 'text-red-500' : 'text-green-600'}`}>
                                                {cls.is_full ? 'Full' : `${(cls.max_capacity || 20) - (cls.current_bookings || 0)} spots left`}
                                            </div>
                                        </div>
                                        <button 
                                            className={`ml-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                                cls.is_full 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                                            }`}
                                            disabled={cls.is_full}
                                            onClick={() => {
                                                if (connected && !cls.is_full) {
                                                    const text = `Book ${cls.name} on ${new Date(cls.schedule_time).toLocaleDateString()} at ${new Date(cls.schedule_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                                    setInput(text);
                                                }
                                            }}
                                        >
                                            {cls.is_full ? 'Full' : 'Book'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            
            {/* Input for text mode */}
            {textMode && (
                <div className="flex items-center space-x-2 mb-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={!connected}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendText}
                        disabled={!connected || !input.trim()}
                        className="bg-[#1A1A2E] text-white p-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between">
              
               {/* Power Button */}
               <button
                onClick={toggleConnection}
                className={`p-3 rounded-full transition-colors ${
                  connected 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
                title={connected ? "Disconnect" : "Connect"}
              >
                <Power className="h-5 w-5" />
              </button>

              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                 {/* Simple volume visualizer */}
                 <div 
                    className="h-full bg-[#FF6B35] transition-all duration-75"
                    style={{ width: `${Math.min(volume * 100, 100)}%` }}
                 />
              </div>

             {/* Modality Toggle Button */}
             <button
                onClick={toggleModality}
                disabled={!connected}
                 className={`p-3 rounded-full transition-colors mr-2 ${
                  textMode 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                }`}
                title={textMode ? "Switch to Audio Mode" : "Switch to Text Mode"}
             >
                <Type className="h-5 w-5" />
             </button>
             
              {/* Record Button */}
              <button
                onClick={toggleRecord}
                disabled={!connected || textMode}
                className={`p-3 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
             <div className="text-center mt-2 text-xs text-gray-500">
                {connected 
                    ? (textMode ? "Text Mode Active" : (isRecording ? "Listening..." : "Audio Mode (Click Mic to Speak)")) 
                    : "Disconnected"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Chatbot component wrapper
const Chatbot = () => {
  // Try to get key from env first (dev), then fetch from edge function if needed
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [loadingKey, setLoadingKey] = useState(false);

  const { user } = useAuthStore(); // Use the user from the store to detect login changes

  useEffect(() => {
    // If no key in env, fetch from Supabase Edge Function
    if (!import.meta.env.VITE_GEMINI_API_KEY && user) {
      const fetchKey = async () => {
        setLoadingKey(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
             console.warn("User not logged in, cannot fetch API key securely.");
             setLoadingKey(false);
             return;
          }

          // Force use of session token in Authorization header
          const { data, error } = await supabase.functions.invoke('get-gemini-key', {
              headers: {
                  Authorization: `Bearer ${session.access_token}`
              }
          });
          
          if (error) {
              console.error("Supabase Function Error:", error);
              throw error;
          }
          
          console.log("Edge Function Response:", data); // Debug log

          if (data?.apiKey) {
            setApiKey(data.apiKey);
          } else {
              console.error("No apiKey returned from Edge Function");
          }
        } catch (err) {
          console.error("Failed to fetch Gemini API key:", err);
        } finally {
          setLoadingKey(false);
        }
      };
      fetchKey();
    }
  }, [user]); // Re-run this effect when the user state changes
  
  if (loadingKey) return null; // Or a loading spinner
  
  if (!apiKey) {
      // If user is not logged in, we can still show a disabled chatbot or a prompt to login
      // console.warn("VITE_GEMINI_API_KEY is not set and could not be fetched. Chatbot will not function.");
      // return null;
  }

  // Define tools available to the AI
  const tools = [
      {
        functionDeclarations: [
          {
            name: "get_classes",
            description: "Get list of available fitness classes. IMPORTANT: You MUST ask the user for a specific date (e.g., 'today', 'tomorrow', '2024-05-25') before calling this tool. The 'date' parameter is REQUIRED.",
            parameters: {
                type: "OBJECT",
                properties: {
                    date: { type: "STRING", description: "The date to check classes for (e.g., '2024-05-25', 'today', 'tomorrow')." }
                },
                required: ["date"]
            }
          },
          {
            name: "book_class",
            description: "Book a fitness class",
            parameters: {
              type: "OBJECT",
              properties: {
                class_id: { type: "STRING" },
                booking_date: { type: "STRING" }
              },
              required: ["class_id"]
            }
          },
           {
            name: "cancel_booking",
            description: "Cancel a class booking. IMPORTANT: Before calling this tool, you MUST confirm the class name, date, and time with the user to ensure the correct booking is cancelled.",
            parameters: {
              type: "OBJECT",
              properties: {
                booking_id: { type: "STRING" }
              },
              required: ["booking_id"]
            }
          },
          {
            name: "get_user_bookings",
            description: "Get list of classes booked by the user",
          },
          {
              name: "display_message",
              description: "Display a text message to the user in the chat interface. Call this tool IMMEDIATELY every time you speak to the user, passing the exact text of what you are saying.",
              parameters: {
                  type: "OBJECT",
                  properties: {
                      message: { type: "STRING", description: "The exact text transcript of what you are speaking." }
                  },
                  required: ["message"]
              }
          }
        ]
      }
    ];

  if (!apiKey) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
           <button
             onClick={() => alert("Please log in to use the AI Assistant.")}
             className="bg-gray-400 text-white p-4 rounded-full shadow-lg cursor-not-allowed"
             title="Log in to use AI Assistant"
           >
             <MessageSquare className="h-6 w-6" />
           </button>
        </div>
      );
  }

  // Provide the Live API context to the ChatbotContent
  const now = new Date();
  const dateTimeString = now.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric'
  });

  return (
    <LiveAPIProvider 
      options={{ apiKey }} 
      initialConfig={{ 
        generationConfig: {
           responseModalities: "AUDIO",
         },
         systemInstruction: {
           parts: [{ text: `You are a helpful fitness assistant for Elevate Fitness. 
Current Date and Time: ${dateTimeString}.
You can help users check class schedules, book classes, and view their bookings. 
You should be friendly and encouraging. 

CRITICAL RULES:
1. TIME GROUNDING: When the user says "today", "tomorrow", "this weekend", etc., ALWAYS calculate the specific date based on the "Current Date and Time" provided above. Do NOT guess.
2. NO AUTO-BOOKING: If the 'get_classes' tool returns an empty list, DO NOT automatically try to book another class. Instead, inform the user about the empty schedule and the next available date suggestion provided by the tool, then WAIT for the user to confirm if they want to see that schedule.
3. VERIFY BOOKING: Never call 'book_class' unless you have successfully found a specific class slot (with a class_id) that the user has explicitly agreed to book.
4. CANCELLATION: When a user asks to cancel a booking, you must first ask them to confirm the class name, date, and time. Only proceed with the cancellation tool once they have confirmed these details.
5. DISPLAY MESSAGES: Whenever you speak to the user, you MUST call the 'display_message' tool with the text transcript of your speech. Do NOT rely on the standard text output channel.
6. CONCISE CLASS LISTING: When listing classes, DO NOT read out every single time slot. Instead, group them by class name (e.g., "We have Yoga Flow and HIIT available") and mention that multiple time slots are shown on the screen. Keep your spoken response brief.` }]
         },
         tools: tools 
       }}
    >
      <ChatbotContent />
    </LiveAPIProvider>
  );
};

export default Chatbot;