import { useCallback, useRef, useState } from 'react';

/**
 * Shared state machine for any "click a button, call a live AI function,
 * show the result or a genuine error" interaction. Extracted because
 * DestinationDetail previously repeated this exact { data, error, loading }
 * triplet by hand for story/gems/itinerary/insight — four copies of the same
 * bug surface. Centralizing it here means:
 *
 *  - every AI action gets re-entrancy protection for free (a second click
 *    while a request is in flight is ignored, not queued as a duplicate
 *    network call — this was a real bug in the previous version's
 *    "Generate another" button).
 *  - the {ok, data|error} contract from aiService is handled in exactly one
 *    place instead of four near-identical if/else blocks.
 *
 * @param {(...args: any[]) => Promise<{ok: boolean, error?: string} & Record<string, any>>} action
 * @param {string} dataKey - which property of a successful result holds the payload (e.g. "story", "gems")
 */
export function useAsyncAI(action, dataKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args) => {
      if (inFlight.current) return; // ignore re-entrant clicks while a request is already running
      inFlight.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        if (result.ok) {
          setData(result[dataKey]);
        } else {
          setData(null);
          setError(result.error);
        }
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    },
    [action, dataKey]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, error, loading, run, reset };
}

/**
 * Same idea, but keyed by an arbitrary string (used for per-heritage-item
 * cultural insights, where each card/pill needs its own independent
 * data/error/loading slot rather than one shared slot).
 */
export function useKeyedAsyncAI(action, dataKey) {
  const [dataByKey, setDataByKey] = useState({});
  const [errorByKey, setErrorByKey] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const inFlightKeys = useRef(new Set());

  const run = useCallback(
    async (key, ...args) => {
      if (inFlightKeys.current.has(key)) return;
      inFlightKeys.current.add(key);
      setLoadingKey(key);
      setErrorByKey((prev) => ({ ...prev, [key]: null }));
      try {
        const result = await action(key, ...args);
        if (result.ok) {
          setDataByKey((prev) => ({ ...prev, [key]: result[dataKey] }));
        } else {
          setErrorByKey((prev) => ({ ...prev, [key]: result.error }));
        }
      } finally {
        inFlightKeys.current.delete(key);
        setLoadingKey((current) => (current === key ? null : current));
      }
    },
    [action, dataKey]
  );

  return { dataByKey, errorByKey, loadingKey, run };
}
