"use client";

import React from "react";

interface PostActionsProps {
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({ onLike, onComment, onShare }) => {
  return (
    <div className="flex space-x-4 mt-2 text-sm text-gray-600">
      <button onClick={onLike} className="hover:text-blue-600">إعجاب</button>
      <button onClick={onComment} className="hover:text-blue-600">تعليق</button>
      <button onClick={onShare} className="hover:text-blue-600">مشاركة</button>
    </div>
  );
};

export default PostActions;
