import { motion } from 'framer-motion';
import { Calendar, Users, MessageCircle, Landmark, Flame } from 'lucide-react';
import { VibeBadge } from '../ui.jsx';

/** Small presentational cards shared by the destination tabs. No AI/data logic lives here. */

export function EventCard({ event }) {
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

export function LocalCard({ local }) {
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

export function HeritageSiteCard({ site }) {
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

export function FestivalBadge({ festival }) {
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
