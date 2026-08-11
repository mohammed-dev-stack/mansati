import React from "react";
import Navbar from "../components/Navbar"; // ✅ مكون شريط التنقل العلوي
import Footer from "../components/Footer"; // ✅ مكون الفوتر أسفل الصفحة
import { AuthProvider } from "../context/AuthContext"; // ✅ مزود السياق لإدارة حالة المصادقة (تسجيل الدخول/الخروج)
import { PostProvider } from "../context/PostContext"; // ✅ مزود السياق لإدارة حالة البوستات
import "../styles/global.css"; // ✅ استيراد ملف التنسيقات العامة للتطبيق

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ عنوان الصفحة */}
        <title>Social App</title>

        {/* ✅ وصف الصفحة لمحركات البحث */}
        <meta name="description" content="A modern social platform" />

        {/* ✅ إعدادات العرض للاستجابة */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* ✅ تغليف التطبيق بمزودي السياق لإتاحة البيانات عبر جميع المكونات */}
        <AuthProvider>
          <PostProvider>
            {/* ✅ عرض شريط التنقل */}
            <Navbar />

            {/* ✅ منطقة المحتوى الرئيسية */}
            <main className="container">{children}</main>

            {/* ✅ عرض الفوتر */}
            <Footer />
          </PostProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

