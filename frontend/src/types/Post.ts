// src/types/Post.ts
// 📝 أنواع بيانات المنشورات - نسخة موحدة مع دوال تحويل آمنة
// @version 3.0.0
// @lastUpdated 2026

// ============================================================
// الأنواع الأساسية
// ============================================================

export interface Author {
  _id: string;
  username: string;
  name?: string;
  avatar?: string;
}

export interface Post {
  _id: string;           // ✅ معرف البوست الأساسي (من MongoDB)
  id?: string;           // ✅ اختياري للتوافق مع مكونات أخرى
  title: string;
  content: string;
  media?: string[];
  author: Author;
  createdAt: string;
  updatedAt?: string;
  // حقول إضافية (اختيارية)
  commentsCount?: number;
  reactionsCount?: number;
  sharesCount?: number;
  userReaction?: string;
}

// ============================================================
// دوال تحويل آمنة (اختيارية)
// ============================================================

export function toAuthor(data: any): Author {
  return {
    _id: data?._id || '',
    username: data?.username || data?.name || 'مستخدم',
    name: data?.name || data?.username,
    avatar: data?.avatar,
  };
}

export function toPost(data: any): Post {
  return {
    _id: data?._id || '',
    id: data?.id || data?._id,
    title: data?.title || '',
    content: data?.content || '',
    media: Array.isArray(data?.media) ? data.media : [],
    author: toAuthor(data?.author),
    createdAt: data?.createdAt || new Date().toISOString(),
    updatedAt: data?.updatedAt,
    commentsCount: data?.commentsCount || 0,
    reactionsCount: data?.reactionsCount || 0,
    sharesCount: data?.sharesCount || 0,
    userReaction: data?.userReaction,
  };
}

export function toPostArray(data: any[]): Post[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => toPost(item));
}