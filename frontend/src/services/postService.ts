// src/services/postService.ts
// 📝 خدمة المنشورات - إدارة طلبات API المتعلقة بالمنشورات
// @version 2.0.0
// @lastUpdated 2026

import { api } from './api';

// ============================================================
// 📋 تعريف أنواع الإرجاع (اختياري للتوثيق)
// ============================================================

/**
 * خدمة إدارة المنشورات
 * 
 * 📌 المعايير الهندسية:
 * - جميع الدوال تستخدم عميل API المُكوَّن (مع Interceptors)
 * - التوكن يُضاف عبر Header في كل طلب
 * - معالجة الأخطاء موحدة
 */
export const postService = {
  /**
   * جلب جميع المنشورات
   */
  getAll: async (token: string): Promise<any> => {
    try {
      const { data } = await api.get('/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err: any) {
      console.error('❌ [postService] فشل جلب المنشورات:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * إنشاء منشور جديد
   */
  create: async (content: string, token: string): Promise<any> => {
    try {
      const { data } = await api.post(
        '/posts',
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err: any) {
      console.error('❌ [postService] فشل إنشاء المنشور:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * ✅ حذف منشور
   */
  delete: async (postId: string, token: string): Promise<void> => {
    try {
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err: any) {
      console.error('❌ [postService] فشل حذف المنشور:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * ✅ تحديث منشور (تعديل المحتوى)
   */
  update: async (postId: string, content: string, token: string): Promise<any> => {
    try {
      const { data } = await api.put(
        `/posts/${postId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err: any) {
      console.error('❌ [postService] فشل تحديث المنشور:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * الحصول على منشور واحد (اختياري)
   */
  getOne: async (postId: string, token: string): Promise<any> => {
    try {
      const { data } = await api.get(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err: any) {
      console.error('❌ [postService] فشل جلب المنشور:', err.response?.data || err.message);
      throw err;
    }
  },
};