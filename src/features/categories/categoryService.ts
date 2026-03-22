import { getDB } from '@/services/db/schema';
import { Category } from '@/types';
import * as crypto from 'expo-crypto';

export const CategoryService = {
  async getCategoriesByLedgerId(ledgerId: string): Promise<Category[]> {
    const db = await getDB();
    const result = await db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE ledgerId = ? AND deletedAt IS NULL ORDER BY sortOrder ASC, createdAt DESC;',
      [ledgerId]
    );
    return result;
  },

  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Category> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO categories (id, ledgerId, name, kind, color, icon, sortOrder, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id, 
        category.ledgerId, 
        category.name, 
        category.kind, 
        category.color || null, 
        category.icon || null, 
        category.sortOrder || 0, 
        now, 
        now
      ]
    );

    return {
      id,
      ...category,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'deletedAt'>>): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    
    const setQuery = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);

    if (setQuery) {
      await db.runAsync(
        `UPDATE categories SET ${setQuery}, updatedAt = ? WHERE id = ?;`,
        [...values, now, id]
      );
    }
  },

  // Soft delete for sync purposes
  async deleteCategory(id: string): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    await db.runAsync('UPDATE categories SET deletedAt = ?, updatedAt = ? WHERE id = ?;', [now, now, id]);
  }
};
