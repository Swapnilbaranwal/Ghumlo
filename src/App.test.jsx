import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

// App.jsx renders DestinationDetail once a destination is picked, which
// calls the real aiService on mount to show the connectivity badge — mock it
// so this integration test stays a fast, network-free unit test.
vi.mock('./services/aiService.js', () => ({
  generateCulturalStory: vi.fn(),
  generateHiddenGems: vi.fn(),
  generateItinerary: vi.fn(),
  generateCulturalInsight: vi.fn(),
  generateConnectionTip: vi.fn(),
  checkAIHealth: vi.fn().mockResolvedValue(true),
}));

describe('App', () => {
  it('walks the full screen state machine: onboarding -> matching -> destination -> back -> back', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Onboarding
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Priya');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('radio', { name: /history buff/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('button', { name: /ancient temples/i }));
    await user.click(screen.getByRole('button', { name: /discover my cultural destiny/i }));

    // Matching -> pick the first destination card
    const matchingHeading = await screen.findByText(/your cultural matches/i, {}, { timeout: 3000 });
    expect(matchingHeading).toBeInTheDocument();
    await user.click(screen.getAllByRole('button')[0]);

    // Destination detail
    expect(await screen.findByRole('tab', { name: /story/i })).toBeInTheDocument();

    // Back -> matching again (re-runs the ~1.2s matching animation, hence the longer timeout)
    await user.click(screen.getByRole('button', { name: /back to matches/i }));
    expect(await screen.findByText(/your cultural matches/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
