import React, { useState } from "react";
import { CalendarCheck, Clock, Tag, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickAddTaskProps {
  onTaskAdd?: (task: TaskData) => void;
  isOpen?: boolean;
}

interface TaskData {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedTo: string[];
}

const QuickAddTask = ({
  onTaskAdd = () => {},
  isOpen = true,
}: QuickAddTaskProps) => {
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    assignedTo: ["John Farmer"],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setTaskData((prev) => ({ ...prev, priority: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskAdd(taskData);
    // Reset form after submission
    setTaskData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: ["John Farmer"],
    });
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-[350px] bg-background shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CalendarCheck className="mr-2 h-5 w-5 text-primary" />
          Quick Add Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="title"
              placeholder="Task title"
              value={taskData.title}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              name="description"
              placeholder="Brief description"
              value={taskData.description}
              onChange={handleChange}
              className="w-full resize-none"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 flex-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select
                value={taskData.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1 flex-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Assigned to you
            </span>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button variant="ghost" size="sm" type="button">
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Add Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuickAddTask;
