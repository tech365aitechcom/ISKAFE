import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      newsCategories: [],
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
      setRoles: (roles) => set({ roles }),
      setNewsCategories: (newsCategories) => set({ newsCategories }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    }
  )
)

export default useStore
