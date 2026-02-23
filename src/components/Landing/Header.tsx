import { FC, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSettings } from "@/contexts/SettingsContext";

const HeaderAuthContent = dynamic(
  () => import("./HeaderAuthContent"),
  { ssr: false }
);

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { webSettings } = useSettings();

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Marketplace", href: "/products" },
    { label: "About", href: "/about-us" },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-green-600 hover:text-green-700 transition-colors duration-300">
          🌾 {webSettings?.siteName || "FarmersMart"}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-gray-700 hover:text-green-600 transition-colors duration-300 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <HeaderAuthContent />
          </div>
          <button className="bg-linear-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm md:text-base">
            Download App
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-200"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <motion.div key={link.label} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-300 font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={itemVariants} className="pt-2">
                <div onClick={() => setIsMenuOpen(false)}>
                  <HeaderAuthContent />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
