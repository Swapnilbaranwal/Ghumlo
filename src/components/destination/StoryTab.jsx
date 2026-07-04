import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Wand2, Navigation, User, Clock } from 'lucide-react';
import { generateCulturalStory, generateHiddenGems } from '../../services/aiService.js';
import { useAsyncAI } from '../../hooks/useAsyncAI.js';
import { LoadingState, ErrorState, SectionTitle, GlassCard } from '../ui.jsx';

export default function StoryTab({ profile, destination }) {
  const storyAction = useCallback(
    () => generateCulturalStory({ mood: profile.mood, interests: profile.interests, destination, travelerName: profile.name }),
    [profile, destination]
  );
  const story = useAsyncAI(storyAction, 'story');

  const gemsAction = useCallback(
    () => generateHiddenGems({ mood: profile.mood, interests: profile.interests, destination }),
    [profile, destination]
  );
  const gems = useAsyncAI(gemsAction, 'gems');

  return (
    <div className="space-y-6">
      {!story.data && !story.loading && !story.error && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={story.run}
          className="w-full py-4 bg-gradient-to-r from-gold via-saffron to-indiaGreen text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />
          <span>Generate My Personal Story with AI</span>
        </motion.button>
      )}

      {story.loading && <LoadingState message="The AI is writing your personal narrative..." />}
      {story.error && <ErrorState message={story.error} onRetry={story.run} />}

      {story.data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-l-gold shadow-xl">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 mr-2 text-gold" aria-hidden="true" />
            <h3 className="font-serif text-xl font-semibold text-heritage-800">Your AI-Crafted Cultural Narrative</h3>
            <div className="ml-2 flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" aria-hidden="true" />
              <span className="text-xs text-gold font-medium">Live from the AI, just now</span>
            </div>
          </div>
          <div className="story-text whitespace-pre-line">{story.data}</div>
          <div className="mt-4 pt-4 border-t border-heritage-100 flex items-center text-xs text-heritage-400 space-x-4">
            <span className="flex items-center"><Wand2 className="w-3 h-3 mr-1" /> Generated live from your prompt, just now</span>
            <button onClick={story.run} disabled={story.loading} className="text-gold hover:underline disabled:opacity-50 disabled:no-underline">
              Generate another
            </button>
          </div>
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Navigation} title="Hidden Gems" subtitle="Generated live by AI, based on your profile" />
          <button onClick={gems.run} disabled={gems.loading} className="text-sm text-gold hover:text-gold/80 flex items-center space-x-1 disabled:opacity-50">
            <Wand2 className="w-4 h-4" aria-hidden="true" />
            <span>{gems.data ? 'Regenerate' : 'Generate with AI'}</span>
          </button>
        </div>
        {gems.loading && <LoadingState message="The AI is scouting hidden gems..." />}
        {gems.error && !gems.loading && <ErrorState message={gems.error} onRetry={gems.run} />}
        {gems.data && !gems.loading && (
          <div className="grid gap-3">
            {gems.data.map((gem) => (
              <GlassCard key={gem.name ?? gem.significance} className="border-l-4 border-l-saffron">
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
        {!gems.data && !gems.loading && !gems.error && (
          <p className="text-sm text-heritage-400 italic">Click "Generate with AI" to discover personalized hidden gems.</p>
        )}
      </div>
    </div>
  );
}
