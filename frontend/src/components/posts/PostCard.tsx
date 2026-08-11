"use client";

import React from "react";
import { formatDate } from "../../utils/formatDate";
import PostActions from "./PostActions";
import CommentsSection from "./CommentsSection";

interface Post {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="font-semibold">{post.author}</div>
      <div className="text-gray-700 mt-2">{post.content}</div>
      <div className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</div>
      <PostActions
        onLike={() => console.log("Like", post.id)}
        onComment={() => console.log("Comment", post.id)}
        onShare={() => console.log("Share", post.id)}
      />
      <CommentsSection postId={post.id} />
    </div>
  );
};

export default PostCard;
