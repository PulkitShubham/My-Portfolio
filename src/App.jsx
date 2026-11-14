import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { initSmoothScroll, lockScroll } from "./lib/scroll";

import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Background from "./components/Background";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Achievements from "./components/Achievements";
import Contact from "./components/Contact";
import TerminalDock from "./components/terminal/TerminalDock";
import LocationSection from "./components/location/LocationSection";
import Footer from "./components/Footer";
import GitStatusBar from "./components/GitStatusBar";
import FunExtras from "./components/FunExtras";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => initSmoothScroll(), []);

  // Keep the page still while the preloader plays.
  useEffect(() => {
    lockScroll(loading);
    if (!loading) window.scrollTo(0, 0);
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <Cursor />
      <Background />
      <ScrollProgress />
      <Navbar ready={!loading} />
      <TerminalDock ready={!loading} />

      <main className="relative">
        <Hero ready={!loading} />
        <Marquee />
        <About />
        <Experience />
        <Skills />
        <Education />
        <Projects />
        <Achievements />
        <LocationSection />
        <Contact />
      </main>
      <Footer />
      <GitStatusBar ready={!loading} />
      <FunExtras />
    </MotionConfig>
  );
}
