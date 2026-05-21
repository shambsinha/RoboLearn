import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const StudentLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen text-slate-300">
      <Navbar />
      <div className="flex-1 pt-14">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <Outlet />
            </div>
            <Footer />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentLayout;