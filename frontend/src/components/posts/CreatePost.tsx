"use client";

import React, { useState } from "react";

interface CreatePostProps {
  onCreate: (content: string) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCreate }) => {
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await onCreate(content.trim());
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full border rounded p-2"
        placeholder="اكتب منشورًا جديدًا..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        نشر
      </button>
    </form>
  );
};

export default CreatePost;
