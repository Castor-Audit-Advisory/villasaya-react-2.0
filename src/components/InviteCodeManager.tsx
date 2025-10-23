import React, { useState } from 'react';
import { Copy, Share2, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';
import { MobileButton, MobileInput, MobileCard } from './mobile';

interface InviteCodeManagerProps {
  villa: any;
  onClose?: () => void;
}

export function InviteCodeManager({ villa, onClose }: InviteCodeManagerProps) {
  const [role, setRole] = useState('staff');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const { inviteCode } = await apiRequest(`/villas/${villa.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      
      setGeneratedCode(inviteCode);
      toast.success('Invite code generated!');
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast.error(error.message || 'Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleShare = async () => {
    const shareText = `Join ${villa.name} on VillaSaya!\n\nInvite Code: ${generatedCode}\n\nThis code expires in 7 days.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invite to ${villa.name}`,
          text: shareText,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await handleCopyCode();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-vs-text-primary mb-2">
          Invite to {villa.name}
        </h2>
        <p className="text-vs-text-secondary text-[14px]">
          Generate an invite code to add team members to this villa
        </p>
      </div>

      <MobileCard padding="lg" className="mb-4">
        <div className="mb-4">
          <label className="text-vs-text-secondary text-[14px] font-medium block mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mobile-input"
            disabled={!!generatedCode}
          >
            <option value="staff">Staff</option>
            <option value="tenant">Tenant</option>
            <option value="agent">Property Agent</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>

        {!generatedCode ? (
          <MobileButton
            onClick={handleGenerateCode}
            loading={loading}
            icon={<UserPlus className="w-5 h-5" />}
            variant="primary"
          >
            Generate Invite Code
          </MobileButton>
        ) : (
          <div className="space-y-4">
            {/* Generated Code Display */}
            <div className="bg-vs-primary/5 border-2 border-vs-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-vs-primary" />
                <span className="text-vs-text-secondary text-sm font-medium">
                  Invite Code Generated
                </span>
              </div>
              <div className="font-mono text-[20px] font-bold text-vs-primary break-all">
                {generatedCode}
              </div>
              <div className="flex items-center gap-2 mt-2 text-vs-text-muted text-sm">
                <Clock className="w-4 h-4" />
                Expires in 7 days
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-vs-primary text-vs-primary rounded-2xl font-medium transition-colors hover:bg-vs-primary/5"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy
                  </>
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-primary text-white rounded-2xl font-medium shadow-lg shadow-vs-primary/30"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Generate Another */}
            <button
              onClick={() => {
                setGeneratedCode('');
                setCopied(false);
              }}
              className="w-full py-3 text-vs-text-secondary text-[14px] font-medium hover:text-vs-text-primary transition-colors"
            >
              Generate Another Code
            </button>
          </div>
        )}
      </MobileCard>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 text-vs-text-secondary text-[14px] font-medium hover:text-vs-text-primary transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}
