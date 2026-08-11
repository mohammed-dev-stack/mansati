"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUserShield,
  faSignInAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Navbar.css";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  // ✅ استرجاع بيانات المستخدم من localStorage بعد تحميل الصفحة (client-side)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <h1 className="logo">
          <span className="logo-icon">🌐</span> Social App
        </h1>
        <ul className="nav-links">
          <li>
            <Link href="/">
              <FontAwesomeIcon icon={faHome} className="nav-icon" /> Home
            </Link>
          </li>

          <li>
            {user ? (
              <Link href={`/profile/${user.id}`}>
                <FontAwesomeIcon icon={faUser} className="nav-icon" /> Profile
              </Link>
            ) : (
              <Link href="/login">
                <FontAwesomeIcon icon={faUser} className="nav-icon" /> Profile
              </Link>
            )}
          </li>

          <li>
            {/* زر الأدمن يوجّه دائمًا للـ Login للتحقق من الصلاحيات */}
            <Link href="/login">
              <FontAwesomeIcon icon={faUserShield} className="nav-icon" /> Admin
            </Link>
          </li>

          <li>
            <Link href="/login">
              <FontAwesomeIcon icon={faSignInAlt} className="nav-icon" /> Login
            </Link>
          </li>

          <li>
            <Link href="/register">
              <FontAwesomeIcon icon={faUserPlus} className="nav-icon" /> Register
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;



