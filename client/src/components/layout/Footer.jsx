// components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-50 to-white">
      {/* Quality Guarantee Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Quality Guarantee</h2>
          <p className="text-lg max-w-2xl mx-auto">
            We ensure that every product meets the highest standards of quality. Your satisfaction is our top priority.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              className="h-12"
              src="/logo.png"
              alt="Bazario Logo"
            />
            <p className="text-gray-600 text-sm">
              Your trusted destination for quality food products. We bring the best of local flavors to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-4">
              Subscribe to our newsletter
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Get the latest updates and news delivered to your inbox.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                className="block w-full px-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Bazario. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;