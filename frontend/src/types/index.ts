export interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
  avatar?: string;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export interface Reaction {
  id: string;
  user: string;
  postId: string;
  type: string;
}
