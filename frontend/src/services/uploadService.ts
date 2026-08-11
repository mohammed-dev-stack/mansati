import { api } from "./api";

export const uploadService = {
  // ✅ رفع صورة البروفايل
  async uploadAvatar(userId: string, file: File, token: string) {
    if (!token) throw new Error("No token provided");

    const formData = new FormData();
    formData.append("avatar", file);

    // ✅ المسار الصحيح حسب الـ backend عندك
    const { data } = await api.post(`/users/upload-avatar/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};

