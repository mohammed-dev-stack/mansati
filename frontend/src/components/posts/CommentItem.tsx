"use client";

import React from "react";
import { formatDate } from "../../utils/formatDate";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  };
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="p-2 border rounded bg-gray-50">
      <div className="text-sm text-gray-600">{comment.author}</div>
      <div className="text-base">{comment.content}</div>
      <div className="text-xs text-gray-400">{formatDate(comment.createdAt)}</div>
    </div>
  );
};

export default CommentItem;
