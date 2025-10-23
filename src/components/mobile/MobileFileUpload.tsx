import { useState, useRef } from 'react';
import { Camera, Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface MobileFileUploadProps {
  expenseId?: string;
  onUploadSuccess?: (file: any) => void;
  maxFiles?: number;
  existingFiles?: any[];
  onFilesChange?: (files: any[]) => void;
}

export function MobileFileUpload({ 
  expenseId, 
  onUploadSuccess, 
  maxFiles = 5,
  existingFiles = [],
  onFilesChange
}: MobileFileUploadProps) {
  const [files, setFiles] = useState<any[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const updateFiles = (newFiles: any[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const handleFiles = async (fileList: FileList) => {
    if (files.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const file = fileList[0];

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
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      if (expenseId) {
        formData.append('expenseId', expenseId);
      }

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Get project ID from info module
        import('../../utils/supabase/info')
          .then(({ getSupabaseUrl }) => {
            xhr.open('POST', `${getSupabaseUrl()}/functions/v1/make-server-41a1615d/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('access_token')}`);
            xhr.send(formData);
          })
          .catch(reject);
      });

      const data = await uploadPromise;

      if (!data || !data.file) {
        throw new Error('Invalid response from server');
      }

      const uploadedFile = data.file;
      const newFiles = [...files, uploadedFile];
      updateFiles(newFiles);
      toast.success('Receipt uploaded!');
      onUploadSuccess?.(uploadedFile);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await apiRequest(`/files/${fileId}`, {
        method: 'DELETE',
      });

      const newFiles = files.filter(f => f.id !== fileId);
      updateFiles(newFiles);
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
      {/* File inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={uploading || files.length >= maxFiles}
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        className="hidden"
        disabled={uploading || files.length >= maxFiles}
      />

      {/* Upload Buttons */}
      {files.length < maxFiles && !uploading && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 bg-gradient-primary text-white rounded-2xl shadow-lg shadow-vs-primary/30 active:scale-98 transition-transform"
          >
            <Camera className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Take Photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-vs-primary text-vs-primary rounded-2xl active:scale-98 transition-transform"
          >
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Upload File</span>
          </button>
        </div>
      )}

      {/* Uploading State with Progress */}
      {uploading && (
        <div className="space-y-3 p-6 bg-vs-bg-secondary rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 text-vs-primary animate-spin mr-3" />
              <span className="text-vs-text-secondary text-[14px] font-medium">Uploading...</span>
            </div>
            <span className="text-vs-primary text-sm font-bold">{uploadProgress}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-vs-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Info */}
      {files.length < maxFiles && (
        <div className="bg-vs-primary/5 border-2 border-vs-primary/20 rounded-2xl p-3">
          <p className="text-vs-text-secondary text-sm">
            📸 <strong>Tip:</strong> Take a clear photo of your receipt. Accepted formats: JPG, PNG, PDF • Max 5MB • {files.length}/{maxFiles} files uploaded
          </p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-vs-text-secondary text-sm font-medium">
            Uploaded Receipts ({files.length})
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-vs-bg-secondary rounded-2xl border border-vs-border-primary"
            >
              {/* File Preview */}
              {file.signedUrl && file.fileType.startsWith('image/') ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-vs-gray-200">
                  <img 
                    src={file.signedUrl} 
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-vs-primary/10 flex items-center justify-center flex-shrink-0 text-vs-primary">
                  {getFileIcon(file.fileType)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-vs-text-primary text-[14px] font-medium truncate">
                  {file.fileName}
                </p>
                <p className="text-vs-text-muted text-sm">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>

              {/* View Link */}
              {file.signedUrl && (
                <a
                  href={file.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vs-primary text-sm font-medium px-3 py-1.5 hover:bg-vs-primary/10 rounded-lg transition-colors"
                >
                  View
                </a>
              )}

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="p-2 hover:bg-vs-error/10 rounded-lg transition-colors text-vs-error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Max Files Warning */}
      {files.length >= maxFiles && (
        <div className="bg-vs-warning/10 border-2 border-vs-warning/20 rounded-2xl p-3">
          <p className="text-vs-warning text-sm font-medium">
            ⚠️ Maximum {maxFiles} files reached. Remove files to upload more.
          </p>
        </div>
      )}
    </div>
  );
}
