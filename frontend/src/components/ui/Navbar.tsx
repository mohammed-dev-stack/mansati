"use client";

import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <div className="font-bold text-lg">Social App</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">الرئيسية</Link>
        <Link to="/profile/1" className="hover:underline">البروفايل</Link>
      </div>
    </nav>
  );
};

export default Navbar;
