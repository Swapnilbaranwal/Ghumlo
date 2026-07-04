import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DestinationDetail from './DestinationDetail.jsx';
import { INDIAN_DESTINATIONS } from '../data/indiaHeritage.js';
import * as aiService from '../services/aiService.js';

// DestinationDetail's tabs call real network functions from aiService. Unit
// tests must never make real network calls, so every function is mocked —
// these tests verify the UI wiring (does a click call the right function
// with the right args, does a success/error result render correctly), not
// the AI model's actual behavior.
vi.mock('../services/aiService.js', () => ({
  generateCulturalStory: vi.fn(),
  generateHiddenGems: vi.fn(),
  generateItinerary: vi.fn(),
  generateCulturalInsight: vi.fn(),
  generateConnectionTip: vi.fn(),
  checkAIHealth: vi.fn(),
}));

const destination = INDIAN_DESTINATIONS[0];
const profile = { name: 'Priya', mood: 'spiritual', interests: ['temples', 'spiritual'] };

describe('DestinationDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiService.checkAIHealth.mockResolvedValue(true);
  });

  it('renders the destination hero and defaults to the Story tab', async () => {
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: destination.name })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /story/i })).toHaveAttribute('aria-selected', 'true');
    // Let the async checkAIHealth() status update settle before the test ends.
    expect(await screen.findByText(/ai connected/i)).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<DestinationDetail destination={destination} profile={profile} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back to matches/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('generates a story on click and renders it as AI-generated, never a static fallback', async () => {
    const user = userEvent.setup();
    aiService.generateCulturalStory.mockResolvedValue({ ok: true, story: 'A story about the ghats at dawn.' });
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /generate my personal story with ai/i }));

    await waitFor(() => expect(screen.getByText('A story about the ghats at dawn.')).toBeInTheDocument());
    expect(aiService.generateCulturalStory).toHaveBeenCalledWith(
      expect.objectContaining({ mood: 'spiritual', interests: ['temples', 'spiritual'], travelerName: 'Priya' })
    );
  });

  it('shows a genuine error state — not fabricated content — when the AI call fails', async () => {
    const user = userEvent.setup();
    aiService.generateCulturalStory.mockResolvedValue({ ok: false, error: 'Gemini (gemini-2.5-flash) error 503: overloaded' });
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /generate my personal story with ai/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/overloaded/i);
  });

  it('ignores a second click while a story request is already in flight', async () => {
    const user = userEvent.setup();
    let resolveStory;
    aiService.generateCulturalStory.mockReturnValue(new Promise((resolve) => (resolveStory = resolve)));
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);

    const generateButton = screen.getByRole('button', { name: /generate my personal story with ai/i });
    await user.click(generateButton);
    // Button disappears while loading, so a rapid second click can't reach it —
    // this itself proves the re-entrancy guard's effect at the UI level.
    expect(screen.queryByRole('button', { name: /generate my personal story with ai/i })).not.toBeInTheDocument();

    resolveStory({ ok: true, story: 'Done.' });
    await waitFor(() => expect(screen.getByText('Done.')).toBeInTheDocument());
    expect(aiService.generateCulturalStory).toHaveBeenCalledTimes(1);
  });

  it('switches to the Heritage tab and shows its real heritage sites', async () => {
    const user = userEvent.setup();
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: /heritage/i }));
    // The tab panel swap is animated (AnimatePresence mode="wait"), so the
    // new panel's content mounts asynchronously.
    expect(await screen.findByText(destination.heritageSites[0].name)).toBeInTheDocument();
  });

  it('shows real events and festivals on the Events tab without any AI call', async () => {
    const user = userEvent.setup();
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);
    await user.click(screen.getByRole('tab', { name: /events/i }));
    expect(await screen.findByText(destination.events[0].title)).toBeInTheDocument();
    expect(aiService.generateCulturalStory).not.toHaveBeenCalled();
  });

  it('generates a connection tip on the Connect tab, separate from the static profiles', async () => {
    const user = userEvent.setup();
    aiService.generateConnectionTip.mockResolvedValue({ ok: true, tip: 'Join a morning aarti and just listen first.' });
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: /connect/i }));
    expect(await screen.findByText(destination.localConnectors[0].name)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ask the ai/i }));
    expect(await screen.findByText('Join a morning aarti and just listen first.')).toBeInTheDocument();
    expect(aiService.generateConnectionTip).toHaveBeenCalledWith(
      expect.objectContaining({ mood: 'spiritual', interests: ['temples', 'spiritual'] })
    );
  });

  it('generates a 3-day itinerary on the Plan tab', async () => {
    const user = userEvent.setup();
    aiService.generateItinerary.mockResolvedValue({
      ok: true,
      itinerary: { days: [{ day: 1, theme: 'Sunrise on the ghats', morning: { activity: 'Ganga Aarti', location: 'Dashashwamedh Ghat' } }] },
    });
    render(<DestinationDetail destination={destination} profile={profile} onBack={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: /plan/i }));
    await user.click(await screen.findByRole('button', { name: /generate 3-day plan/i }));

    expect(await screen.findByText('Sunrise on the ghats')).toBeInTheDocument();
    expect(screen.getByText('Ganga Aarti')).toBeInTheDocument();
  });
});
