"use client";

import React from "react";
import UserAvatar from "../ui/UserAvatar";
import { useProfile } from "../../hooks/useProfile"; // ✅ استدعاء hook البروفايل

interface ProfileHeaderProps {
  userId: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userId }) => {
  const { user, avatarPreview } = useProfile(userId); // ✅ جلب بيانات المستخدم والصورة

  return (
    <header className="flex items-center space-x-4 border-b pb-4">
      {/* ✅ عرض صورة البروفايل عبر UserAvatar */}
      <UserAvatar avatarUrl={avatarPreview} size="lg" />

      <div>
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        <p className="text-gray-600">معرّف المستخدم: {userId}</p>
        {user && (
          <>
            <p className="text-gray-600">البريد: {user.email}</p>
            <p className="text-gray-600">الدور: {user.role}</p>
          </>
        )}
      </div>
    </header>
  );
};

export default ProfileHeader;


