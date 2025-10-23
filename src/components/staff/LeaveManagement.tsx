import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

interface LeaveManagementProps {
  villaId?: string;
}

export function LeaveManagement({ villaId }: LeaveManagementProps) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, [villaId]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const url = villaId ? `/staff/leave?villaId=${villaId}` : '/staff/leave';
      const { leaves: fetchedLeaves } = await apiRequest(url);
      setLeaves(fetchedLeaves || []);
    } catch (error: any) {
      console.error('Error loading leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!villaId) {
      toast.error('Please select a villa');
      return;
    }

    try {
      await apiRequest('/staff/leave', {
        method: 'POST',
        body: JSON.stringify({
          villaId,
          ...formData,
        }),
      });

      toast.success('Leave request submitted!');
      setFormData({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setDialogOpen(false);
      loadLeaves();
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      toast.error(error.message || 'Failed to submit request');
    }
  };

  const handleCancel = async (leaveId: string) => {
    if (!confirm('Cancel this leave request?')) return;

    try {
      await apiRequest(`/staff/leave/${leaveId}`, {
        method: 'DELETE',
      });
      toast.success('Leave request cancelled');
      loadLeaves();
    } catch (error: any) {
      console.error('Error cancelling leave:', error);
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'outline', icon: XCircle, color: 'text-gray-600' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="capitalize">
        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const renderLeaveList = (status?: string) => {
    const filteredLeaves = status
      ? leaves.filter((l) => l.status === status)
      : leaves;

    if (filteredLeaves.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {status ? status : ''} leave requests
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredLeaves.map((leave) => (
          <Card key={leave.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {leave.type} Leave
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(leave.status)}
              </div>

              {leave.reason && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                  {leave.reason}
                </p>
              )}

              {leave.status === 'rejected' && leave.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg mb-3">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700">{leave.rejectionReason}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>{leave.days} {leave.days === 1 ? 'day' : 'days'}</span>
                  <span>Submitted {formatDate(leave.createdAt)}</span>
                </div>
                {leave.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(leave.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const leaveCounts = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Leave Requests</h2>
          <p className="text-gray-600">Manage your time off</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!villaId}>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <SelectItem value="emergency">Emergency</SelectItem>
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

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-medium text-indigo-900">
                    Total: {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Provide a reason for your leave request..."
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leaveCounts.all}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {leaveCounts.pending}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {leaveCounts.approved}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {leaveCounts.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({leaveCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({leaveCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({leaveCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({leaveCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderLeaveList()}
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          {renderLeaveList('pending')}
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          {renderLeaveList('approved')}
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          {renderLeaveList('rejected')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
