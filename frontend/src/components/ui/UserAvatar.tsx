"use client";

import React from "react";

interface UserAvatarProps {
  avatarUrl?: string | null;
  userId?: string; // ✅ اختيارية
  size?: "sm" | "md" | "lg";
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, userId, size = "md" }) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return (
    <div
      className={`rounded-full bg-gray-300 flex items-center justify-center ${sizeMap[size]}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User Avatar"
          className={`rounded-full object-cover ${sizeMap[size]}`}
        />
      ) : (
        <span className="text-gray-700 font-bold">
          {userId && userId.length > 0 ? userId[0].toUpperCase() : "?"}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
