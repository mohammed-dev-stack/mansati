// src/types/Comment.ts
// 💬 أنواع بيانات التعليقات - نظام الأنواع الموحد للمشروع
// @version 2.0.0
// @lastUpdated 2026

/**
 * ============================================================
 * 📌 نظرة عامة (Overview)
 * ============================================================
 * هذا الملف هو المصدر الوحيد والحصري (Single Source of Truth)
 * لجميع أنواع بيانات التعليقات في التطبيق.
 * 
 * يضمن:
 * 1. توافق البيانات بين الخادم (Backend) والعميل (Frontend)
 * 2. سلامة النوع (Type Safety) في جميع مراحل التطوير
 * 3. إمكانية الصيانة والتوسع المستقبلي
 * 4. تحويل آمن للبيانات القادمة من API
 * 
 * ============================================================
 * 📋 المعايير الهندسية المعتمدة
 * ============================================================
 * ✅ تصدير واضح لجميع الأنواع (Export)
 * ✅ دوال تحويل آمنة (Safe Transform Functions)
 * ✅ تعليقات توثيقية لكل جزء (JSDoc Comments)
 * ✅ معالجة الحالات الحدية (Edge Cases)
 * ✅ توافق مع معمارية المشروع
 * ============================================================
 */

// ============================================================
// 📦 الأنواع الأساسية (Core Types)
// ============================================================

/**
 * معلومات المستخدم المصغّرة (تُستخدم داخل التعليق)
 * 
 * @property _id - معرف المستخدم الفريد (من MongoDB)
 * @property name - اسم المستخدم الكامل (اختياري)
 * @property username - اسم المستخدم للتسجيل (اختياري)
 * @property avatar - رابط صورة المستخدم (اختياري)
 * 
 * @example
 * const user: CommentUser = {
 *   _id: "507f1f77bcf86cd799439011",
 *   name: "أحمد محمد",
 *   username: "ahmed_m",
 *   avatar: "/uploads/avatar.png"
 * };
 */
export interface CommentUser {
  /** معرف المستخدم الفريد (MongoDB ObjectId) */
  _id: string;
  
  /** اسم المستخدم الكامل (للعرض) */
  name?: string;
  
  /** اسم المستخدم للتسجيل (للإشارة) */
  username?: string;
  
  /** رابط صورة المستخدم (قد يكون null) */
  avatar?: string | null;
}

/**
 * كيان التعليق الكامل
 * 
 * @property _id - معرف التعليق الفريد
 * @property user - صاحب التعليق (كائن أو معرف فقط)
 * @property text - نص التعليق
 * @property createdAt - تاريخ الإنشاء
 * @property updatedAt - تاريخ آخر تحديث (اختياري)
 * 
 * @example
 * const comment: Comment = {
 *   _id: "507f1f77bcf86cd799439012",
 *   user: {
 *     _id: "507f1f77bcf86cd799439011",
 *     name: "أحمد محمد"
 *   },
 *   text: "هذا تعليق رائع!",
 *   createdAt: "2026-08-11T10:00:00Z"
 * };
 */
export interface Comment {
  /** معرف التعليق الفريد (MongoDB ObjectId) */
  _id: string;
  
  /** صاحب التعليق (قد يكون كاملًا أو معرفًا فقط) */
  user: CommentUser | string;
  
  /** نص التعليق (المحتوى الفعلي) */
  text: string;
  
  /** تاريخ ووقت الإنشاء (ISO String) */
  createdAt: string;
  
  /** تاريخ ووقت آخر تحديث (ISO String) - اختياري */
  updatedAt?: string;
}

// ============================================================
// 🔄 دوال تحويل آمنة (Safe Transform Functions)
// ============================================================

/**
 * تحويل أي قيمة (من API أو غيرها) إلى كائن مستخدم صالح
 * 
 * 🛡️ الغرض من الدالة:
 * - حماية التطبيق من البيانات غير المنتظمة القادمة من الخادم
 * - توفير قيم افتراضية آمنة لمنع الأعطال (Fail-safe)
 * - توحيد هيكل كائن المستخدم في جميع أنحاء التطبيق
 * 
 * 📌 حالات المعالجة:
 * 1. إذا كانت القيمة null/undefined → نعيد كائن افتراضي
 * 2. إذا كانت القيمة نص (string) → نعتبرها معرف المستخدم
 * 3. إذا كانت القيمة كائن → نستخرج الحقول المطلوبة
 * 
 * @param data - أي قيمة (قد تكون من API أو null أو undefined)
 * @returns كائن مستخدم صالح مع قيم افتراضية
 * 
 * @example
 * // حالة البيانات الكاملة
 * toCommentUser({ _id: '123', name: 'أحمد', avatar: '/img.jpg' })
 * // => { _id: '123', name: 'أحمد', avatar: '/img.jpg' }
 * 
 * // حالة البيانات الناقصة
 * toCommentUser({ _id: '123' })
 * // => { _id: '123', name: 'مستخدم', avatar: undefined }
 * 
 * // حالة البيانات الفارغة
 * toCommentUser(null)
 * // => { _id: '', name: 'مستخدم' }
 */
export function toCommentUser(data: any): CommentUser {
  // ✅ الحالة الأولى: بيانات فارغة أو غير موجودة
  if (!data) {
    return { 
      _id: '', 
      name: 'مستخدم' 
    };
  }

  // ✅ الحالة الثانية: البيانات هي مجرد معرف (نص)
  if (typeof data === 'string') {
    return { 
      _id: data, 
      name: 'مستخدم' 
    };
  }

  // ✅ الحالة الثالثة: البيانات كائن كامل
  return {
    _id: data._id || '',
    name: data.name || data.username || 'مستخدم',
    username: data.username,
    avatar: data.avatar || null,
  };
}

/**
 * تحويل أي كائن (من API) إلى تعليق صالح
 * 
 * 🛡️ الغرض من الدالة:
 * - معالجة البيانات القادمة من الخادم بجميع صيغها
 * - توفير قيم افتراضية آمنة
 * - التعامل مع الحقول المفقودة أو غير المتوقعة
 * 
 * 📌 حالات المعالجة:
 * 1. إذا كانت البيانات فارغة → نعيد تعليقاً افتراضياً
 * 2. إذا كان حقل user مجرد معرف → نُحوّله إلى كائن
 * 3. إذا كانت بعض الحقول مفقودة → نستخدم قيماً افتراضية
 * 
 * @param data - أي كائن قادم من API أو null/undefined
 * @returns تعليق صالح مع قيم افتراضية
 * 
 * @example
 * // من الخادم (بـ _id و user كائن)
 * toComment({
 *   _id: '123',
 *   user: { _id: '456', name: 'سارة' },
 *   text: 'مرحباً!',
 *   createdAt: '2026-08-11T10:00:00Z'
 * })
 * 
 * // من الخادم (بـ id و userId نص)
 * toComment({
 *   id: '123',
 *   userId: '456',
 *   content: 'مرحباً!',
 *   createdAt: '2026-08-11T10:00:00Z'
 * })
 * // => سيتم التعامل معها أيضاً (مرونة عالية)
 */
export function toComment(data: any): Comment {
  // ✅ الحالة الأولى: بيانات فارغة
  if (!data) {
    return {
      _id: '',
      user: { _id: '', name: 'مستخدم' },
      text: '',
      createdAt: new Date().toISOString(),
    };
  }

  // ✅ استخراج معرف التعليق (يدعم _id و id)
  const commentId = data._id || data.id || '';

  // ✅ استخراج معرف المستخدم (يدعم user, userId, author, authorId)
  const userData = data.user || data.author || data.userId || data.authorId || null;

  // ✅ استخراج النص (يدعم text, content, message)
  const commentText = data.text || data.content || data.message || '';

  // ✅ استخراج التاريخ (يدعم createdAt, created_at, timestamp)
  const createdAt = data.createdAt || data.created_at || data.timestamp || data.created || new Date().toISOString();

  return {
    _id: commentId,
    user: toCommentUser(userData),
    text: commentText,
    createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
    updatedAt: data.updatedAt || data.updated_at,
  };
}

/**
 * تحويل مصفوفة من البيانات إلى مصفوفة من التعليقات الصالحة
 * 
 * 🛡️ الغرض من الدالة:
 * - معالجة قوائم التعليقات القادمة من API
 * - ضمان أن جميع عناصر المصفوفة صالحة وآمنة
 * - توفير حماية من البيانات غير المتوقعة
 * 
 * 📌 حالات المعالجة:
 * 1. إذا كانت القيمة ليست مصفوفة → نعيد مصفوفة فارغة
 * 2. إذا كانت المصفوفة فارغة → نعيد مصفوفة فارغة
 * 3. إذا كانت المصفوفة تحتوي على بيانات → نحول كل عنصر إلى Comment
 * 
 * @param data - أي قيمة (مصفوفة أو غير مصفوفة) من API
 * @returns مصفوفة من التعليقات الصالحة (آمنة دائماً)
 * 
 * @example
 * // بيانات صحيحة من الخادم
 * toCommentArray([
 *   { _id: '1', user: '456', text: 'مرحباً', createdAt: '...' },
 *   { _id: '2', user: '789', text: 'أهلاً', createdAt: '...' }
 * ])
 * // => [Comment, Comment]
 * 
 * // بيانات غير متوقعة (null أو نص)
 * toCommentArray(null) // => []
 * toCommentArray('not an array') // => []
 * toCommentArray([]) // => []
 * 
 * // بيانات مختلطة (بعضها صحيح، بعضها خاطئ)
 * toCommentArray([
 *   null,
 *   { _id: '1', text: 'مرحباً' },
 *   'invalid'
 * ])
 * // => [Comment (افتراضي), Comment, Comment (افتراضي)]
 */
export function toCommentArray(data: any[]): Comment[] {
  // ✅ إذا لم تكن القيمة مصفوفة → نعيد مصفوفة فارغة
  if (!Array.isArray(data)) {
    return [];
  }

  // ✅ تطبيق toComment على كل عنصر (مع الحماية من الأخطاء)
  return data.map((item) => {
    try {
      return toComment(item);
    } catch (_error) {
      // ✅ في حال فشل تحويل أي عنصر، نعيد تعليقاً افتراضياً
      return {
        _id: '',
        user: { _id: '', name: 'مستخدم' },
        text: '',
        createdAt: new Date().toISOString(),
      };
    }
  });
}

// ============================================================
// 🧪 دوال مساعدة للتحقق من الأنواع (Type Guards)
// ============================================================

/**
 * التحقق مما إذا كانت قيمة معينة هي تعليق صالح
 * 
 * @param value - أي قيمة
 * @returns true إذا كانت Comment صالحة
 * 
 * @example
 * if (isComment(data)) {
 *   console.log(data.text);
 * }
 */
export function isComment(value: any): value is Comment {
  return (
    value &&
    typeof value === 'object' &&
    value._id &&
    typeof value._id === 'string' &&
    value.text &&
    typeof value.text === 'string' &&
    value.createdAt &&
    typeof value.createdAt === 'string'
  );
}

/**
 * التحقق مما إذا كانت مصفوفة تحتوي على تعليقات صالحة
 * 
 * @param value - أي قيمة
 * @returns true إذا كانت المصفوفة تحتوي على تعليقات صالحة
 * 
 * @example
 * if (isCommentArray(data)) {
 *   data.forEach(comment => console.log(comment.text));
 * }
 */
export function isCommentArray(value: any): value is Comment[] {
  return Array.isArray(value) && value.every((item) => isComment(item));
}

// ============================================================
// 📤 التصدير النهائي (للتأكد من عدم نسيان أي شيء)
// ============================================================

// تم التصدير أعلاه باستخدام export interface و export function
// جميع الأنواع والدوال متاحة للاستيراد عبر:
// import { Comment, CommentUser, toComment, toCommentArray, ... } from '@/types/Comment';