import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Marketplace from "../components/Marketplace";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Marketplace />
      <Features />
      <Footer />
    </main>
  );
}