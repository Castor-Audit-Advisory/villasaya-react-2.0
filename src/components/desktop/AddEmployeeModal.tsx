import React, { useState } from 'react';
import { FormModal } from './FormModal';
import { FileUpload } from './FileUpload';
import { User, Briefcase, FileText, Shield } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

type FormStep = 'personal' | 'professional' | 'documents' | 'access';

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    joinDate: '',
    appointmentLetter: null as File | null,
    salarySlips: null as File | null,
    relievingLetter: null as File | null,
    experienceLetter: null as File | null,
    accessLevel: 'standard',
  });

  const steps: { id: FormStep; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Information', icon: <User size={20} /> },
    { id: 'professional', label: 'Professional Information', icon: <Briefcase size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'access', label: 'Account Access', icon: <Shield size={20} /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      onSubmit(formData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="form-step">
            <div className="form-row">
              <div className="form-field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="form-step">
            <div className="form-row">
              <div className="form-field">
                <label>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                >
                  <option value="">Select department</option>
                  <option value="management">Management</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="form-field">
                <label>Designation</label>
                <input
                  type="text"
                  placeholder="Enter designation"
                  value={formData.designation}
                  onChange={(e) => updateFormData('designation', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Salary</label>
                <input
                  type="number"
                  placeholder="Enter salary"
                  value={formData.salary}
                  onChange={(e) => updateFormData('salary', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => updateFormData('joinDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="form-step">
            <div className="form-row">
              <FileUpload
                label="Upload Appointment Letter"
                onFileSelect={(file) => updateFormData('appointmentLetter', file)}
              />
            </div>
            <div className="form-row">
              <FileUpload
                label="Upload Salary Slips"
                onFileSelect={(file) => updateFormData('salarySlips', file)}
              />
            </div>
            <div className="form-row">
              <FileUpload
                label="Upload Reliving Letter"
                onFileSelect={(file) => updateFormData('relievingLetter', file)}
              />
            </div>
            <div className="form-row">
              <FileUpload
                label="Upload Experience Letter"
                onFileSelect={(file) => updateFormData('experienceLetter', file)}
              />
            </div>
          </div>
        );

      case 'access':
        return (
          <div className="form-step">
            <div className="form-field">
              <label>Access Level</label>
              <select
                value={formData.accessLevel}
                onChange={(e) => updateFormData('accessLevel', e.target.value)}
              >
                <option value="standard">Standard User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="access-info">
              <h4>Access Permissions</h4>
              <ul>
                <li>View assigned tasks and properties</li>
                <li>Submit expense reports</li>
                <li>Clock in/out tracking</li>
                <li>Internal messaging</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      subtitle={`All Employee > Add New Employee`}
      onSubmit={handleNext}
      onCancel={currentStepIndex > 0 ? handleBack : undefined}
      cancelLabel={currentStepIndex > 0 ? 'Back' : 'Cancel'}
      submitLabel={currentStepIndex === steps.length - 1 ? 'Submit' : 'Next'}
    >
      <div className="add-employee-form">
        <div className="step-tabs">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-tab ${
                index === currentStepIndex
                  ? 'active'
                  : index < currentStepIndex
                  ? 'completed'
                  : ''
              }`}
            >
              <div className="step-icon">{step.icon}</div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="step-content">{renderStepContent()}</div>
      </div>

      <style>{`
        .add-employee-form {
          width: 100%;
        }

        .step-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .step-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: var(--desktop-radius-md);
          transition: all 0.2s;
        }

        .step-tab.active {
          background: var(--desktop-primary-5);
        }

        .step-tab.completed .step-icon {
          background: #28C76F;
        }

        .step-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--desktop-gray-20);
          color: var(--desktop-dark-500);
          transition: all 0.2s;
        }

        .step-tab.active .step-icon {
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
        }

        .step-label {
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          text-align: center;
        }

        .step-tab.active .step-label {
          color: var(--desktop-primary-500);
          font-weight: var(--desktop-weight-semibold);
        }

        .step-content {
          min-height: 400px;
        }

        .form-step {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-row:has(.file-upload-container) {
          grid-template-columns: 1fr;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
        }

        .form-field input,
        .form-field select {
          padding: 13px 16px;
          height: 50px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          outline: none;
          transition: all 0.2s;
        }

        .form-field input:focus,
        .form-field select:focus {
          border-color: var(--desktop-primary-500);
        }

        .form-field input::placeholder {
          color: var(--desktop-dark-20);
        }

        .access-info {
          margin-top: 20px;
          padding: 20px;
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
        }

        .access-info h4 {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 12px 0;
        }

        .access-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .access-info li {
          font-size: var(--desktop-body-2);
          color: var(--desktop-gray-500);
          margin-bottom: 8px;
        }
      `}</style>
    </FormModal>
  );
};
