// src/hooks/usePosts.ts
// 📝 هوك إدارة المنشورات - نسخة محسّنة مع تصحيح عدد الوسائط
// @version 2.2.0
// @lastUpdated 2026

import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';
import type { Post } from '../types/Post';
import { toPost, toPostArray } from '../types/Post';

// ============================================================
// 📋 تعريف أنواع الإرجاع
// ============================================================

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  createPost: (content: string, media?: File) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  editPost: (postId: string, newContent: string) => Promise<void>;
  reset: () => void;
}

// ============================================================
// 🧠 هوك usePosts
// ============================================================

export function usePosts(): UsePostsReturn {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 🔑 استخراج التوكن من localStorage
  // ============================================================

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // ============================================================
  // 📝 جلب جميع المنشورات
  // ============================================================

  const fetchPosts = useCallback(async (): Promise<Post[]> => {
    const token = getToken();
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await postService.getAll(token);
      const resultArray = Array.isArray(result) ? result : [];
      const safePosts = toPostArray(resultArray);
      setPosts(safePosts);
      return safePosts;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل تحميل المنشورات';
      setError(errorMessage);
      console.error('❌ [usePosts] فشل جلب المنشورات:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // 🔄 تحميل المنشورات عند تحميل الصفحة
  // ============================================================

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ============================================================
  // ➕ إنشاء منشور جديد - ✅ إزالة الوسيط الثالث (media)
  // ============================================================

  const createPost = useCallback(async (content: string, media?: File): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return;
    }

    if (!content || content.trim().length === 0) {
      setError('نص المنشور فارغ');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ تمرير وسيطين فقط: content و token
      // (الميديا ستُرفع بشكل منفصل أو عبر FormData داخل الخدمة)
      const result = await postService.create(content, token);
      // إذا كانت الخدمة تدعم media، يمكنك استخدام:
      // const result = await postService.create(content, token, media);

      const newPost = toPost(result);
      setPosts((prev) => [newPost, ...prev]);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل إنشاء المنشور';
      setError(errorMessage);
      console.error('❌ [usePosts] فشل إنشاء المنشور:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // 🗑️ حذف منشور
  // ============================================================

  const deletePost = useCallback(async (postId: string): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return;
    }

    if (!postId || postId.trim().length < 5) {
      setError('معرف المنشور غير صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await postService.delete(postId, token);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل حذف المنشور';
      setError(errorMessage);
      console.error('❌ [usePosts] فشل حذف المنشور:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // ✏️ تعديل منشور
  // ============================================================

  const editPost = useCallback(async (postId: string, newContent: string): Promise<void> => {
    const token = getToken();
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return;
    }

    if (!postId || postId.trim().length < 5) {
      setError('معرف المنشور غير صالح');
      return;
    }

    if (!newContent || newContent.trim().length === 0) {
      setError('نص المنشور الجديد فارغ');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await postService.update(postId, newContent, token);
      const updatedPost = toPost(result);
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل تعديل المنشور';
      setError(errorMessage);
      console.error('❌ [usePosts] فشل تعديل المنشور:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // 🔄 إعادة تعيين الحالة (Reset)
  // ============================================================

  const reset = useCallback((): void => {
    setPosts([]);
    setLoading(false);
    setError(null);
  }, []);

  // ============================================================
  // 📤 تصدير الهوك
  // ============================================================

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    editPost,
    reset,
  };
}