import { FC } from "react";
import { motion } from "framer-motion";

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

const HowItWorksSection: FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      icon: "📱",
      title: "Download App & Sign Up",
      description: "Get the FarmersMart app and create your account in seconds.",
    },
    {
      number: 2,
      icon: "📍",
      title: "Share Your Location",
      description: "Enable location to see products available in your delivery zone.",
    },
    {
      number: 3,
      icon: "🛒",
      title: "Browse & Add to Cart",
      description: "Explore fresh products from local farmers and add to your cart.",
    },
    {
      number: 4,
      icon: "🚚",
      title: "Quick Checkout & Delivery",
      description: "Complete payment and get fresh produce delivered within 24 hours.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-linear-to-br from-green-50 to-transparent relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            How <span className="text-amber-500">FarmersMart</span> Works
          </h2>
          <p className="text-xl text-gray-600">
            Get fresh, organic produce in 4 simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-4 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[60%] w-[85%] h-1 bg-linear-to-r from-green-400 to-transparent"></div>
              )}

              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                {/* Step Number Circle */}
                <motion.div
                  className="absolute -top-6 left-8 w-16 h-16 bg-linear-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {step.number}
                </motion.div>

                {/* Icon */}
                <div className="text-6xl mb-6 mt-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Video/Demo section */}
        <motion.div
          className="bg-linear-to-br from-green-600 to-green-700 rounded-2xl p-12 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Start?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of customers getting fresh produce directly from farmers.
            Download the app today and get ₦100 off your first order!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/apple-store.svg"
                alt="Download on App Store"
                className="h-12 w-auto"
              />
            </button>
            <button className="flex items-center justify-center bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 h-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/google-play.png"
                alt="Download on Google Play"
                className="h-12 w-auto"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
