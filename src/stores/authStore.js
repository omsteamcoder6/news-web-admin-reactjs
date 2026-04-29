// stores/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',                          // key written to localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({                      // only persist these fields
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };