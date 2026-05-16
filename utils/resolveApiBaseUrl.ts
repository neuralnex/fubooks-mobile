import Constants from 'expo-constants';

/** Must match `app.json` → `expo.extra.apiUrl` when deploying to Render. */
const PRODUCTION_API = 'https://bookmate-n9wh.onrender.com';

function stripTrailingSlashes(u: string): string {
  return u.replace(/\/+$/, '');
}

function extraApiUrl(manifest: unknown): string {
  if (!manifest || typeof manifest !== 'object') return '';
  const extra = (manifest as { extra?: { apiUrl?: unknown } }).extra;
  const u = extra?.apiUrl;
  return typeof u === 'string' ? u.trim() : '';
}

/**
 * In release builds, `localhost` / `127.0.0.1` / emulator host point at the phone, not your PC —
 * the API URL must be public (e.g. Render). Replace mistaken baked-in dev URLs.
 */
function replaceUnusableHostForReleaseBuild(url: string): string {
  const trimmed = stripTrailingSlashes(url);
  if (__DEV__) {
    return trimmed;
  }
  /* eslint-disable-next-line no-useless-escape */
  const isLoopbackOrEmulatorHost =
    /^(https?:\/\/)(localhost|127\.0\.0\.1|10\.0\.2\.2)(\:\d+)?(\/|$)/i.test(trimmed);
  if (isLoopbackOrEmulatorHost) {
    return PRODUCTION_API;
  }
  return trimmed;
}

/**
 * Resolves the API origin. `EXPO_PUBLIC_API_URL` wins when inlined at bundle time.
 * Release APKs: never use localhost — see `replaceUnusableHostForReleaseBuild`.
 */
export function resolveApiBaseUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL != null
      ? String(process.env.EXPO_PUBLIC_API_URL).trim()
      : '';
  let url = fromEnv;

  if (!url) {
    const candidates = [
      extraApiUrl(Constants.expoConfig),
      extraApiUrl(Constants.manifest),
    ];
    const m2 = Constants.manifest2 as
      | { extra?: { expoClient?: { extra?: { apiUrl?: string } } } }
      | null
      | undefined;
    const nested = m2?.extra?.expoClient?.extra?.apiUrl;
    if (typeof nested === 'string' && nested.trim()) {
      candidates.push(nested.trim());
    }
    for (const c of candidates) {
      if (c) {
        url = c;
        break;
      }
    }
  }

  if (!url) {
    url = PRODUCTION_API;
  }

  return replaceUnusableHostForReleaseBuild(url);
}
