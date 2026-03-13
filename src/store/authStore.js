import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    // Mevcut session'ı al
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      set({ user: session.user, profile, loading: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }

    // Sadece gerçek giriş/çıkışı dinle
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, loading: false })
      } else if (event === 'SIGNED_IN' && !get().user) {
        // Sadece önceden user yoksa güncelle
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single()
          set({ user: session.user, profile, loading: false })
        }
      }
      // TOKEN_REFRESHED, INITIAL_SESSION, USER_UPDATED → hiçbir şey yapma
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false })
    window.location.href = '/'
  },
}))

export default useAuthStore