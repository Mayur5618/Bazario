// src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-100"
    >
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardLayout;