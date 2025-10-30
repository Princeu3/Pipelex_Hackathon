import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
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

    // Execute image analysis workflow
    const result = await executePipelexWorkflow('analyze_product_image', {
      image_url: uploadedImageUrl,
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
        imageUrl: uploadedImageUrl,
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
