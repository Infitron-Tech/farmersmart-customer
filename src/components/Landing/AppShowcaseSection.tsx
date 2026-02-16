import { FC } from "react";
import { motion } from "framer-motion";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const AppShowcaseSection: FC = () => {
  const features: Feature[] = [
    {
      icon: "📍",
      title: "Smart Location Detection",
      description: "Automatically shows products available in your delivery zone",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Browse, order, and checkout in under 2 minutes",
    },
    {
      icon: "💳",
      title: "Multiple Payment Options",
      description: "Pay with UPI, cards, wallets, or cash on delivery",
    },
    {
      icon: "🔔",
      title: "Real-time Notifications",
      description: "Get updates on order confirmation and delivery status",
    },
    {
      icon: "⭐",
      title: "Rate & Review",
      description: "Help farmers improve with your honest feedback",
    },
    {
      icon: "🎁",
      title: "Loyalty Rewards",
      description: "Earn points on every purchase and redeem offers",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-green-900">
                Download Our App
              </h2>
              <p className="text-lg text-gray-600">
                Get fresh produce delivered to your doorstep with our easy-to-use mobile app. Available on iOS and Android.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 gap-6"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex gap-4"
                >
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 text-green-600 text-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <button className="flex items-center justify-center bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-300 h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/apple-store.svg"
                  alt="Download on App Store"
                  className="h-12 w-auto"
                />
              </button>
              <button className="flex items-center justify-center bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-300 h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/google-play.png"
                  alt="Download on Google Play"
                  className="h-12 w-auto"
                />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-6 pt-6"
            >
              <div className="border-l-4 border-green-600 pl-4">
                <p className="text-3xl font-bold text-green-900">4.8★</p>
                <p className="text-sm text-gray-600">App Store Rating</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <p className="text-3xl font-bold text-green-900">500K+</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - App Screenshot */}
          <motion.div
            className="relative hidden md:block"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              {/* Phone Frame */}
              <div className="relative mx-auto max-w-sm">
                <div className="bg-black rounded-3xl shadow-2xl overflow-hidden border-8 border-black">
                  <div className="bg-linear-to-b from-green-50 to-white aspect-video flex flex-col items-center justify-center p-6 space-y-6">
                    {/* Fake app UI */}
                    <div className="w-full space-y-4">
                      <div className="h-8 bg-green-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="aspect-square bg-green-100 rounded-lg"></div>
                      <div className="aspect-square bg-amber-100 rounded-lg"></div>
                      <div className="aspect-square bg-blue-100 rounded-lg"></div>
                      <div className="aspect-square bg-pink-100 rounded-lg"></div>
                    </div>

                    <div className="w-full h-16 bg-linear-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      Download Now
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-8 -right-8 bg-white rounded-xl shadow-xl p-4 w-40"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📦</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Fast Delivery
                      </p>
                      <p className="text-xs text-gray-600">24H Guarantee</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-xl p-4 w-40"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">⭐</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        4.8 Rating
                      </p>
                      <p className="text-xs text-gray-600">15K+ Reviews</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcaseSection;
