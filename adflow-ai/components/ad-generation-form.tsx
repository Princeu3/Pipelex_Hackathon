'use client';

import { useState } from 'react';
import { ImageUpload } from './image-upload';
import { Loader2, Sparkles } from 'lucide-react';
import type { ProductInfo } from '@/types/ad-generation';

interface AdGenerationFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export function AdGenerationForm({ onSubmit, isLoading }: AdGenerationFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<ProductInfo>>({
    name: '',
    description: '',
    price: undefined,
    category: '',
    features: [],
    targetAudience: '',
  });

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      alert('Please select a product image');
      return;
    }

    const submitData = new FormData();
    submitData.append('image', selectedImage);
    submitData.append('productName', formData.name || '');
    submitData.append('productDescription', formData.description || '');

    if (formData.price) {
      submitData.append('productPrice', formData.price.toString());
    }

    if (formData.category) {
      submitData.append('productCategory', formData.category);
    }

    if (formData.features && formData.features.length > 0) {
      submitData.append('productFeatures', formData.features.join(','));
    }

    if (formData.targetAudience) {
      submitData.append('targetAudience', formData.targetAudience);
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Product Image *
        </label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          selectedImage={selectedImage}
          onRemove={handleImageRemove}
        />
      </div>

      {/* Product Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Premium Wireless Headphones"
        />
      </div>

      {/* Product Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Product Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your product's key features and benefits..."
        />
      </div>

      {/* Product Price */}
      <div>
        <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
          Price (Optional)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price || ''}
          onChange={handleInputChange}
          step="0.01"
          min="0"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 199.99"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Category (Optional)
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Electronics, Fashion, Home & Garden"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label
          htmlFor="targetAudience"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Target Audience (Optional)
        </label>
        <input
          type="text"
          id="targetAudience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Tech-savvy professionals aged 25-40"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !selectedImage}
        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Ads...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Generate Ad Copy</span>
          </>
        )}
      </button>
    </form>
  );
}
