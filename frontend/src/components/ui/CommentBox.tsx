"use client";

import React, { useState } from "react";

interface CommentBoxProps {
  onSubmit: (comment: string) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({ onSubmit }) => {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full border rounded p-2"
        placeholder="أضف تعليقًا..."
        value={text}
        onChange={(e) => setText(e.target.value)}
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

export default CommentBox;
