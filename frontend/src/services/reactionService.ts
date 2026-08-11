import { api } from "./api";

export const reactionService = {
  async getAll() {
    const { data } = await api.get("/reactions");
    return data;
  },

  async add(postId: string, type: string) {
    const { data } = await api.post(`/posts/${postId}/reactions`, { type });
    return data;
  },
};
