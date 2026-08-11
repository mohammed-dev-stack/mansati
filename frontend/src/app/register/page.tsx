// src/app/register/page.tsx
// 📝 صفحة إنشاء حساب جديد - نسخة محسّنة وآمنة
// @version 2.2.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types/User";
import "../../styles/Auth.css";

// ============================================================
// 📋 تعريف الأنواع المحلية
// ============================================================

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

export default function RegisterPage() {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const { register, loading, error, status } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{
    username: boolean;
    email: boolean;
    password: boolean;
  }>({
    username: false,
    email: false,
    password: false,
  });

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // ============================================================
  // 📝 التحقق من صحة المدخلات (Client-side Validation)
  // ============================================================

  const validateField = useCallback(
    (name: keyof RegisterFormData, value: string): string | undefined => {
      if (name === "username") {
        if (!value.trim()) return "اسم المستخدم مطلوب";
        if (value.length < 3) return "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
        if (value.length > 20) return "اسم المستخدم يجب أن لا يتجاوز 20 حرفاً";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "اسم المستخدم يمكن أن يحتوي فقط على حروف وأرقام و_";
        }
        return undefined;
      }

      if (name === "email") {
        if (!value.trim()) return "البريد الإلكتروني مطلوب";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "يرجى إدخال بريد إلكتروني صحيح";
        }
        return undefined;
      }

      if (name === "password") {
        if (!value.trim()) return "كلمة المرور مطلوبة";
        if (value.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        return undefined;
      }

      return undefined;
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const usernameError = validateField("username", formData.username);
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // ============================================================
  // 🧭 دوال المعالجة (Handlers)
  // ============================================================

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // التحقق الفوري عند فقدان التركيز (Blur)
      if (touched[name as keyof typeof touched]) {
        const error = validateField(name as keyof RegisterFormData, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name as keyof RegisterFormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // التحقق من الصلاحية قبل الإرسال
      if (!validateForm()) return;

      // تنظيف الأخطاء القديمة
      setErrors({});

      try {
        // ✅ استدعاء دالة register ونحدد النوع باستخدام as
        const response = (await register(formData)) as {
          token?: string;
          user?: User;
          _id?: string;
        };

        // ✅ حفظ التوكن إذا موجود
        if (response?.token) {
          localStorage.setItem("token", response.token);
        }

        // ✅ استخراج الـ id باستخدام _id فقط (لأن User لا يحتوي على id)
        const userId = response?.user?._id || response?._id;

        if (userId) {
          setIsRedirecting(true);
          setTimeout(() => {
            router.push(`/profile/${userId}`);
          }, 100);
        } else {
          console.error("❌ لم يتم إرجاع معرف المستخدم من الخادم:", response);
          setErrors((prev) => ({
            ...prev,
            general: "حدث خطأ غير متوقع أثناء إنشاء الحساب",
          }));
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "فشل إنشاء الحساب";
        setErrors((prev) => ({ ...prev, general: errorMessage }));
        console.error("❌ [Register] فشل إنشاء الحساب:", err);
      }
    },
    [formData, register, router, validateForm]
  );

  // ============================================================
  // 🎨 العرض (UI)
  // ============================================================

  return (
    <section className="auth" aria-label="صفحة إنشاء حساب">
      <div className="auth-container">
        <h1 className="auth-title">إنشاء حساب</h1>

        {/* ============================================================
            📝 نموذج التسجيل
            ============================================================ */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* حقل اسم المستخدم */}
          <div className="form-group">
            <label htmlFor="username" className="sr-only">
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="اسم المستخدم"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.username ? "input-error" : ""}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              disabled={loading || isRedirecting}
              required
              autoComplete="username"
              autoFocus
            />
            {errors.username && (
              <span id="username-error" className="field-error" role="alert">
                {errors.username}
              </span>
            )}
          </div>

          {/* حقل البريد الإلكتروني */}
          <div className="form-group">
            <label htmlFor="email" className="sr-only">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? "input-error" : ""}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={loading || isRedirecting}
              required
              autoComplete="email"
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* حقل كلمة المرور */}
          <div className="form-group">
            <label htmlFor="password" className="sr-only">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password ? "input-error" : ""}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={loading || isRedirecting}
              required
              autoComplete="new-password"
              minLength={6}
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* خطأ عام (من الخادم) */}
          {errors.general && (
            <div className="error-msg" role="alert">
              ❌ {errors.general}
            </div>
          )}

          {/* رسالة نجاح */}
          {status === "success" && !errors.general && (
            <div className="success-msg" role="status">
              ✅ تم إنشاء الحساب بنجاح! جاري التوجيه...
            </div>
          )}

          {/* زر الإرسال */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading || isRedirecting}
            aria-busy={loading || isRedirecting}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                جاري إنشاء الحساب...
              </>
            ) : isRedirecting ? (
              "جاري التوجيه..."
            ) : (
              "إنشاء حساب"
            )}
          </button>
        </form>

        {/* ============================================================
            🔗 رابط تسجيل الدخول
            ============================================================ */}
        <p className="auth-footer">
          لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </section>
  );
}