import { createError } from "h3";

export type ToolCategory = "OFFICIAL" | "STUDENTS" | "RESOURCE";

export type ToolRow = {
  id: number;
  name: string;
  category: ToolCategory;
  url: string;
  source?: string | null;
  description?: string | null;
  emoji?: string | null;
  icon?: string | null;
};

export type ToolInput = {
  name: string;
  category: ToolCategory;
  url: string;
  source?: string | null;
  description?: string | null;
  emoji?: string | null;
  icon?: string | null;
};

export const TOOL_SELECT = "id,name,category,url,source,description,emoji,icon";

export const groupTools = (tools: ToolRow[]) => ({
  official: tools.filter((tool) => tool.category === "OFFICIAL"),
  students: tools.filter((tool) => tool.category === "STUDENTS"),
  resource: tools.filter((tool) => tool.category === "RESOURCE"),
});

export type MessageButton = {
  label: string;
  link: string;
  style: string;
};

export type MessageRow = {
  id: number;
  title: string;
  content: string;
  channelId: number;
  buttons?: MessageButton[] | unknown;
  createdAt: string;
  publishAt?: string | null;
  expiresAt?: string | null;
};

export type MessageInput = {
  title: string;
  content: string;
  channelId: number;
  buttons?: MessageButton[];
  publishAt?: string | null;
  expiresAt?: string | null;
};

export const MESSAGE_SELECT =
  "id,title,content,channelId:channel_id,buttons,createdAt:created_at,publishAt:publish_at,expiresAt:expires_at";

export const normalizeMessage = (message: MessageRow): MessageRow => ({
  ...message,
  buttons: Array.isArray(message.buttons)
    ? message.buttons.filter((button): button is MessageButton => {
        return Boolean(
          button &&
          typeof button === "object" &&
          "label" in button &&
          "link" in button &&
          "style" in button,
        );
      })
    : [],
});

export type PlanningRow = {
  id: number;
  start: string | Date;
  end: string | Date;
  module: string;
  summary: string;
  location: string;
  teachers: string[];
  group: string;
};

export const PLANNING_SELECT =
  "id,start:start_at,end:end_at,module,summary,location,teachers,group:group_name";

export type TaskRow = {
  id: number;
  moduleId: string;
  title: string;
  description?: string | null;
  groups?: unknown;
  files?: unknown;
  expected?: unknown;
  date?: string | null;
  deadline?: string | null;
};

export type Task = {
  id: number;
  moduleId: string;
  title: string;
  description?: string | null;
  groups: string[];
  files: unknown[];
  expected: unknown[];
  date?: string | null;
  deadline?: string | null;
};

export const TASK_SELECT =
  "id,moduleId:module_id,title,description,groups,files,expected,date,deadline";

export const normalizeTask = (task: TaskRow): Task => ({
  ...task,
  groups: Array.isArray(task.groups)
    ? task.groups.filter((group): group is string => typeof group === "string")
    : [],
  files: Array.isArray(task.files) ? task.files : [],
  expected: Array.isArray(task.expected) ? task.expected : [],
});

export type PlanningInput = {
  start: string | Date;
  end: string | Date;
  module: string;
  summary: string;
  location: string;
  teachers: string[];
  group: string;
};

export type TaskInput = {
  moduleId: string;
  title: string;
  description?: string | null;
  groups: string[];
  files: unknown[];
  expected: unknown[];
  date?: string | null;
  deadline?: string | null;
};

export const filterTasksForGroup = (tasks: Task[], group: string) =>
  tasks.filter(
    (task) => task.groups.includes("ALL") || task.groups.includes(group),
  );

export const throwDatabaseError = (scope: string, message?: string) => {
  throw createError({
    statusCode: 500,
    statusMessage: `Failed to load ${scope}.`,
    data: message ? { message } : undefined,
  });
};
