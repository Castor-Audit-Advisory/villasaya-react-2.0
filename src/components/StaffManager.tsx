import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Users, Plus, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  villaId: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  status: string;
  createdAt: string;
}

interface StaffManagerProps {
  villas: any[];
}

export function StaffManager({ villas }: StaffManagerProps) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<string>('');
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation',
  });

  const currentUserId = sessionStorage.getItem('user_id');

  useEffect(() => {
    if (villas.length > 0 && !selectedVilla) {
      setSelectedVilla(villas[0].id);
    }
  }, [villas]);

  useEffect(() => {
    if (selectedVilla) {
      loadLeaves();
    }
  }, [selectedVilla]);

  const loadLeaves = async () => {
    try {
      const { leaves } = await apiRequest(`/villas/${selectedVilla}/leave`);
      setLeaves(leaves || []);
    } catch (error: any) {
      console.error('Error loading leaves:', error);
      toast.error('Failed to load leave requests');
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/staff/leave', {
        method: 'POST',
        body: JSON.stringify({
          villaId: selectedVilla,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          type: formData.type,
        }),
      });

      toast.success('Leave request submitted!');
      setLeaveDialogOpen(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'vacation',
      });
      loadLeaves();
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      toast.error(error.message || 'Failed to submit leave request');
    }
  };

  const handleUpdateLeaveStatus = async (leaveId: string, status: string) => {
    try {
      await apiRequest(`/staff/leave/${leaveId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      toast.success(`Leave ${status}!`);
      loadLeaves();
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      toast.error(error.message || 'Failed to update leave status');
    }
  };

  const handleClockInOut = async (action: 'in' | 'out') => {
    try {
      await apiRequest('/staff/clock', {
        method: 'POST',
        body: JSON.stringify({
          villaId: selectedVilla,
          action,
          location: null, // In a real app, would get geolocation
        }),
      });

      toast.success(`Clocked ${action} successfully!`);
      setClockDialogOpen(false);
    } catch (error: any) {
      console.error('Error clocking in/out:', error);
      toast.error(error.message || 'Failed to clock in/out');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Staff Management</h2>
          <p className="text-gray-600">Manage staff, leave, and attendance</p>
        </div>
        <div className="flex gap-3">
          {villas.length > 0 && (
            <Select value={selectedVilla} onValueChange={setSelectedVilla}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!selectedVilla ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Select a villa to manage staff</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave Requests</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Clock In/Out</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <Dialog open={clockDialogOpen} onOpenChange={setClockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-40">
                        <Clock className="mr-2 h-5 w-5" />
                        Clock In
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clock In/Out</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Record your attendance for {villas.find(v => v.id === selectedVilla)?.name}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleClockInOut('in')}
                            className="flex-1"
                          >
                            Clock In
                          </Button>
                          <Button
                            onClick={() => handleClockInOut('out')}
                            variant="outline"
                            className="flex-1"
                          >
                            Clock Out
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-center text-sm text-gray-600">
                  <p>Current time: {new Date().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Request Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateLeave} className="space-y-4">
                      <div>
                        <Label htmlFor="type">Leave Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vacation">Vacation</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                          id="reason"
                          placeholder="Reason for leave..."
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Submit Request</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No leave requests
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="capitalize">{leave.type}</TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell>
                            {leave.status === 'pending' && leave.userId !== currentUserId && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateLeaveStatus(leave.id, 'approved')
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateLeaveStatus(leave.id, 'rejected')
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <CardTitle>Staff Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Roster management coming soon
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Schedule and assign staff shifts
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
