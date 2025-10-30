import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

// GET: List all saved generations
export async function GET(request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      // No blob storage configured - return empty list
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Blob storage not configured',
      });
    }

    // List all blobs with the 'generations/' prefix
    const { blobs } = await list({
      prefix: 'generations/',
      token: blobToken,
    });

    // Sort by uploaded date (newest first)
    const sortedBlobs = blobs.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    // Fetch metadata for each generation
    const generations = await Promise.all(
      sortedBlobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          return {
            id: blob.pathname.replace('generations/', '').replace('.json', ''),
            url: blob.url,
            createdAt: blob.uploadedAt,
            productName: data.productInfo?.name || 'Unknown Product',
            imageUrl: data.imageUrl,
            size: blob.size,
          };
        } catch (error) {
          console.error('Error fetching generation:', error);
          return null;
        }
      })
    );

    // Filter out any failed fetches
    const validGenerations = generations.filter((g) => g !== null);

    return NextResponse.json({
      success: true,
      data: validGenerations,
      count: validGenerations.length,
    });
  } catch (error) {
    console.error('Error listing generations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list generations',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a saved generation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('id');

    if (!generationId) {
      return NextResponse.json(
        { success: false, error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      return NextResponse.json(
        { success: false, error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    // Delete the blob
    const blobPath = `generations/${generationId}.json`;
    await del(blobPath, { token: blobToken });

    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete generation',
      },
      { status: 500 }
    );
  }
}

