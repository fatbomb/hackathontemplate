import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GeocodeResult {
  formatted_address: string;
  // Add other properties as needed
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function getLocationName(lat: number, lng: number, callback: (name: string) => void): void {
  if (typeof google === 'undefined') {
    callback("Location data not available");
    return;
  }
  
  const geocoder = new google.maps.Geocoder();
  const latlng = { lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) };
  
  geocoder.geocode({ location: latlng }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
    if (status === "OK" && results && results[0]) {
      callback(results[0].formatted_address);
    } else {
      callback("Unknown location");
    }
  });
}
