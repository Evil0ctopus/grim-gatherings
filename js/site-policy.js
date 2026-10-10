export const BUILD_RELEASE_ONLY = false;
export const DEVELOPMENT_URL = 'https://evil0ctopus.github.io/grim-gatherings/';

export function isReleaseSite(hostname = globalThis.location?.hostname || '') {
  return BUILD_RELEASE_ONLY || ['grimgatherings.com', 'www.grimgatherings.com'].includes(hostname.toLowerCase());
}

export const RELEASE_ONLY = isReleaseSite();

const RELEASE_FAMILIES = ['lockdown', 'woodland-hollow', 'lago-cabin', 'ravenmoor', 'blackwater-scalable', 'briar-playtest'];
const DEVELOPMENT_FAMILIES = ['sample', 'mercy-hollow', 'blackthorn-farm', 'briar-house', 'blackwater-row'];

export function isPlayableStoryFamily(family, releaseOnly = RELEASE_ONLY) {
  return RELEASE_FAMILIES.includes(family) || (!releaseOnly && DEVELOPMENT_FAMILIES.includes(family));
}
