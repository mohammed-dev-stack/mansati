import { api } from "./api";

export const userService = {
  // تسجيل الدخول
  async login(email: string, password: string) {
    const { data } = await api.post("/users/login", { email, password });
    return data;
  },

  // تسجيل مستخدم جديد
  async register(name: string, email: string, password: string) {
    const { data } = await api.post("/users/register", { name, email, password });
    return data;
  },

  // تسجيل الخروج
  async logout(token: string) {
    await api.post("/users/logout", null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // البحث عن مستخدمين
  async search(query: string, token: string) {
    const { data } = await api.get(`/users/search?q=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // جلب بيانات مستخدم بالـ id
  async getById(id: string, token: string) {
    const { data } = await api.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
