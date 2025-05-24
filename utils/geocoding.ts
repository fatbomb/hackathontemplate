// utils/geocoding.ts
export async function getPlaceName(lat: number, lng: number, apiKey: string): Promise<string> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        // Try to get locality first, then fall back to other components
        const address = data.results[0];
        const components = address.address_components;
        
        const locality = components.find((c: any) => c.types.includes('locality'));
        if (locality) return locality.long_name;
        
        const adminArea = components.find((c: any) => c.types.includes('administrative_area_level_1'));
        if (adminArea) return adminArea.long_name;
        
        return address.formatted_address.split(',')[0];
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    return 'Location';
  }
 