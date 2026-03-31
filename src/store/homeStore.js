import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useHomeStore = create((set, get) => ({
  products: [],
  discountMap: {},
  loading: true,

  fetchProducts: async (force = false) => {
    if (get().products.length > 0 && !force) return;

    set({ loading: true })
    const now = new Date().toISOString()
    const [{ data: prods }, { data: discs }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('discounts').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now),
    ])

    const map = {}
    discs?.forEach(d => { map[d.product_id] = d })

    set({ products: prods || [], discountMap: map, loading: false })
  }
}))

export default useHomeStore