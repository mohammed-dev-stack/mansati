"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faShieldAlt, faFileContract } from "@fortawesome/free-solid-svg-icons";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} Social App. All rights reserved.</p>
        <ul className="footer-links">
          <li>
            <a href="/about">
              <FontAwesomeIcon icon={faInfoCircle} /> About
            </a>
          </li>
          <li>
            <a href="/privacy">
              <FontAwesomeIcon icon={faShieldAlt} /> Privacy Policy
            </a>
          </li>
          <li>
            <a href="/terms">
              <FontAwesomeIcon icon={faFileContract} /> Terms of Service
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;

