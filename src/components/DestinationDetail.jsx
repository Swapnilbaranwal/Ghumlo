import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, BookOpen, Calendar, Users, Sparkles, MessageCircle,
  Clock, UtensilsCrossed, Landmark, Flame, BookMarked, ArrowLeft, Loader2, Wand2,
  Map, User, CheckCircle2, AlertCircle, Navigation,
} from 'lucide-react';
import { getUpcomingFestivals } from '../data/indiaHeritage.js';
import {
  generateCulturalStory, generateHiddenGems, generateItinerary,
  generateCulturalInsight, checkAIHealth,
} from '../services/aiService.js';
import { LoadingState, ErrorState, VibeBadge, SectionTitle, GlassCard } from './ui.jsx';

function EventCard({ event }) {
  return (
    <div className="glass-card p-4 flex items-start space-x-3">
      <div className={`p-2 rounded-lg ${event.isReal ? 'bg-gold/10' : 'bg-heritage-100'}`}>
        <Calendar className={`w-5 h-5 ${event.isReal ? 'text-gold' : 'text-heritage-500'}`} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <h4 className="font-semibold text-heritage-800 text-sm">{event.title}</h4>
          {event.isReal && <VibeBadge color="gold">Verified date</VibeBadge>}
        </div>
        <p className="text-xs text-heritage-500 mt-1">{event.date}</p>
        <div className="flex items-center mt-1.5 text-xs text-heritage-400">
          <Users className="w-3 h-3 mr-1" aria-hidden="true" />
          <span>Hosted by {event.host}</span>
        </div>
      </div>
    </div>
  );
}

function LocalCard({ local }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-4 text-center">
      <div className="text-4xl mb-2" aria-hidden="true">{local.avatar}</div>
      <h4 className="font-semibold text-heritage-800 text-sm">{local.name}</h4>
      <p className="text-xs text-gold font-medium uppercase tracking-wider mt-1">{local.role}</p>
      <p className="text-xs text-heritage-500 mt-2 leading-relaxed">{local.bio}</p>
      <button
        type="button"
        title="Community connection requests are not wired to a backend in this build"
        className="mt-3 w-full py-2 bg-heritage-800 text-white rounded-lg text-xs font-medium hover:bg-heritage-700 transition-colors flex items-center justify-center space-x-1 opacity-60 cursor-not-allowed"
        disabled
      >
        <MessageCircle className="w-3 h-3" aria-hidden="true" />
        <span>Connect (coming soon)</span>
      </button>
    </motion.div>
  );
}

function HeritageSiteCard({ site }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-heritage-50 rounded-xl">
      <Landmark className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <h4 className="font-semibold text-heritage-800 text-sm">{site.name}</h4>
        <p className="text-xs text-heritage-500">{site.type} • Built {site.built}</p>
        <p className="text-xs text-heritage-400 mt-1">{site.significance}</p>
      </div>
    </div>
  );
}

function FestivalBadge({ festival }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-saffron/10 via-white to-indiaGreen/10 rounded-lg border border-heritage-100">
      <Flame className="w-4 h-4 text-saffron" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-heritage-800 truncate">{festival.name}</p>
        <p className="text-xs text-heritage-500">{festival.date}</p>
      </div>
      <VibeBadge color="saffron">{festival.type}</VibeBadge>
    </div>
  );
}

const TABS = [
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'heritage', label: 'Heritage', icon: Landmark },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'locals', label: 'Connect', icon: Users },
  { id: 'itinerary', label: 'Plan', icon: Map },
];

export default function DestinationDetail({ destination, profile, onBack }) {
  const [activeTab, setActiveTab] = useState('story');

  // Story generation state — story/storyError are mutually exclusive and
  // ONLY story (never storyError) is ever labeled "AI-generated" in the UI.
  const [story, setStory] = useState(null);
  const [storyError, setStoryError] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const [gems, setGems] = useState(null);
  const [gemsError, setGemsError] = useState(null);
  const [isLoadingGems, setIsLoadingGems] = useState(false);

  const [itinerary, setItinerary] = useState(null);
  const [itineraryError, setItineraryError] = useState(null);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  const [insights, setInsights] = useState({});
  const [insightErrors, setInsightErrors] = useState({});
  const [loadingInsightFor, setLoadingInsightFor] = useState(null);

  const [aiOnline, setAiOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;
    checkAIHealth().then((ok) => !cancelled && setAiOnline(ok));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerateStory() {
    setIsGeneratingStory(true);
    setStoryError(null);
    const result = await generateCulturalStory({
      mood: profile.mood,
      interests: profile.interests,
      destination,
      travelerName: profile.name,
    });
    if (result.ok) {
      setStory(result.story);
    } else {
      setStory(null);
      setStoryError(result.error);
    }
    setIsGeneratingStory(false);
  }

  async function handleGenerateGems() {
    setIsLoadingGems(true);
    setGemsError(null);
    const result = await generateHiddenGems({ mood: profile.mood, interests: profile.interests, destination });
    if (result.ok) {
      setGems(result.gems);
    } else {
      setGems(null);
      setGemsError(result.error);
    }
    setIsLoadingGems(false);
  }

  async function handleGenerateItinerary() {
    setIsLoadingItinerary(true);
    setItineraryError(null);
    const result = await generateItinerary({ destination, days: 3, interests: profile.interests, mood: profile.mood });
    if (result.ok) {
      setItinerary(result.itinerary);
    } else {
      setItinerary(null);
      setItineraryError(result.error);
    }
    setIsLoadingItinerary(false);
  }

  async function handleGetInsight(key) {
    setLoadingInsightFor(key);
    const result = await generateCulturalInsight(key, destination.name);
    if (result.ok) {
      setInsights((prev) => ({ ...prev, [key]: result.insight }));
      setInsightErrors((prev) => ({ ...prev, [key]: null }));
    } else {
      setInsightErrors((prev) => ({ ...prev, [key]: result.error }));
    }
    setLoadingInsightFor(null);
  }

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
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
              <span className="flex items-center text-gold font-medium text-sm">
                <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                {destination.state} • {destination.type}
              </span>
              {aiOnline !== null && (
                <span className={`flex items-center text-xs ${aiOnline ? 'text-green-400' : 'text-red-400'}`}>
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
          <div className="flex space-x-1 overflow-x-auto scroll-hide py-2" role="tablist">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
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
          {activeTab === 'story' && (
            <motion.div key="story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {!story && !isGeneratingStory && !storyError && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateStory}
                  className="w-full py-4 bg-gradient-to-r from-gold via-saffron to-indiaGreen text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-6 h-6" aria-hidden="true" />
                  <span>Generate My Personal Story with AI</span>
                </motion.button>
              )}

              {isGeneratingStory && <LoadingState message="The AI is writing your personal narrative..." />}

              {storyError && <ErrorState message={storyError} onRetry={handleGenerateStory} />}

              {story && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-l-gold shadow-xl">
                  <div className="flex items-center mb-4">
                    <BookOpen className="w-5 h-5 mr-2 text-gold" aria-hidden="true" />
                    <h3 className="font-serif text-xl font-semibold text-heritage-800">Your AI-Crafted Cultural Narrative</h3>
                    <div className="ml-2 flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-gold animate-pulse" aria-hidden="true" />
                      <span className="text-xs text-gold font-medium">Live from the AI, just now</span>
                    </div>
                  </div>
                  <div className="story-text whitespace-pre-line">{story}</div>
                  <div className="mt-4 pt-4 border-t border-heritage-100 flex items-center text-xs text-heritage-400 space-x-4">
                    <span className="flex items-center"><Wand2 className="w-3 h-3 mr-1" /> Generated live from your prompt, just now</span>
                    <button onClick={handleGenerateStory} className="text-gold hover:underline">Generate another</button>
                  </div>
                </motion.div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={Navigation} title="Hidden Gems" subtitle="Generated live by AI, based on your profile" />
                  <button onClick={handleGenerateGems} disabled={isLoadingGems} className="text-sm text-gold hover:text-gold/80 flex items-center space-x-1 disabled:opacity-50">
                    <Wand2 className="w-4 h-4" aria-hidden="true" />
                    <span>{gems ? 'Regenerate' : 'Generate with AI'}</span>
                  </button>
                </div>
                {isLoadingGems && <LoadingState message="The AI is scouting hidden gems..." />}
                {gemsError && !isLoadingGems && <ErrorState message={gemsError} onRetry={handleGenerateGems} />}
                {gems && !isLoadingGems && (
                  <div className="grid gap-3">
                    {gems.map((gem, i) => (
                      <GlassCard key={i} className="border-l-4 border-l-saffron">
                        <h4 className="font-semibold text-heritage-800">{gem.name}</h4>
                        <p className="text-sm text-heritage-600 mt-1">{gem.significance}</p>
                        <div className="flex flex-wrap items-center mt-2 text-xs text-heritage-500 gap-x-3 gap-y-1">
                          <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {gem.localContact?.name}, {gem.localContact?.role}</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {gem.bestTime}</span>
                        </div>
                        <p className="text-xs text-heritage-400 mt-1 italic">{gem.sensoryDetail}</p>
                      </GlassCard>
                    ))}
                  </div>
                )}
                {!gems && !isLoadingGems && !gemsError && (
                  <p className="text-sm text-heritage-400 italic">Click "Generate with AI" to discover personalized hidden gems.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'heritage' && (
            <motion.div key="heritage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <SectionTitle icon={Landmark} title="Heritage Sites" subtitle="Well-documented, publicly recognized sites" />
              <div className="grid gap-3">
                {destination.heritageSites.map((site) => (
                  <GlassCard key={site.name} hover={false}>
                    <HeritageSiteCard site={site} />
                    {insights[site.name] ? (
                      <p className="mt-3 text-sm text-heritage-600 italic bg-gold/5 p-3 rounded-lg border-l-2 border-l-gold">
                        <Sparkles className="w-3 h-3 inline mr-1 text-gold" aria-hidden="true" />
                        {insights[site.name]}
                      </p>
                    ) : insightErrors[site.name] ? (
                      <div className="mt-3">
                        <ErrorState message={insightErrors[site.name]} onRetry={() => handleGetInsight(site.name)} />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGetInsight(site.name)}
                        disabled={loadingInsightFor === site.name}
                        className="mt-3 text-xs text-gold hover:text-gold/80 flex items-center space-x-1 disabled:opacity-60"
                      >
                        {loadingInsightFor === site.name ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /><span>Asking the AI...</span></>
                        ) : (
                          <><Wand2 className="w-3 h-3" /><span>Get AI cultural insight</span></>
                        )}
                      </button>
                    )}
                  </GlassCard>
                ))}
              </div>

              <SectionTitle icon={BookMarked} title="Intangible Heritage" subtitle="Living traditions of this region" />
              <div className="flex flex-wrap gap-2">
                {destination.intangibleHeritage.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleGetInsight(item)}
                    disabled={loadingInsightFor === item}
                    className="glass-card px-4 py-2 text-sm text-heritage-700 hover:bg-gold/5 hover:border-gold/30 transition-all flex items-center space-x-2 disabled:opacity-60"
                  >
                    <Sparkles className="w-3 h-3 text-gold" aria-hidden="true" />
                    <span>{item}</span>
                    {insights[item] && <CheckCircle2 className="w-3 h-3 text-green-500" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              {destination.intangibleHeritage.filter((k) => insights[k]).map((key) => (
                <motion.div key={key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 border-l-4 border-l-gold">
                  <h4 className="font-semibold text-heritage-800 text-sm mb-1">{key}</h4>
                  <p className="text-sm text-heritage-600 italic">{insights[key]}</p>
                </motion.div>
              ))}

              <SectionTitle icon={UtensilsCrossed} title="Must-Try Cuisine" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {destination.cuisine.map((dish) => (
                  <div key={dish} className="glass-card p-3 text-center">
                    <UtensilsCrossed className="w-5 h-5 text-saffron mx-auto mb-1" aria-hidden="true" />
                    <p className="text-sm font-medium text-heritage-800">{dish}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <SectionTitle icon={Calendar} title="Experiences" subtitle="Publicly known recurring events at this destination" />
              <div className="space-y-3">
                {destination.events.map((event) => (
                  <EventCard key={event.title} event={event} />
                ))}
              </div>
              <SectionTitle icon={Flame} title="Upcoming Pan-India Festivals" subtitle="2026 national festival calendar" />
              <div className="grid gap-2">
                {getUpcomingFestivals().map((festival) => (
                  <FestivalBadge key={festival.name} festival={festival} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'locals' && (
            <motion.div key="locals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <SectionTitle icon={Users} title="Cultural Connectors" subtitle="Sample profiles illustrating the connector model" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {destination.localConnectors.map((local) => (
                  <LocalCard key={local.name} local={local} />
                ))}
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-gold/5 to-saffron/5">
                <h4 className="font-serif text-lg font-bold text-heritage-800 mb-2">How cultural connection would work</h4>
                <p className="text-sm text-heritage-600">
                  In a full deployment, locals verify their profile and travelers request an introduction; a
                  messaging backend brokers the conversation. That backend is out of scope for this build —
                  the profiles above illustrate the intended experience rather than a live directory.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'itinerary' && (
            <motion.div key="itinerary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <SectionTitle icon={Map} title="AI Travel Plan" subtitle="Personalized itinerary generated live by AI" />
                <button onClick={handleGenerateItinerary} disabled={isLoadingItinerary} className="btn-gold text-sm disabled:opacity-60">
                  {isLoadingItinerary ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></>
                  ) : (
                    <><Wand2 className="w-4 h-4" /><span>{itinerary ? 'Regenerate' : 'Generate 3-Day Plan'}</span></>
                  )}
                </button>
              </div>

              {isLoadingItinerary && <LoadingState message="The AI is planning your 3-day itinerary..." />}
              {itineraryError && !isLoadingItinerary && <ErrorState message={itineraryError} onRetry={handleGenerateItinerary} />}

              {itinerary && !isLoadingItinerary && (
                <div className="space-y-4">
                  {itinerary.days?.map((day) => (
                    <GlassCard key={day.day} hover={false} className="border-l-4 border-l-gold">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">{day.day}</div>
                        <h4 className="font-serif text-lg font-bold text-heritage-800">{day.theme}</h4>
                      </div>
                      <div className="space-y-3">
                        {['morning', 'afternoon', 'evening'].map(
                          (time) =>
                            day[time] && (
                              <div key={time} className="flex items-start space-x-3">
                                <div className="w-20 text-xs font-medium text-heritage-500 capitalize pt-1">{time}</div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-heritage-800">{day[time].activity}</p>
                                  <p className="text-xs text-heritage-500">{day[time].location}</p>
                                  {day[time].tip && <p className="text-xs text-gold mt-1">Tip: {day[time].tip}</p>}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                      {day.food && (
                        <div className="mt-3 pt-3 border-t border-heritage-100">
                          <p className="text-xs text-heritage-500">
                            <UtensilsCrossed className="w-3 h-3 inline mr-1" /> Try: {day.food.join(', ')}
                          </p>
                        </div>
                      )}
                      {day.culturalMoment && (
                        <div className="mt-2 p-2 bg-gold/5 rounded-lg">
                          <p className="text-xs text-heritage-600 italic">{day.culturalMoment}</p>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}

              {!itinerary && !isLoadingItinerary && !itineraryError && (
                <div className="text-center py-12">
                  <Map className="w-16 h-16 text-heritage-300 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-heritage-500">Click "Generate 3-Day Plan" for an AI-crafted itinerary</p>
                  <p className="text-sm text-heritage-400 mt-2">Based on your {profile.mood} mood and {profile.interests.length} interests</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
