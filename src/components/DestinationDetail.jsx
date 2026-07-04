import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BookOpen, Landmark, Calendar, Users, Map, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { checkAIHealth } from '../services/aiService.js';
import { VibeBadge } from './ui.jsx';
import StoryTab from './destination/StoryTab.jsx';
import HeritageTab from './destination/HeritageTab.jsx';
import EventsTab from './destination/EventsTab.jsx';
import LocalsTab from './destination/LocalsTab.jsx';
import ItineraryTab from './destination/ItineraryTab.jsx';

const TABS = [
  { id: 'story', label: 'Story', icon: BookOpen, Component: StoryTab },
  { id: 'heritage', label: 'Heritage', icon: Landmark, Component: HeritageTab },
  { id: 'events', label: 'Events', icon: Calendar, Component: EventsTab },
  { id: 'locals', label: 'Connect', icon: Users, Component: LocalsTab },
  { id: 'itinerary', label: 'Plan', icon: Map, Component: ItineraryTab },
];

/**
 * Shell for the destination detail screen: hero image, AI-connectivity badge,
 * and the tab strip. Each tab's own state (loading/error/data, AI calls) lives
 * in its own component under ./destination/ — this file only owns which tab
 * is active and passes profile/destination down.
 */
export default function DestinationDetail({ destination, profile, onBack }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [aiOnline, setAiOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;
    checkAIHealth().then((ok) => !cancelled && setAiOnline(ok));
    return () => {
      cancelled = true;
    };
  }, []);

  const ActiveTabComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="min-h-screen bg-heritage-50">
      <div className="relative h-[55vh] sm:h-[60vh] overflow-hidden">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-900/90 via-heritage-900/30 to-transparent" />
        <button
          onClick={onBack}
          aria-label="Back to matches"
          className="absolute top-4 left-4 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
              <span className="flex items-center text-gold-light font-medium text-sm">
                <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                {destination.state} • {destination.type}
              </span>
              {aiOnline !== null && (
                <span className={`flex items-center text-xs ${aiOnline ? 'text-green-400' : 'text-red-400'}`} role="status">
                  {aiOnline ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {aiOnline ? 'AI connected' : 'AI unreachable — check your API key(s)'}
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">{destination.name}</h1>
            <p className="text-lg text-white/80 font-light">{destination.tagline}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {destination.vibe.map((v) => (
                <VibeBadge key={v} color="gold">{v}</VibeBadge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-heritage-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto scroll-hide py-2" role="tablist" aria-label="Destination sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive ? 'bg-gold/10 text-gold' : 'text-heritage-500 hover:text-heritage-700 hover:bg-heritage-50'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {ActiveTabComponent && <ActiveTabComponent profile={profile} destination={destination} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
