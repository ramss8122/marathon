/**
 * Helper to extract and format only the city name (e.g. "Chennai", "Coimbatore")
 * from registrations, event IDs, event titles, or city records.
 */
export function getCityDisplayName(record, cities = []) {
  if (!record) return 'Chennai';

  if (typeof record === 'string') {
    const raw = record.trim();
    if (raw && !raw.toLowerCase().includes('marathon') && !raw.toLowerCase().includes('sunrise') && !raw.toLowerCase().includes('run') && !raw.toLowerCase().includes('stride')) {
      return raw;
    }
    const match = raw.match(/(chennai|coimbatore|bengaluru|bangalore|kochi|cochin|hyderabad|mumbai|delhi)/i);
    if (match) {
      const name = match[1].toLowerCase();
      if (name === 'chennai') return 'Chennai';
      if (name === 'coimbatore') return 'Coimbatore';
      if (name === 'bengaluru' || name === 'bangalore') return 'Bengaluru';
      if (name === 'kochi' || name === 'cochin') return 'Kochi';
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    const firstWord = raw.split(/[\s-_]+/)[0];
    return firstWord ? (firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()) : 'Chennai';
  }

  // 1. If record has city field that is clean
  if (record.city && typeof record.city === 'string') {
    const trimmed = record.city.trim();
    if (trimmed && !trimmed.toLowerCase().includes('marathon') && !trimmed.toLowerCase().includes('sunrise') && !trimmed.toLowerCase().includes('run') && !trimmed.toLowerCase().includes('stride')) {
      return trimmed;
    }
  }

  const textToMatch = [record.cityName, record.selectedEvent, record.eventName, record.city].filter(Boolean).join(' ').toLowerCase();

  // 2. Check against active cities array
  if (Array.isArray(cities) && cities.length > 0) {
    const matchedCity = cities.find(c => {
      const cName = (c.name || '').toLowerCase();
      const cSlug = (c.slug || '').toLowerCase();
      return (cName && textToMatch.includes(cName)) || (cSlug && textToMatch.includes(cSlug));
    });
    if (matchedCity && matchedCity.name) {
      return matchedCity.name;
    }
  }

  // 3. Check known city names
  const knownMatch = textToMatch.match(/(chennai|coimbatore|bengaluru|bangalore|kochi|cochin|hyderabad|mumbai|delhi)/i);
  if (knownMatch) {
    const name = knownMatch[1].toLowerCase();
    if (name === 'chennai') return 'Chennai';
    if (name === 'coimbatore') return 'Coimbatore';
    if (name === 'bengaluru' || name === 'bangalore') return 'Bengaluru';
    if (name === 'kochi' || name === 'cochin') return 'Kochi';
    return knownMatch[1].charAt(0).toUpperCase() + knownMatch[1].slice(1);
  }

  // 4. Fallback to first word
  const fallbackStr = record.eventName || record.selectedEvent || record.city || 'Chennai';
  const firstWord = String(fallbackStr).split(/[\s-_]+/)[0];
  return firstWord ? (firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()) : 'Chennai';
}
