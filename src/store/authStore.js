import { create } from 'zustand'
import { supabase } from '../lib/supabase'

let authListener = null

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        set({ user: session.user, profile, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    } catch (err) {
      console.error('Auth init error:', err)
      set({ user: null, profile: null, loading: false })
    }

    if (authListener) {
      authListener.subscription.unsubscribe()
    }

const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
  // Sadece bu iki event'e bak, diğerlerini yoksay
  if (event === 'SIGNED_OUT') {
    set({ user: null, profile: null, loading: false })
    return
  }
  if (event === 'SIGNED_IN') {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      set({ user: session.user, profile, loading: false })
    }
    return
  }
  // TOKEN_REFRESHED, INITIAL_SESSION vs → DOKUNMA
})

    authListener = data
  },

  logout: async () => {
    if (authListener) {
      authListener.subscription.unsubscribe()
      authListener = null
    }
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false })
    window.location.href = '/giris-yap'
  },
}))

export default useAuthStore