import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  version: "v1",
  collections: {
    channels: "/api/v1/channels",
    academicGroups: "/api/v1/academic-groups",
    tools: "/api/v1/tools",
    messages: "/api/v1/messages",
  },
  services: {
    vencat: "/api/v1/services/vencat/planning",
    planup: "/api/v1/services/planup/tasks",
  },
}));
