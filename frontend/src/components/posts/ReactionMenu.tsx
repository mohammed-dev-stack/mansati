"use client";

import React from "react";

interface ReactionMenuProps {
  onReact: (reaction: string) => void;
}

const reactions = ["👍", "❤️", "😂", "😮", "😢"];

const ReactionMenu: React.FC<ReactionMenuProps> = ({ onReact }) => {
  return (
    <div className="flex space-x-2 mt-2">
      {reactions.map((r) => (
        <button
          key={r}
          onClick={() => onReact(r)}
          className="text-xl hover:scale-110 transition-transform"
        >
          {r}
        </button>
      ))}
    </div>
  );
};

export default ReactionMenu;
