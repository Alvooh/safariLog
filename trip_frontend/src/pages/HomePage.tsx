import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Truck size={64} className="mx-auto text-blue-900" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          Welcome to SafariLog Pro
        </h1>
        
        <p className="text-gray-600 text-lg mb-8">
          Plan your routes, manage your hours, and generate ELD logs with ease.
          Start your journey with professional trip management today.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/new-trip')}
          className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold 
                   flex items-center justify-center space-x-2 mx-auto hover:bg-orange-600 
                   transition-colors duration-200"
        >
          <span>Start New Trip</span>
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HomePage;