import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Truck size={24} />
            <span className="font-bold text-xl">SafariLog Pro</span>
          </Link>
          
          <div className="flex space-x-4">
            <NavLink to="/" active={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/new-trip" active={isActive('/new-trip')}>
              New Trip
            </NavLink>
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) => (
  <Link to={to} className="relative">
    <span className={`py-2 px-3 rounded-md transition-colors ${active ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
      {children}
    </span>
    {active && (
      <motion.div
        layoutId="navbar-indicator"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
        initial={false}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
  </Link>
);

export default Navbar;