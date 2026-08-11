// src/hooks/useUser.ts
// 👤 هوك إدارة المستخدمين - نسخة محسّنة مع أنواع آمنة
// @version 2.0.0
// @lastUpdated 2026

import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User, SearchUserResult } from '../types/User';
import { toUser, toUserArray } from '../types/User';

// ============================================================
// 📋 تعريف أنواع الإرجاع
// ============================================================

interface UseUserReturn {
  /** المستخدم الحالي */
  user: User | null;
  /** تحديث المستخدم مباشرة (للاستخدام الداخلي) */
  setUser: (user: User | null) => void;
  /** حالة التحميل */
  loading: boolean;
  /** رسالة الخطأ (إن وجدت) */
  error: string | null;
  /** حالة العملية (idle | success | error) */
  status: 'idle' | 'success' | 'error';
  /** تسجيل الدخول */
  login: (email: string, password: string) => Promise<User | null>;
  /** إنشاء حساب جديد */
  register: (data: { username: string; email: string; password: string }) => Promise<User | null>;
  /** تسجيل الخروج */
  logout: () => Promise<void>;
  /** البحث عن مستخدمين */
  searchUsers: (query: string) => Promise<SearchUserResult[]>;
  /** إعادة تعيين الحالة */
  reset: () => void;
}

// ============================================================
// 🧠 هوك useUser
// ============================================================

/**
 * هوك مخصص لإدارة المستخدمين
 * 
 * 📌 المعايير الهندسية:
 * - ✅ يستخدم أنواعاً صريحة من types/User
 * - ✅ دوال تحويل آمنة (toUser, toUserArray)
 * - ✅ معالجة شاملة للأخطاء
 * 
 * @returns {UseUserReturn} دوال وحالات إدارة المستخدمين
 */
export function useUser(): UseUserReturn {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ============================================================
  // 🔑 استخراج التوكن من localStorage
  // ============================================================

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // ============================================================
  // 📝 تسجيل الدخول
  // ============================================================

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    if (!email.trim() || !password.trim()) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus('idle');

      // ✅ استدعاء الخدمة وتحديد النوع باستخدام as User
      const result = await userService.login(email, password) as User;

      // ✅ تحويل البيانات إلى كائن User آمن
      const loggedInUser = toUser(result);
      setUser(loggedInUser);
      setStatus('success');

      // ✅ حفظ التوكن في localStorage (إذا كان موجوداً)
      if (loggedInUser.token) {
        localStorage.setItem('token', loggedInUser.token);
      }

      return loggedInUser;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل تسجيل الدخول';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ [useUser] فشل تسجيل الدخول:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // 📝 إنشاء حساب جديد
  // ============================================================

  const register = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User | null> => {
    const { username, email, password } = data;

    if (!username.trim()) {
      setError('اسم المستخدم مطلوب');
      return null;
    }
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return null;
    }
    if (!password.trim() || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus('idle');

      // ✅ استدعاء الخدمة (ترتيب الوسائط: name, email, password)
      const result = await userService.register(username, email, password) as User;

      // ✅ تحويل البيانات إلى كائن User آمن
      const newUser = toUser(result);
      setUser(newUser);
      setStatus('success');

      // ✅ حفظ التوكن في localStorage (إذا كان موجوداً)
      if (newUser.token) {
        localStorage.setItem('token', newUser.token);
      }

      return newUser;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل إنشاء الحساب';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ [useUser] فشل إنشاء الحساب:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // 📝 تسجيل الخروج
  // ============================================================

  const logout = useCallback(async (): Promise<void> => {
    const token = getToken();
    try {
      setLoading(true);
      if (token) {
        await userService.logout(token);
      }
    } catch (err) {
      console.warn('⚠️ [useUser] خطأ أثناء تسجيل الخروج:', err);
    } finally {
      setUser(null);
      setStatus('idle');
      setError(null);
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // 📝 البحث عن مستخدمين
  // ============================================================

  const searchUsers = useCallback(async (query: string): Promise<SearchUserResult[]> => {
    const token = getToken();
    if (!query || query.trim().length === 0) {
      return [];
    }
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ استدعاء خدمة البحث مع التوكن
      const result = await userService.search(query, token);

      // ✅ التأكد من أن النتيجة مصفوفة
      const resultArray = Array.isArray(result) ? result : [];
      return resultArray as SearchUserResult[];
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل البحث عن المستخدمين';
      setError(errorMessage);
      console.error('❌ [useUser] فشل البحث:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // ============================================================
  // 🔄 إعادة تعيين الحالة (Reset)
  // ============================================================

  const reset = useCallback((): void => {
    setUser(null);
    setLoading(false);
    setError(null);
    setStatus('idle');
  }, []);

  // ============================================================
  // 📤 تصدير الهوك
  // ============================================================

  return {
    user,
    setUser,
    loading,
    error,
    status,
    login,
    register,
    logout,
    searchUsers,
    reset,
  };
}