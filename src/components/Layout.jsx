import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from './Chatbot';

/**
 * Layout component that wraps the main content of the application.
 * It includes the Navbar at the top, the main content area, the Chatbot, and the Footer at the bottom.
 *
 * @param children - The content to be rendered within the layout.
 */
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
};

export default Layout;
