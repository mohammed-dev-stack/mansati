"use client";
import React, { useEffect, useState } from "react";

interface Reaction {
  _id: string;
  user?: { username: string };
  type: string;
  post?: { title?: string };
  comment?: { text?: string };
  createdAt: string;
}

export default function ReactionsSection() {
  const [reactions, setReactions] = useState<Reaction[]>([]);
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

  // ✅ جلب التفاعلات
  const fetchReactions = async () => {
    try {
      setLoading(true);

      // ⚠️ إذا المستخدم أدمن → يستدعي /api/reactions
      // ⚠️ إذا المستخدم عادي → يستدعي /api/reactions/:postId
      // هنا نفترض أنك تريد لوحة الأدمن، لذلك نستعمل المسار الخاص بالأدمن:
      const data = await authFetch("http://127.0.0.1:5000/api/reactions");

      setReactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, []);

  // ✅ حذف تفاعل (للأدمن)
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا التفاعل؟")) return;
    try {
      await authFetch(`http://127.0.0.1:5000/api/reactions/${id}/admin`, {
        method: "DELETE",
      });
      await fetchReactions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2>إدارة التفاعلات</h2>

      {loading && <p>جاري تحميل التفاعلات...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>نوع التفاعل</th>
              <th>الهدف</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {reactions.map((r) => (
              <tr key={r._id}>
                <td>{r.user?.username || "Unknown"}</td>
                <td>{r.type}</td>
                <td>
                  {r.post
                    ? `Post: ${r.post?.title || "N/A"}`
                    : r.comment
                    ? `Comment: ${r.comment?.text || "N/A"}`
                    : "N/A"}
                </td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn-edit">تعديل</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(r._id)}
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
