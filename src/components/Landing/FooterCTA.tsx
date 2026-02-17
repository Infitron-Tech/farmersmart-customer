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
  );
};

export default FooterCTA;
