// This code should be deployed as a Google Cloud Function named "processEnvironmentalData"
/**
 * Google Cloud Function to process environmental data submissions
 * - Validates and enriches incoming data
 * - Performs analysis based on data type
 * - Can trigger notifications if thresholds are exceeded
 */
import { Datastore } from '@google-cloud/datastore';
import { PubSub } from '@google-cloud/pubsub';
import axios from 'axios';

const datastore = new Datastore();
const pubsub = new PubSub();

// Types
interface Location {
  latitude: number;
  longitude: number;
}

interface LocationDetails {
  formattedAddress: string;
  locality: string | null;
  adminArea: string | null;
  country: string | null;
}

interface EnvironmentalData {
  dataType: string;
  value: string;
  recordId?: string;
  location: Location;
  locationDetails?: LocationDetails;
  timestamp?: string;
}

interface Analysis {
  normalizedValue: number;
  category: string;
  exceededThreshold: boolean;
  recommendation?: string;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface Request {
  body: string | {
    dataType: string;
    value: string;
    recordId?: string;
    location: Location;
  };
}

interface Response {
  status: (code: number) => Response;
  send: (body: unknown) => void;
}

/**
 * Main function to process environmental data
 * @param {Request} req The Cloud Functions event
 * @param {Response} res The Cloud Functions response
 */
export const processEnvironmentalData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract data from the request
    const data: EnvironmentalData = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : req.body as EnvironmentalData;
    
    console.log('Processing data:', data);
    
    // Validate the data
    if (!data.dataType || !data.value || !data.location) {
      res.status(400).send('Missing required data fields');
      return;
    }
    
    // Enrich data with location information
    const enrichedData = await enrichDataWithLocation(data);
    
    // Analyze data based on type
    const analysis = analyzeData(enrichedData);
    
    // Store the processed data in Datastore
    await storeProcessedData(enrichedData, analysis);
    
    // Check for alert conditions and publish to PubSub if needed
    await checkAndPublishAlerts(enrichedData, analysis);
    
    // Return success response
    res.status(200).send({
      success: true,
      message: 'Data processed successfully',
      analysis: analysis
    });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Error processing environmental data');
  }
};

/**
 * Enrich data with additional location information
 * @param {EnvironmentalData} data The original data object
 * @returns {Promise<EnvironmentalData>} Data enriched with location details
 */
async function enrichDataWithLocation(data: EnvironmentalData): Promise<EnvironmentalData> {
  const enrichedData: EnvironmentalData = { ...data };
  
  try {
    // Add timestamp if not present
    if (!enrichedData.timestamp) {
      enrichedData.timestamp = new Date().toISOString();
    }
    
    // Use Google Maps Geocoding API to get location name
    const { latitude, longitude } = data.location;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    // google map api 
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Skipping location enrichment.');
      return enrichedData;
    }
    
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    const response = await axios.get(geocodingUrl);
    
    if (response.data.results && response.data.results.length > 0) {
      // Extract location components
      const addressComponents = response.data.results[0].address_components as AddressComponent[];
      
      // Extract locality, administrative area, and country
      enrichedData.locationDetails = {
        formattedAddress: response.data.results[0].formatted_address,
        locality: findAddressComponent(addressComponents, 'locality'),
        adminArea: findAddressComponent(addressComponents, 'administrative_area_level_1'),
        country: findAddressComponent(addressComponents, 'country')
      };
    }
  } catch (error) {
    console.error('Error enriching location data:', error);
    // Continue with original data if enrichment fails
  }
  
  return enrichedData;
}

/**
 * Find specific address component from Google Maps API results
 * @param {AddressComponent[]} components The address components array
 * @param {string} type The component type to find
 * @returns {string|null} The component name or null if not found
 */
function findAddressComponent(components: AddressComponent[], type: string): string | null {
  const component = components.find(comp => comp.types.includes(type));
  return component ? component.long_name : null;
}

/**
 * Analyze data based on its type
 * @param {EnvironmentalData} data The environmental data
 * @returns {Analysis} Analysis results
 */
function analyzeData(data: EnvironmentalData): Analysis {
  const numericValue = parseFloat(data.value);
  const analysis: Analysis = {
    normalizedValue: numericValue,
    category: 'normal',
    exceededThreshold: false
  };
  
  // Perform analysis based on data type
  switch (data.dataType.toLowerCase()) {
    case 'air_quality':
      // AQI scale
      if (numericValue <= 50) {
        analysis.category = 'good';
      } else if (numericValue <= 100) {
        analysis.category = 'moderate';
      } else if (numericValue <= 150) {
        analysis.category = 'unhealthy_sensitive';
        analysis.exceededThreshold = true;
        analysis.recommendation = 'Limit outdoor activities for sensitive groups';
      } else {
        analysis.category = 'unhealthy';
        analysis.exceededThreshold = true;
        analysis.recommendation = 'Avoid outdoor activities';
      }
      break;
      
    case 'temperature':
      // Temperature analysis (assuming Celsius)
      if (numericValue < 0) {
        analysis.category = 'freezing';
      } else if (numericValue < 15) {
        analysis.category = 'cold';
      } else if (numericValue < 25) {
        analysis.category = 'comfortable';
      } else if (numericValue < 35) {
        analysis.category = 'hot';
      } else {
        analysis.category = 'extreme_heat';
        analysis.exceededThreshold = true;
        analysis.recommendation = 'Take precautions against heat stress';
      }
      break;
      
    case 'water_quality':
      // Generic water quality scale (0-100)
      if (numericValue >= 90) {
        analysis.category = 'excellent';
      } else if (numericValue >= 70) {
        analysis.category = 'good';
      } else if (numericValue >= 50) {
        analysis.category = 'fair';
      } else {
        analysis.category = 'poor';
        analysis.exceededThreshold = true;
        analysis.recommendation = 'Water treatment recommended';
      }
      break;
      
    default:
      // Generic numeric scale
      if (numericValue < 25) {
        analysis.category = 'low';
      } else if (numericValue < 75) {
        analysis.category = 'medium';
      } else {
        analysis.category = 'high';
      }
  }
  
  return analysis;
}

/**
 * Store processed data and analysis in Datastore
 * @param {EnvironmentalData} data The environmental data
 * @param {Analysis} analysis The analysis results
 */
async function storeProcessedData(data: EnvironmentalData, analysis: Analysis): Promise<void> {
  try {
    // Create a key for the new entity
    const kind = 'EnvironmentalDataProcessed';
    const key = datastore.key([kind]);
    
    // Prepare entity data
    const entityData = {
      originalRecordId: data.recordId || 'unknown',
      dataType: data.dataType,
      value: data.value,
      numericValue: parseFloat(data.value),
      location: data.location,
      locationDetails: data.locationDetails || null,
      timestamp: data.timestamp || new Date().toISOString(),
      analysis: analysis,
      processed: new Date().toISOString()
    };
    
    // Save the entity
    await datastore.save({
      key: key,
      data: entityData
    });
    
    console.log(`Data stored with analysis in Datastore`);
  } catch (error) {
    console.error('Error storing processed data:', error);
    throw error;
  }
}

/**
 * Check if data exceeds thresholds and publish alerts if needed
 * @param {EnvironmentalData} data The environmental data
 * @param {Analysis} analysis The analysis results
 */
async function checkAndPublishAlerts(data: EnvironmentalData, analysis: Analysis): Promise<void> {
  // Only publish alerts if threshold is exceeded
  if (!analysis.exceededThreshold) {
    return;
  }
  
  try {
    const topicName = 'environmental-alerts';
    const alertData = {
      dataType: data.dataType,
      value: data.value,
      location: data.location,
      locationDetails: data.locationDetails,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
    
    // Publish to PubSub
    const dataBuffer = Buffer.from(JSON.stringify(alertData));
    const messageId = await pubsub.topic(topicName).publish(dataBuffer);
    
    console.log(`Alert published to ${topicName}, ID: ${messageId}`);
  } catch (error) {
    console.error('Error publishing alert:', error);
    // Don't fail the overall process if alert publishing fails
  }
}