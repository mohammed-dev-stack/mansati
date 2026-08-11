"use client";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دالة عامة لعمل طلبات محمية مع التوكن
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  };

  // جلب كل المستخدمين
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authFetch("http://127.0.0.1:5000/api/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // حذف مستخدم بواسطة الأدمن
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;
    try {
      await authFetch(`http://127.0.0.1:5000/api/users/${id}`, {
        method: "DELETE",
      });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // تعديل بيانات مستخدم (مثال: تغيير الدور)
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await authFetch(`http://127.0.0.1:5000/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <header className="admin-header">
        <h2>إدارة المستخدمين</h2>
        <p>يمكنك التحكم الكامل بالمستخدمين من هنا</p>
      </header>

      {loading && <p>جاري تحميل المستخدمين...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>اسم المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  {u.avatar ? (
                    <img
                      src={`http://127.0.0.1:5000${u.avatar}`}
                      alt={u.username}
                      className="avatar-img"
                    />
                  ) : (
                    <i className="fas fa-user-circle"></i>
                  )}
                </td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button className="btn-edit">تعديل</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(u._id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
