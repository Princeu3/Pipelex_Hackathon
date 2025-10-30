import { NextRequest, NextResponse } from 'next/server';
import { executePipelexWorkflow } from '@/lib/pipelex-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoPrompt } = body;

    if (!videoPrompt) {
      return NextResponse.json(
        { success: false, error: 'No video prompt provided' },
        { status: 400 }
      );
    }

    // Truncate prompt to 2000 characters (Veo 3 Fast limit)
    const truncatedPrompt = videoPrompt.substring(0, 2000);

    // Execute video generation workflow
    const result = await executePipelexWorkflow('generate_video', {
      video_prompt: truncatedPrompt,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate video'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        videoUrl: result.output.video_url || result.output.url,
        prompt: truncatedPrompt,
      },
      processingTime: result.executionTime,
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
