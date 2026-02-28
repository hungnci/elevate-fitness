import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuthStore } from '../store/authStore';
import { Calendar, User as UserIcon, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          classes:class_id (
            id,
            name,
            instructor,
            duration_minutes,
            schedule_time,
            image_url
          )
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancelLoading(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert('Booking cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + error.message);
    } finally {
      setCancelLoading(null);
    }
  };

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
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Welcome back, {user?.user_metadata?.full_name || user?.email}!</h1>
          <p className="text-gray-600">Manage your class bookings and profile.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Your Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">You haven't booked any classes yet.</p>
              <a href="/classes" className="text-[#FF6B35] font-semibold hover:underline">
                Browse Classes
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {booking.classes && (
                    <>
                      <div className="relative h-40">
                        <img 
                          src={booking.classes.image_url || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=60'} 
                          alt={booking.classes.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-0 right-0 px-3 py-1 m-4 rounded-full text-xs font-semibold text-white ${
                          new Date(booking.classes.schedule_time) < new Date() ? 'bg-gray-500' : 'bg-[#FF6B35]'
                        }`}>
                          {new Date(booking.classes.schedule_time) < new Date() ? 'Completed' : 'Upcoming'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-[#1A1A2E] mb-1">{booking.classes.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <UserIcon className="h-3 w-3 mr-2" />
                          <span>{booking.classes.instructor}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span>
                            {new Date(booking.classes.schedule_time).toLocaleDateString()} at {new Date(booking.classes.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {new Date(booking.classes.schedule_time) > new Date() && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelLoading === booking.id}
                            className="w-full flex justify-center items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {cancelLoading === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
