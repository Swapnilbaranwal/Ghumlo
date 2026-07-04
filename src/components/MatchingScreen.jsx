import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, ChevronRight, Landmark, Users, Calendar } from 'lucide-react';
import { INDIAN_DESTINATIONS, matchDestinations, matchScoreToPercent } from '../data/indiaHeritage.js';
import { VibeBadge } from './ui.jsx';

/**
 * Runs the (synchronous, deterministic) matching algorithm against the
 * traveler's profile. The brief animated delay is presentational only —
 * it does not fabricate results, it reveals the same real ranking that
 * matchDestinations() computes immediately.
 */
export default function MatchingScreen({ profile, onSelect }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ranked = matchDestinations(profile.interests, profile.mood);
    const timer = setTimeout(() => {
      setMatches(ranked);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-100 via-heritage-50 to-gold/10 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }}>
            <Compass className="w-20 h-20 text-gold mx-auto mb-6" aria-hidden="true" />
          </motion.div>
          <h2 className="font-serif text-3xl font-bold text-heritage-900 mb-2">Matching your cultural profile...</h2>
          <p className="text-heritage-600 mb-4">
            Scoring your <span className="font-semibold text-gold">{profile.mood}</span> mood against{' '}
            {profile.interests.length} interests across {INDIAN_DESTINATIONS.length} destinations
          </p>
          <div className="space-y-2">
            {INDIAN_DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-3 flex items-center space-x-3"
              >
                <MapPin className="w-4 h-4 text-gold" aria-hidden="true" />
                <span className="text-sm text-heritage-600">Scoring {dest.name}...</span>
                <div className="ml-auto w-16 h-1.5 bg-heritage-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-100 via-heritage-50 to-gold/10 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-heritage-900 mb-2">Your Cultural Matches</h2>
          <p className="text-heritage-600">
            Ranked by your {profile.mood} mood and {profile.interests.length} interests
          </p>
        </div>
        <div className="space-y-4">
          {matches.map((dest, index) => (
            <motion.button
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(dest)}
              className="w-full text-left glass-card p-0 overflow-hidden hover:shadow-2xl transition-all group"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
                  <img
                    src={dest.image}
                    alt={`${dest.name} — ${dest.tagline}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2">
                    <VibeBadge color="gold">{matchScoreToPercent(dest.matchScore)}% Match</VibeBadge>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <VibeBadge color="saffron">Top Pick</VibeBadge>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-heritage-800 group-hover:text-gold transition-colors">{dest.name}</h3>
                      <p className="text-sm text-heritage-500 mt-1">{dest.tagline}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-heritage-300 group-hover:text-gold transition-colors flex-shrink-0" aria-hidden="true" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {dest.vibe.map((v) => (
                      <VibeBadge key={v}>{v}</VibeBadge>
                    ))}
                  </div>
                  <div className="flex items-center mt-4 text-xs text-heritage-400 space-x-4">
                    <span className="flex items-center"><Landmark className="w-3 h-3 mr-1" /> {dest.heritageSites.length} Heritage Sites</span>
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {dest.localConnectors.length} Local Connectors</span>
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {dest.events.filter((e) => e.isReal).length} Real Events</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
