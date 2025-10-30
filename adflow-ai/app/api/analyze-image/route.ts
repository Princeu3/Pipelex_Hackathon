import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { executePipelexWorkflow } from '@/lib/pipelex-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productInfo = {
      name: formData.get('productName') as string,
      description: formData.get('productDescription') as string,
    };

    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Upload image to Vercel Blob
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
    });

    // Execute image analysis workflow
    const result = await executePipelexWorkflow('analyze_product_image', {
      image_url: blob.url,
      product_info: productInfo,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to analyze image'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: blob.url,
        analysis: result.output,
      },
      processingTime: result.executionTime,
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
