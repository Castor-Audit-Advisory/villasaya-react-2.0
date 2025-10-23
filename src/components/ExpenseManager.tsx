import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  villaId: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  paidAt?: string;
}

interface ExpenseManagerProps {
  villas: any[];
}

export function ExpenseManager({ villas }: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVilla, setSelectedVilla] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'general',
    description: '',
  });

  useEffect(() => {
    if (villas.length > 0 && !selectedVilla) {
      setSelectedVilla(villas[0].id);
    }
  }, [villas]);

  useEffect(() => {
    if (selectedVilla) {
      loadExpenses();
    }
  }, [selectedVilla]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { expenses } = await apiRequest(`/villas/${selectedVilla}/expenses`);
      setExpenses(expenses || []);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          villaId: selectedVilla,
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
        }),
      });

      toast.success('Expense created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        amount: '',
        category: 'general',
        description: '',
      });
      loadExpenses();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast.error(error.message || 'Failed to create expense');
    }
  };

  const handleUpdateStatus = async (expenseId: string, status: string) => {
    try {
      await apiRequest(`/expenses/${expenseId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      toast.success(`Expense ${status}!`);
      loadExpenses();
    } catch (error: any) {
      console.error('Error updating expense status:', error);
      toast.error(error.message || 'Failed to update expense');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center w-fit">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-500 flex items-center w-fit">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center w-fit">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'paid':
        return (
          <Badge className="bg-green-500 flex items-center w-fit">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidAmount = expenses
    .filter((exp) => exp.status === 'paid')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingAmount = expenses
    .filter((exp) => exp.status === 'pending' || exp.status === 'approved')
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Expenses</h2>
          <p className="text-gray-600">Track and manage villa expenses</p>
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedVilla}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="title">Expense Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Pool maintenance"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (IDR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 500000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Expense details..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Expense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedVilla ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Select a villa to view expenses</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">Rp {totalAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-green-600">
                  Rp {paidAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-yellow-600">
                  Rp {pendingAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading expenses...
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expenses yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.title}</TableCell>
                        <TableCell className="capitalize">
                          {expense.category}
                        </TableCell>
                        <TableCell>
                          Rp {expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                        <TableCell>
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {expense.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateStatus(expense.id, 'approved')
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateStatus(expense.id, 'rejected')
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {expense.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(expense.id, 'paid')
                                }
                              >
                                Mark as Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
