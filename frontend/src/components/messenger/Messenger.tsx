"use client";

import React from "react";
import RecipientSearch from "./RecipientSearch";
import ChatBox from "./ChatBox";
import { useMessages } from "../../hooks/useMessages";
import Loader from "../ui/Loader";

const Messenger: React.FC = () => {
  const { isLoading, selectedRecipient, setRecipient } = useMessages();

  if (isLoading) return <Loader />;

  return (
    <div className="messenger-container flex h-full">
      <aside className="w-1/3 border-r p-4">
        <RecipientSearch onSelect={setRecipient} />
      </aside>
      <main className="flex-1">
        {selectedRecipient ? (
          <ChatBox recipient={selectedRecipient} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            اختر مستخدم لبدء المحادثة
          </div>
        )}
      </main>
    </div>
  );
};

export default Messenger;


