import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { EnvironmentalData } from '@/types/index';
import jsPDF from 'jspdf';
import { getPlaceName } from '@/utils/geocoding';

interface MapProps {
  dataPoints: EnvironmentalData[];
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

const Map: React.FC<MapProps> = ({ dataPoints }) => {
  const [selectedPoint, setSelectedPoint] = useState<EnvironmentalData | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
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



  

  const generatePDF = async () => {
    if (!selectedPoint) return;
    
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
  
      // Set report title based on data type
     
      doc.text(`${selectedPoint.dataType} Data Report`, 20, 20);
  
      // Get place name asynchronously
      const locationInfo = await getPlaceName(
        selectedPoint.latitude,
        selectedPoint.longitude,
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
      );
  
      doc.setFontSize(12);
      //doc.text('Hello World',20,20);
      doc.text(`Location: ${locationInfo}`, 20, 30);
      doc.text(`Coordinates: Lat ${selectedPoint.latitude.toFixed(6)}, Lng ${selectedPoint.longitude.toFixed(6)}`, 20, 40);
      doc.text(`Data Type: ${selectedPoint.dataType}`, 20, 50);
      doc.text(`Value: ${selectedPoint.value}`, 20, 60);
  
      if (selectedPoint.notes) {
        doc.text(`Notes: ${selectedPoint.notes}`, 20, 70);
      }
  
     doc.text(`Date: ${new Date(selectedPoint.created).toLocaleDateString()}`, 20, 80);
  
      const fileName = `${selectedPoint.dataType}-report-${new Date().getTime()}.pdf`;
      doc.save(fileName);
      //alert(`PDF generated: ${fileName}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={6}
      >
       
       {dataPoints?.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.latitude, lng: point.longitude }}
            icon={getMarkerIcon(point.dataType)}
            onClick={() => {
              if (selectedPoint?.id !== point.id) {
                setSelectedPoint(point);
              }
            }}
          />
        ))}

        {selectedPoint && (
          <InfoWindow
            position={{ lat: selectedPoint.latitude, lng: selectedPoint.longitude }}
            onCloseClick={() => setSelectedPoint(null)}
          >
            <div className="bg-white dark:bg-gray-800 p-2 max-w-xs text-gray-900 dark:text-gray-100">
              <h3 className="font-bold">{selectedPoint.dataType.charAt(0).toUpperCase() + selectedPoint.dataType.slice(1)}</h3>
              <p><strong>Value:</strong> {selectedPoint.value}</p>
              {selectedPoint.notes && <p><strong>Notes:</strong> {selectedPoint.notes}</p>}
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                Submitted on {new Date(selectedPoint.created).toLocaleDateString()}
              </p>
              <button
                onClick={generatePDF}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Download PDF
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;
