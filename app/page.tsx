import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import BestSellers from "@/components/BestSellers";
import NewAndNoteworthy from "@/components/NewAndNoteworthy";
import AboutSection from "@/components/AboutSection";
import Testimonials from "@/components/Testimonials";
import NewArrivals from "@/components/NewArrivals";
import FAQ from "@/components/FAQ";
import TrustFeatures from "@/components/TrustFeatures";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <CategoryGrid />
      <BestSellers />
      <NewAndNoteworthy />
      <AboutSection />
      <Testimonials />
      <NewArrivals />
      <FAQ />
      <TrustFeatures />
      <Footer />
    </main>
  );
}