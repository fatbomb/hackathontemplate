import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // strip data:*/*;base64,
      } else {
        reject("Failed to convert blob to base64");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string, type = "audio/mpeg"): Blob {
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type });
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
