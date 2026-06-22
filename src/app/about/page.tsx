import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="red-label">About</p>
          <h1>Lower Price, Zero Hassle.</h1>
          <p>
            Lowzo is being built to help people find better deals across
            multiple marketplaces without checking every app manually.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container about-grid">
          <div>
            <h2>Why Lowzo Exists</h2>
            <p>
              Good deals disappear fast. Lowzo helps users search smarter, track
              items automatically and get notified before the best deals are
              gone.
            </p>
          </div>

          <div>
            <h2>The Mission</h2>
            <p>
              To make deal hunting faster, easier and more powerful for buyers,
              collectors and resellers.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}