// src/components/messenger/RecipientSearch.tsx
// 🔍 بحث المستلمين - نسخة محسّنة مع أنواع آمنة وتحويل صريح
// @version 2.1.0
// @lastUpdated 2026

"use client";

import React, { useState, useCallback } from "react";
import { useUser } from "../../hooks/useUser";
import Input from "../ui/Input";
import type { SearchUserResult } from "../../types/User";

// ============================================================
// 📋 تعريف أنواع الخصائص
// ============================================================

interface RecipientSearchProps {
  onSelect: (recipientId: string) => void;
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

const RecipientSearch: React.FC<RecipientSearchProps> = ({ onSelect }) => {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { searchUsers } = useUser();

  // ============================================================
  // 📝 معالجة البحث
  // ============================================================

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);

      // ✅ إذا كان النص فارغاً، امسح النتائج
      if (!value.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ استدعاء البحث مع تحويل النتيجة إلى النوع المطلوب
        // إذا كانت searchUsers تعيد unknown، نستخدم as لتأكيد النوع
        const users = (await searchUsers(value)) as SearchUserResult[];

        // ✅ التأكد من أن النتيجة مصفوفة، وإلا نستخدم مصفوفة فارغة
        const usersArray = Array.isArray(users) ? users : [];
        setResults(usersArray);
      } catch (err: any) {
        console.error("❌ [RecipientSearch] فشل البحث:", err);
        setError(err?.message || "فشل البحث عن المستخدمين");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchUsers]
  );

  // ============================================================
  // 🎨 العرض (UI)
  // ============================================================

  return (
    <div className="recipient-search">
      <Input
        placeholder="ابحث عن مستخدم..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={loading}
        aria-label="البحث عن مستخدم"
      />

      {/* ✅ رسالة التحميل */}
      {loading && (
        <div className="search-loading" aria-label="جاري البحث">
          <span className="spinner" />
          <span>جاري البحث...</span>
        </div>
      )}

      {/* ✅ رسالة الخطأ */}
      {error && (
        <div className="search-error" role="alert">
          ❌ {error}
        </div>
      )}

      {/* ✅ نتائج البحث */}
      {!loading && !error && results.length > 0 && (
        <ul className="search-results mt-2">
          {results.map((user) => (
            <li
              key={user._id} // ✅ استخدام _id بدلاً من id
              className="search-result-item p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(user._id)} // ✅ استخدام _id
            >
              <span className="user-name">{user.name}</span>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar w-8 h-8 rounded-full"
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ✅ حالة عدم وجود نتائج */}
      {!loading && !error && query.trim() && results.length === 0 && (
        <div className="no-results" role="status">
          <p>لا يوجد مستخدمون بهذا الاسم</p>
        </div>
      )}
    </div>
  );
};

export default RecipientSearch;