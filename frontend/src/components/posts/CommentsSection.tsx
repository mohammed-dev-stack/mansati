// src/components/posts/CommentsSection.tsx
// 💬 قسم التعليقات - نسخة محسّنة مع تحويل البيانات لتوافق CommentItem
// @version 2.1.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import { useComments } from "../../hooks/useComments";
import type { Comment } from "../../types/Comment";
import Loader from "../ui/Loader";
import CommentItem from "./CommentItem";

// ============================================================
// 📋 تعريف أنواع الخصائص
// ============================================================

interface CommentsSectionProps {
  postId: string;
}

/**
 * شكل البيانات الذي يتوقعه مكون CommentItem
 */
interface CommentItemData {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { getCommentsByPost } = useComments();

  // ============================================================
  // 🔄 دالة تحويل Comment → CommentItemData
  // ============================================================

  /**
   * تحويل تعليق من صيغة API (Comment) إلى الصيغة المتوقعة من CommentItem
   * 
   * @param comment - التعليق من نوع Comment (من الـ API)
   * @returns كائن متوافق مع CommentItem
   */
  const toCommentItemData = useCallback((comment: Comment): CommentItemData => {
    // ✅ استخراج اسم المستخدم من كائن user أو من النص
    const authorName = 
      typeof comment.user === 'string' 
        ? comment.user 
        : comment.user?.name || 'مستخدم';

    return {
      id: comment._id,
      content: comment.text,
      author: authorName,
      createdAt: comment.createdAt,
    };
  }, []);

  // ============================================================
  // 📝 جلب التعليقات
  // ============================================================

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getCommentsByPost(postId);
      const commentsArray = Array.isArray(result) ? result : [];
      setComments(commentsArray);
    } catch (err: any) {
      console.error("❌ [CommentsSection] فشل جلب التعليقات:", err);
      setError(err?.message || "فشل تحميل التعليقات");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId, getCommentsByPost]);

  // ============================================================
  // 🔄 تحميل التعليقات عند تغيير المعرف
  // ============================================================

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ============================================================
  // 🎨 العرض (UI)
  // ============================================================

  // حالة التحميل
  if (loading) {
    return (
      <div className="comments-loading" aria-label="جاري تحميل التعليقات">
        <Loader />
        <p>جاري تحميل التعليقات...</p>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="comments-error" role="alert">
        <p>❌ {error}</p>
        <button onClick={fetchComments}>إعادة المحاولة</button>
      </div>
    );
  }

  // حالة عدم وجود تعليقات
  if (comments.length === 0) {
    return (
      <div className="comments-empty" role="status">
        <p>لا توجد تعليقات بعد</p>
      </div>
    );
  }

  // ✅ تحويل التعليقات إلى التنسيق المتوقع من CommentItem
  const commentItems: CommentItemData[] = comments.map(toCommentItemData);

  // عرض التعليقات
  return (
    <section className="comments-section space-y-2">
      <h4 className="comments-title">
        التعليقات ({comments.length})
      </h4>
      <div className="comments-list">
        {commentItems.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </section>
  );
};

export default CommentsSection;