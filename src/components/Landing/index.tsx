import About from "./About";
import AiUsage from "./AiUsage";
import Features from "./Features";
import FinalCta from "./FinalCta";
import Footer from "./Footer";
import Header from "./Header";
import Hero from "./Hero";
import OpenSource from "./OpenSource";
import StorageInfo from "./StorageInfo";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-black">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <StorageInfo />
        <AiUsage />
        <About />
        <OpenSource />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
