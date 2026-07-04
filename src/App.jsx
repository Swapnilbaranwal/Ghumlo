import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OnboardingScreen from './components/OnboardingScreen.jsx';
import MatchingScreen from './components/MatchingScreen.jsx';
import DestinationDetail from './components/DestinationDetail.jsx';

/**
 * Top-level screen state machine: onboarding -> matching -> destination detail.
 * Kept intentionally simple (no router) since the app is a single linear flow.
 */
export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [profile, setProfile] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  function handleOnboardingComplete(userProfile) {
    setProfile(userProfile);
    setScreen('matching');
  }

  function handleDestinationSelect(destination) {
    setSelectedDestination(destination);
    setScreen('destination');
  }

  function handleBack() {
    if (screen === 'destination') {
      setScreen('matching');
      setSelectedDestination(null);
    } else if (screen === 'matching') {
      setScreen('onboarding');
    }
  }

  return (
    <div className="min-h-screen bg-heritage-50">
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div key="onboarding" exit={{ opacity: 0 }}>
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
        {screen === 'matching' && profile && (
          <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MatchingScreen profile={profile} onSelect={handleDestinationSelect} />
          </motion.div>
        )}
        {screen === 'destination' && selectedDestination && profile && (
          <motion.div key="destination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DestinationDetail destination={selectedDestination} profile={profile} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
