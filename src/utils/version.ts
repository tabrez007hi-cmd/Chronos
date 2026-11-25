export const APP_VERSION = '1.6.0';
export const APP_SHORT_VERSION = '1.6';
export const APP_RELEASE_NAME = 'Unified Store, Illustrated Cosmetics & Social Focus';

const LAST_SEEN_VERSION_KEY = 'chronos_last_seen_app_version';

export function loadLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch {
    return null;
  }
}

export function saveLastSeenVersion(version: string = APP_VERSION): void {
  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
  } catch {
    // ignore storage errors
  }
}

export function hasUnseenAppUpdate(): boolean {
  return loadLastSeenVersion() !== APP_VERSION;
}
