"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t p-4 text-center text-gray-500">
      © {new Date().getFullYear()} Social App. جميع الحقوق محفوظة.
    </footer>
  );
};

export default Footer;
