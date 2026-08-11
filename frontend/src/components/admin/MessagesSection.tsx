"use client";
import React, { useEffect, useState } from "react";

interface Message {
  _id: string;
  sender?: { username: string; email: string };
  recipient?: { username: string; email: string };
  content: string;
  createdAt: string;
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
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

  // جلب الرسائل (Inbox)
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await authFetch("http://127.0.0.1:5000/api/messages/inbox");
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // حذف رسالة
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذه الرسالة؟")) return;
    try {
      await authFetch(`http://127.0.0.1:5000/api/messages/${id}`, {
        method: "DELETE",
      });
      await fetchMessages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2>إدارة الرسائل</h2>

      {loading && <p>جاري تحميل الرسائل...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>المرسل</th>
              <th>المستلم</th>
              <th>المحتوى</th>
              <th>تاريخ الإرسال</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m._id}>
                <td>{m.sender?.username || "Unknown"}</td>
                <td>{m.recipient?.username || "Unknown"}</td>
                <td>{m.content}</td>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn-edit">تعديل</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(m._id)}
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

