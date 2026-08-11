// src/components/messenger/ChatBox.tsx
// 💬 صندوق المحادثة - نسخة محسّنة مع تحويل البيانات لتوافق ChatMessages
// @version 1.4.0
// @lastUpdated 2026

"use client";

// ============================================================
// 📦 الاستيرادات
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { messageService } from "../../services/messageService";
import type { Message as ApiMessage } from "../../types/Message";

// ============================================================
// 📋 تعريف نوع الرسالة المتوقع من ChatMessages (حسب الخطأ)
// ============================================================

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: string; // ✅ السيندر يجب أن يكون string (المعرف) وليس كائن
  // يمكن إضافة حقول أخرى حسب الحاجة
}

// ============================================================
// 🧠 المكون الرئيسي
// ============================================================

const ChatBox: React.FC<{ recipient: string }> = ({ recipient }) => {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 🔄 تحويل بيانات API إلى تنسيق ChatMessages
  // ============================================================

  const convertToChatMessage = useCallback((apiMsg: ApiMessage): ChatMessage => {
    // ✅ السيندر يجب أن يكون string (المعرف)، وليس الكائن الكامل
    const senderId = apiMsg.sender?._id || 'unknown';

    return {
      id: apiMsg._id,
      content: apiMsg.text,
      timestamp: apiMsg.createdAt,
      sender: senderId, // ✅ تمرير المعرف فقط
    };
  }, []);

  // ============================================================
  // 🛠️ جلب الرسائل
  // ============================================================

  const fetchMessages = useCallback(async () => {
    if (!recipient) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await messageService.getConversation(recipient);
      const messagesArray = Array.isArray(result) ? result : [];
      setMessages(messagesArray as ApiMessage[]);
    } catch (err: any) {
      console.error("❌ [ChatBox] فشل جلب الرسائل:", err);
      setError(err?.message || "فشل تحميل الرسائل");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [recipient]);

  // ============================================================
  // 🔄 تحميل الرسائل عند تغيير المستلم
  // ============================================================

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ============================================================
  // 📨 إرسال رسالة جديدة
  // ============================================================

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || !recipient) return;

      try {
        const newMsg = await messageService.send(recipient, content);
        // ✅ إضافة الرسالة الجديدة إلى القائمة (بصيغة API)
        setMessages((prev) => [...prev, newMsg as ApiMessage]);
      } catch (err: any) {
        console.error("❌ [ChatBox] فشل إرسال الرسالة:", err);
        setError(err?.message || "فشل إرسال الرسالة");
      }
    },
    [recipient]
  );

  // ============================================================
  // 🎨 العرض (UI)
  // ============================================================

  // حالة التحميل
  if (loading) {
    return (
      <div className="chat-box-loading" aria-label="جاري تحميل المحادثة">
        <span className="spinner" />
        <p>جاري تحميل المحادثة...</p>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="chat-box-error" role="alert">
        <p>❌ {error}</p>
        <button onClick={fetchMessages}>إعادة المحاولة</button>
      </div>
    );
  }

  // ✅ تحويل الرسائل إلى التنسيق المتوقع من ChatMessages قبل تمريرها
  const chatMessages: ChatMessage[] = messages.map(convertToChatMessage);

  // عرض المحادثة
  return (
    <div className="flex flex-col h-full chat-box">
      <ChatMessages messages={chatMessages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatBox;