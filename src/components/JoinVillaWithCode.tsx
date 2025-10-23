import React, { useState } from 'react';
import { Home, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';
import { MobileButton, MobileInput, MobileCard } from './mobile';
import { validateField } from '../utils/formValidation';

interface JoinVillaWithCodeProps {
  onSuccess?: (villa: any) => void;
  onCancel?: () => void;
}

export function JoinVillaWithCode({ onSuccess, onCancel }: JoinVillaWithCodeProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInviteCode = (code: string) => {
    const validation = validateField(code.trim(), {
      required: 'Please enter an invite code',
      minLength: { value: 6, message: 'Invite code must be at least 6 characters' },
      pattern: { value: /^[A-Za-z0-9]+$/, message: 'Invite code can only contain letters and numbers' }
    });

    if (!validation.isValid) {
      setError(validation.error || 'Invalid invite code');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleJoinVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInviteCode(inviteCode)) {
      return;
    }

    try {
      setLoading(true);
      const { villa } = await apiRequest('/villas/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      
      toast.success(`Successfully joined ${villa.name}!`);
      onSuccess?.(villa);
    } catch (error: any) {
      console.error('Error joining villa:', error);
      toast.error(error.message || 'Failed to join villa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-[24px] font-semibold text-vs-text-primary mb-2">
          Join a Villa
        </h2>
        <p className="text-vs-text-secondary text-[14px]">
          Enter the invite code shared with you to join a villa
        </p>
      </div>

      <form onSubmit={handleJoinVilla}>
        <MobileCard padding="lg" className="mb-4">
          <div className="mb-6">
            <MobileInput
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                if (error) setError('');
              }}
              onBlur={() => validateInviteCode(inviteCode)}
              placeholder="Enter invite code"
              disabled={loading}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error}</p>
            )}
          </div>

          <div className="bg-vs-primary/5 border-2 border-vs-primary/20 rounded-2xl p-4 mb-6">
            <p className="text-vs-text-secondary text-sm">
              💡 <strong>Tip:</strong> Invite codes are case-sensitive and expire after 7 days. 
              Make sure to enter the code exactly as shared.
            </p>
          </div>

          <MobileButton
            type="submit"
            loading={loading}
            icon={!loading && <ArrowRight className="w-5 h-5" />}
            variant="primary"
          >
            Join Villa
          </MobileButton>
        </MobileCard>
      </form>

      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full py-3 text-vs-text-secondary text-[14px] font-medium hover:text-vs-text-primary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
