// src/context/AuthContext.tsx
// 🔐 مزود المصادقة - نظام إدارة المستخدمين والجلسات
// @version 2.0.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { userService } from "../services/userService";
import type { User } from "../types/User";

// ============================================================
// 📋 تعريف الأنواع
// ============================================================

/**
 * شكل بيانات المستخدم كما يخزن في السياق والتخزين المحلي
 * (مطابق لما يرسله الخادم، مع استخدام _id)
 */
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  token: string;
  refreshToken?: string;
}

/**
 * شكل بيانات تسجيل الدخول
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * شكل بيانات التسجيل
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * واجهة السياق (ما توفره للمكونات)
 */
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  error: string | null;
}

// ============================================================
// 🧠 إنشاء السياق
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// 🏗️ مزود السياق (AuthProvider)
// ============================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 🔄 تحميل المستخدم من التخزين المحلي عند بدء التشغيل
  // ============================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // ✅ التحقق من صحة البيانات المخزنة
        if (parsedUser && parsedUser._id && parsedUser.token) {
          setUser(parsedUser);
        } else {
          // ✅ إذا كانت البيانات غير صالحة، حذفها
          localStorage.removeItem("user");
        }
      }
    } catch (err) {
      console.error("❌ [AuthContext] فشل تحميل المستخدم من localStorage:", err);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // 📝 دوال المصادقة (مع أنواع صريحة ومعالجة أخطاء)
  // ============================================================

  /**
   * تسجيل الدخول
   * 
   * @param email - البريد الإلكتروني
   * @param password - كلمة المرور
   * @throws {Error} في حال فشل تسجيل الدخول
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    // ✅ التحقق من المدخلات
    if (!email.trim() || !password.trim()) {
      setError("البريد الإلكتروني وكلمة المرور مطلوبان");
      throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة مع تحديد النوع (as AuthUser)
      const loggedInUser = await userService.login(email, password) as AuthUser;

      // ✅ التحقق من صحة البيانات المسترجعة
      if (!loggedInUser || !loggedInUser._id || !loggedInUser.token) {
        throw new Error("بيانات المستخدم غير مكتملة من الخادم");
      }

      // ✅ تحديث الحالة والتخزين المحلي
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "فشل تسجيل الدخول";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * إنشاء حساب جديد
   * 
   * @param name - اسم المستخدم
   * @param email - البريد الإلكتروني
   * @param password - كلمة المرور
   * @throws {Error} في حال فشل التسجيل
   */
  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    // ✅ التحقق من المدخلات
    if (!name.trim()) {
      setError("الاسم مطلوب");
      throw new Error("الاسم مطلوب");
    }
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      throw new Error("البريد الإلكتروني مطلوب");
    }
    if (!password.trim() || password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة مع تحديد النوع (as AuthUser)
      const newUser = await userService.register(name, email, password) as AuthUser;

      // ✅ التحقق من صحة البيانات المسترجعة
      if (!newUser || !newUser._id || !newUser.token) {
        throw new Error("بيانات المستخدم غير مكتملة من الخادم");
      }

      // ✅ تحديث الحالة والتخزين المحلي
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "فشل إنشاء الحساب";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * تسجيل الخروج
   */
  const logout = useCallback((): void => {
    try {
      // ✅ إذا كان هناك توكن، إبلاغ الخادم (اختياري)
      if (user?.token) {
        userService.logout(user.token).catch((err) => {
          console.warn("⚠️ [AuthContext] فشل إعلام الخادم بتسجيل الخروج:", err);
        });
      }
    } catch (err) {
      console.warn("⚠️ [AuthContext] خطأ أثناء تسجيل الخروج:", err);
    } finally {
      // ✅ تنظيف الحالة والتخزين المحلي دائماً
      setUser(null);
      localStorage.removeItem("user");
      setError(null);
    }
  }, [user]);

  /**
   * تحديث بيانات المستخدم (مثل تغيير الصورة أو الاسم)
   */
  const updateUser = useCallback((updatedData: Partial<AuthUser>): void => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, [user]);

  // ============================================================
  // 🎨 القيم المصدرة للسياق
  // ============================================================

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!user.token,
    login,
    register,
    logout,
    updateUser,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// 🪝 هوك استخدام المصادقة (useAuth)
// ============================================================

/**
 * هوك مخصص للوصول إلى سياق المصادقة
 * 
 * @returns {AuthContextType} كائن السياق
 * @throws {Error} إذا تم استخدامه خارج AuthProvider
 * 
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ============================================================
// 📤 تصدير مباشر للسياق (للاستخدام المباشر عند الحاجة)
// ============================================================

export { AuthContext };