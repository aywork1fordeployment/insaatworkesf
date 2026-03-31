import { create } from 'zustand'

const useFilterStore = create((set) => ({
  search: '',
  category: null,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  resetFilters: () => set({ search: '', category: null })
}))

export default useFilterStore