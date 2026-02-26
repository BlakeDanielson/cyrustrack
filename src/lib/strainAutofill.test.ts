import assert from 'node:assert/strict';
import test from 'node:test';
import { ConsumptionSession } from '@/types/consumption';
import { getLatestStrainAutofill } from '@/lib/strainAutofill';

function createSession(overrides: Partial<ConsumptionSession>): ConsumptionSession {
  return {
    id: overrides.id || 'session-id',
    date: overrides.date || '2026-01-01',
    time: overrides.time || '12:00',
    location: overrides.location || 'Home',
    who_with: overrides.who_with || '',
    vessel_category: overrides.vessel_category || 'Pipe',
    vessel: overrides.vessel || 'Default',
    accessory_used: overrides.accessory_used || 'N/A',
    my_vessel: overrides.my_vessel ?? true,
    my_substance: overrides.my_substance ?? true,
    strain_name: overrides.strain_name || 'Unknown',
    strain_type: overrides.strain_type,
    thc_percentage: overrides.thc_percentage,
    purchased_legally: overrides.purchased_legally ?? true,
    state_purchased: overrides.state_purchased,
    tobacco: overrides.tobacco,
    kief: overrides.kief ?? false,
    concentrate: overrides.concentrate ?? false,
    lavender: overrides.lavender ?? false,
    comments: overrides.comments,
    quantity: overrides.quantity || { amount: 1, unit: 'bowl size', type: 'size_category' },
    images: overrides.images,
    created_at: overrides.created_at || '2026-01-01T12:00:00.000Z',
    updated_at: overrides.updated_at || '2026-01-01T12:00:00.000Z',
    latitude: overrides.latitude,
    longitude: overrides.longitude,
    location_ref: overrides.location_ref,
    quantity_legacy: overrides.quantity_legacy,
  };
}

test('returns null when no matching strain exists', () => {
  const sessions = [createSession({ strain_name: 'OG Kush' })];
  const result = getLatestStrainAutofill('Blue Dream', sessions);
  assert.equal(result, null);
});

test('matches strain name case-insensitively with trimming', () => {
  const sessions = [
    createSession({
      strain_name: 'Blue Dream',
      strain_type: 'Hybrid',
      thc_percentage: 23.5,
      purchased_legally: true,
      state_purchased: 'CA',
    }),
  ];

  const result = getLatestStrainAutofill('  blue dream  ', sessions);
  assert.deepEqual(result, {
    strain_type: 'Hybrid',
    thc_percentage: 23.5,
    purchased_legally: true,
    state_purchased: 'CA',
  });
});

test('returns metadata from the most recent matching session', () => {
  const sessions = [
    createSession({
      id: 'older',
      strain_name: 'Gelato',
      strain_type: 'Indica',
      thc_percentage: 18.2,
      purchased_legally: true,
      state_purchased: 'CO',
      created_at: '2026-01-15T10:00:00.000Z',
      updated_at: '2026-01-15T10:00:00.000Z',
    }),
    createSession({
      id: 'newest',
      strain_name: 'gelato',
      strain_type: 'Hybrid',
      thc_percentage: 25.1,
      purchased_legally: false,
      state_purchased: '',
      created_at: '2026-02-10T10:00:00.000Z',
      updated_at: '2026-02-10T10:00:00.000Z',
    }),
    createSession({
      id: 'other-strain',
      strain_name: 'Runtz',
      strain_type: 'Hybrid',
      thc_percentage: 20.0,
      purchased_legally: true,
      state_purchased: 'WA',
      created_at: '2026-02-12T10:00:00.000Z',
      updated_at: '2026-02-12T10:00:00.000Z',
    }),
  ];

  const result = getLatestStrainAutofill('Gelato', sessions);
  assert.deepEqual(result, {
    strain_type: 'Hybrid',
    thc_percentage: 25.1,
    purchased_legally: false,
    state_purchased: '',
  });
});

test('scopes autofill metadata to matching vessel when provided', () => {
  const sessions = [
    createSession({
      id: 'pipe-session',
      strain_name: 'Blue Dream',
      vessel: 'Sherlock',
      strain_type: 'Sativa',
      thc_percentage: 22.1,
      purchased_legally: true,
      state_purchased: 'OR',
      created_at: '2026-02-02T10:00:00.000Z',
      updated_at: '2026-02-02T10:00:00.000Z',
    }),
    createSession({
      id: 'bong-session',
      strain_name: 'Blue Dream',
      vessel: 'Beaker',
      strain_type: 'Hybrid',
      thc_percentage: 27.3,
      purchased_legally: false,
      state_purchased: '',
      created_at: '2026-02-10T10:00:00.000Z',
      updated_at: '2026-02-10T10:00:00.000Z',
    }),
  ];

  const result = getLatestStrainAutofill('Blue Dream', sessions, 'Sherlock');
  assert.deepEqual(result, {
    strain_type: 'Sativa',
    thc_percentage: 22.1,
    purchased_legally: true,
    state_purchased: 'OR',
  });
});

test('returns null when strain exists but not for selected vessel', () => {
  const sessions = [
    createSession({
      strain_name: 'Runtz',
      vessel: 'Bubbler',
      strain_type: 'Hybrid',
    }),
  ];

  const result = getLatestStrainAutofill('Runtz', sessions, 'Joint');
  assert.equal(result, null);
});
