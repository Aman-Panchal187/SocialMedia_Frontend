import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Access token is persisted to sessionStorage (tab-scoped, cleared on close) and
// never to localStorage — the refresh token (httpOnly cookie) is the durable
// credential, so keeping the access token in a shorter-lived, more XSS-resistant
// store limits the blast radius if the page is ever compromised.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: ({ user, accessToken }) =>
        set((state) => ({
          user: user ?? state.user,
          accessToken: accessToken ?? state.accessToken,
        })),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
)
