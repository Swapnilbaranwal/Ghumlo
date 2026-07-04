import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, ChevronRight, ArrowLeft, Sparkles, Sunrise, Mountain, Heart,
  Coffee, UtensilsCrossed, BookMarked, Music, Camera, Landmark, BookOpen,
  Palmtree, Waves, Star,
} from 'lucide-react';

const MOOD_OPTIONS = [
  { label: 'Seeking Peace & Spirituality', value: 'spiritual', desc: 'Inner journey, temples, meditation', icon: Sunrise },
  { label: 'Hungry for Adventure', value: 'adventurous', desc: 'Trekking, hidden trails, raw experiences', icon: Mountain },
  { label: 'Romantic & Dreamy', value: 'romantic', desc: 'Palaces, sunsets, poetry', icon: Heart },
  { label: 'Creative & Curious', value: 'creative', desc: 'Art, craft, music, storytelling', icon: Coffee },
  { label: 'Food Obsessed', value: 'foodie', desc: 'Local cuisine, street food, cooking', icon: UtensilsCrossed },
  { label: 'History Buff', value: 'historical', desc: 'Ancient sites, untold stories', icon: BookMarked },
];

const INTEREST_OPTIONS = [
  { label: 'Classical Music & Dance', icon: Music, value: 'music' },
  { label: 'Traditional Crafts', icon: Camera, value: 'craft' },
  { label: 'Ancient Temples', icon: Landmark, value: 'temples' },
  { label: 'Local Cuisine', icon: UtensilsCrossed, value: 'food' },
  { label: 'Folk Art & Stories', icon: BookOpen, value: 'folklore' },
  { label: 'Textiles & Weaving', icon: Camera, value: 'textiles' },
  { label: 'Spiritual Practices', icon: Sunrise, value: 'spiritual' },
  { label: 'Nature & Wildlife', icon: Palmtree, value: 'nature' },
  { label: 'Royal Heritage', icon: Star, value: 'royal' },
  { label: 'Coastal Culture', icon: Waves, value: 'coastal' },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [interests, setInterests] = useState([]);
  const [name, setName] = useState('');

  const toggleInterest = (value) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-100 via-heritage-50 to-gold/10 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Compass className="w-16 h-16 text-gold mx-auto mb-4" aria-hidden="true" />
          </motion.div>
          <h1 className="font-serif text-5xl font-bold text-heritage-900 mb-2">Ghumlo</h1>
          <p className="text-xl text-heritage-600 font-light">Bharat ki Virasat, Aapki Kahani</p>
          <p className="text-sm text-heritage-400 mt-1">India's heritage, your story — narrated live by Gemini AI</p>
        </div>

        <div className="glass-card p-8 space-y-8">
          <div className="flex space-x-2" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= i ? 'bg-gold' : 'bg-heritage-200'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Namaste! What's your name?</h2>
                  <p className="text-heritage-500 text-sm">We'll weave you into India's stories</p>
                </div>
                <label htmlFor="traveler-name" className="sr-only">Your name</label>
                <input
                  id="traveler-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full p-4 bg-white border-2 border-heritage-200 rounded-xl text-lg focus:border-gold focus:outline-none transition-colors"
                />
                <button onClick={() => setStep(2)} disabled={!name.trim()} className="w-full btn-primary disabled:opacity-50">
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">How are you feeling right now?</h2>
                  <p className="text-heritage-500 text-sm">This shapes the story Gemini writes for you</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Mood">
                  {MOOD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = mood === opt.value;
                    return (
                      <button
                        key={opt.value}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setMood(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selected ? 'border-gold bg-gold/10 shadow-lg' : 'border-heritage-200 hover:border-heritage-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Icon className="w-5 h-5 mr-2 text-heritage-600" aria-hidden="true" />
                          <span className="font-semibold text-heritage-800">{opt.label}</span>
                        </div>
                        <p className="text-xs text-heritage-500">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setStep(1)} aria-label="Go back" className="px-4 py-3 border-2 border-heritage-300 rounded-xl text-heritage-600 hover:bg-heritage-50">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setStep(3)} disabled={!mood} className="flex-1 btn-primary disabled:opacity-50">
                    <span>Continue</span>
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">What moves your soul?</h2>
                  <p className="text-heritage-500 text-sm">Select all that resonate — this drives your destination match</p>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
                  {INTEREST_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = interests.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        aria-pressed={isSelected}
                        onClick={() => toggleInterest(opt.value)}
                        className={`inline-flex items-center px-4 py-2.5 rounded-full border-2 transition-all ${
                          isSelected ? 'border-gold bg-gold/10 text-heritage-800' : 'border-heritage-200 text-heritage-600 hover:border-heritage-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setStep(2)} aria-label="Go back" className="px-4 py-3 border-2 border-heritage-300 rounded-xl text-heritage-600 hover:bg-heritage-50">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onComplete({ mood, interests, name: name.trim() || 'Traveler' })}
                    disabled={interests.length === 0}
                    className="flex-1 btn-gold disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    <span>Discover My Cultural Destiny</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-gold">42</p>
            <p className="text-xs text-heritage-500">UNESCO Sites</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-saffron">3,691</p>
            <p className="text-xs text-heritage-500">ASI Monuments</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-indiaGreen">&infin;</p>
            <p className="text-xs text-heritage-500">Stories to Tell</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
