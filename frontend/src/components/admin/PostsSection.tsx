"use client";
import React, { useEffect, useState } from "react";

interface Post {
  _id: string;
  author?: { username: string; avatar?: string };
  title?: string;
  content: string;
  createdAt: string;
  reactionsCount?: number;
  userReaction?: string | null;
}

export default function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
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

  // جلب كل البوستات
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await authFetch("http://127.0.0.1:5000/api/posts");
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // حذف بوست بواسطة الأدمن
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا البوست؟")) return;
    try {
      await authFetch(`http://127.0.0.1:5000/api/posts/${id}`, {
        method: "DELETE",
      });
      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2>إدارة البوستات</h2>

      {loading && <p>جاري تحميل البوستات...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>الكاتب</th>
              <th>المحتوى</th>
              <th>تاريخ الإنشاء</th>
              <th>التفاعلات</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p._id}>
                <td>{p.author?.username || "Unknown"}</td>
                <td>{p.content}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.reactionsCount ?? 0}</td>
                <td>
                  <button className="btn-edit">تعديل</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(p._id)}
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

