import React from "react";
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignedTo?: string[];
}

interface TaskSummaryProps {
  tasks?: Task[];
  onViewTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onAddTask?: (task: Omit<Task, "id">) => void;
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

const TaskSummary = ({
  tasks = defaultTasks,
  onViewTask = () => {},
  onEditTask = () => {},
  onCompleteTask = () => {},
  onAddTask = () => {},
}: TaskSummaryProps) => {
  // Group tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const overdueTasks = tasks.filter((task) => task.status === "overdue");
  const completedTasks = tasks.filter((task) => task.status === "completed");

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

  // Render task card
  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      className={cn(
        "mb-4 hover:shadow-md transition-shadow",
        task.status === "overdue" && "border-red-300",
        task.status === "completed" && "opacity-75",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditTask(task.id)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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
      <CardFooter className="pt-2 p-3 sm:p-6 flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewTask(task.id)}
          className="w-full sm:w-auto"
        >
          View Details
        </Button>
        {task.status !== "completed" && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onCompleteTask(task.id)}
            className={cn(
              "w-full sm:w-auto",
              task.status === "overdue" ? "bg-red-500 hover:bg-red-600" : "",
            )}
          >
            {task.status === "overdue" ? "Mark Complete" : "Complete"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="bg-background dark:bg-gray-800 rounded-xl border border-border p-4 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold">Task Summary</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue: {overdueTasks.length}
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Pending: {pendingTasks.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="ml-0 sm:ml-2"
            onClick={() => {
              const newTask = {
                title: "New Task",
                description: "Click to edit this task",
                dueDate: new Date(Date.now() + 86400000),
                priority: "medium" as const,
                status: "pending" as const,
                assignedTo: ["John Farmer"],
              };
              onAddTask(newTask);
            }}
            asChild
          >
            <Link to="/task-planner" className="flex items-center gap-1">
              + Add Task
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[500px] md:max-h-[600px]">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-red-600 font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> Overdue Tasks
            </h3>
            {overdueTasks.map(renderTaskCard)}
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-blue-600 font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Pending Tasks
            </h3>
            {pendingTasks.map(renderTaskCard)}
          </div>
        )}

        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-yellow-600 font-medium mb-2 flex items-center">
              <CalendarCheck className="h-4 w-4 mr-1" /> In Progress
            </h3>
            {inProgressTasks.map(renderTaskCard)}
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-green-600 font-medium mb-2 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
            </h3>
            {completedTasks.map(renderTaskCard)}
          </div>
        )}

        {/* No Tasks */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks available. Create a new task to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSummary;
