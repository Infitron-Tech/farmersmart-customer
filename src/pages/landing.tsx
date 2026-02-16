import HeroSection from "@/components/Landing/HeroSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import HowItWorksSection from "@/components/Landing/HowItWorksSection";
import StatsSection from "@/components/Landing/StatsSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import AppShowcaseSection from "@/components/Landing/AppShowcaseSection";
import FAQSection from "@/components/Landing/FAQSection";
import LandingLayout from "@/layouts/landing";
import { NextPageWithLayout } from "@/types";

/**
 * Landing Page - Core content sections
 * Header and Footer are provided by LandingLayout
 */
const LandingPage: NextPageWithLayout = () => {
  return (
    <>
      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>

      {/* Features Section */}
      <section id="features">
        <FeaturesSection />
      </section>

      {/* How It Works */}
      <section id="how-it-works">
        <HowItWorksSection />
      </section>

      {/* Stats Section */}
      <section id="stats">
        <StatsSection />
      </section>

      {/* Testimonials */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* App Showcase */}
      <section id="app">
        <AppShowcaseSection />
      </section>

      {/* FAQ */}
      <section id="faq">
        <FAQSection />
      </section>
    </>
  );
};

// Use LandingLayout
LandingPage.getLayout = (page) => <LandingLayout>{page}</LandingLayout>;

export default LandingPage;
