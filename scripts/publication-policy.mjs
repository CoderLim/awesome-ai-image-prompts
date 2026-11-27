import { hasXPermission } from './x-source.mjs';

export function eligible(r) {
  return Boolean((r.rights?.prompt === 'CC-BY-4.0' &&
    r.rights?.media === 'CC-BY-4.0' &&
    typeof r.rights.evidence === 'string' && r.rights.evidence.trim()) ||
    hasXPermission(r));
}

export function withdrawn(r) {
  return ['revoked','withdrawn','denied','prohibited'].some(status=>[r.rights?.prompt,r.rights?.media].includes(status));
}

