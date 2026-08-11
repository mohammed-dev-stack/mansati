"use client"; // ✅ يحدد أن هذا الكومبوننت يعمل على جانب العميل (Client Component) في Next.js
import React, { useState, useEffect } from "react"; // ✅ استيراد React والهوكس
import UsersSection from "../../components/admin/UsersSection"; // ✅ قسم إدارة المستخدمين
import "./admin.css";  // ✅ استيراد ملف التنسيقات الخاص بلوحة التحكم
import PostsSection from "../../components/admin/PostsSection"; // ✅ قسم إدارة البوستات
import CommentsSection from "../../components/admin/CommentsSection";   // ✅ قسم إدارة التعليقات
import MessagesSection from "../../components/admin/MessagesSection";   // ✅ قسم إدارة الرسائل
import ReactionsSection from "../../components/admin/ReactionsSection"; // ✅ قسم إدارة التفاعلات

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users"); // ✅ حالة لتحديد التبويب النشط، يبدأ بالمستخدمين

  // ✅ تعريف التبويبات المتاحة في لوحة التحكم
  const tabs = [
    { key: "users", label: "Users" },
    { key: "posts", label: "Posts" },
    { key: "comments", label: "Comments" },
    { key: "messages", label: "Messages" },
    { key: "reactions", label: "Reactions" },
  ];

  return (
    <section className="admin-dashboard">
      {/* ✅ رأس الصفحة */}
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Control and manage all sections of the social app</p>
      </header>

      {/* ✅ شريط التبويبات للتنقل بين الأقسام */}
      <nav className="admin-nav">
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab.key} // ✅ مفتاح فريد لكل عنصر
              className={activeTab === tab.key ? "active" : ""} // ✅ تمييز التبويب النشط
              onClick={() => setActiveTab(tab.key)} // ✅ تغيير التبويب عند الضغط
            >
              {tab.label} {/* ✅ اسم التبويب */}
            </li>
          ))}
        </ul>
      </nav>

      {/* ✅ منطقة المحتوى التي تعرض القسم حسب التبويب النشط */}
      <div className="admin-content">
        {activeTab === "users" && <UsersSection />}       {/* ✅ قسم المستخدمين */}
        {activeTab === "posts" && <PostsSection />}       {/* ✅ قسم البوستات */}
        {activeTab === "comments" && <CommentsSection />} {/* ✅ قسم التعليقات */}
        {activeTab === "messages" && <MessagesSection />} {/* ✅ قسم الرسائل */}
        {activeTab === "reactions" && <ReactionsSection />} {/* ✅ قسم التفاعلات */}
      </div>
    </section>
  );
}

