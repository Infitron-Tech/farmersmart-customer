import { FC } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSettings } from "@/contexts/SettingsContext";

const FooterCTA: FC = () => {
  const { webSettings } = useSettings();
  const footerLinks = {
    company: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
    for_farmers: [
      { label: "Become a Seller", href: "/seller-register" },
      { label: "Farmer Dashboard", href: "#" },
      { label: "Support", href: "#" },
      { label: "Commission Details", href: "#" },
    ],
    policies: [
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return & Refund", href: "/return-refund-policy" },
    ],
    social: [
      { icon: "f", label: "Facebook", href: "#" },
      { icon: "𝕏", label: "Twitter", href: "#" },
      { icon: "📷", label: "Instagram", href: "#" },
      { icon: "▶", label: "YouTube", href: "#" },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <>
      {/* CTA Section */}
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
              <Link href="/marketplace">
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

      {/* Footer */}
      <footer className="bg-linear-to-r from-green-800 to-green-900 text-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="grid md:grid-cols-5 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Brand */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                🌾 {webSettings?.siteName || "FarmersMart"}
              </div>
              <p className="text-sm text-gray-400">
                Direct from farms, delivered to your door.
              </p>
              <div className="flex gap-4 pt-4">
                {footerLinks.social.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Company Links */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h4 className="text-white font-semibold">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="hover:text-green-400 transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Farmers */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h4 className="text-white font-semibold">For Farmers</h4>
              <ul className="space-y-2">
                {footerLinks.for_farmers.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="hover:text-green-400 transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Policies */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h4 className="text-white font-semibold">Policies</h4>
              <ul className="space-y-2">
                {footerLinks.policies.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="hover:text-green-400 transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h4 className="text-white font-semibold">Contact</h4>
              <ul className="space-y-3 text-sm">
                {webSettings?.supportEmail && (
                  <li className="flex gap-2">
                    <span>📧</span>
                    <a href={`mailto:${webSettings.supportEmail}`} className="hover:text-green-400 transition-colors duration-300">
                      {webSettings.supportEmail}
                    </a>
                  </li>
                )}
                {webSettings?.supportNumber && (
                  <li className="flex gap-2">
                    <span>📞</span>
                    <a href={`tel:${webSettings.supportNumber}`} className="hover:text-green-400 transition-colors duration-300">
                      {webSettings.supportNumber}
                    </a>
                  </li>
                )}
                {webSettings?.address && (
                  <li className="flex gap-2">
                    <span>📍</span>
                    <span>
                      {webSettings.address}<br />
                      <span className="text-xs text-gray-500">Expanding nationwide</span>
                    </span>
                  </li>
                )}
              </ul>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="border-t border-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          ></motion.div>

          {/* Bottom */}
          <motion.div
            className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p>
              {webSettings?.siteCopyright || `© ${new Date().getFullYear()} FarmersMart. All rights reserved.`}
            </p>
            <p>
              Made with <span className="text-red-500">❤️</span> by the {webSettings?.siteName || "FarmersMart"} team
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
};

export default FooterCTA;
