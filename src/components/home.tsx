import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import WeatherSection from "./home/WeatherSection";
import TaskSummary from "./dashboard/TaskSummary";
import QuickAddTask from "./dashboard/QuickAddTask";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedTo?: string[];
}

const Home = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("farmTasks");
    if (savedTasks) {
      try {
        // Parse the JSON string and convert date strings back to Date objects
        const parsedTasks = JSON.parse(savedTasks, (key, value) => {
          if (key === "dueDate") return new Date(value);
          return value;
        });
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Error parsing saved tasks:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("farmTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Handlers for task actions
  const handleViewTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setCurrentTask(task);
      setIsNewTask(false);
      setIsDialogOpen(true);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setCurrentTask(task);
      setIsNewTask(false);
      setIsDialogOpen(true);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" as const } : task,
      ),
    );

    toast({
      title: "Task completed",
      description: "The task has been marked as completed.",
    });
  };

  const handleAddTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);

    toast({
      title: "Task added",
      description: "A new task has been added to your list.",
    });
  };

  const handleQuickAddTask = (taskData: any) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      dueDate: new Date(taskData.dueDate),
      priority: taskData.priority as "low" | "medium" | "high",
      status: "pending",
      assignedTo: taskData.assignedTo,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);

    toast({
      title: "Task added",
      description: "A new task has been added to your list.",
    });
  };

  const handleCreateNewTask = () => {
    const newTaskTemplate: Task = {
      id: "", // Will be set when saving
      title: "",
      description: "",
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      priority: "medium",
      status: "pending",
      assignedTo: ["John Farmer"],
    };

    setCurrentTask(newTaskTemplate);
    setIsNewTask(true);
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!currentTask) return;

    if (isNewTask) {
      // Create new task
      const newTask: Task = {
        ...currentTask,
        id: `task-${Date.now()}`,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);

      toast({
        title: "Task created",
        description: "A new task has been created successfully.",
      });
    } else {
      // Update existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === currentTask.id ? { ...currentTask } : task,
        ),
      );

      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    }

    setIsDialogOpen(false);
  };

  // Check for overdue tasks and update their status
  useEffect(() => {
    const now = new Date();
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (
          task.status === "pending" &&
          task.dueDate < now &&
          task.dueDate.toDateString() !== now.toDateString()
        ) {
          return { ...task, status: "overdue" as const };
        }
        return task;
      }),
    );
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6 bg-background">
        <h1 className="text-2xl font-bold">Farm Dashboard</h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Weather and Quick Add */}
          <div className="flex flex-col space-y-4 md:space-y-6">
            <WeatherSection />
            <QuickAddTask onTaskAdd={handleQuickAddTask} />
          </div>

          {/* Right Column - Task Summary (spans 2 columns on larger screens) */}
          <div className="md:col-span-1 lg:col-span-2 h-[500px] md:h-[600px]">
            <TaskSummary
              tasks={tasks}
              onViewTask={handleViewTask}
              onEditTask={handleEditTask}
              onCompleteTask={handleCompleteTask}
              onAddTask={handleCreateNewTask}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white rounded-lg border border-border">
          <h2 className="text-lg font-medium mb-2 md:mb-3">Quick Links</h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link to="/ai-chat" className="text-primary hover:underline">
              AI Crop Identification
            </Link>
            <Link to="/inventory" className="text-primary hover:underline">
              Inventory Management
            </Link>
            <Link to="/market" className="text-primary hover:underline">
              Market Prices
            </Link>
            <Link to="/settings" className="text-primary hover:underline">
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Task Edit/View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95%] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isNewTask ? "Create New Task" : "Edit Task"}
            </DialogTitle>
            <DialogDescription>
              {isNewTask
                ? "Add details for your new task"
                : "Make changes to the task details"}
            </DialogDescription>
          </DialogHeader>

          {currentTask && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={currentTask.title}
                  onChange={(e) =>
                    setCurrentTask({
                      ...currentTask,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentTask.description}
                  onChange={(e) =>
                    setCurrentTask({
                      ...currentTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={
                      currentTask.dueDate
                        ? currentTask.dueDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        dueDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={currentTask.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setCurrentTask({
                        ...currentTask,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isNewTask && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={currentTask.status}
                    onValueChange={(
                      value:
                        | "pending"
                        | "in-progress"
                        | "completed"
                        | "overdue",
                    ) =>
                      setCurrentTask({
                        ...currentTask,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger id="status">
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
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              {isNewTask ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Home;
