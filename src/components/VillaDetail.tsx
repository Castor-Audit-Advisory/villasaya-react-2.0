import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { usePermissions, PermissionGuard } from '../utils/permissions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Villa {
  id: string;
  name: string;
  address: string;
  leaseDetails?: any;
  users: Array<{ userId: string; role: string; permissions: string[] }>;
  createdBy: string;
}

interface VillaDetailProps {
  villa: Villa;
  onBack: () => void;
}

export function VillaDetail({ villa, onBack }: VillaDetailProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('tenant');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const permissions = usePermissions(villa.id);
  const canInvite = permissions?.hasPermission('villa.invite') || false;

  const handleGenerateInvite = async () => {
    try {
      const { inviteCode } = await apiRequest(`/villas/${villa.id}/invite`, {
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
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Villas
        </Button>
        {canInvite && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Invite Users
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Invite Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">Role for Invited User</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landlord">Landlord</SelectItem>
                      <SelectItem value="property_agent">Property Agent</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!generatedCode ? (
                  <Button onClick={handleGenerateInvite} className="w-full">
                    Generate Code
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label>Invite Code</Label>
                    <div className="flex gap-2">
                      <Input value={generatedCode} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Share this code with the user to invite them to this villa.
                      Code expires in 7 days.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{villa.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="lease">Lease Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label>Address</Label>
                <p className="text-gray-700">{villa.address}</p>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div>
                <Label className="mb-3 block">Villa Members</Label>
                <div className="space-y-2">
                  {villa.users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p>User {index + 1}</p>
                        <p className="text-sm text-gray-600">ID: {user.userId}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lease" className="space-y-4">
              {villa.leaseDetails && Object.keys(villa.leaseDetails).length > 0 ? (
                <>
                  {villa.leaseDetails.startDate && (
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-gray-700">{villa.leaseDetails.startDate}</p>
                    </div>
                  )}
                  {villa.leaseDetails.duration && (
                    <div>
                      <Label>Duration</Label>
                      <p className="text-gray-700">
                        {villa.leaseDetails.duration} months
                      </p>
                    </div>
                  )}
                  {villa.leaseDetails.rent && (
                    <div>
                      <Label>Monthly Rent</Label>
                      <p className="text-gray-700">
                        Rp {Number(villa.leaseDetails.rent).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">No lease information available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
