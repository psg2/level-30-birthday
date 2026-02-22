import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CurtainReveal } from './components/CurtainReveal';
import { HeroSection } from './components/HeroSection';
import { CharacterSheet } from './components/CharacterSheet';
import { TimelineSection } from './components/TimelineSection';
import { EventDetails } from './components/EventDetails';
import { RSVPSection } from './components/RSVPSection';
import { Footer } from './components/Footer';

export default function App() {
  const [curtainOpen, setCurtainOpen] = useState(false);

  return (
    <div className="grain-overlay">
      <CurtainReveal onComplete={() => setCurtainOpen(true)} />

      <AnimatePresence>
        {curtainOpen && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <HeroSection />

            {/* Act divider */}
            <div className="relative py-4">
              <div className="max-w-xs mx-auto flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
                <div className="font-mono text-gold/20 text-xs">✦</div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
              </div>
            </div>

            <CharacterSheet />

            {/* Act divider */}
            <div className="relative py-4">
              <div className="max-w-xs mx-auto flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
                <div className="font-mono text-gold/20 text-xs">✦</div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
              </div>
            </div>

            <TimelineSection />

            {/* Act divider */}
            <div className="relative py-4">
              <div className="max-w-xs mx-auto flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
                <div className="font-mono text-gold/20 text-xs">✦</div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
              </div>
            </div>

            <EventDetails />

            {/* Act divider */}
            <div className="relative py-4">
              <div className="max-w-xs mx-auto flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
                <div className="font-mono text-gold/20 text-xs">✦</div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
              </div>
            </div>

            <RSVPSection />
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
