import { NextRequest, NextResponse } from 'next/server';
import { CloudFunctionsServiceClient } from '@google-cloud/functions';

interface TriggerFunctionRequestBody {
  functionName: string;
  data: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TriggerFunctionRequestBody;
    const { functionName, data } = body;

    if (!functionName || !data) {
      return NextResponse.json(
        { message: 'Missing function name or data' },
        { status: 400 }
      );
    }

    // Check if we have credentials available
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GCP_SERVICE_ACCOUNT) {
      return NextResponse.json(
        { message: 'Google Cloud credentials not configured' },
        { status: 500 }
      );
    }

    let credentials;
    
    // Try to load credentials from environment variable first
    if (process.env.GCP_SERVICE_ACCOUNT) {
      credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use the path from environment variable
      credentials = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    } else {
      return NextResponse.json(
        { message: 'No valid Google Cloud credentials found' },
        { status: 500 }
      );
    }

    // Initialize Google Cloud Functions client
    const functionsClient = new CloudFunctionsServiceClient({
      credentials
    });

    // Define Cloud Function name - update your project ID and region
    const projectId = 'smooth-calling-460417-k5'; // Update this to your project ID
    const region = 'us-central1'; // Update this to your region
    const name = `projects/${projectId}/locations/${region}/functions/${functionName}`;

    // Call the Cloud Function
    const [response] = await functionsClient.callFunction({
      name,
      data: JSON.stringify(data)
    });

    return NextResponse.json({ 
      success: true, 
      response: response,
      message: 'Function triggered successfully'
    });

  } catch (error) {
    console.error('Error triggering Cloud Function:', error);
    
    // More detailed error handling
    let errorMessage = 'Failed to trigger function';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}