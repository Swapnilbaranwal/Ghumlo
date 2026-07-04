import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Wand2, Sparkles } from 'lucide-react';
import { generateConnectionTip } from '../../services/aiService.js';
import { useAsyncAI } from '../../hooks/useAsyncAI.js';
import { SectionTitle, LoadingState, ErrorState } from '../ui.jsx';
import { LocalCard } from './cards.jsx';

export default function LocalsTab({ profile, destination }) {
  const tipAction = useCallback(
    () => generateConnectionTip({ mood: profile.mood, interests: profile.interests, destination }),
    [profile, destination]
  );
  const tip = useAsyncAI(tipAction, 'tip');

  return (
    <div className="space-y-6">
      <SectionTitle icon={Users} title="Cultural Connectors" subtitle="Sample profiles illustrating the connector model" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destination.localConnectors.map((local) => (
          <LocalCard key={local.name} local={local} />
        ))}
      </div>

      <div className="glass-card p-6 bg-gradient-to-br from-gold/5 to-saffron/5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <h4 className="font-serif text-lg font-bold text-heritage-800">Get a personalized way to connect</h4>
          <button onClick={tip.run} disabled={tip.loading} className="text-sm text-gold hover:text-gold/80 flex items-center space-x-1 disabled:opacity-50">
            <Wand2 className="w-4 h-4" aria-hidden="true" />
            <span>{tip.data ? 'Get another idea' : 'Ask the AI'}</span>
          </button>
        </div>
        <p className="text-sm text-heritage-600">
          The profiles above are illustrative sample data (no live directory is wired up in this build). This part is
          live: based on your mood and interests, the AI suggests one concrete, honest way to engage with{' '}
          {destination.name}'s culture as a participant rather than a spectator.
        </p>

        {tip.loading && <div className="mt-4"><LoadingState message="The AI is thinking of a way to connect..." /></div>}
        {tip.error && !tip.loading && <div className="mt-4"><ErrorState message={tip.error} onRetry={tip.run} /></div>}
        {tip.data && !tip.loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white/70 rounded-xl border-l-4 border-l-gold"
          >
            <div className="flex items-center mb-1 text-xs text-gold font-medium">
              <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              Live from the AI, just now
            </div>
            <p className="text-sm text-heritage-700">{tip.data}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
