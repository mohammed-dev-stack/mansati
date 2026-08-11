import { api } from "./api";

export const messageService = {
  async getAll() {
    const { data } = await api.get("/messages");
    return data;
  },

  async getConversation(recipientId: string) {
    const { data } = await api.get(`/messages/${recipientId}`);
    return data;
  },

  async send(recipientId: string, content: string) {
    const { data } = await api.post(`/messages/${recipientId}`, { content });
    return data;
  },
};

