// The traveler's name is echoed verbatim into every AI prompt this app sends
// (generateCulturalStory, generateConnectionTip, etc. — see aiService.js).
// Capping its length and stripping control/formatting characters bounds how
// much of the prompt a traveler can hijack. This is not a substitute for
// treating all model output as untrusted — it closes off the cheapest
// prompt-injection/DoS vector (pasting thousands of characters, or
// characters intended to break out of the prompt template).
export const NAME_MAX_LENGTH = 40;

export function sanitizeName(value) {
  // eslint-disable-next-line no-control-regex -- intentionally stripping control chars
  return value.replace(/[\x00-\x1F\x7F<>]/g, '').slice(0, NAME_MAX_LENGTH);
}
