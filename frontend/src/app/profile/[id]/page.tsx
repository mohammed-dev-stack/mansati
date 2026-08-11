"use client";

import React, { use } from "react"; // ✅ استدعاء use من React
import { useUser } from "../../../hooks/useUser";
import { usePosts } from "../../../hooks/usePosts";

import ProfileHeader from "../../../components/profile/ProfileHeader";
import AvatarUpload from "../../../components/profile/AvatarUpload";
import PostsList from "../../../components/posts/PostsList";
import CreatePost from "../../../components/posts/CreatePost";
import Messenger from "../../../components/messenger/Messenger";

interface ProfilePageProps {
  params: Promise<{ id: string }>; // ✅ params هو Promise في Next.js 16
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = use(params); // ✅ فك الـ Promise باستخدام React.use
  const { user } = useUser();
  const { posts, createPost } = usePosts();

  return (
    <div className="profile-page container mx-auto p-6 space-y-6">
      {/* ===================== قسم البروفايل ===================== */}
      <ProfileHeader userId={id} />
      <AvatarUpload userId={id} />

      {/* ===================== قسم المنشورات ===================== */}
      <section className="posts-section space-y-4">
        <CreatePost onCreate={createPost} />
        <PostsList posts={posts} />
      </section>

      {/* ===================== قسم الرسائل ===================== */}
      <section className="messages-section">
        <Messenger />
      </section>
    </div>
  );
}
