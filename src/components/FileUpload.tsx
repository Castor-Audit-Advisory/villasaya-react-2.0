import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';

interface FileUploadProps {
  expenseId?: string;
  onUploadSuccess?: (file: any) => void;
  maxFiles?: number;
  existingFiles?: any[];
}

export function FileUpload({ 
  expenseId, 
  onUploadSuccess, 
  maxFiles = 5,
  existingFiles = []
}: FileUploadProps) {
  const [files, setFiles] = useState<any[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    if (files.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = fileList[0]; // Handle one file at a time

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      if (expenseId) {
        formData.append('expenseId', expenseId);
      }

      const response = await fetch(
        `${(await import('../utils/supabase/info')).getSupabaseUrl()}/functions/v1/make-server-41a1615d/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const uploadedFile = data.file;
      setFiles([...files, uploadedFile]);
      toast.success('File uploaded successfully!');
      onUploadSuccess?.(uploadedFile);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await apiRequest(`/files/${fileId}`, {
        method: 'DELETE',
      });

      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File removed');
    } catch (error: any) {
      console.error('Error removing file:', error);
      toast.error(error.message || 'Failed to remove file');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-colors ${
          dragActive
            ? 'border-vs-primary bg-vs-primary/5'
            : 'border-vs-border-primary bg-vs-bg-secondary'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          className="hidden"
          disabled={uploading || files.length >= maxFiles}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-10 h-10 text-vs-primary animate-spin mb-2" />
            <p className="text-vs-text-secondary text-[14px]">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-full bg-vs-primary/10 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-vs-primary" />
            </div>
            <p className="text-vs-text-primary font-medium mb-1">
              {files.length >= maxFiles ? 'Maximum files reached' : 'Upload Receipt'}
            </p>
            <p className="text-vs-text-muted text-sm mb-3">
              Drag and drop or click to browse
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= maxFiles}
              className="px-4 py-2 bg-vs-primary text-white rounded-full text-[14px] font-medium hover:bg-vs-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose File
            </button>
            <p className="text-vs-text-muted text-sm mt-3">
              JPG, PNG or PDF • Max 5MB • {files.length}/{maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-vs-text-secondary text-sm font-medium">
            Uploaded Files ({files.length})
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-vs-bg-secondary rounded-xl border border-vs-border-primary"
            >
              <div className="w-10 h-10 rounded-lg bg-vs-primary/10 flex items-center justify-center flex-shrink-0 text-vs-primary">
                {getFileIcon(file.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-vs-text-primary text-[14px] font-medium truncate">
                  {file.fileName}
                </p>
                <p className="text-vs-text-muted text-sm">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
              {file.signedUrl && file.fileType.startsWith('image/') && (
                <a
                  href={file.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vs-primary text-sm font-medium hover:underline"
                >
                  View
                </a>
              )}
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="p-1.5 hover:bg-vs-error/10 rounded-lg transition-colors text-vs-error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
