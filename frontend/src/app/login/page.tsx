// src/app/login/page.tsx
// 🔐 صفحة تسجيل الدخول - نسخة محسّنة وآمنة (مع استيراد نوع User)
// @version 2.2.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types/User"; 
import "../../styles/Auth.css";

// ============================================================
// 📋 تعريف الأنواع المحلية
// ============================================================

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

export default function LoginPage() {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const { login, loading, error, status } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // ============================================================
  // 📝 التحقق من صحة المدخلات (Client-side Validation)
  // ============================================================

  const validateField = useCallback(
    (name: keyof LoginFormData, value: string): string | undefined => {
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
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

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
        const error = validateField(name as keyof LoginFormData, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name as keyof LoginFormData, value);
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
        // ✅ استدعاء دالة login مع تمرير البريد الإلكتروني وكلمة المرور
        // ونقوم بتحديد النوع باستخدام 'as User' أو التحقق من وجود _id
        const user = (await login(formData.email, formData.password)) as User | null;

        // ✅ التحقق من وجود المستخدم ومعرف صحيح
        if (user && user._id) {
          setIsRedirecting(true);

          // التوجيه حسب الدور مع تأخير بسيط
          const redirectPath =
            user.role === "admin" ? "/admin" : `/profile/${user._id}`;

          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
        } else {
          // إذا لم يعد المستخدم أو لم يحتوي على _id
          setErrors((prev) => ({
            ...prev,
            general: "حدث خطأ غير متوقع في بيانات المستخدم",
          }));
        }
      } catch (err: any) {
        // معالجة الخطأ من الخادم
        const errorMessage =
          err?.response?.data?.message || err?.message || "فشل تسجيل الدخول";
        setErrors((prev) => ({ ...prev, general: errorMessage }));
        console.error("❌ [Login] فشل تسجيل الدخول:", err);
      }
    },
    [formData, login, router, validateForm]
  );

  // ============================================================
  // 🔄 تأثيرات جانبية (Effects)
  // ============================================================

  useEffect(() => {
    if (status === "success" && !isRedirecting) {
      // يمكن إضافة منطق إضافي هنا
    }
  }, [status, isRedirecting]);

  useEffect(() => {
    return () => {
      setIsRedirecting(false);
    };
  }, []);

  // ============================================================
  // 🎨 العرض (UI)
  // ============================================================

  return (
    <section className="auth" aria-label="صفحة تسجيل الدخول">
      <div className="auth-container">
        <h1 className="auth-title">تسجيل الدخول</h1>

        {/* ============================================================
            📝 نموذج تسجيل الدخول
            ============================================================ */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              autoFocus
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
              autoComplete="current-password"
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
              ✅ تم تسجيل الدخول بنجاح! جاري التوجيه...
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
                جاري تسجيل الدخول...
              </>
            ) : isRedirecting ? (
              "جاري التوجيه..."
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        {/* ============================================================
            🔗 رابط التسجيل
            ============================================================ */}
        <p className="auth-footer">
          ليس لديك حساب؟ <Link href="/register">إنشاء حساب</Link>
        </p>

        {/* ============================================================
            🔗 رابط استعادة كلمة المرور (اختياري)
            ============================================================ */}
        <p className="auth-footer" style={{ marginTop: "0.5rem" }}>
          <Link href="/forgot-password" className="forgot-link">
            نسيت كلمة المرور؟
          </Link>
        </p>
      </div>
    </section>
  );
}