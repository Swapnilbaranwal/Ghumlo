import { Calendar, Flame } from 'lucide-react';
import { getUpcomingFestivals } from '../../data/indiaHeritage.js';
import { SectionTitle } from '../ui.jsx';
import { EventCard, FestivalBadge } from './cards.jsx';

export default function EventsTab({ destination }) {
  return (
    <div className="space-y-6">
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
    </div>
  );
}
