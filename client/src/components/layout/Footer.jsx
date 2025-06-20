// components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            {/* <img src="/images/bazario-logo.png" alt="Bazario Logo" className="h-8 mb-4" /> */}
            <h5 className='text-xl font-bold'>Bazario</h5>
            <p className="text-gray-600 mb-4">
              Your trusted destination for quality food products. We bring the best of local flavors to your doorstep.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-blue-600 font-semibold mb-4">QUICK LINKS</h3>
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
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-blue-600 font-semibold mb-4">LEGAL</h3>
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
            <h3 className="text-blue-600 font-semibold mb-4">SUBSCRIBE TO OUR NEWSLETTER</h3>
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
      </div>
    </footer>
  );
};

export default Footer;