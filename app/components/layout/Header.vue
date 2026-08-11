<script setup lang="ts">
import {
  AdjustmentsHorizontalIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/vue/24/outline";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/vue/24/solid";
import HeaderMessage from "../cards/HeaderMessage.vue";
import HeaderCourse from "../cards/HeaderCourse.vue";
import HeaderPlanup from "../cards/HeaderPlanup.vue";
import { motion } from "motion-v";

const { settings } = useSettings();
const { session } = useSession();
const { messages, fetchMessages } = useMessages();
const widget = ref<number>(0);

const widgets = computed(() => {
  const list: any[] = [];
  if (settings.value.widgets.vencat.enabled) list.push(HeaderCourse);
  if (settings.value.widgets.messages.enabled) list.push(HeaderMessage);
  if (settings.value.widgets.planup?.enabled) list.push(HeaderPlanup);
  return list;
});

let widgetInterval: ReturnType<typeof setInterval> | undefined;

const clearWidgetInterval = () => {
  if (!widgetInterval) return;
  clearInterval(widgetInterval);
  widgetInterval = undefined;
};

const startWidgetInterval = () => {
  clearWidgetInterval();
  if (!settings.value.widgets.carrousel || widgets.value.length <= 1) return;
  widgetInterval = setInterval(() => {
    if (widgets.value.length > 0) {
      widget.value = (widget.value + 1) % widgets.value.length;
    }
  }, settings.value.widgets.carrouselRate);
};

onMounted(() => {
  document.addEventListener("keypress", (event) => {
    if (!widgets.value.length) return;
    const target = event.target as HTMLElement;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      return;
    if (event.key === "+") {
      widget.value =
        (widget.value - 1 + widgets.value.length) % widgets.value.length;
    } else if (event.key === "-") {
      widget.value = (widget.value + 1) % widgets.value.length;
    }
  });
  startWidgetInterval();
});

onUnmounted(() => {
  clearWidgetInterval();
});

watch(
  () => [
    settings.value.widgets.carrousel,
    settings.value.widgets.carrouselRate,
    widgets.value.length,
  ],
  () => {
    if (widget.value >= widgets.value.length) {
      widget.value = Math.max(0, widgets.value.length - 1);
    }
    startWidgetInterval();
  },
);
</script>
<template>
  <header class="container grid xl:grid-cols-12">
    <div
      class="flex flex-col gap-2 justify-center col-span-1 p-4 md:p-8 md:space-y-4 xl:col-span-6 xl:row-1"
    >
      <h1 v-if="session" class="text-4xl font-bold">
        Bonjour,
        <span class="text-primary underline decoration-4">{{
          session?.firstName || "MMI"
        }}</span>
        !
      </h1>
      <h1 v-else class="text-4xl font-bold">Tableau de bord</h1>
      <p class="text-xl text-subtext max-md:hidden">
        Espace reserve aux etudiants MMI. Retrouvez au meme endroit vos outils,
        ressources, messages campus et widgets utiles dans une interface plus
        complete.
      </p>
      <div class="flex gap-2 overflow-x-auto">
        <Button :icon="AdjustmentsHorizontalIcon" handler="/settings" />
        <div class="flex gap-6 ml-4 overflow-x-auto">
          <Button
            v-for="link in settings.customization.links"
            :label="link.name"
            btnStyle="LINK"
            :handler="link.url"
          />
        </div>
      </div>
    </div>

    <div
      v-if="widgets.length > 0"
      class="flex flex-col gap-2 h-80 xl:col-start-8 xl:col-span-5"
    >
      <div class="flex justify-center items-center gap-2">
        <Button
          v-if="settings.widgets.messages.enabled"
          :icon="ChatBubbleOvalLeftEllipsisIcon"
          :handler="() => { widget = widgets.indexOf(HeaderMessage); }"
          :btnStyle="widget === widgets.indexOf(HeaderMessage) ? 'PRIMARY' : 'NEUTRAL'"
        />
        <Button
          v-if="settings.widgets.planup?.enabled"
          :icon="CalendarIcon"
          :handler="() => { widget = widgets.indexOf(HeaderPlanup); }"
          :btnStyle="widget === widgets.indexOf(HeaderPlanup) ? 'PRIMARY' : 'NEUTRAL'"
        />
        <Button
          v-if="settings.widgets.vencat.enabled"
          :icon="ClipboardDocumentListIcon"
          :handler="() => { widget = widgets.indexOf(HeaderCourse); }"
          :btnStyle="widget === widgets.indexOf(HeaderCourse) ? 'PRIMARY' : 'NEUTRAL'"
        />
      </div>
      <div
        class="flex flex-row-reverse items-center gap-2 h-80 xl:col-start-8 xl:col-span-5"
        @mouseenter="clearWidgetInterval"
        @mouseleave="startWidgetInterval"
      >
        <div
          class="group shrink-0 flex items-center gap-2 w-fit"
          v-if="widget === widgets.indexOf(HeaderMessage) && settings.widgets.messages.enabled"
        >
          <motion.div
            v-for="m in messages"
            :key="m.id"
            class="cursor-pointer rounded-full w-4 h-2"
            :class="m.id === messages[widget]?.id ? 'bg-primary' : 'bg-button'"
            :initial="{ opacity: 0, scale: 0.5 }"
            :animate="{
              opacity: 1,
              scale: 1,
              width: m.id === messages[widget]?.id ? 24 : 16,
            }"
            :transition="{ duration: 0.3 }"
            @click="widget = messages.indexOf(m)"
          />
        </div>
        <component :is="widgets[widget]" />
      </div>
    </div>
  </header>
</template>
