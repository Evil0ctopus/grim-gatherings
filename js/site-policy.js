export const BUILD_RELEASE_ONLY = false;
export const DEVELOPMENT_URL = 'https://evil0ctopus.github.io/grim-gatherings/';

export function isReleaseSite(hostname = globalThis.location?.hostname || '') {
  return BUILD_RELEASE_ONLY || ['grimgatherings.com', 'www.grimgatherings.com'].includes(hostname.toLowerCase());
}

export const RELEASE_ONLY = isReleaseSite();
