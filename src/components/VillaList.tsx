import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Building2, Plus, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Villa {
  id: string;
  name: string;
  address: string;
  leaseDetails?: any;
  users: Array<{ userId: string; role: string }>;
}

interface VillaListProps {
  onVillaSelect: (villa: Villa) => void;
}

export function VillaList({ onVillaSelect }: VillaListProps) {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    leaseStartDate: '',
    leaseDuration: '',
    rent: '',
  });
  const [inviteCode, setInviteCode] = useState('');

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
    try {
      const leaseDetails = {
        startDate: formData.leaseStartDate,
        duration: formData.leaseDuration,
        rent: formData.rent,
      };

      await apiRequest('/villas', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          leaseDetails,
        }),
      });

      toast.success('Villa created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        name: '',
        address: '',
        leaseStartDate: '',
        leaseDuration: '',
        rent: '',
      });
      loadVillas();
    } catch (error: any) {
      console.error('Error creating villa:', error);
      toast.error(error.message || 'Failed to create villa');
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
      setJoinDialogOpen(false);
      setInviteCode('');
      loadVillas();
    } catch (error: any) {
      console.error('Error joining villa:', error);
      toast.error(error.message || 'Failed to join villa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading villas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">My Villas</h2>
          <p className="text-gray-600">Manage your villa properties</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Join Villa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Villa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleJoinVilla} className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Join Villa</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Villa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Villa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVilla} className="space-y-4">
                <div>
                  <Label htmlFor="name">Villa Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Villa Sunset"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter villa address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                  <Input
                    id="leaseStartDate"
                    type="date"
                    value={formData.leaseStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaseStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="leaseDuration">Lease Duration (months)</Label>
                  <Input
                    id="leaseDuration"
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.leaseDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaseDuration: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rent">Monthly Rent</Label>
                  <Input
                    id="rent"
                    type="number"
                    placeholder="e.g., 5000000"
                    value={formData.rent}
                    onChange={(e) =>
                      setFormData({ ...formData, rent: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Villa</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {villas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="mb-2">No villas yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first villa or join one with an invite code
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {villas.map((villa) => (
            <Card
              key={villa.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onVillaSelect(villa)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-indigo-600" />
                  {villa.name}
                </CardTitle>
                <CardDescription className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{villa.address}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {villa.users?.length || 0} member(s)
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
