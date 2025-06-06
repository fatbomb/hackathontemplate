import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { CloudFunctionsServiceClient } from '@google-cloud/functions';
import { CloudFunctionData } from '@/types/index';
import fs from 'fs';


export async function POST(request: NextRequest) {
  try {
    //const body = await request.json() as SubmitDataRequestBody;
    //const { dataType, value, notes, latitude, longitude } = body;

    const formData = await request.formData();

    const dataType = formData.get('dataType') as string;
    const value = formData.get('value') as string;
    const notes = formData.get('notes') as string | null;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const images = formData.getAll('images') as File[];

    const pbFormData = new FormData();
    pbFormData.append('dataType', dataType);
    pbFormData.append('value', value);
    if (notes) pbFormData.append('notes', notes);
    pbFormData.append('latitude', latitude.toString());
    pbFormData.append('longitude', longitude.toString());

    images.forEach((file) => {
      pbFormData.append('images', file);
    });
    

    // Validate inputs
    if (!dataType || !value || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate latitude and longitude ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { message: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    // Create record in PocketBase
    const record = await pb.collection('environmental_data').create(pbFormData);
    // const record = await pb.collection('environmental_data').create({
    //   dataType,
    //   value,
    //   notes: notes || '',
    //   latitude: parseFloat(latitude.toString()),
    //   longitude: parseFloat(longitude.toString()),
      
    //   created: new Date().toISOString(),
    // });

    // Trigger Google Cloud Function for further processing
    await triggerCloudFunction({
      dataType,
      value,
      location: { latitude, longitude },
      recordId: record.id
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error submitting data:', error);
    return NextResponse.json(
      { 
        message: 'Failed to submit data',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

async function triggerCloudFunction(data: CloudFunctionData): Promise<void> {
  try {
    // Check if we have credentials available
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GCP_SERVICE_ACCOUNT) {
      console.warn('No Google Cloud credentials found, skipping function trigger');
      return;
    }

    let credentials;
    
    // Try to load credentials from environment variable first
    if (process.env.GCP_SERVICE_ACCOUNT) {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    } else {
      console.warn('No valid Google Cloud credentials found');
      return;
    }

    // Initialize Google Cloud Functions client
    const functionsClient = new CloudFunctionsServiceClient({
      credentials
    });

    // Cloud Function name - update this to match your actual function name
    const name = 'projects/smooth-calling-460417-k5/locations/asia-southeast1/functions/processEnvironmentalData';

    // Call the Cloud Function
    const [response] = await functionsClient.callFunction({
      name,
      data: JSON.stringify(data)
    });

    console.log('Cloud Function triggered successfully:', response);
  } catch (error) {
    console.error('Error triggering Cloud Function:', error);
    // We're not failing the request if function trigger fails
    // Just log the error and continue
  }
}