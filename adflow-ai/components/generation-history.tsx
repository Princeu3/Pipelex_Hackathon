'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Trash2, Loader2, RefreshCw, FolderOpen } from 'lucide-react';
import type { GenerationSummary, GeneratedAd } from '@/types/ad-generation';

interface GenerationHistoryProps {
  onLoadGeneration: (generation: GeneratedAd) => void;
}

export function GenerationHistory({ onLoadGeneration }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<GenerationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGenerations = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/generations');
      const result = await response.json();

      if (result.success) {
        setGenerations(result.data || []);
      } else {
        setError(result.error || result.message || 'Failed to load generations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleLoadGeneration = async (generationId: string) => {
    try {
      const response = await fetch(`/api/generations/${generationId}`);
      const result = await response.json();

      if (result.success && result.data) {
        onLoadGeneration(result.data);
      } else {
        alert('Failed to load generation: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error loading generation: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeleteGeneration = async (generationId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this generation?')) {
      return;
    }

    setDeletingId(generationId);

    try {
      const response = await fetch(`/api/generations?id=${generationId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setGenerations(generations.filter((g) => g.id !== generationId));
      } else {
        alert('Failed to delete: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && generations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <FolderOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => fetchGenerations()}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <FolderOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-600">
          No saved generations yet. Create your first ad to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Past Generations ({generations.length})
        </h3>
        <button
          onClick={() => fetchGenerations(true)}
          disabled={isRefreshing}
          className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Generation Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generations.map((generation) => (
          <div
            key={generation.id}
            onClick={() => handleLoadGeneration(generation.id)}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
          >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              <Image
                src={generation.imageUrl}
                alt={generation.productName}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="mb-2 font-semibold text-gray-900 line-clamp-2">
                {generation.productName}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(generation.createdAt)}</span>
                </div>
                <span>{formatSize(generation.size)}</span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteGeneration(generation.id, e)}
              disabled={deletingId === generation.id}
              className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-gray-600 opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
              title="Delete generation"
            >
              {deletingId === generation.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

