// Type definitions for AdFlow AI ad generation system

export interface ProductInfo {
  name: string;
  description: string;
  price?: number;
  category?: string;
  features?: string[];
  targetAudience?: string;
}

export interface AdCopyVariant {
  headline: string;
  subheadline?: string;
  body: string;
  callToAction: string;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'persuasive';
}

export interface GeneratedAd {
  id: string;
  productInfo: ProductInfo;
  imageUrl: string;
  adCopy: AdCopyVariant[];
  createdAt: string;
  format: AdFormat;
}

export interface AdFormat {
  width: number;
  height: number;
  platform: 'facebook' | 'instagram' | 'google' | 'twitter' | 'linkedin' | 'custom';
  name: string;
}

export interface ImageAnalysis {
  description: string;
  colors: string[];
  objects: string[];
  sentiment: string;
  quality: 'high' | 'medium' | 'low';
  suggestions: string[];
}

export interface AdGenerationRequest {
  productInfo: ProductInfo;
  imageFile?: File;
  imageUrl?: string;
  numberOfVariants?: number;
  tones?: AdCopyVariant['tone'][];
  targetPlatforms?: AdFormat['platform'][];
}

export interface AdGenerationResponse {
  success: boolean;
  data?: GeneratedAd;
  error?: string;
  processingTime?: number;
}

export interface PipelexWorkflowInput {
  product_info: {
    name: string;
    description: string;
    price?: number;
    category?: string;
    features?: string[];
    target_audience?: string;
  };
  image_url: string;
  number_of_variants?: number;
  tones?: string[];
  platforms?: string[];
}

export interface PipelexWorkflowOutput {
  image_analysis: {
    description: string;
    colors: string[];
    objects: string[];
    sentiment: string;
    quality: string;
    suggestions: string[];
  };
  ad_variants: Array<{
    headline: string;
    subheadline?: string;
    body: string;
    call_to_action: string;
    tone: string;
  }>;
  processing_metadata: {
    workflow_id: string;
    execution_time: number;
    timestamp: string;
  };
}

export interface ExportOptions {
  format: 'json' | 'pdf' | 'html' | 'csv';
  includeImages: boolean;
  includeMetadata: boolean;
}
