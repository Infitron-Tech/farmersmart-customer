import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { getLandingPageStats } from "@/routes/api";

interface Stat {
  icon: string;
  value: number | string;
  label: string;
  description: string;
}

interface StatsData {
  total_customers: number;
  total_farmers: number;
  average_rating: number;
  total_reviews: number;
}

const CountUp: FC<{ target: number; suffix?: string }> = ({ target, suffix = "" }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const increment = target / 50;
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.floor(prev + increment);
      });
    }, 30);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const StatsSection: FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getLandingPageStats();
        if (response.success) {
          const data: StatsData = response.data;
          setStats([
            {
              icon: "👨‍🌾",
              value: data.total_farmers,
              label: "Farmers",
              description: "Local farmers partnered for quality produce",
            },
            {
              icon: "👥",
              value: data.total_customers,
              label: "Happy Customers",
              description: "Satisfied customers in 20+ cities",
            },
            {
              icon: "📦",
              value: "10K+",
              label: "Products",
              description: "Fresh items available daily",
            },
            {
              icon: "⭐",
              value: data.average_rating ? data.average_rating.toFixed(1) : "4.8",
              label: "App Rating",
              description: `Average rating from ${data.total_reviews}+ reviews`,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="py-20 md:py-28 bg-linear-to-r from-green-600 via-green-700 to-emerald-700 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            By The Numbers
          </h2>
          <p className="text-xl text-green-50 opacity-90">
            Join a growing community transforming agricultural commerce
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.length > 0 ? (
            stats.map((stat, index) => {
              const isNumeric = typeof stat.value === "number";
              const displayValue = isNumeric ? stat.value : stat.value;
              const displaySuffix = isNumeric ? "+" : "";
              const countUpTarget = isNumeric ? Math.round(displayValue / 1000) : 0;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center text-white"
                >
                  <motion.div
                    className="text-6xl mb-4 inline-block"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {stat.icon}
                  </motion.div>

                  <h3 className="text-5xl font-bold mb-2">
                    {isNumeric ? (
                      <>
                        <CountUp target={countUpTarget} suffix={`K${displaySuffix}`} />
                      </>
                    ) : (
                      displayValue
                    )}
                  </h3>

                  <p className="text-green-50 font-semibold mb-2">{stat.label}</p>
                  <p className="text-green-100 text-sm opacity-80">
                    {stat.description}
                  </p>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-white">Loading stats...</div>
          )}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-green-500 border-opacity-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h4 className="text-lg font-bold text-white mb-2">100% Secure</h4>
            <p className="text-green-100 text-sm">
              Encrypted payments & buyer protection guarantee
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <h4 className="text-lg font-bold text-white mb-2">Quality Verified</h4>
            <p className="text-green-100 text-sm">
              Every product inspected before delivery
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h4 className="text-lg font-bold text-white mb-2">24/7 Support</h4>
            <p className="text-green-100 text-sm">
              Live chat support available round the clock
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
