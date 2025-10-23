import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  placeholder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  accept = '.jpeg,.jpg,.pdf',
  placeholder = 'Drag & Drop or choose file to upload',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <label className="file-upload-label">{label}</label>
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="upload-icon">
          <Upload size={32} />
        </div>
        <div className="upload-text">
          {fileName ? (
            <span className="file-name">{fileName}</span>
          ) : (
            <>
              <span className="upload-prompt">
                {placeholder.split('or')[0]}
                <span className="upload-link">or {placeholder.split('or')[1]}</span>
              </span>
              <span className="upload-hint">Supported formats: {accept}</span>
            </>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <style>{`
        .file-upload-container {
          width: 100%;
          margin-bottom: var(--desktop-gap-lg);
        }

        .file-upload-label {
          display: block;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          margin-bottom: var(--desktop-gap-sm);
        }

        .file-upload-area {
          width: 100%;
          height: 120px;
          border: 2px dashed var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--desktop-gap-md);
          cursor: pointer;
          transition: all 0.2s;
          background: var(--desktop-white-500);
        }

        .file-upload-area:hover,
        .file-upload-area.dragging {
          border-color: var(--desktop-primary-500);
          background: var(--desktop-primary-5);
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          background: var(--desktop-primary-500);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--desktop-white-500);
        }

        .upload-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .upload-prompt {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
        }

        .upload-link {
          color: var(--desktop-primary-500);
          font-weight: var(--desktop-weight-semibold);
        }

        .upload-hint {
          font-size: var(--desktop-caption);
          color: var(--desktop-gray-500);
        }

        .file-name {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-primary-500);
        }
      `}</style>
    </div>
  );
};
