import { reactionService } from "../services/reactionService";

export function useReactions() {
  async function getAllReactions() {
    return await reactionService.getAll();
  }

  async function addReaction(postId: string, type: string) {
    return await reactionService.add(postId, type);
  }

  return { getAllReactions, addReaction };
}
