import { create } from 'zustand';
import { Category } from '@/types';
import { CategoryService } from '@/features/categories/categoryService';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: (ledgerId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'deletedAt'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (ledgerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await CategoryService.getCategoriesByLedgerId(ledgerId);
      set({ categories, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await CategoryService.createCategory(category);
      const { categories } = get();
      set({ 
        categories: [...categories, newCategory].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)), 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to add category', isLoading: false });
    }
  },

  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await CategoryService.updateCategory(id, updates);
      const { categories } = get();
      const updatedCategories = categories.map(c => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c);
      set({
        categories: updatedCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update category', isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await CategoryService.deleteCategory(id);
      const { categories } = get();
      set({
        categories: categories.filter(c => c.id !== id),
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete category', isLoading: false });
    }
  }
}));
