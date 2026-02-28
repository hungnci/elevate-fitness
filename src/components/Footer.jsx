import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

// Footer component
const Footer = () => {
  return (
    <footer className="bg-[#1A1A2E] text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <Dumbbell className="h-8 w-8 text-[#FF6B35]" />
              <span className="ml-2 text-xl font-bold">Elevate Fitness</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Empowering you to live a healthier, stronger life through expert guidance and community support.
            </p>
          </div>

          {/* Quick Links Navigation */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#FF6B35] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#FF6B35] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/classes" className="text-gray-400 hover:text-[#FF6B35] transition-colors">
                  Our Classes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#FF6B35] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#FF6B35] mr-2 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Fitness Blvd, Wellness City, WC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#FF6B35] mr-2" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#FF6B35] mr-2" />
                <span className="text-gray-400 text-sm">info@elevatefitness.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-[#FF6B35] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-[#FF6B35] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-[#FF6B35] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Elevate Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
