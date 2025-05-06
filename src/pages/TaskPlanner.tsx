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

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return task.status === "pending";
    if (activeTab === "in-progress") return task.status === "in-progress";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "overdue") return task.status === "overdue";
    return true;
  });

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
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="mb-4 hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
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
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks available. Create a new task to get started.</p>
            </div>
          )}
        </TabsContent>

        {/* Other tab contents will show the same content, filtered by the tab value */}
        <TabsContent value="pending" className="space-y-4">
          {/* Same content as "all" but filtered */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="mb-4 hover:shadow-md transition-shadow"
              >
                {/* Same card content as above */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
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
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending tasks available.</p>
            </div>
          )}
        </TabsContent>

        {/* Similar content for other tabs */}
        <TabsContent value="in-progress" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="mb-4 hover:shadow-md transition-shadow"
              >
                {/* Card content */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
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
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No in-progress tasks available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* Similar content */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="mb-4 hover:shadow-md transition-shadow opacity-75"
              >
                {/* Card content */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
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
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed tasks available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {/* Similar content */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="mb-4 hover:shadow-md transition-shadow border-red-300"
              >
                {/* Card content */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
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
              </Card>
            ))
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
