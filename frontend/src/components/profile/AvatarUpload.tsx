"use client";
import React from "react";
import { uploadService } from "../../services/uploadService";
import { useUser } from "../../hooks/useUser"; // ✅ استدعاء hook المستخدم

interface AvatarUploadProps {
  userId: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId }) => {
  const { setUser } = useUser(); // ✅ نستخدم setUser لتحديث الحالة

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const authToken = localStorage.getItem("token");
    if (!authToken) {
      console.error("No token provided");
      return;
    }

    try {
      await uploadService.uploadAvatar(userId, file, authToken);
      console.log("Avatar updated successfully");

      // ✅ بعد الرفع، جلب بيانات المستخدم المحدثة
      const updatedRes = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const freshData = await updatedRes.json();
      setUser(freshData); // ✅ تحديث بيانات المستخدم
    } catch (err: any) {
      console.error("Avatar upload failed:", err.response?.data || err.message);
    }
  }

  return (
    <div className="file-upload-wrapper">
      <label htmlFor="file-upload" className="custom-file-upload">
        اختر ملف
      </label>
      <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default AvatarUpload;

