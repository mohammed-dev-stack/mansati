import { api } from "./api";

export const commentService = {
  async getByPost(postId: string) {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data;
  },

  async add(postId: string, content: string) {
    const { data } = await api.post(`/posts/${postId}/comments`, { content });
    return data;
  },
};

