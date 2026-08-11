"use client";
import React, { useEffect, useState } from "react";

interface Comment {
  _id: string;
  text: string;
  author?: { username: string; avatar?: string };
  post?: { _id: string; title?: string };
  createdAt: string;
}

export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دالة عامة لعمل طلبات محمية مع التوكن
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized: no token found");

    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ أرسل التوكن هنا
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  };

  // ✅ جلب كل التعليقات (للأدمن فقط)
  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await authFetch("http://127.0.0.1:5000/api/comments");
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // ✅ حذف تعليق (للأدمن فقط)
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا التعليق؟")) return;
    try {
      await authFetch(`http://127.0.0.1:5000/api/comments/${id}`, {
        method: "DELETE",
      });
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2>إدارة التعليقات</h2>

      {loading && <p>جاري تحميل التعليقات...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>النص</th>
              <th>البوست</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c._id}>
                <td>{c.author?.username || "Unknown"}</td>
                <td>{c.text}</td>
                <td>{c.post?.title || "N/A"}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn-edit">تعديل</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(c._id)}
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

