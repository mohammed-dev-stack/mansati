// src/hooks/useComments.ts
// 💬 هوك إدارة التعليقات - نسخة محسّنة مع معالجة unknown
// @version 2.2.0
// @lastUpdated 2026

import { useState, useCallback } from 'react';
import { commentService } from '../services/commentService';
import { api } from '../services/api';
import type { Comment } from '../types/Comment';
import { toComment, toCommentArray } from '../types/Comment';

// ============================================================
// 📋 تعريف أنواع الإرجاع
// ============================================================

interface UseCommentsReturn {
  /** قائمة التعليقات */
  comments: Comment[];
  /** حالة التحميل */
  loading: boolean;
  /** رسالة الخطأ (إن وجدت) */
  error: string | null;
  /** جلب تعليقات منشور معين */
  getCommentsByPost: (postId: string) => Promise<Comment[]>;
  /** إضافة تعليق جديد */
  addComment: (postId: string, content: string) => Promise<Comment | null>;
  /** حذف تعليق */
  deleteComment: (commentId: string) => Promise<boolean>;
  /** إعادة تعيين الحالة */
  reset: () => void;
}

// ============================================================
// 🧠 هوك useComments
// ============================================================

/**
 * هوك مخصص لإدارة التعليقات
 * 
 * 📌 المعايير الهندسية:
 * - ❌ لا يمرر التوكن يدوياً (يُدار في api تلقائياً)
 * - ✅ يستخدم دوال تحويل آمنة (toComment, toCommentArray)
 * - ✅ معالجة شاملة للأخطاء
 * - ✅ حالات التحميل والخطأ
 * - ✅ أنواع صريحة وآمنة
 * 
 * @returns {UseCommentsReturn} دوال وحالات إدارة التعليقات
 */
export function useComments(): UseCommentsReturn {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 📝 جلب تعليقات منشور معين
  // ============================================================

  /**
   * جلب جميع التعليقات الخاصة بمنشور معين
   */
  const getCommentsByPost = useCallback(async (postId: string): Promise<Comment[]> => {
    // ✅ التحقق من وجود معرف صالح
    if (!postId || postId.trim().length < 5) {
      setError('معرف المنشور غير صالح');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة - النتيجة من النوع unknown
      const result = await commentService.getByPost(postId);

      // ✅ التحويل الآمن: التأكد من أن النتيجة مصفوفة
      // إذا لم تكن مصفوفة، نستخدم مصفوفة فارغة
      const resultArray = Array.isArray(result) ? result : [];

      // ✅ تحويل البيانات إلى مصفوفة تعليقات آمنة
      const safeComments = toCommentArray(resultArray);
      setComments(safeComments);
      return safeComments;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل تحميل التعليقات';
      setError(errorMessage);
      console.error('❌ [useComments] فشل جلب التعليقات:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // ➕ إضافة تعليق جديد
  // ============================================================

  /**
   * إضافة تعليق جديد على منشور
   */
  const addComment = useCallback(async (postId: string, content: string): Promise<Comment | null> => {
    // ✅ التحقق من صحة المدخلات
    if (!postId || postId.trim().length < 5) {
      setError('معرف المنشور غير صالح');
      return null;
    }

    if (!content || content.trim().length === 0) {
      setError('نص التعليق فارغ');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة
      const result = await commentService.add(postId, content);

      // ✅ تحويل البيانات إلى تعليق آمن
      const newComment = toComment(result);

      // ✅ تحديث القائمة محلياً (إضافة التعليق في البداية)
      setComments((prev) => [newComment, ...prev]);

      return newComment;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل إضافة التعليق';
      setError(errorMessage);
      console.error('❌ [useComments] فشل إضافة التعليق:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // 🗑️ حذف تعليق
  // ============================================================

  /**
   * حذف تعليق (لمنشوراته الخاصة أو للأدمن)
   */
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!commentId || commentId.trim().length < 5) {
      setError('معرف التعليق غير صالح');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ استخدام api.delete مباشرة
      await api.delete(`/comments/${commentId}`);

      // ✅ إزالة التعليق من القائمة المحلية
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل حذف التعليق';
      setError(errorMessage);
      console.error('❌ [useComments] فشل حذف التعليق:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // 🔄 إعادة تعيين الحالة (Reset)
  // ============================================================

  /**
   * إعادة تعيين جميع الحالات إلى القيم الافتراضية
   */
  const reset = useCallback((): void => {
    setComments([]);
    setLoading(false);
    setError(null);
  }, []);

  // ============================================================
  // 📤 تصدير الهوك
  // ============================================================

  return {
    comments,
    loading,
    error,
    getCommentsByPost,
    addComment,
    deleteComment,
    reset,
  };
}