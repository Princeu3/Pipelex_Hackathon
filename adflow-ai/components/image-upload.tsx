'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemove: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onImageSelect(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
  });

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  if (preview && selectedImage) {
    return (
      <div className="relative w-full">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200">
          <Image
            src={preview}
            alt="Product preview"
            fill
            className="object-contain"
          />
        </div>
        <button
          onClick={handleRemove}
          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mt-2 text-sm text-gray-600">{selectedImage.name}</p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-blue-500" />
            <p className="text-lg font-medium text-blue-500">Drop your image here</p>
          </>
        ) : (
          <>
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your product image here
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
            <p className="text-xs text-gray-400">
              Supports: PNG, JPG, JPEG, WEBP
            </p>
          </>
        )}
      </div>
    </div>
  );
}
