import { useState } from 'react';
import { Plus, UserPlus, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { InviteCodeManager } from '../InviteCodeManager';
import { JoinVillaWithCode } from '../JoinVillaWithCode';

interface MobileVillaActionsProps {
  villas: any[];
  onVillaUpdate?: () => void;
}

export function MobileVillaActions({ villas, onVillaUpdate }: MobileVillaActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showInviteManager, setShowInviteManager] = useState(false);
  const [showJoinVilla, setShowJoinVilla] = useState(false);
  const [selectedVilla, setSelectedVilla] = useState<any>(null);

  const handleInviteClick = () => {
    if (villas.length === 0) {
      return;
    }
    // Always set the first villa as default selection
    // User can change it in the InviteCodeManager if they have multiple villas
    setSelectedVilla(villas[0]);
    setShowMenu(false);
    setShowInviteManager(true);
  };

  const handleJoinClick = () => {
    setShowMenu(false);
    setShowJoinVilla(true);
  };

  const handleJoinSuccess = () => {
    setShowJoinVilla(false);
    onVillaUpdate?.();
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-[104px] right-6 z-50">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] text-white shadow-2xl shadow-[#7B5FEB]/40 flex items-center justify-center transition-transform ${
            showMenu ? 'rotate-45' : ''
          }`}
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Menu Options */}
        {showMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl p-2 min-w-[200px] animate-in slide-in-from-bottom-2">
            <button
              onClick={handleJoinClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8F8] rounded-xl transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#7B5FEB]/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-[#7B5FEB]" />
              </div>
              <div>
                <div className="font-medium text-[14px] text-[#1F1F1F]">Join Villa</div>
                <div className="text-sm text-[#6E6B7B]">Use invite code</div>
              </div>
            </button>

            {villas.length > 0 && (
              <button
                onClick={handleInviteClick}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8F8] rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#28C76F]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#28C76F]" />
                </div>
                <div>
                  <div className="font-medium text-[14px] text-[#1F1F1F]">Invite Users</div>
                  <div className="text-sm text-[#6E6B7B]">Generate code</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Invite Code Manager Dialog */}
      <Dialog open={showInviteManager} onOpenChange={setShowInviteManager}>
        <DialogContent className="p-0 max-w-lg border-0">
          <DialogTitle className="sr-only">Invite Code Manager</DialogTitle>
          <DialogDescription className="sr-only">
            Generate and manage invite codes for your villa
          </DialogDescription>
          {selectedVilla && (
            <InviteCodeManager
              villa={selectedVilla}
              onClose={() => setShowInviteManager(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Join Villa Dialog */}
      <Dialog open={showJoinVilla} onOpenChange={setShowJoinVilla}>
        <DialogContent className="p-0 max-w-lg border-0">
          <DialogTitle className="sr-only">Join Villa</DialogTitle>
          <DialogDescription className="sr-only">
            Enter an invite code to join a villa
          </DialogDescription>
          <JoinVillaWithCode
            onSuccess={handleJoinSuccess}
            onCancel={() => setShowJoinVilla(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
