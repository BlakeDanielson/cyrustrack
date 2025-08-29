/**
 * Geocoding service to convert location strings to coordinates
 * Supports multiple providers with fallback options
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressComponents {
  city?: string;
  state?: string;
  country?: string;
  county?: string;
  postal_code?: string;
}

export interface GeocodeResult {
  coordinates: Coordinates | null;
  formatted_address?: string;
  address_components?: AddressComponents;
  error?: string;
}

/**
 * Geocode using Mapbox API (requires MAPBOX_ACCESS_TOKEN)
 */
async function geocodeWithMapbox(location: string): Promise<GeocodeResult> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return { coordinates: null, error: 'Mapbox token not configured' };
  }

  try {
    const encodedLocation = encodeURIComponent(location);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${token}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;
      
      // Extract address components from Mapbox context
      const addressComponents: AddressComponents = {};
      
      if (feature.context) {
        for (const contextItem of feature.context) {
          const id = contextItem.id || '';
          if (id.startsWith('place.')) {
            addressComponents.city = contextItem.text;
          } else if (id.startsWith('region.')) {
            addressComponents.state = contextItem.text;
          } else if (id.startsWith('country.')) {
            addressComponents.country = contextItem.text;
          } else if (id.startsWith('postcode.')) {
            addressComponents.postal_code = contextItem.text;
          }
        }
      }
      
      // If no city found in context, try to extract from place name
      if (!addressComponents.city && feature.place_type?.includes('place')) {
        addressComponents.city = feature.text;
      }
      
      return {
        coordinates: { latitude, longitude },
        formatted_address: feature.place_name,
        address_components: addressComponents
      };
    }

    return { coordinates: null, error: 'No results found' };
  } catch (error) {
    return { 
      coordinates: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Geocode using OpenStreetMap Nominatim (free, no API key required)
 */
async function geocodeWithNominatim(location: string): Promise<GeocodeResult> {
  try {
    const encodedLocation = encodeURIComponent(location);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`,
      {
        headers: {
          'User-Agent': 'Cannabis-Tracker-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      
      // Extract address components from Nominatim result
      const addressComponents: AddressComponents = {};
      if (result.address) {
        addressComponents.city = result.address.city || result.address.town || result.address.village;
        addressComponents.state = result.address.state;
        addressComponents.country = result.address.country;
        addressComponents.postal_code = result.address.postcode;
      }
      
      return {
        coordinates: { 
          latitude: parseFloat(result.lat), 
          longitude: parseFloat(result.lon) 
        },
        formatted_address: result.display_name,
        address_components: addressComponents
      };
    }

    return { coordinates: null, error: 'No results found' };
  } catch (error) {
    return { 
      coordinates: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Main geocoding function with fallback providers
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (!location || location.trim() === '') {
    return { coordinates: null, error: 'Empty location string' };
  }

  // Clean up location string
  const cleanLocation = location.trim();
  
  // Try Mapbox first (if configured)
  const mapboxResult = await geocodeWithMapbox(cleanLocation);
  if (mapboxResult.coordinates) {
    return mapboxResult;
  }

  // Fallback to Nominatim (free service)
  console.log('Falling back to Nominatim for:', cleanLocation);
  const nominatimResult = await geocodeWithNominatim(cleanLocation);
  
  if (nominatimResult.coordinates) {
    return nominatimResult;
  }

  // Return combined error message
  return {
    coordinates: null,
    error: `Failed to geocode "${cleanLocation}": ${mapboxResult.error || 'Mapbox failed'}, ${nominatimResult.error || 'Nominatim failed'}`
  };
}

/**
 * Batch geocoding with rate limiting
 */
export async function geocodeLocationsBatch(
  locations: string[], 
  delayMs: number = 1000
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    console.log(`Geocoding ${i + 1}/${locations.length}: ${location}`);
    
    const result = await geocodeLocation(location);
    results.set(location, result);
    
    // Rate limiting - wait between requests
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Cache-aware geocoding for common locations
 */
const geocodeCache = new Map<string, GeocodeResult>();

export async function geocodeLocationCached(location: string): Promise<GeocodeResult> {
  const cacheKey = location.toLowerCase().trim();
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }
  
  const result = await geocodeLocation(location);
  geocodeCache.set(cacheKey, result);
  
  return result;
}

/**
 * Reverse geocoding with Mapbox API (coordinates to address)
 */
async function reverseGeocodeWithMapbox(coordinates: Coordinates): Promise<GeocodeResult> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return { coordinates, error: 'Mapbox token not configured' };
  }

  try {
    const { longitude, latitude } = coordinates;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      
      // Extract address components from Mapbox context
      const addressComponents: AddressComponents = {};
      
      if (feature.context) {
        for (const contextItem of feature.context) {
          const id = contextItem.id || '';
          if (id.startsWith('place.')) {
            addressComponents.city = contextItem.text;
          } else if (id.startsWith('region.')) {
            addressComponents.state = contextItem.text;
          } else if (id.startsWith('country.')) {
            addressComponents.country = contextItem.text;
          } else if (id.startsWith('postcode.')) {
            addressComponents.postal_code = contextItem.text;
          }
        }
      }
      
      return {
        coordinates,
        formatted_address: feature.place_name,
        address_components: addressComponents
      };
    }

    return { coordinates, error: 'No results found' };
  } catch (error) {
    return { 
      coordinates, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Reverse geocoding with Nominatim (coordinates to address)
 */
async function reverseGeocodeWithNominatim(coordinates: Coordinates): Promise<GeocodeResult> {
  try {
    const { latitude, longitude } = coordinates;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'Cannabis-Tracker-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      // Extract address components from Nominatim result
      const addressComponents: AddressComponents = {};
      if (data.address) {
        addressComponents.city = data.address.city || data.address.town || data.address.village;
        addressComponents.state = data.address.state;
        addressComponents.country = data.address.country;
        addressComponents.postal_code = data.address.postcode;
      }
      
      return {
        coordinates,
        formatted_address: data.display_name,
        address_components: addressComponents
      };
    }

    return { coordinates, error: 'No results found' };
  } catch (error) {
    return { 
      coordinates, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Main reverse geocoding function (coordinates to address)
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
  if (!coordinates || 
      coordinates.latitude < -90 || coordinates.latitude > 90 ||
      coordinates.longitude < -180 || coordinates.longitude > 180) {
    return { coordinates, error: 'Invalid coordinates' };
  }
  
  // Try Mapbox first (if configured)
  const mapboxResult = await reverseGeocodeWithMapbox(coordinates);
  if (mapboxResult.formatted_address && !mapboxResult.error) {
    return mapboxResult;
  }

  // Fallback to Nominatim (free service)
  console.log('Falling back to Nominatim for reverse geocoding:', coordinates);
  const nominatimResult = await reverseGeocodeWithNominatim(coordinates);
  
  if (nominatimResult.formatted_address && !nominatimResult.error) {
    return nominatimResult;
  }

  // Return combined error message
  return {
    coordinates,
    error: `Failed to reverse geocode coordinates: ${mapboxResult.error || 'Mapbox failed'}, ${nominatimResult.error || 'Nominatim failed'}`
  };
}

/**
 * Cache-aware reverse geocoding
 */
const reverseGeocodeCache = new Map<string, GeocodeResult>();

export async function reverseGeocodeCached(coordinates: Coordinates): Promise<GeocodeResult> {
  const cacheKey = `${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`;
  
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey)!;
  }
  
  const result = await reverseGeocode(coordinates);
  reverseGeocodeCache.set(cacheKey, result);
  
  return result;
}

