import { useCallback } from 'react';
import { Map, Wand2, Loader2, UtensilsCrossed } from 'lucide-react';
import { generateItinerary } from '../../services/aiService.js';
import { useAsyncAI } from '../../hooks/useAsyncAI.js';
import { SectionTitle, LoadingState, ErrorState, GlassCard } from '../ui.jsx';

const TIME_SLOTS = ['morning', 'afternoon', 'evening'];

export default function ItineraryTab({ profile, destination }) {
  const itineraryAction = useCallback(
    () => generateItinerary({ destination, days: 3, interests: profile.interests, mood: profile.mood }),
    [profile, destination]
  );
  const itinerary = useAsyncAI(itineraryAction, 'itinerary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionTitle icon={Map} title="AI Travel Plan" subtitle="Personalized itinerary generated live by AI" />
        <button onClick={itinerary.run} disabled={itinerary.loading} className="btn-gold text-sm disabled:opacity-60">
          {itinerary.loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></>
          ) : (
            <><Wand2 className="w-4 h-4" /><span>{itinerary.data ? 'Regenerate' : 'Generate 3-Day Plan'}</span></>
          )}
        </button>
      </div>

      {itinerary.loading && <LoadingState message="The AI is planning your 3-day itinerary..." />}
      {itinerary.error && !itinerary.loading && <ErrorState message={itinerary.error} onRetry={itinerary.run} />}

      {itinerary.data && !itinerary.loading && (
        <div className="space-y-4">
          {itinerary.data.days?.map((day) => (
            <GlassCard key={day.day} hover={false} className="border-l-4 border-l-gold">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">{day.day}</div>
                <h4 className="font-serif text-lg font-bold text-heritage-800">{day.theme}</h4>
              </div>
              <div className="space-y-3">
                {TIME_SLOTS.map(
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

      {!itinerary.data && !itinerary.loading && !itinerary.error && (
        <div className="text-center py-12">
          <Map className="w-16 h-16 text-heritage-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-heritage-500">Click "Generate 3-Day Plan" for an AI-crafted itinerary</p>
          <p className="text-sm text-heritage-400 mt-2">Based on your {profile.mood} mood and {profile.interests.length} interests</p>
        </div>
      )}
    </div>
  );
}
