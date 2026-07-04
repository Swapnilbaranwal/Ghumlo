import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary.jsx';

function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error('boom');
  return <div>Rendered fine</div>;
}

describe('ErrorBoundary', () => {
  // React logs uncaught errors to the console even when a boundary handles
  // them; silence that expected noise so it doesn't look like a test failure.
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Rendered fine')).toBeInTheDocument();
  });

  it('shows a recoverable fallback instead of crashing the whole app when a child throws', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i);
    expect(screen.queryByText('Rendered fine')).not.toBeInTheDocument();

    // "Try again" resets the boundary's own state without a full page reload.
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByRole('button', { name: /reload the page/i })).toBeInTheDocument();
  });
});
