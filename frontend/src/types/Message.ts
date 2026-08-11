// src/types/Message.ts
// 💬 أنواع بيانات الرسائل والمحادثات – نسخة متكاملة مع دوال تحويل آمنة
// @version 3.0.0
// @lastUpdated 2026

// ============================================================================
// الأنواع الأساسية
// ============================================================================

/**
 * كيان المستخدم المصغّر للرسائل (يُستخدم في sender و receiver)
 */
export interface MessageUser {
  _id: string;
  name: string;
  avatar?: string | null;
}

/**
 * كيان الرسالة الكامل
 */
export interface Message {
  _id: string;
  sender: MessageUser;
  receiver: MessageUser;
  text: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * كيان المحادثة (يُستخدم في قائمة المحادثات)
 */
export interface Conversation {
  user: MessageUser; // المستخدم الآخر في المحادثة
  lastMessage: Message;
  unreadCount: number;
  messagesCount?: number;
}

/**
 * بيانات إرسال رسالة جديدة
 */
export interface SendMessageData {
  receiver: string; // معرف المستلم (ObjectId)
  text: string;
}

/**
 * نتيجة البحث عن مستخدمين للدردشة
 */
export interface SearchUserResult {
  _id: string;
  name: string;
  avatar?: string;
}

// ============================================================================
// دوال تحويل آمنة (للتعامل مع بيانات API غير المتوقعة)
// ============================================================================

/**
 * تحويل أي قيمة إلى كائن مستخدم صالح للرسائل
 */
export function toMessageUser(data: any): MessageUser {
  if (!data) return { _id: '', name: 'مستخدم' };
  if (typeof data === 'string') {
    return { _id: data, name: 'مستخدم' };
  }
  return {
    _id: data._id || '',
    name: data.name || 'مستخدم',
    avatar: data.avatar || null,
  };
}

/**
 * تحويل أي كائن إلى رسالة صالحة مع ضبط sender/receiver
 */
export function toMessage(data: any): Message {
  if (!data) throw new Error('Invalid message data');
  return {
    _id: data._id || '',
    sender: toMessageUser(data.sender),
    receiver: toMessageUser(data.receiver),
    text: data.text || '',
    read: data.read || false,
    readAt: data.readAt || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt,
  };
}

/**
 * تحويل مصفوفة من البيانات إلى رسائل صالحة
 */
export function toMessageArray(data: any[]): Message[] {
  if (!Array.isArray(data)) return [];
  return data.map(item => toMessage(item));
}

/**
 * تحويل بيانات محادثة قادمة من API إلى Conversation صالحة
 */
export function toConversation(data: any): Conversation {
  if (!data) throw new Error('Invalid conversation data');
  return {
    user: toMessageUser(data.user),
    lastMessage: toMessage(data.lastMessage),
    unreadCount: data.unreadCount || 0,
    messagesCount: data.messagesCount || 0,
  };
}

/**
 * تحويل مصفوفة محادثات
 */
export function toConversationArray(data: any[]): Conversation[] {
  if (!Array.isArray(data)) return [];
  return data.map(item => toConversation(item));
}