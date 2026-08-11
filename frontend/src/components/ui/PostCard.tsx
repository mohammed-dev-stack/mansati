"use client";

import React from "react";
import { Post } from "../../types/Post";   // ✅ استدعاء النوع الموحد

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="font-semibold">{post.title}</h3>
      <p className="text-gray-700 mt-2">{post.content}</p>
      <div className="text-sm text-gray-500 mt-1">
        بواسطة {post.author.username}
      </div>
      {post.author.avatar && (
        <img
          src={`http://127.0.0.1:5000${post.author.avatar}`}
          alt={post.author.username}
          className="w-8 h-8 rounded-full mt-2"
        />
      )}
      <div className="text-xs text-gray-400 mt-1">{post.createdAt}</div>
    </div>
  );
};

export default PostCard;
