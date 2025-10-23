import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Next',
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{title}</h2>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">{children}</div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={handleCancel}>
            {cancelLabel}
          </button>
          <button className="modal-btn-submit" onClick={handleSubmit}>
            {submitLabel}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(22, 21, 28, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--desktop-content-padding);
        }

        .modal-container {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          background: var(--desktop-white-500);
          border-radius: var(--desktop-radius-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: var(--desktop-gap-2xl);
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .modal-title-section {
          flex: 1;
        }

        .modal-title {
          font-size: var(--desktop-header-5);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 4px 0;
        }

        .modal-subtitle {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 0;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          color: var(--desktop-dark-500);
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: var(--desktop-gray-10);
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--desktop-gap-2xl);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-2xl);
          border-top: 1px solid var(--desktop-gray-10);
        }

        .modal-btn-cancel {
          padding: 13px 20px;
          height: 50px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-btn-cancel:hover {
          border-color: var(--desktop-gray-500);
        }

        .modal-btn-submit {
          padding: 13px 20px;
          height: 50px;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-btn-submit:hover {
          background: var(--desktop-primary-400);
        }
      `}</style>
    </div>
  );
};
