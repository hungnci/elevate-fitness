import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Navigation bar component
const Navbar = () => {
  // State to manage mobile menu visibility
  const [isOpen, setIsOpen] = useState(false);
  // Get current location path
  const location = useLocation();
  // Get user authentication state
  const { user, signOut } = useAuthStore();

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Define navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Classes', path: '/classes' },
    { name: 'Contact', path: '/contact' },
  ];

  // Check if a link is active based on current path
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Dumbbell className="h-8 w-8 text-[#FF6B35]" />
              <span className="ml-2 text-xl font-bold text-[#1A1A2E]">Elevate Fitness</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-[#FF6B35]'
                    : 'text-[#1A1A2E] hover:text-[#FF6B35]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Conditional rendering based on auth status */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-[#FF6B35]'
                      : 'text-[#1A1A2E] hover:text-[#FF6B35]'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-[#1A1A2E] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Login / Register
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-[#1A1A2E] hover:text-[#FF6B35] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-[#FF6B35] bg-gray-50'
                    : 'text-[#1A1A2E] hover:text-[#FF6B35] hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard')
                      ? 'text-[#FF6B35] bg-gray-50'
                      : 'text-[#1A1A2E] hover:text-[#FF6B35] hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-[#1A1A2E] hover:text-[#FF6B35] hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center mt-4 bg-[#FF6B35] text-white px-4 py-2 rounded-md text-base font-medium hover:bg-opacity-90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
