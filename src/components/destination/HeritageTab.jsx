import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Landmark, BookMarked, UtensilsCrossed, Sparkles, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { generateCulturalInsight } from '../../services/aiService.js';
import { useKeyedAsyncAI } from '../../hooks/useAsyncAI.js';
import { SectionTitle, GlassCard, ErrorState } from '../ui.jsx';
import { HeritageSiteCard } from './cards.jsx';

export default function HeritageTab({ destination }) {
  const insightAction = useCallback((key) => generateCulturalInsight(key, destination.name), [destination]);
  const insight = useKeyedAsyncAI(insightAction, 'insight');

  return (
    <div className="space-y-6">
      <SectionTitle icon={Landmark} title="Heritage Sites" subtitle="Well-documented, publicly recognized sites" />
      <div className="grid gap-3">
        {destination.heritageSites.map((site) => (
          <GlassCard key={site.name} hover={false}>
            <HeritageSiteCard site={site} />
            {insight.dataByKey[site.name] ? (
              <p className="mt-3 text-sm text-heritage-600 italic bg-gold/5 p-3 rounded-lg border-l-2 border-l-gold">
                <Sparkles className="w-3 h-3 inline mr-1 text-gold" aria-hidden="true" />
                {insight.dataByKey[site.name]}
              </p>
            ) : insight.errorByKey[site.name] ? (
              <div className="mt-3">
                <ErrorState message={insight.errorByKey[site.name]} onRetry={() => insight.run(site.name)} />
              </div>
            ) : (
              <button
                onClick={() => insight.run(site.name)}
                disabled={insight.loadingKey === site.name}
                className="mt-3 text-xs text-gold hover:text-gold/80 flex items-center space-x-1 disabled:opacity-60"
              >
                {insight.loadingKey === site.name ? (
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
            onClick={() => insight.run(item)}
            disabled={insight.loadingKey === item}
            className="glass-card px-4 py-2 text-sm text-heritage-700 hover:bg-gold/5 hover:border-gold/30 transition-all flex items-center space-x-2 disabled:opacity-60"
          >
            <Sparkles className="w-3 h-3 text-gold" aria-hidden="true" />
            <span>{item}</span>
            {insight.dataByKey[item] && <CheckCircle2 className="w-3 h-3 text-green-500" aria-hidden="true" />}
          </button>
        ))}
      </div>
      {destination.intangibleHeritage.filter((k) => insight.dataByKey[k]).map((key) => (
        <motion.div key={key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 border-l-4 border-l-gold">
          <h4 className="font-semibold text-heritage-800 text-sm mb-1">{key}</h4>
          <p className="text-sm text-heritage-600 italic">{insight.dataByKey[key]}</p>
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
    </div>
  );
}
