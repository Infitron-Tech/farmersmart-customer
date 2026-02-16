import { FC } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const HeroSection: FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative bg-linear-to-br from-green-50 via-white to-amber-50 pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Fresh from Farms Daily
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 leading-tight"
              >
                Direct from Farmers, to{" "}
                <span className="text-amber-500">You</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed"
              >
                Skip the middlemen. Get fresh, organic produce directly from
                local farmers at fair prices. Same-day delivery available.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/marketplace">
                <button className="bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.884l.312 2.492a1 1 0 01-.837 1.089c-.49.083-.949.205-1.377.360a1 1 0 00-.64 1.539l3.29 3.29a1 1 0 001.414 0L9 6.414l2.293 2.293a1 1 0 001.414-1.414l-2.293-2.293 2.293-2.293a1 1 0 10-1.414-1.414L9 3.586 6.707 1.293A1 1 0 005.293 2.707L7.586 5l-3.29-3.29a1 1 0 00-1.539.64c-.155.428-.277.887-.36 1.377a1 1 0 01-1.089.837L2.884 3.153A1 1 0 012 3z" />
                  </svg>
                  Start Shopping
                </button>
              </Link>

              <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300">
                ▶ Watch Demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-4"
            >
              <div className="text-center md:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-green-900">50K+</p>
                <p className="text-xs sm:text-sm text-gray-600">Happy Customers</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-green-900">2000+</p>
                <p className="text-xs sm:text-sm text-gray-600">Farmers Trusted</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-green-900">4.8★</p>
                <p className="text-xs sm:text-sm text-gray-600">App Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={imageVariants}
            className="relative hidden md:block"
          >
            <div className="relative">
              {/* Floating cards effect */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -left-8 bg-white rounded-xl shadow-2xl p-4 w-48 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    🥕
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fresh Veggies</p>
                    <p className="text-sm text-gray-600">₦250/kg</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Hero Image */}
              <div className="relative bg-linear-to-br from-green-400 to-amber-400 rounded-2xl overflow-hidden h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🌾</div>
                  <p className="text-2xl font-bold text-white">Fresh & Organic</p>
                </div>
              </div>

              {/* Bottom floating card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-8 -right-8 bg-white rounded-xl shadow-2xl p-4 w-48"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                    🍎
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Organic Fruits</p>
                    <p className="text-sm text-gray-600">₦180/kg</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
