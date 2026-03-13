import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Her sepet satırı için benzersiz anahtar: ürün id + varyant id (yoksa 'base')
const getCartKey = (product) =>
  `${product.id}_${product.variant_id || 'base'}`

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items
        const key = getCartKey(product)
        const existing = items.find(i => getCartKey(i.product) === key)
        if (existing) {
          set({
            items: items.map(i =>
              getCartKey(i.product) === key
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, quantity }] })
        }
      },

      // cartKey = getCartKey(product) — string olarak geç
      removeItem: (cartKey) =>
        set({ items: get().items.filter(i => getCartKey(i.product) !== cartKey) }),

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => getCartKey(i.product) !== cartKey) })
        } else {
          set({
            items: get().items.map(i =>
              getCartKey(i.product) === cartKey ? { ...i, quantity } : i
            ),
          })
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => {
          const price = parseFloat(i.product?.price) || 0
          return sum + price * i.quantity
        }, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'esf-cart' }
  )
)

export { getCartKey }
export default useCartStore