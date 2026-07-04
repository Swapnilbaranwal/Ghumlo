import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MatchingScreen from './MatchingScreen.jsx';
import { INDIAN_DESTINATIONS } from '../data/indiaHeritage.js';

describe('MatchingScreen', () => {
  it('shows a loading state, then every destination ranked, and lets the traveler pick one', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const profile = { name: 'Priya', mood: 'spiritual', interests: ['temples', 'spiritual'] };

    render(<MatchingScreen profile={profile} onSelect={onSelect} />);

    expect(screen.getByText(/matching your cultural profile/i)).toBeInTheDocument();

    const heading = await screen.findByText(/your cultural matches/i, {}, { timeout: 3000 });
    expect(heading).toBeInTheDocument();

    // Every destination should appear exactly once, ranked (not filtered out).
    for (const dest of INDIAN_DESTINATIONS) {
      expect(screen.getByText(dest.name)).toBeInTheDocument();
    }

    await user.click(screen.getAllByRole('button')[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(INDIAN_DESTINATIONS.map((d) => d.id)).toContain(onSelect.mock.calls[0][0].id);
  });
});
