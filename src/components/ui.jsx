import { motion } from 'framer-motion';
import { Compass, AlertTriangle } from 'lucide-react';

/** Small, reusable, presentation-only building blocks used across screens. */

export function LoadingState({ message = 'Working...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-16 space-y-4"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Compass className="w-12 h-12 text-gold" aria-hidden="true" />
      </motion.div>
      <p className="font-serif text-lg text-heritage-600 italic">{message}</p>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gold rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="glass-card p-5 border-l-4 border-l-red-400 bg-red-50/60 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">The AI request didn't go through</p>
        <p className="text-xs text-red-600 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function VibeBadge({ children, color = 'heritage' }) {
  const palette = {
    gold: 'bg-gold/10 text-gold border-gold/30',
    green: 'bg-indiaGreen/10 text-indiaGreen border-indiaGreen/30',
    saffron: 'bg-saffron/10 text-saffron border-saffron/30',
    heritage: 'bg-heritage-100 text-heritage-700 border-heritage-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${palette[color]}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="font-serif text-2xl font-bold text-heritage-800 flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-2 text-gold" aria-hidden="true" />}
        {title}
      </h3>
      {subtitle && <p className="text-sm text-heritage-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function GlassCard({ children, className = '', onClick, hover = true }) {
  const interactiveProps = onClick
    ? { role: 'button', tabIndex: 0, onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) }
    : {};
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={`glass-card p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...interactiveProps}
    >
      {children}
    </motion.div>
  );
}
