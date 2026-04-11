import { FC, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const FooterCTABanner: FC = () => {
  // Load Bitrix24 Chat Widget
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://cdn.bitrix24.com/b35146879/crm/site_button/loader_8_8evb7f.js?${Math.floor(Date.now() / 60000)}`;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="py-20 md:py-28 bg-linear-to-br from-green-700 via-green-600 to-emerald-700 relative overflow-hidden w-full">
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Start Your Fresh Journey Today
          </h2>
          <p className="text-xl text-green-50 opacity-90 max-w-2xl mx-auto">
            Join thousands of customers getting fresh, quality produce
            delivered daily. Download FarmersMart now and get ₦100 off your
            first order!
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <button className="bg-white text-green-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2">
              📱 Download App
            </button>
            <Link href="/products">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
                Start Shopping
              </button>
            </Link>
          </motion.div>

          {/* Email Signup */}
          <motion.form
            className="mt-8 max-w-md mx-auto flex gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-300"
            >
              Subscribe
            </button>
          </motion.form>

          <p className="text-green-100 text-sm">
            Get special offers, new products, and farming tips delivered to
            your inbox
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FooterCTABanner;
