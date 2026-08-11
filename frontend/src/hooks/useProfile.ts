import { useState, useEffect, useCallback } from "react";

interface User {
  _id?: string;
  username: string;
  email?: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export function useProfile(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: User = await res.json();

        setUser(data);
        if (data.avatar) {
          setAvatarPreview(`http://127.0.0.1:5000${data.avatar}`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  // ✅ رفع صورة جديدة
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://127.0.0.1:5000/api/users/upload-avatar/${user._id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token || ""}` },
            body: formData,
          }
        );

        if (res.ok) {
          // ✅ بعد رفع الصورة، جلب بيانات المستخدم المحدثة
          const updatedRes = await fetch(
            `http://127.0.0.1:5000/api/users/${user._id}`,
            { headers: { Authorization: `Bearer ${token || ""}` } }
          );
          const freshData: User = await updatedRes.json();
          setUser(freshData);
          setAvatarPreview(`http://127.0.0.1:5000${freshData.avatar}`);
        }
      } catch (err: any) {
        setError(err.message);
      }
    },
    [user]
  );

  return { user, avatarPreview, handleAvatarChange, loading, error };
}


