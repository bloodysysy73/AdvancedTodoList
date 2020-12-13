import { SubTask } from "../../subtasks/shared/subtaskTypes";

export interface Todo {
  key?: string;
  task?: string;
  deadline?: string;
  importance?: number;
  subtasks?: SubTask[];
  creationDate?: string;
  isdone: boolean;
  numberdaysleft?: number;
  urgency?: number;
  order?: number;
  tags?: string[];
}
