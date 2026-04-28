<script setup lang="ts">
import { motion } from "motion-v";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/24/solid";

import type { Task } from "~/composables/useTasks";

const { settings, saveSettings } = useSettings();
const { tasks, fetchTasks } = useTasks();

const taskFallback = (id: number) => {
  if (!settings.value.widgets.planup.tasks?.[id]) {
    settings.value.widgets.planup.tasks[id] = { status: "todo", tags: [] };
    saveSettings();
  }

  return (
    settings.value.widgets.planup.tasks?.[id] || {
      status: "todo",
      tags: [],
    }
  );
};

const activeTasks = computed(() => {
  return tasks.value.filter((t) =>
    ["todo", "in-progress"].includes(taskFallback(t.id).status),
  );
});

const nextTask = computed<Task | undefined>(() => {
  const active = activeTasks.value;
  if (!active.length) return undefined;

  return active.sort((a, b) => {
    const statusA = taskFallback(a.id).status;
    const statusB = taskFallback(b.id).status;

    if (statusA === statusB) {
      return (
        new Date(a.deadline || 0).getTime() -
        new Date(b.deadline || 0).getTime()
      );
    } else if (statusA === "in-progress") {
      return -1;
    } else {
      return 1;
    }
  })[0];
});

const remainingTaskCount = computed(() => activeTasks.value.length);

const formatDeadline = (date?: Date | string | null) => {
  if (!date) return "Pas de date";
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diff = d.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "En retard";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `${days}j restant${days > 1 ? "s" : ""}`;
};

const openPlanUP = () => {
  if (process.client) {
    window.open("https://planup.mmi.codes", "_blank");
  }
};

const goToSettings = async () => {
  await navigateTo("/settings?tab=widgets");
};

onMounted(() => {
  fetchTasks();
});

watch(
  () => settings.value.widgets.planup.group,
  () => {
    fetchTasks();
  },
  { immediate: true },
);
</script>
<template>
  <motion.div
    v-if="nextTask && remainingTaskCount > 0"
    class="flex flex-col gap-4 bg-surface hover:bg-surface-hover/50 border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6 w-full cursor-pointer transition-all"
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.3 }"
    @click="openPlanUP"
  >
    <!-- Header avec titre et badge -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="flex items-center justify-center bg-primary/10 text-2xl border border-primary/10 rounded-xl w-12 h-12"
        >
          <ClipboardDocumentListIcon class="text-primary w-6 h-6" />
        </div>
        <div class="flex flex-col">
          <h3 class="text-lg font-bold text-foreground">Tâches</h3>
          <p class="text-xs text-subtext">Propulsé par PlanUP</p>
        </div>
      </div>
      <div
        class="flex items-center justify-center gap-1 bg-primary/10 text-primary rounded-full h-10 font-bold text-sm max-sm:w-10 sm:px-4"
      >
        {{ remainingTaskCount }}
        <span class="max-sm:hidden"> tâches restantes</span>
      </div>
    </div>

    <!-- Next task card -->
    <motion.div
      class="bg-surface-hover/30 border border-surface-border/50 rounded-2xl p-4 flex flex-col gap-2"
      :whileHover="{ scale: 1.01 }"
      :transition="{ duration: 0.3 }"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p
            class="text-xs font-semibold text-subtext uppercase tracking-wider"
          >
            {{ nextTask.moduleId }}
          </p>
          <h4 class="font-bold text-foreground line-clamp-2 mt-1">
            {{ nextTask.title }}
          </h4>
        </div>
        <span
          v-if="taskFallback(nextTask.id).status === 'in-progress'"
          class="bg-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-semibold shrink-0"
        >
          En cours
        </span>
      </div>

      <p v-if="nextTask.description" class="text-sm text-subtext line-clamp-1">
        {{ nextTask.description }}
      </p>

      <!-- Deadline indicator -->
      <div
        class="flex items-center gap-1 mt-2 text-xs font-semibold"
        :class="{
          'text-danger': new Date(nextTask.deadline || 0) < new Date(),
          'text-amber-500':
            new Date(nextTask.deadline || 0).toDateString() ===
            new Date().toDateString(),
        }"
      >
        <ClipboardDocumentListIcon class="w-4 h-4" />
        {{ formatDeadline(nextTask.deadline) }}
      </div>
    </motion.div>

    <!-- Action button -->
    <Button
      label="Ouvrir PlanUP"
      btnStyle="LINK"
      handler="https://planup.mmi.codes"
      class="mx-auto"
      @click.stop
    />
  </motion.div>

  <!-- No group selected -->
  <motion.div
    v-else-if="!settings.widgets.planup.group"
    class="flex flex-col items-center justify-center gap-4 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6 w-full h-full"
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.3 }"
  >
    <ExclamationCircleIcon class="w-12 h-12 text-subtext/50" />
    <p class="text-subtext font-medium text-center">
      Configurez votre groupe MMI pour voir vos tâches.
    </p>
    <Button
      label="Choisir mon groupe"
      btnStyle="PRIMARY"
      :handler="goToSettings"
    />
  </motion.div>

  <!-- All tasks done -->
  <motion.div
    v-else
    class="flex flex-col justify-center items-center gap-3 bg-surface border border-surface-border rounded-3xl shadow-2xl shadow-black/5 px-7 py-6 w-full h-full"
    :initial="{ opacity: 0, scale: 0.9 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.3 }"
  >
    <CheckCircleIcon class="w-16 h-16 text-success" />
    <div class="text-center">
      <h3 class="text-2xl font-bold text-foreground">Parfait !</h3>
      <p class="text-sm text-subtext">Vous n'avez aucune tâche en attente.</p>
    </div>
  </motion.div>
</template>
