'use client';

import { useState } from 'react';
import { AdGenerationForm } from '@/components/ad-generation-form';
import { AdPreview } from '@/components/ad-preview';
import { Sparkles, Zap } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { GeneratedAd } from '@/types/ad-generation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);

  const handleGenerateAd = async (formData: FormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate ad');
      }

      setGeneratedAd(result.data);
      toast.success('Ad generated successfully!', {
        description: `Generated ${result.data.adCopy.length} ad variants in ${(result.processingTime / 1000).toFixed(1)}s`,
      });
    } catch (error) {
      console.error('Error generating ad:', error);
      toast.error('Failed to generate ad', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: string) => {
    if (!generatedAd) return;

    const dataStr = JSON.stringify(generatedAd, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adflow-ad-${generatedAd.id}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Ad exported successfully!');
  };

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AdFlow AI</h1>
                <p className="text-sm text-gray-600">
                  AI-Powered Product Ad Generator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {!generatedAd ? (
            <div className="mx-auto max-w-3xl">
              {/* Hero Section */}
              <div className="mb-12 text-center">
                <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  <Zap className="h-4 w-4" />
                  <span>Powered by Pipelex AI Workflows</span>
                </div>
                <h2 className="mb-4 text-4xl font-bold text-gray-900">
                  Create Compelling Product Ads
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    In Seconds
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  Upload your product image, add details, and let AI generate
                  multiple ad copy variants tailored to different tones and audiences.
                </p>
              </div>

              {/* Form */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <AdGenerationForm
                  onSubmit={handleGenerateAd}
                  isLoading={isLoading}
                />
              </div>

              {/* Features */}
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Advanced image analysis to understand your product's visual appeal
                  </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Multiple Variants
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generate 4 unique ad copies with different tones and styles
                  </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Ready to Use
                  </h3>
                  <p className="text-sm text-gray-600">
                    Copy and paste directly into your advertising platforms
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              {/* Results Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your Generated Ads
                  </h2>
                  <p className="text-gray-600">
                    Review and export your AI-generated ad copy variants
                  </p>
                </div>
                <button
                  onClick={() => setGeneratedAd(null)}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Create New Ad
                </button>
              </div>

              {/* Ad Preview */}
              <AdPreview ad={generatedAd} onExport={handleExport} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>
              Built with{' '}
              <a
                href="https://pipelex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Pipelex
              </a>
              {' • '}
              Powered by AI workflows for intelligent ad generation
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
