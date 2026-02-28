import { create } from 'zustand';
import { supabase } from '../supabaseClient';

/**
 * Zustand store for managing authentication state.
 * It handles user sessions, loading states, and provides methods for signing out and checking the current user.
 */
export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  // Sign out the current user
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  // Check if a user is currently logged in
  checkUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
