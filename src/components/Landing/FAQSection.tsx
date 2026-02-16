import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const FAQSection: FC = () => {
  const [activeId, setActiveId] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      id: 0,
      question: "How does FarmersMart work?",
      answer:
        "FarmersMart connects you directly with local farmers. Download our app, select your delivery zone, browse fresh products, and get them delivered within 24 hours. No middlemen, no inflated prices!",
    },
    {
      id: 1,
      question: "What delivery zones do you cover?",
      answer:
        "We currently deliver to 20+ major cities including Delhi, Bangalore, Mumbai, Pune, Chennai, Hyderabad, and expanding to more cities every month. Check your location in the app to see if we deliver near you.",
    },
    {
      id: 2,
      question: "How fresh are the products?",
      answer:
        "All products come directly from farmers and are picked fresh. We ensure quality through strict inspection before dispatch. If you're not satisfied with freshness, we offer a 100% refund guarantee.",
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer:
        "We accept UPI, credit/debit cards, digital wallets (Google Pay, Apple Pay, Paytm, PhonePe), and cash on delivery in selected areas. All payments are secure and encrypted.",
    },
    {
      id: 4,
      question: "How are prices so low compared to markets?",
      answer:
        "Since we eliminate middlemen and buy directly from farmers, we can offer prices 30-40% lower than traditional retail. This benefits both customers and farmers with fair, transparent pricing.",
    },
    {
      id: 5,
      question: "What if I'm not satisfied with the product?",
      answer:
        "We offer a 100% satisfaction guarantee. If you're unhappy with any product, contact us within 24 hours and we'll process a refund or replacement immediately. No questions asked!",
    },
    {
      id: 6,
      question: "Are the products organic?",
      answer:
        "We have a dedicated organic section with certified organic products. You can filter by 'Organic' while browsing. All organic products are certified by recognized agricultural bodies.",
    },
    {
      id: 7,
      question: "How do I become a seller/farmer on FarmersMart?",
      answer:
        "Farmers and producers can register on our platform by visiting FarmersMart.com/farmer-register. Fill the form with details about your farm and products. Our team will verify and onboard you within 5-7 days.",
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Frequently Asked <span className="text-amber-500">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about FarmersMart
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={itemVariants}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-green-200 transition-colors duration-300"
            >
              <button
                onClick={() =>
                  setActiveId(activeId === faq.id ? null : faq.id)
                }
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
              >
                <span className="text-lg font-semibold text-green-900 text-left">
                  {faq.question}
                </span>
                <motion.svg
                  className="w-6 h-6 text-green-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    rotate: activeId === faq.id ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {activeId === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 bg-linear-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-4">Still have questions?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our customer support team is available 24/7 to help. Reach out
            anytime!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              📞 Call Support
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors duration-300">
              💬 Live Chat
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
