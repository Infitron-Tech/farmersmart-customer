import { FC } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
}

const TestimonialsSection: FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Homemaker, Delhi",
      image: "👩",
      text: "FarmersMart has changed how I buy groceries. Fresh vegetables delivered daily at prices way better than my local market. Highly recommended!",
      rating: 5,
    },
    {
      id: 2,
      name: "Raj Kumar",
      role: "Software Engineer, Bangalore",
      image: "👨",
      text: "The quality is exceptional. I was skeptical at first, but the organic certification and daily delivery convinced me. Now it's my go-to app.",
      rating: 5,
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Restaurant Owner, Mumbai",
      image: "👨‍🍳",
      text: "As a restaurant owner, I need consistent quality. FarmersMart has been my trusted supplier for 6 months. Amazing pricing for bulk orders!",
      rating: 5,
    },
    {
      id: 4,
      name: "Neha Singh",
      role: "Fitness Coach, Pune",
      image: "👩‍🏫",
      text: "Love the organic selection! All my clients ask where I get such fresh produce. Customer service is also fantastic.",
      rating: 5,
    },
    {
      id: 5,
      name: "Vikram Gupta",
      role: "Retired Professional, Delhi",
      image: "👨‍🦳",
      text: "Supporting local farmers while getting fresh produce. It's a win-win. The app is easy to use even for someone like me!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-30"></div>

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
            Love from Our <span className="text-amber-500">Community</span>
          </h2>
          <p className="text-xl text-gray-600">
            Thousands of customers trust FarmersMart for fresh, quality produce
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-16"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="bg-gray-50 rounded-2xl p-8 h-full border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    &quot;{testimonial.text}&quot;
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="w-12 h-12 bg-linear-to-br from-green-400 to-amber-400 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation buttons */}
          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-300 -translate-x-6 md:translate-x-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-300 translate-x-6 md:translate-x-0">
            <svg
              className="w-6 h-6"
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
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">Join our growing community</p>
          <button className="bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
            Download App & Get ₦100 OFF
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
