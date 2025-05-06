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
    <Card className="w-full max-w-full md:max-w-[350px] bg-background shadow-md">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg flex items-center">
          <CalendarCheck className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Quick Add Task
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <Input
              name="title"
              placeholder="Task title"
              value={taskData.title}
              onChange={handleChange}
              className="w-full text-sm"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Textarea
              name="description"
              placeholder="Brief description"
              value={taskData.description}
              onChange={handleChange}
              className="w-full resize-none text-sm"
              rows={2}
            />
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
            <div className="flex items-center space-x-1 w-full xs:flex-1">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select
                value={taskData.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs sm:text-sm">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs sm:text-sm">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-xs sm:text-sm">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1 w-full xs:flex-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Assigned to you
            </span>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-0 p-3 sm:p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="h-7 sm:h-8 text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          className="h-7 sm:h-8 text-xs sm:text-sm"
        >
          Add Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuickAddTask;
