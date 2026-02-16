import { FC } from "react";
import { motion } from "framer-motion";

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const FeaturesSection: FC = () => {
  const features: Feature[] = [
    {
      icon: "👨‍🌾",
      title: "Direct from Farmers",
      description:
        "Cut out the middlemen and get produce straight from local farmers, ensuring freshness and fair pricing.",
      color: "bg-green-100",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description:
        "Get fresh products delivered to your doorstep within 24 hours. Same-day delivery in selected zones.",
      color: "bg-blue-100",
    },
    {
      icon: "✅",
      title: "Quality Guaranteed",
      description:
        "Every product is verified for quality before dispatch. Not satisfied? Get a full refund.",
      color: "bg-amber-100",
    },
    {
      icon: "💰",
      title: "Best Prices",
      description:
        "Direct farmer partnerships mean you save 30-40% compared to traditional retail. No hidden charges.",
      color: "bg-pink-100",
    },
  ];

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
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Why Choose <span className="text-amber-500">FarmersMart?</span>
          </h2>
          <p className="text-xl text-gray-600">
            We&apos;re revolutionizing how you buy fresh produce by connecting you
            directly with farmers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ translateY: -8 }}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl p-8 h-full border border-gray-200 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                {/* Icon Background */}
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-green-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* CTA Link */}
                <button className="text-green-600 font-semibold flex items-center gap-2 group/link hover:text-green-700">
                  Learn More
                  <svg
                    className="w-4 h-4 group-hover/link:translate-x-2 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          className="mt-20 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="text-5xl font-bold text-green-600 mb-2">30-40%</p>
            <p className="text-gray-600">Lower Prices Than Retail</p>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <p className="text-5xl font-bold text-green-600 mb-2">24H</p>
            <p className="text-gray-600">Average Delivery Time</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-green-600 mb-2">100%</p>
            <p className="text-gray-600">Satisfaction Guarantee</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
