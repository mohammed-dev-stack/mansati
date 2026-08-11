"use client";

import React from "react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => (
        <div key={msg.id} className="p-2 rounded border bg-gray-50">
          <div className="text-sm text-gray-600">{msg.sender}</div>
          <div className="text-base">{msg.content}</div>
          <div className="text-xs text-gray-400">{msg.timestamp}</div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;

