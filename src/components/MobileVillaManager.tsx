import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, MapPin, Calendar, DollarSign, ArrowLeft, Copy } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';
import { Villa } from '../types';

interface MobileVillaManagerProps {
  villas: Villa[];
  onNavigate?: (view: string) => void;
}

export function MobileVillaManager({ villas: initialVillas, onNavigate }: MobileVillaManagerProps) {
  const [villas, setVillas] = useState<Villa[]>(initialVillas);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inviteRole, setInviteRole] = useState('tenant');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    leaseStartDate: '',
    leaseDuration: '',
    rent: '',
  });

  const currentUserId = sessionStorage.getItem('user_id');

  useEffect(() => {
    loadVillas();
  }, []);

  const loadVillas = async () => {
    try {
      setLoading(true);
      const { villas } = await apiRequest('/villas');
      setVillas(villas || []);
    } catch (error: any) {
      console.error('Error loading villas:', error);
      toast.error('Failed to load villas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.address) {
      toast.error('Please fill in villa name and address');
      return;
    }
    
    try {
      setLoading(true);
      const leaseDetails = {
        startDate: formData.leaseStartDate,
        duration: formData.leaseDuration,
        rent: formData.rent,
      };

      const response = await apiRequest('/villas', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          leaseDetails,
        }),
      });

      console.log('Villa created successfully:', response);
      toast.success('Villa created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        address: '',
        leaseStartDate: '',
        leaseDuration: '',
        rent: '',
      });
      await loadVillas();
    } catch (error: any) {
      console.error('Error creating villa:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      toast.error(error?.message || 'Failed to create villa. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/villas/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      });

      toast.success('Joined villa successfully!');
      setShowJoinForm(false);
      setInviteCode('');
      loadVillas();
    } catch (error: any) {
      console.error('Error joining villa:', error);
      toast.error(error.message || 'Failed to join villa');
    }
  };

  const handleGenerateInvite = async () => {
    if (!selectedVilla) return;
    
    try {
      const { inviteCode } = await apiRequest(`/villas/${selectedVilla.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ role: inviteRole }),
      });

      setGeneratedCode(inviteCode);
      toast.success('Invite code generated!');
    } catch (error: any) {
      console.error('Error generating invite:', error);
      toast.error(error.message || 'Failed to generate invite code');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Copied to clipboard!');
  };

  const isAdmin = (villa: Villa) => {
    return villa.users?.find((u: any) => u.userId === currentUserId)?.role === 'admin';
  };

  if (showCreateForm) {
    return (
      <div className="flex flex-col min-h-screen bg-card dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setShowCreateForm(false)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Create New Villa</h2>
          <div className="w-9" />
        </div>

        <form onSubmit={handleCreateVilla} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Villa Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Lease Start Date
            </label>
            <input
              type="date"
              value={formData.leaseStartDate}
              onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Lease Duration (months)
            </label>
            <input
              type="number"
              value={formData.leaseDuration}
              onChange={(e) => setFormData({ ...formData, leaseDuration: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Monthly Rent ($)
            </label>
            <input
              type="number"
              value={formData.rent}
              onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Create Villa
          </button>
        </form>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="flex flex-col min-h-screen bg-card dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setShowJoinForm(false)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Join Villa</h2>
          <div className="w-9" />
        </div>

        <form onSubmit={handleJoinVilla} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Join Villa
          </button>
        </form>
      </div>
    );
  }

  if (selectedVilla) {
    return (
      <div className="flex flex-col min-h-screen bg-card dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setSelectedVilla(null)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">{selectedVilla.name}</h2>
          {isAdmin(selectedVilla) && (
            <button
              onClick={() => setShowInviteDialog(true)}
              className="p-2 text-indigo-600"
            >
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">{selectedVilla.address}</p>
              </div>
            </div>

            {selectedVilla.leaseDetails && (
              <>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Lease Period</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedVilla.leaseDetails.startDate).toLocaleDateString()} - 
                      {selectedVilla.leaseDetails.duration} months
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Monthly Rent</p>
                    <p className="text-sm text-muted-foreground">${selectedVilla.leaseDetails.rent}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-foreground mb-3">Members</h3>
            <div className="space-y-2">
              {selectedVilla.users?.map((user: any) => (
                <div key={user.userId} className="flex items-center justify-between p-2 bg-muted dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showInviteDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 w-full">
              <h3 className="text-lg font-semibold mb-4">Generate Invite Code</h3>
              
              {!generatedCode ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Role for Invited User
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="landlord">Landlord</option>
                      <option value="property_agent">Property Agent</option>
                      <option value="tenant">Tenant</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowInviteDialog(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateInvite}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                      Generate
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Share this code:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={generatedCode}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-muted dark:bg-gray-800"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowInviteDialog(false);
                      setGeneratedCode('');
                    }}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-card dark:bg-gray-900 p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Villa Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your villas and properties</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading villas...</p>
          </div>
        ) : villas.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground">No villas yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create or join a villa to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {villas.map((villa) => (
              <button
                key={villa.id}
                onClick={() => setSelectedVilla(villa)}
                className="w-full bg-card dark:bg-gray-800 p-4 rounded-lg border border-border text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                      <h3 className="font-semibold text-foreground">{villa.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{villa.address}</p>
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{villa.users?.length || 0} members</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card dark:bg-gray-900 border-t border-border p-4 space-y-2">
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Villa
        </button>
        <button
          onClick={() => setShowJoinForm(true)}
          className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium border border-indigo-600 hover:bg-indigo-50"
        >
          Join Villa with Code
        </button>
      </div>
    </div>
  );
}