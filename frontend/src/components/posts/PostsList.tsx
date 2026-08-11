// src/components/posts/PostsList.tsx
// 📋 قائمة المنشورات - نسخة محسّنة مع تحويل آمن للبيانات
// @version 2.1.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React from "react";
import PostCard from "./PostCard";
import type { Post } from "../../types/Post";

// ============================================================
// 📋 تعريف أنواع الخصائص
// ============================================================

interface PostsListProps {
  posts: Post[];
}

/**
 * شكل البيانات المتوقع من PostCard
 * (PostCard يتوقع author كـ string و id إلزامي)
 */
interface PostCardData {
  _id: string;
  id: string;           // ✅ إلزامي (من _id)
  title: string;
  content: string;
  media?: string[];
  author: string;       // ✅ هنا author هو string (المعرف)
  createdAt: string;
  updatedAt?: string;
  commentsCount?: number;
  reactionsCount?: number;
  sharesCount?: number;
  userReaction?: string;
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  // ============================================================
  // 📋 حالة عدم وجود منشورات
  // ============================================================

  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8" role="status">
        لا توجد منشورات بعد
      </div>
    );
  }

  // ============================================================
  // 🔄 دالة تحويل Post → PostCardData
  // ============================================================

  /**
   * تحويل منشور من صيغة API (Post) إلى الصيغة المتوقعة من PostCard
   * 
   * @param post - المنشور من نوع Post (مع author ككائن)
   * @returns كائن متوافق مع PostCard (مع author كـ string)
   */
  const toPostCardData = (post: Post): PostCardData => {
    // ✅ استخراج معرف المستخدم من كائن author
    const authorId = typeof post.author === 'string'
      ? post.author
      : post.author?._id || '';

    return {
      _id: post._id,
      id: post._id, // تعيين id من _id (ضمان وجود id دائماً)
      title: post.title,
      content: post.content,
      media: post.media || [],
      author: authorId, // ✅ author هو string (المعرف)
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentsCount: post.commentsCount || 0,
      reactionsCount: post.reactionsCount || 0,
      sharesCount: post.sharesCount || 0,
      userReaction: post.userReaction,
    };
  };

  // ============================================================
  // 🎨 عرض القائمة
  // ============================================================

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        // ✅ تحويل البيانات لتتوافق مع PostCard
        const postForCard = toPostCardData(post);

        return (
          <PostCard
            key={post._id}
            post={postForCard} 
          />
        );
      })}
    </div>
  );
};

export default PostsList;