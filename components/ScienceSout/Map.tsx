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
    switch(dataType) {
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
    <div className="border rounded-lg overflow-hidden shadow-md">
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
            <div className="p-2 max-w-xs">
              <h3 className="font-bold">{selectedPoint.dataType.charAt(0).toUpperCase() + selectedPoint.dataType.slice(1)}</h3>
              <p><strong>Value:</strong> {selectedPoint.value}</p>
              {selectedPoint.notes && <p><strong>Notes:</strong> {selectedPoint.notes}</p>}
              <p className="text-xs text-gray-500">
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