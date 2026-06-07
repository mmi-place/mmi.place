import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  services: {
    vencat: "/api/v1/services/vencat/planning",
    planup: "/api/v1/services/planup/tasks",
  },
}));
