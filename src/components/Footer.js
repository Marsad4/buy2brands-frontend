import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Facebook, Youtube } from "lucide-react";

/**
 * Footer — Tailwind-based component.
 * Assets used below should be added to /public/assets (see instructions).
 */
const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 mt-12">
      {/* Top logo + intro */}
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <img
          src="/assets/logo-footer.png"
          alt="Buy2Brands"
          className="mx-auto h-14 mb-4"
        />

        <p className="max-w-3xl mx-auto text-sm text-gray-500 leading-relaxed hidden md:block">
          Since 2014, Buy2Brands has connected traders and online retailers with the largest wholesale selection of designer clothing and accessories. We combine industry experience and logistics expertise to offer exclusive listings, tailored promotions, purchasing assistance, and more.
        </p>

        <div className="mt-6 border-t border-gray-200 pt-6 flex items-center justify-center gap-6">
          <a href="https://www.instagram.com/excelien.spark/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-900">
            <Instagram className="w-5 h-5 text-gray-500" />
          </a>
          <a href="https://www.linkedin.com/in/excelienspark/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gray-900">
            <Linkedin className="w-5 h-5 text-gray-500" />
          </a>
          <a href="https://www.facebook.com/people/Excelien-Spark/61584947973868/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-900">
            <Facebook className="w-5 h-5 text-gray-500" />
          </a>
          <a href="https://www.youtube.com/@EXCELIENSPARK" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-gray-900">
            <Youtube className="w-5 h-5 text-gray-500" />
          </a>
        </div>
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">COMPANY</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><Link to="/about" className="hover:text-gray-900">About Us</Link></li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">SERVICES</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
              <li><Link to="/products" className="hover:text-gray-900">Catalogue</Link></li>

            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">CUSTOMER SERVICES</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li><Link to="/faqs" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-gray-900">Privacy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-gray-900">Terms &amp; Conditions</Link></li>

            </ul>
          </div>

          <div className="w-full">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Do you have any questions?</h4>
            <div className="text-sm text-gray-600">
              <p className="mb-3">Contact Us</p>
              <address className="not-italic text-xs text-gray-500">
                info@buy2brands.com<br />
                +44 7723 108434
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info row: secure payments only (concise & centered) */}
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-100">
        <div className="flex flex-col items-center justify-center gap-4">
          <h5 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Secure Payment
          </h5>
          <div className="flex items-center gap-6 justify-center">
            <img
              src="/assets/payment-visa.png"
              alt="Visa"
              className="h-5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
            <img
              src="/assets/payment-mastercard.png"
              alt="Mastercard"
              className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
            <img
              src="/assets/payment-paypal.png"
              alt="PayPal"
              className="h-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-300">
          Copyright © 2026 Buy2Brands. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;


