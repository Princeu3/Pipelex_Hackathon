import { NextRequest, NextResponse } from 'next/server';

// GET: Retrieve a specific generation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      return NextResponse.json(
        { success: false, error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // Construct the blob URL
    const blobUrl = `https://${process.env.BLOB_STORE_ID || 'your-store'}.public.blob.vercel-storage.com/generations/${id}.json`;

    // Fetch the generation data
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error retrieving generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve generation',
      },
      { status: 500 }
    );
  }
}

