import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User as UserIcon, X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Classes page component
const Classes = () => {
  // State for storing list of classes (raw data)
  const [classes, setClasses] = useState([]);
  // State for classes grouped by type
  const [classTypes, setClassTypes] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for selected class type (for modal)
  const [selectedClassType, setSelectedClassType] = useState(null);
  // State for selected time slot in modal
  const [selectedSession, setSelectedSession] = useState(null);
  // Get user authentication state
  const { user } = useAuthStore();
  // Navigation hook
  const navigate = useNavigate();
  // State for booking loading indicator
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings(count)');

      if (error) throw error;
      
      // 1. Process data to include capacity
      const allSessions = (data || []).map(cls => ({
          ...cls,
          current_bookings: cls.bookings[0]?.count || 0,
          is_full: (cls.bookings[0]?.count || 0) >= (cls.max_capacity || 20)
      })).filter(cls => new Date(cls.schedule_time) > new Date()); // Only show future classes

      // 2. Group by Name
      const grouped = {};
      allSessions.forEach(session => {
          if (!grouped[session.name]) {
              grouped[session.name] = {
                  id: session.id, // Use first ID as key
                  name: session.name,
                  description: session.description,
                  image_url: session.image_url,
                  duration_minutes: session.duration_minutes,
                  instructor: session.instructor, // Default instructor
                  sessions: []
              };
          }
          grouped[session.name].sessions.push(session);
      });

      // 3. Sort sessions within each group by time
      Object.values(grouped).forEach(group => {
          group.sessions.sort((a, b) => new Date(a.schedule_time) - new Date(b.schedule_time));
      });

      // 4. Convert to array
      setClassTypes(Object.values(grouped));
      setClasses(allSessions);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... (handleBookClass using selectedSession.id)
  const handleBookClass = async () => {
      if (!selectedSession) return;
      
      if (!user) {
        navigate('/login');
        return;
      }
  
      setBookingLoading(true);
      try {
        const { error } = await supabase.from('bookings').insert([
          {
            user_id: user.id,
            class_id: selectedSession.id,
            booking_date: new Date().toISOString(),
            status: 'confirmed',
          },
        ]);
  
        if (error) {
          if (error.code === '23505') {
              alert('You have already booked this class.');
          } else if (error.message.includes('fully booked')) {
              alert('Sorry, this class is fully booked.');
          } else {
              throw error;
          }
        } else {
          alert('Class booked successfully!');
          setSelectedClassType(null);
          setSelectedSession(null);
          fetchClasses(); // Refresh data to update capacity
        }
      } catch (error) {
        console.error('Error booking class:', error);
        alert('Failed to book class: ' + error.message);
      } finally {
        setBookingLoading(false);
      }
    };


  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-4">Our Class Schedule</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect class to fit your schedule and fitness goals.
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classTypes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img 
                  src={cls.image_url || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=60'} 
                  alt={cls.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-[#FF6B35] text-white px-3 py-1 m-4 rounded-full text-sm font-semibold">
                  {cls.duration_minutes} min
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">{cls.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>{cls.instructor}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>{cls.sessions.length} upcoming sessions</span>
                </div>
                <button
                  onClick={() => {
                      setSelectedClassType(cls);
                      // Select the first available session by default
                      if (cls.sessions.length > 0) {
                          setSelectedSession(cls.sessions[0]);
                      }
                  }}
                  className="w-full bg-[#1A1A2E] text-white py-2 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  View Schedule
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Class Details Modal */}
        {selectedClassType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-[#1A1A2E]">{selectedClassType.name}</h2>
                  <button 
                    onClick={() => setSelectedClassType(null)}
                    className="bg-gray-100 rounded-full p-2 text-gray-800 hover:text-[#FF6B35] transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                     <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {selectedClassType.duration_minutes} min
                     </span>
                     <div className="flex items-center text-gray-600">
                         <UserIcon className="h-4 w-4 mr-2" />
                         <span>{selectedClassType.instructor}</span>
                     </div>
                </div>

                <p className="text-gray-600 mb-6">{selectedClassType.description}</p>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Available Sessions:</h3>
                    
                    {/* List View for Sessions */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedClassType.sessions.map(session => (
                            <div 
                                key={session.id}
                                onClick={() => !session.is_full && setSelectedSession(session)}
                                className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${
                                    selectedSession?.id === session.id 
                                        ? 'border-[#FF6B35] bg-orange-50 ring-1 ring-[#FF6B35]' 
                                        : 'border-gray-200 hover:bg-gray-50'
                                } ${session.is_full ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center font-medium text-gray-900">
                                        <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                                        {new Date(session.schedule_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mt-1 ml-6">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(session.schedule_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                                
                                <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                                    session.is_full 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'bg-green-100 text-green-600'
                                }`}>
                                    {session.is_full ? 'FULL' : `${(session.max_capacity || 20) - session.current_bookings} spots left`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => setSelectedClassType(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookClass}
                    disabled={bookingLoading || !selectedSession || selectedSession.is_full}
                    className={`px-6 py-2 rounded-md transition-colors font-medium disabled:opacity-50 ${
                        (!selectedSession || selectedSession.is_full)
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-[#FF6B35] text-white hover:bg-[#e55a2b]'
                    }`}
                  >
                    {bookingLoading ? 'Booking...' : (selectedSession?.is_full ? 'Fully Booked' : user ? 'Confirm Booking' : 'Login to Book')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;