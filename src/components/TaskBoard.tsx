import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { usePermissions, PermissionGuard } from '../utils/permissions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, CheckSquare, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  villaId: string;
  title: string;
  description: string;
  assignedTo: string[];
  supervisorId?: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskBoardProps {
  villas: any[];
}

export function TaskBoard({ villas }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVilla, setSelectedVilla] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const currentUserId = sessionStorage.getItem('user_id');

  useEffect(() => {
    if (villas.length > 0 && !selectedVilla) {
      setSelectedVilla(villas[0].id);
    }
  }, [villas]);

  useEffect(() => {
    if (selectedVilla) {
      loadTasks();
    }
  }, [selectedVilla]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { tasks } = await apiRequest(`/villas/${selectedVilla}/tasks`);
      setTasks(tasks || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          villaId: selectedVilla,
          title: formData.title,
          description: formData.description,
          assignedTo: [currentUserId], // Assigning to self for demo
          dueDate: formData.dueDate || null,
        }),
      });

      toast.success('Task created successfully!');
      setCreateDialogOpen(false);
      setFormData({ title: '', description: '', dueDate: '' });
      loadTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      toast.success('Task status updated!');
      loadTasks();
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task');
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Tasks</h2>
          <p className="text-gray-600">Manage and track villa tasks</p>
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
          <PermissionGuard 
            permission="task.create" 
            villaId={selectedVilla || undefined}
            fallback={null}
          >
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedVilla}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Clean pool area"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task details..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </PermissionGuard>
        </div>
      </div>

      {!selectedVilla ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Select a villa to view tasks</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading tasks...</div>
        </div>
      ) : (
        <Tabs defaultValue="board" className="w-full">
          <TabsList>
            <TabsTrigger value="board">Board View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="board">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pending Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-yellow-600" />
                    Pending
                  </h3>
                  <Badge variant="secondary">{pendingTasks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleUpdateStatus}
                    />
                  ))}
                  {pendingTasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No pending tasks
                    </p>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
                    In Progress
                  </h3>
                  <Badge variant="secondary">{inProgressTasks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleUpdateStatus}
                    />
                  ))}
                  {inProgressTasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No tasks in progress
                    </p>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    Completed
                  </h3>
                  <Badge variant="secondary">{completedTasks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleUpdateStatus}
                    />
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No completed tasks
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleUpdateStatus}
                  listView
                />
              ))}
              {tasks.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckSquare className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600">No tasks yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  listView?: boolean;
}

function TaskCard({ task, onStatusChange, listView }: TaskCardProps) {
  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="secondary">{task.status}</Badge>;
    }
  };

  return (
    <Card className={listView ? '' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{task.title}</CardTitle>
          {!listView && getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}
        {task.dueDate && (
          <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
        )}
        {listView && <div>{getStatusBadge()}</div>}
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(task.id, 'in_progress')}
            >
              Start
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(task.id, 'completed')}
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
