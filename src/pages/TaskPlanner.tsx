import React, { useState } from "react";
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Filter,
  SortDesc,
  User,
  X,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedTo?: string[];
}

const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Irrigation System Maintenance",
    description: "Check and repair any leaks in the drip irrigation system",
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    priority: "high",
    status: "pending",
    assignedTo: ["John Farmer"],
  },
  {
    id: "task-2",
    title: "Apply Fertilizer to North Field",
    description: "Apply organic fertilizer to the north corn field",
    dueDate: new Date(Date.now() + 172800000), // day after tomorrow
    priority: "medium",
    status: "pending",
  },
  {
    id: "task-3",
    title: "Harvest Tomatoes",
    description: "Harvest ripe tomatoes from greenhouse #2",
    dueDate: new Date(Date.now() - 86400000), // yesterday
    priority: "high",
    status: "overdue",
  },
  {
    id: "task-4",
    title: "Equipment Maintenance",
    description: "Service the tractor and check oil levels",
    dueDate: new Date(Date.now() + 259200000), // 3 days from now
    priority: "low",
    status: "in-progress",
  },
  {
    id: "task-5",
    title: "Fence Repair",
    description: "Fix damaged fence in the south pasture",
    dueDate: new Date(Date.now() - 172800000), // 2 days ago
    priority: "medium",
    status: "completed",
  },
];

// Available farm workers for task assignment
const availableWorkers = [
  "John Farmer",
  "Sarah Miller",
  "David Johnson",
  "Maria Garcia",
  "Robert Smith",
];

const TaskPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 86400000), // tomorrow by default
    priority: "medium",
    status: "pending",
    assignedTo: [],
  });

  // Selected workers for assignment
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get priority badge color
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Completed
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "in-progress":
        return <CalendarCheck className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Handle marking a task as complete
  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task,
      ),
    );
  };

  // Handle editing a task
  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask(taskToEdit);
      setSelectedWorkers(taskToEdit.assignedTo || []);
      setIsEditTaskDialogOpen(true);
    }
  };

  // Handle updating a task
  const handleUpdateTask = () => {
    if (selectedTask) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id ? { ...selectedTask } : task,
        ),
      );
      setIsEditTaskDialogOpen(false);
      setSelectedTask(null);
      setSelectedWorkers([]);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete) {
      setSelectedTask(taskToDelete);
      setIsDeleteConfirmOpen(true);
    }
  };

  // Confirm delete task
  const confirmDeleteTask = () => {
    if (selectedTask) {
      setTasks(tasks.filter((task) => task.id !== selectedTask.id));
      setIsDeleteConfirmOpen(false);
      setSelectedTask(null);
    }
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return task.status === "pending";
    if (activeTab === "in-progress") return task.status === "in-progress";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "overdue") return task.status === "overdue";
    return true;
  });

  // Render task card
  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      className={`mb-4 hover:shadow-md transition-shadow ${task.status === "overdue" ? "border-red-300" : ""} ${task.status === "completed" ? "opacity-75" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "completed" && (
                <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {getPriorityBadge(task.priority)}
          {getStatusBadge(task.status)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span>Assigned to: {task.assignedTo.join(", ")}</span>
          </div>
        )}
      </CardContent>
      {task.status !== "completed" && (
        <CardFooter>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleCompleteTask(task.id)}
            className={
              task.status === "overdue" ? "bg-red-500 hover:bg-red-600" : ""
            }
          >
            {task.status === "overdue" ? "Mark Complete" : "Complete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Planner</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortDesc className="h-4 w-4 mr-2" /> Sort
          </Button>
          <Dialog
            open={isAddTaskDialogOpen}
            onOpenChange={setIsAddTaskDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={new Date(
                      newTask.dueDate.getTime() -
                        newTask.dueDate.getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueDate: new Date(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({
                        ...newTask,
                        priority: value as "low" | "medium" | "high",
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Assign To</Label>
                  <div className="col-span-3">
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          if (!selectedWorkers.includes(value)) {
                            setSelectedWorkers([...selectedWorkers, value]);
                            setNewTask({
                              ...newTask,
                              assignedTo: [...selectedWorkers, value],
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkers.map((worker) => (
                            <SelectItem key={worker} value={worker}>
                              {worker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add custom worker"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              e.currentTarget.value.trim()
                            ) {
                              const newWorker = e.currentTarget.value.trim();
                              if (!selectedWorkers.includes(newWorker)) {
                                setSelectedWorkers([
                                  ...selectedWorkers,
                                  newWorker,
                                ]);
                                setNewTask({
                                  ...newTask,
                                  assignedTo: [...selectedWorkers, newWorker],
                                });
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedWorkers.map((worker) => (
                        <Badge
                          key={worker}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          {worker}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => {
                              const updatedWorkers = selectedWorkers.filter(
                                (w) => w !== worker,
                              );
                              setSelectedWorkers(updatedWorkers);
                              setNewTask({
                                ...newTask,
                                assignedTo: updatedWorkers,
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddTaskDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Add the new task to the tasks array
                    const taskId = `task-${Date.now()}`;
                    const taskToAdd = {
                      id: taskId,
                      ...newTask,
                    };
                    setTasks([...tasks, taskToAdd]);

                    // Reset form
                    setNewTask({
                      title: "",
                      description: "",
                      dueDate: new Date(Date.now() + 86400000),
                      priority: "medium",
                      status: "pending",
                      assignedTo: [],
                    });
                    setSelectedWorkers([]);
                    setIsAddTaskDialogOpen(false);
                  }}
                >
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={setIsEditTaskDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={selectedTask.title}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="datetime-local"
                  value={new Date(
                    selectedTask.dueDate.getTime() -
                      selectedTask.dueDate.getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      dueDate: new Date(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={selectedTask.priority}
                  onValueChange={(value) =>
                    setSelectedTask({
                      ...selectedTask,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={selectedTask.status}
                  onValueChange={(value) =>
                    setSelectedTask({
                      ...selectedTask,
                      status: value as
                        | "pending"
                        | "in-progress"
                        | "completed"
                        | "overdue",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Assign To</Label>
                <div className="col-span-3">
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (!selectedWorkers.includes(value)) {
                          setSelectedWorkers([...selectedWorkers, value]);
                          setSelectedTask({
                            ...selectedTask,
                            assignedTo: [...selectedWorkers, value],
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWorkers.map((worker) => (
                          <SelectItem key={worker} value={worker}>
                            {worker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedWorkers.map((worker) => (
                      <Badge
                        key={worker}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <User className="h-3 w-3" />
                        {worker}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => {
                            const updatedWorkers = selectedWorkers.filter(
                              (w) => w !== worker,
                            );
                            setSelectedWorkers(updatedWorkers);
                            setSelectedTask({
                              ...selectedTask,
                              assignedTo: updatedWorkers,
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTaskDialogOpen(false);
                setSelectedTask(null);
                setSelectedWorkers([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task "{selectedTask?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setSelectedTask(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTaskCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks available. Create a new task to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTaskCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending tasks available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTaskCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No in-progress tasks available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTaskCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed tasks available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderTaskCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No overdue tasks available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskPlanner;
