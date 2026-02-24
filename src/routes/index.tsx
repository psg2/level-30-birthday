import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { CurtainReveal } from '@/components/CurtainReveal'
import { HeroSection } from '@/components/HeroSection'
import { CharacterSheet } from '@/components/CharacterSheet'
import { TimelineSection } from '@/components/TimelineSection'
import { EventDetails } from '@/components/EventDetails'
import { RSVPSection } from '@/components/RSVPSection'
import { Footer } from '@/components/Footer'
import { EasterEggProvider } from '@/hooks/useEasterEggs'
import { TrophyNotification } from '@/components/TrophyNotification'
import { TrophyCounter } from '@/components/TrophyCounter'

export const Route = createFileRoute('/')({
  component: Home,
})

function ActDivider() {
  return (
    <div className="relative py-4">
      <div className="max-w-xs mx-auto flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/30" />
        <div className="font-mono text-gold/20 text-xs">✦</div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/30" />
      </div>
    </div>
  )
}

function Home() {
  const [curtainOpen, setCurtainOpen] = useState(false)

  return (
    <EasterEggProvider>
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
              <ActDivider />
              <CharacterSheet />
              <ActDivider />
              <TimelineSection />
              <ActDivider />
              <EventDetails />
              <ActDivider />
              <RSVPSection />
              <Footer />
            </motion.main>
          )}
        </AnimatePresence>
        <TrophyNotification />
        <TrophyCounter />
      </div>
    </EasterEggProvider>
  )
}
