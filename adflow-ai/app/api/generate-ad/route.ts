import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { executePipelexWorkflow } from '@/lib/pipelex-client';
import type { AdGenerationRequest, AdGenerationResponse } from '@/types/ad-generation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract product information
    const productInfo = {
      name: formData.get('productName') as string,
      description: formData.get('productDescription') as string,
      price: formData.get('productPrice') ? parseFloat(formData.get('productPrice') as string) : undefined,
      category: formData.get('productCategory') as string || undefined,
      features: formData.get('productFeatures') ? (formData.get('productFeatures') as string).split(',').map(f => f.trim()) : undefined,
      target_audience: formData.get('targetAudience') as string || undefined,
    };

    // Handle image upload
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

    // Execute Pipelex workflow
    const result = await executePipelexWorkflow('generate_complete_ad', {
      image_url: blob.url,
      product_info: productInfo,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate ad'
        },
        { status: 500 }
      );
    }

    // Format response
    const response: AdGenerationResponse = {
      success: true,
      data: {
        id: `ad_${Date.now()}`,
        productInfo: productInfo,
        imageUrl: blob.url,
        adCopy: result.output.ad_variants,
        createdAt: new Date().toISOString(),
        format: {
          width: 1200,
          height: 628,
          platform: 'custom',
          name: 'Standard Ad Format',
        },
      },
      processingTime: result.executionTime,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating ad:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
