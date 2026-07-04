import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingScreen from './OnboardingScreen.jsx';
import { sanitizeName, NAME_MAX_LENGTH } from '../utils/sanitize.js';

describe('sanitizeName', () => {
  it('strips control characters and angle brackets that could break out of an AI prompt', () => {
    expect(sanitizeName('Priya\x00\x1F<script>')).toBe('Priyascript');
  });

  it('caps length so a traveler cannot balloon every AI prompt with a huge name', () => {
    const long = 'a'.repeat(NAME_MAX_LENGTH + 50);
    expect(sanitizeName(long)).toHaveLength(NAME_MAX_LENGTH);
  });

  it('leaves an ordinary name untouched', () => {
    expect(sanitizeName('Priya Sharma')).toBe('Priya Sharma');
  });
});

describe('OnboardingScreen', () => {
  it('walks a user through all three steps and calls onComplete with their profile', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OnboardingScreen onComplete={onComplete} />);

    // Step 1: name — Continue is disabled until something is typed.
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Priya');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: mood — pick one, then continue. (findBy* because the step
    // transition is animated, so the next step's controls mount asynchronously.)
    await user.click(await screen.findByRole('radio', { name: /hungry for adventure/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: interests — select two, then finish.
    await user.click(await screen.findByRole('button', { name: /nature & wildlife/i }));
    await user.click(screen.getByRole('button', { name: /royal heritage/i }));
    await user.click(screen.getByRole('button', { name: /discover my cultural destiny/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({
      name: 'Priya',
      mood: 'adventurous',
      interests: expect.arrayContaining(['nature', 'royal']),
    });
  });

  it('does not let the traveler finish without selecting at least one interest', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OnboardingScreen onComplete={onComplete} />);

    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Traveler');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('radio', { name: /romantic & dreamy/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByRole('button', { name: /discover my cultural destiny/i })).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
