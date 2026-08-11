"use client"; // ✅ يحدد أن هذا الكومبوننت يعمل على جانب العميل (Client Component) في Next.js
import React, { useMemo } from "react"; // ✅ استيراد React والهوك useMemo لتحسين الأداء
import Link from "next/link"; // ✅ مكون للتنقل بين الصفحات داخل Next.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // ✅ استيراد أيقونات FontAwesome
import {
  faNewspaper,
  faEnvelope,
  faComment,
  faShareAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons"; // ✅ استيراد الأيقونات المستخدمة
import "../styles/Home.css"; // ✅ استيراد ملف التنسيقات الخاص بصفحة Home

export default function HomePage() {
  // ✅ تعريف البطاقات في مصفوفة واحدة باستخدام useMemo لتجنب إعادة الإنشاء في كل رندر
  const features = useMemo(
    () => [
      {
        icon: faNewspaper,
        title: "Posts",
        description: "Share your thoughts, stories, and updates with the community.",
        route: "/posts", // ✅ رابط القسم
      },
      {
        icon: faComment,
        title: "Comments",
        description: "Engage in meaningful conversations and discussions.",
        route: "/comments",
      },
      {
        icon: faEnvelope,
        title: "Messages",
        description: "Stay connected with friends through private messaging.",
        route: "/messages",
      },
      {
        icon: faShareAlt,
        title: "Sharing",
        description: "Spread ideas and content easily across the platform.",
        route: "/sharing",
      },
      {
        icon: faUsers,
        title: "Community",
        description: "Discover new people, groups, and trending topics.",
        route: "/community",
      },
    ],
    []
  );

  return (
    <section className="home">
      {/* ✅ القسم الرئيسي (Hero Section) */}
      <header className="home-header">
        <h1 className="logo1">Social App</h1>
        <p className="tagline">
          A modern social platform to connect, share, and engage with your community.
        </p>
        <Link href="/register" className="cta-btn">
          Get Started {/* ✅ زر دعوة للتسجيل */}
        </Link>
      </header>

      {/* ✅ قسم المميزات (Features Overview) */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <Link href={feature.route} key={index} className="feature-card">
            <FontAwesomeIcon icon={feature.icon} className="feature-icon" /> {/* ✅ أيقونة الميزة */}
            <h3>{feature.title}</h3> {/* ✅ عنوان الميزة */}
            <p>{feature.description}</p> {/* ✅ وصف الميزة */}
          </Link>
        ))}
      </div>
    </section>
  );
}



