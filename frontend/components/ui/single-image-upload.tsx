'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  aspectRatio?: 'square' | 'cover';
  placeholder?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  onUploadingChange,
  disabled,
  aspectRatio = 'square',
  placeholder = 'Upload image',
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const updateUploading = (val: boolean) => {
    setUploading(val);
    onUploadingChange?.(val);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', `ember-${Date.now()}-${file.name}`);

    try {
      const response = await fetch('/api/ipfs/file', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.gatewayUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled || uploading) return;
      updateUploading(true);
      const url = await uploadFile(file);
      if (url) onChange(url);
      updateUploading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, uploading, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const aspectClass = aspectRatio === 'cover' ? 'aspect-[3/1]' : 'aspect-square';

  if (value) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden', aspectClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={() => onChange('')}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      className={cn(
        'border-2 border-dashed rounded-lg transition-colors',
        aspectClass,
        dragActive ? 'border-ember bg-ember/5' : 'border-border hover:border-ember/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {uploading ? (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-ember" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">{placeholder}</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />
        </label>
      )}
    </div>
  );
}
