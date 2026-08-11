// src/hooks/useMessages.ts
// 💬 هوك إدارة الرسائل - نسخة محسّنة مع إدارة مركزية للتوكن
// @version 2.0.0
// @lastUpdated 2026

import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import type { Message } from '../types/Message';
import { toMessage, toMessageArray } from '../types/Message';

// ============================================================
// 📋 تعريف أنواع الإرجاع
// ============================================================

interface UseMessagesReturn {
  /** قائمة الرسائل في المحادثة الحالية */
  messages: Message[];
  /** حالة التحميل */
  isLoading: boolean;
  /** رسالة الخطأ (إن وجدت) */
  error: string | null;
  /** معرف المستلم المحدد */
  selectedRecipient: string | null;
  /** تعيين المستلم (بدء محادثة) */
  setRecipient: (recipientId: string | null) => void;
  /** إرسال رسالة جديدة */
  sendMessage: (content: string) => Promise<Message | null>;
  /** إعادة تعيين الحالة */
  reset: () => void;
}

// ============================================================
// 🧠 هوك useMessages
// ============================================================

/**
 * هوك مخصص لإدارة الرسائل والمحادثات
 * 
 * 📌 المعايير الهندسية:
 * - ❌ لا يمرر التوكن يدوياً (يُدار في service تلقائياً)
 * - ✅ يستخدم دوال تحويل آمنة (toMessage, toMessageArray)
 * - ✅ معالجة شاملة للأخطاء
 * - ✅ حالات التحميل والخطأ
 * - ✅ أنواع صريحة وآمنة
 * 
 * @returns {UseMessagesReturn} دوال وحالات إدارة الرسائل
 * 
 * @example
 * const { messages, isLoading, sendMessage, setRecipient } = useMessages();
 * 
 * // بدء محادثة مع مستخدم
 * setRecipient('userId');
 * 
 * // إرسال رسالة
 * await sendMessage('مرحباً!');
 */
export function useMessages(): UseMessagesReturn {
  // ============================================================
  // 🎯 الحالات (State)
  // ============================================================

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // 📝 جلب المحادثة عند تغيير المستلم
  // ============================================================

  /**
   * جلب رسائل المحادثة مع المستلم المحدد
   * 
   * @param recipientId - معرف المستلم
   * @returns {Promise<Message[]>} مصفوفة من الرسائل
   * 
   * @remarks
   * - التوكن يُدار تلقائياً داخل messageService (عبر Axios Interceptor)
   * - البيانات تُحوَّل باستخدام toMessageArray للسلامة النوعية
   */
  const fetchConversation = useCallback(async (recipientId: string): Promise<Message[]> => {
    if (!recipientId || recipientId.trim().length < 5) {
      setError('معرف المستلم غير صالح');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة (بدون تمرير توكن - يُدار داخلياً)
      const result = await messageService.getConversation(recipientId);

      // ✅ التحويل الآمن: التأكد من أن النتيجة مصفوفة
      const resultArray = Array.isArray(result) ? result : [];

      // ✅ تحويل البيانات إلى مصفوفة رسائل آمنة
      const safeMessages = toMessageArray(resultArray);
      setMessages(safeMessages);
      return safeMessages;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل تحميل المحادثة';
      setError(errorMessage);
      console.error('❌ [useMessages] فشل جلب المحادثة:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // 🔄 تحميل المحادثة عند تغيير المستلم
  // ============================================================

  useEffect(() => {
    if (selectedRecipient) {
      fetchConversation(selectedRecipient);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [selectedRecipient, fetchConversation]);

  // ============================================================
  // 📨 إرسال رسالة جديدة
  // ============================================================

  /**
   * إرسال رسالة جديدة إلى المستلم المحدد
   * 
   * @param content - نص الرسالة
   * @returns {Promise<Message | null>} الرسالة المُرسلة أو null في حال الفشل
   * 
   * @remarks
   * - التوكن يُدار تلقائياً داخل messageService
   * - بعد الإرسال، تُحدث القائمة محلياً
   */
  const sendMessage = useCallback(async (content: string): Promise<Message | null> => {
    // ✅ التحقق من صحة المدخلات
    if (!selectedRecipient) {
      setError('لم يتم تحديد مستلم');
      return null;
    }

    if (!content || content.trim().length === 0) {
      setError('نص الرسالة فارغ');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ استدعاء الخدمة (بدون تمرير توكن)
      const result = await messageService.send(selectedRecipient, content);

      // ✅ تحويل البيانات إلى رسالة آمنة
      const newMessage = toMessage(result);

      // ✅ تحديث القائمة محلياً (إضافة الرسالة في النهاية)
      setMessages((prev) => [...prev, newMessage]);

      return newMessage;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'فشل إرسال الرسالة';
      setError(errorMessage);
      console.error('❌ [useMessages] فشل إرسال الرسالة:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRecipient]);

  // ============================================================
  // 🎯 تعيين المستلم (بدء محادثة)
  // ============================================================

  /**
   * تعيين معرف المستلم وبدء محادثة جديدة
   * 
   * @param recipientId - معرف المستلم أو null لإعادة التعيين
   */
  const setRecipient = useCallback((recipientId: string | null): void => {
    setSelectedRecipient(recipientId);
    if (!recipientId) {
      setMessages([]);
      setError(null);
    }
  }, []);

  // ============================================================
  // 🔄 إعادة تعيين الحالة (Reset)
  // ============================================================

  /**
   * إعادة تعيين جميع الحالات إلى القيم الافتراضية
   */
  const reset = useCallback((): void => {
    setMessages([]);
    setSelectedRecipient(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // ============================================================
  // 📤 تصدير الهوك
  // ============================================================

  return {
    messages,
    isLoading,
    error,
    selectedRecipient,
    setRecipient,
    sendMessage,
    reset,
  };
}