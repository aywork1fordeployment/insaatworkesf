import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  blocked: false,
  signingIn: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      
      if (profile?.is_blocked) {
        await supabase.auth.signOut()
        localStorage.setItem('esf-blocked', '1')
        set({ user: null, profile: null, loading: false, blocked: true })
        return
      }
      set({ user: session.user, profile, loading: false, blocked: false })
    } else {
      set({ user: null, profile: null, loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set(state => ({ user: null, profile: null, loading: false, blocked: state.blocked }))
      } else if (event === 'SIGNED_IN' && !get().user && !get().signingIn) {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single()
          if (profile?.is_blocked) {
            await supabase.auth.signOut()
            localStorage.setItem('esf-blocked', '1')
            set({ user: null, profile: null, loading: false, blocked: true })
            return
          }
          set({ user: session.user, profile, loading: false, blocked: false })
        }
      }
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false, blocked: false, signingIn: false })
    window.location.href = '/'
  },
}))

export default useAuthStore