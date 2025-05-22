import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { EnvironmentalData } from '@/types/index';

interface MapProps {
  dataPoints: EnvironmentalData[];
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const Map: React.FC<MapProps> = ({ dataPoints }) => {
  const [selectedPoint, setSelectedPoint] = useState<EnvironmentalData | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_ || ''
  });

  const getMarkerIcon = (dataType: string): string => {
    switch (dataType) {
      case 'pollution':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'biodiversity':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'weather':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }
  };

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
      >
        {dataPoints?.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            icon={getMarkerIcon(point.dataType)}
            onClick={() => setSelectedPoint(point)}
          />
        ))}

        {selectedPoint && (
          <InfoWindow
            position={{ lat: selectedPoint.latitude, lng: selectedPoint.longitude }}
            onCloseClick={() => setSelectedPoint(null)}
          >
            <div className="bg-white dark:bg-gray-800 p-2 max-w-xs text-gray-900 dark:text-gray-100">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{selectedPoint.dataType.charAt(0).toUpperCase() + selectedPoint.dataType.slice(1)}</h3>
              <p className="text-gray-800 dark:text-gray-200"><strong>Value:</strong> {selectedPoint.value}</p>
              {selectedPoint.notes && <p className="text-gray-800 dark:text-gray-200"><strong>Notes:</strong> {selectedPoint.notes}</p>}
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Submitted on {new Date(selectedPoint.created).toLocaleDateString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;