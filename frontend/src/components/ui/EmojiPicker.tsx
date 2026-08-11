"use client";

import React from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const emojis = ["😀", "😂", "😍", "😢", "👍", "❤️"];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <div className="flex space-x-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
