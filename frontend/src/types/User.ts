// src/types/User.ts
// 👤 أنواع بيانات المستخدم - المصدر الوحيد والحصري لتعريفات المستخدم
// @version 5.2.1 (إصلاح خطأ Nullish coalescing)
// @lastUpdated 2026

// ============================================================
// 📌 نظرة عامة (Overview)
// ============================================================
// هذا الملف هو المصدر الوحيد (Single Source of Truth) لجميع
// أنواع بيانات المستخدم في التطبيق. يضمن:
// 1. توافق البيانات بين الخادم (Backend) والعميل (Frontend)
// 2. توافق مع AuthContext و useAuth
// 3. سلامة النوع (Type Safety) في جميع أنحاء التطبيق
// 4. دوال تحويل آمنة للبيانات القادمة من API
// ============================================================

// ============================================================================
// الأنواع الأساسية
// ============================================================================

/**
 * أدوار المستخدم في النظام
 */
export type UserRole = 'user' | 'moderator' | 'admin';

/**
 * الجنس (اختياري)
 */
export type Gender = 'male' | 'female' | 'other';

// ============================================================================
// واجهة المستخدم الرئيسية (متوافقة مع الخادم و AuthContext)
// ============================================================================

/**
 * كيان المستخدم الكامل
 * 
 * @remarks
 * - جميع الحقول تتطابق مع نموذج الخادم (User Model في MongoDB)
 * - تم إضافة حقلي `token` و `refreshToken` للتوافق مع AuthContext
 * - `_id` هو المعرف الأساسي (من MongoDB)
 * - الحقول الاختيارية محددة بوضوح
 * 
 * @example
 * const user: User = {
 *   _id: "507f1f77bcf86cd799439011",
 *   name: "أحمد محمد",
 *   email: "ahmed@example.com",
 *   role: "user",
 *   isActive: true,
 *   token: "eyJhbGciOiJIUzI1NiIs...",
 *   createdAt: "2026-08-11T10:00:00Z"
 * };
 */
export interface User {
  // ============================================================
  // 🔑 المعرفات الأساسية (Basic Identifiers)
  // ============================================================
  
  /** معرف المستخدم الفريد (MongoDB ObjectId) - إلزامي */
  _id: string;
  
  /** اسم المستخدم الكامل (للعرض) - إلزامي */
  name: string;
  
  /** البريد الإلكتروني (فريد) - إلزامي */
  email: string;
  
  /** دور المستخدم في النظام - إلزامي */
  role: UserRole;
  
  /** حالة النشاط (محظور/نشط) - إلزامي */
  isActive: boolean;

  // ============================================================
  // 🖼️ الصور والوسائط (Media & Images)
  // ============================================================
  
  /** رابط صورة المستخدم (اختياري) */
  avatar?: string | null;
  
  /** صورة الغلاف (Cover Photo) - اختياري */
  coverPhoto?: string;
  
  /** معرف صورة المستخدم في خدمة التخزين السحابي (اختياري) */
  avatarPublicId?: string;
  
  /** معرف صورة الغلاف في خدمة التخزين السحابي (اختياري) */
  coverPublicId?: string;

  // ============================================================
  // 📝 الملف الشخصي (Profile Information)
  // ============================================================
  
  /** نبذة عن المستخدم (Bio) - اختياري */
  bio?: string;
  
  /** الموقع الجغرافي - اختياري */
  location?: string;
  
  /** الموقع الإلكتروني - اختياري */
  website?: string;
  
  /** رقم الهاتف - اختياري */
  phone?: string;
  
  /** الجنس - اختياري */
  gender?: Gender;
  
  /** تاريخ الميلاد - اختياري */
  birthDate?: string;

  // ============================================================
  // 📊 الإحصائيات (Statistics)
  // ============================================================
  
  /** عدد المتابعين - اختياري (افتراضي 0) */
  followersCount?: number;
  
  /** عدد من يتابعهم - اختياري (افتراضي 0) */
  followingCount?: number;
  
  /** عدد المنشورات - اختياري (افتراضي 0) */
  postsCount?: number;
  
  /** حساب موثّق (Verified) - اختياري (افتراضي false) */
  isVerified?: boolean;

  // ============================================================
  // 🔐 الأمان والمصادقة (Security & Authentication)
  // ============================================================
  
  /** آخر تسجيل دخول - اختياري */
  lastLogin?: string;
  
  /** آخر عنوان IP - اختياري */
  lastIp?: string;
  
  /** عدد محاولات تسجيل الدخول الفاشلة - اختياري */
  loginAttempts?: number;
  
  /** وقت قفل الحساب حتى (Lock Until) - اختياري */
  lockUntil?: string;
  
  /** ✅ توكن المصادقة (JWT) - يُضاف عند تسجيل الدخول (اختياري) */
  token?: string;
  
  /** ✅ توكن التحديث (Refresh Token) - يُضاف عند تسجيل الدخول (اختياري) */
  refreshToken?: string;

  // ============================================================
  // ⏱️ التواريخ (Timestamps)
  // ============================================================
  
  /** تاريخ الإنشاء - إلزامي */
  createdAt: string;
  
  /** تاريخ آخر تحديث - اختياري */
  updatedAt?: string;
  
  /** تاريخ الحذف الناعم (Soft Delete) - اختياري */
  deletedAt?: string | null;
}

// ============================================================================
// أنواع مساعدة (Helper Types)
// ============================================================================

/**
 * المستخدم مع حالة المتابعة (يُستخدم في قوائم المستخدمين)
 */
export interface UserWithFollow extends User {
  /** هل يتابع المستخدم الحالي هذا المستخدم؟ */
  isFollowing: boolean;
  
  /** هل المستخدم متصل الآن؟ (للتواصل الفوري) - اختياري */
  isOnline?: boolean;
}

/**
 * نتيجة البحث عن مستخدمين (نسخة مبسطة للبحث)
 */
export interface SearchUserResult {
  /** معرف المستخدم */
  _id: string;
  
  /** اسم المستخدم */
  name: string;
  
  /** رابط صورة المستخدم (اختياري) */
  avatar?: string | null;
  
  /** عدد المتابعين (اختياري) */
  followersCount?: number;
  
  /** عدد من يتابعهم (اختياري) */
  followingCount?: number;
  
  /** عدد المنشورات (اختياري) */
  postsCount?: number;
  
  /** البريد الإلكتروني (قد يكون متاحاً في بعض الاستجابات) */
  email?: string;
}

/**
 * بيانات المستخدم للمصادقة (تسجيل الدخول/التسجيل)
 */
export interface AuthUserData {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  token: string;           // ✅ مطلوب للمصادقة
  refreshToken?: string;
}

// ============================================================================
// دوال تحويل آمنة (Safe Transform Functions)
// ============================================================================

/**
 * تحويل أي كائن قادم من API إلى كيان User صالح
 * 
 * @param data - البيانات القادمة من الخادم (قد تكون غير مكتملة)
 * @returns كائن User صالح مع قيم افتراضية آمنة
 * 
 * @example
 * const user = toUser({ _id: '123', name: 'أحمد', email: 'a@b.com' });
 * // => { _id: '123', name: 'أحمد', email: 'a@b.com', role: 'user', ... }
 */
export function toUser(data: any): User {
  return {
    _id: data?._id || '',
    name: data?.name || '',
    email: data?.email || '',
    role: data?.role || 'user',
    isActive: data?.isActive ?? true,
    avatar: data?.avatar ?? null,
    coverPhoto: data?.coverPhoto,
    avatarPublicId: data?.avatarPublicId,
    coverPublicId: data?.coverPublicId,
    bio: data?.bio || '',
    location: data?.location || '',
    website: data?.website || '',
    phone: data?.phone,
    gender: data?.gender,
    birthDate: data?.birthDate,
    followersCount: data?.followersCount || 0,
    followingCount: data?.followingCount || 0,
    postsCount: data?.postsCount || 0,
    isVerified: data?.isVerified ?? false,
    lastLogin: data?.lastLogin,
    lastIp: data?.lastIp,
    loginAttempts: data?.loginAttempts,
    lockUntil: data?.lockUntil,
    token: data?.token,
    refreshToken: data?.refreshToken,
    createdAt: data?.createdAt || new Date().toISOString(),
    updatedAt: data?.updatedAt,
    deletedAt: data?.deletedAt ?? null,
  };
}

/**
 * تحويل مصفوفة من البيانات إلى مصفوفة User
 */
export function toUserArray(data: any[]): User[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => toUser(item));
}

/**
 * تحويل كائن User إلى UserWithFollow (إضافة حالة المتابعة)
 */
export function toUserWithFollow(
  user: User,
  isFollowing: boolean,
  isOnline: boolean = false
): UserWithFollow {
  return {
    ...user,
    isFollowing,
    isOnline,
  };
}

/**
 * تحويل SearchUserResult إلى UserWithFollow
 * 
 * @remarks
 * تم إصلاح خطأ Nullish coalescing في خاصية avatar باستخدام الأقواس
 * لتحديد أولوية العمليات المنطقية بشكل صحيح.
 */
export function searchResultToUserWithFollow(
  result: SearchUserResult,
  fullUser?: User,
  isFollowing: boolean = false,
  isOnline: boolean = false
): UserWithFollow {
  const base = fullUser || result;
  return {
    _id: result._id,
    name: result.name,
    email: fullUser?.email || result.email || '',
    role: fullUser?.role || 'user',
    isActive: fullUser?.isActive ?? true,
    // ✅ تم إصلاح السطر التالي: إضافة أقواس لتوضيح الأولوية
    avatar: (result.avatar || fullUser?.avatar) ?? null,
    coverPhoto: fullUser?.coverPhoto,
    bio: fullUser?.bio || '',
    location: fullUser?.location || '',
    website: fullUser?.website || '',
    phone: fullUser?.phone,
    gender: fullUser?.gender,
    birthDate: fullUser?.birthDate,
    followersCount: result.followersCount ?? fullUser?.followersCount ?? 0,
    followingCount: result.followingCount ?? fullUser?.followingCount ?? 0,
    postsCount: result.postsCount ?? fullUser?.postsCount ?? 0,
    isVerified: fullUser?.isVerified ?? false,
    lastLogin: fullUser?.lastLogin,
    lastIp: fullUser?.lastIp,
    loginAttempts: fullUser?.loginAttempts,
    lockUntil: fullUser?.lockUntil,
    token: fullUser?.token,
    refreshToken: fullUser?.refreshToken,
    createdAt: fullUser?.createdAt || new Date().toISOString(),
    updatedAt: fullUser?.updatedAt,
    deletedAt: fullUser?.deletedAt ?? null,
    isFollowing,
    isOnline,
  };
}

// ============================================================================
// دوال مساعدة للتحقق من الأنواع (Type Guards)
// ============================================================================

/**
 * التحقق مما إذا كانت قيمة معينة هي User صالح
 */
export function isUser(value: any): value is User {
  return (
    value &&
    typeof value === 'object' &&
    typeof value._id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.role === 'string'
  );
}

/**
 * التحقق مما إذا كانت القيمة تحتوي على توكن (مستخدم موثّق)
 */
export function isAuthenticatedUser(value: any): value is User & { token: string } {
  return isUser(value) && typeof value.token === 'string' && value.token.length > 0;
}