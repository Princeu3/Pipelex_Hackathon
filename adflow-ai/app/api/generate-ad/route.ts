import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
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

    // Prefer Vercel Blob if token is available; otherwise fall back to local file save in dev
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    let uploadedImageUrl: string;

    if (blobToken) {
      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
        token: blobToken,
      });
      uploadedImageUrl = blob.url;
    } else {
      // Local-dev fallback: write to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);
      uploadedImageUrl = `/uploads/${safeName}`;
    }

    // Execute Pipelex workflow
    const result = await executePipelexWorkflow('generate_complete_ad', {
      image_url: uploadedImageUrl,
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

    // Parse the output - it contains product_analysis, ad_copy, and video_prompt
    const adCopyData = result.output.ad_copy || {};
    const videoPromptText = result.output.video_prompt || '';
    const productAnalysis = result.output.product_analysis || {};

    // Format ad copy as array with single variant
    const adCopyVariant = {
      headline: adCopyData.headline || '',
      subheadline: adCopyData.tagline || '',
      body: adCopyData.body_text || '',
      callToAction: adCopyData.call_to_action || 'Shop Now',
      tone: adCopyData.tone || 'professional'
    };

    // Format response
    const generationId = `ad_${Date.now()}`;
    const response: AdGenerationResponse = {
      success: true,
      data: {
        id: generationId,
        productInfo: productInfo,
        imageUrl: uploadedImageUrl,
        adCopy: [adCopyVariant],
        videoPrompt: videoPromptText,
        productAnalysis: productAnalysis,
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

    // Save generation to blob storage if token is available
    if (blobToken) {
      try {
        const generationData = JSON.stringify(response.data, null, 2);
        await put(`generations/${generationId}.json`, generationData, {
          access: 'public',
          token: blobToken,
          contentType: 'application/json',
        });
      } catch (saveError) {
        console.error('Error saving generation to blob:', saveError);
        // Don't fail the request if saving to blob fails
      }
    }

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
