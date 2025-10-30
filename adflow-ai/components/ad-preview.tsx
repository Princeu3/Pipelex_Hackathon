'use client';

import Image from 'next/image';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedAd, AdCopyVariant } from '@/types/ad-generation';

interface AdPreviewProps {
  ad: GeneratedAd;
  onExport: (format: string) => void;
}

export function AdPreview({ ad, onExport }: AdPreviewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getToneBadgeColor = (tone: string) => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-800',
      casual: 'bg-green-100 text-green-800',
      enthusiastic: 'bg-purple-100 text-purple-800',
      persuasive: 'bg-orange-100 text-orange-800',
    };
    return colors[tone] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Image Preview */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-video w-full">
          <Image
            src={ad.imageUrl}
            alt={ad.productInfo.name}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Information</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="text-base text-gray-900">{ad.productInfo.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="text-base text-gray-900">{ad.productInfo.description}</dd>
          </div>
          {ad.productInfo.price && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="text-base text-gray-900">${ad.productInfo.price}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Ad Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Generated Ad Copy Variants</h3>
          <button
            onClick={() => onExport('json')}
            className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </button>
        </div>

        {ad.adCopy.map((variant: AdCopyVariant, index: number) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getToneBadgeColor(
                  variant.tone
                )}`}
              >
                {variant.tone.charAt(0).toUpperCase() + variant.tone.slice(1)} Tone
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    `${variant.headline}\n\n${variant.subheadline || ''}\n\n${variant.body}\n\n${variant.callToAction}`,
                    index
                  )
                }
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Headline
                </h4>
                <p className="text-xl font-bold text-gray-900">{variant.headline}</p>
              </div>

              {variant.subheadline && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subheadline
                  </h4>
                  <p className="text-lg font-medium text-gray-700">{variant.subheadline}</p>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Body Copy
                </h4>
                <p className="text-base leading-relaxed text-gray-700">{variant.body}</p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Call to Action
                </h4>
                <p className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white">
                  {variant.callToAction}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
