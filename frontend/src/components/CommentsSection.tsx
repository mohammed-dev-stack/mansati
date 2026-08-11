"use client";
import React, { useEffect, useState } from "react";

export default function CommentsSection() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب كل التعليقات
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/comments");
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
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

  // حذف تعليق
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      await fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <h2>Manage Comments</h2>

      {loading && <p>Loading comments...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Content</th>
              <th>Post</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c._id}>
                <td>{c.author?.username || "Unknown"}</td>
                <td>{c.content}</td>
                <td>{c.post?.title || "N/A"}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn-edit">Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
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
