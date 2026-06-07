<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  name: "Panel Administrateur",
  title: "MMI Place - Panel Administrateur",
});

import {
  deleteUserForAdmin,
  insert,
  listProfilesForAdmin,
  query,
  remove,
  update,
  updateProfileActiveStateForAdmin,
  updateProfileRoleForAdmin,
} from "@mmiplace/mmi-core";
import type { Profile, Role } from "@mmiplace/mmi-core";
import type { Tool } from "~/composables/useTools";
import type { Message } from "~/composables/useMessages";

type AdminTab = "publications" | "catalogue" | "users";
type ToolCategory = "OFFICIAL" | "STUDENTS" | "RESOURCE";
type MessageButtonStyle = "NEUTRAL" | "PRIMARY" | "SUCCESS" | "DANGER" | "LINK";
type ManagedMessageButton = { label: string; link: string; style: MessageButtonStyle };
type ToolDraft = {
  id: number | null;
  name: string;
  category: ToolCategory;
  url: string;
  source: string;
  description: string;
  emoji: string;
  icon: string;
};
type MessageDraft = {
  id: number | null;
  title: string;
  content: string;
  channelId: number;
  buttons: ManagedMessageButton[];
  publishAt: string;
  expiresAt: string;
};

const { session } = useSession();
const { tools, fetchTools } = useTools();
const { channels, fetchChannels } = useChannels();
const { publishMessage, updateMessage, deleteMessage: removeMessage } = useMessages();

const activeTab = ref<AdminTab>("publications");
const managedMessages = ref<Message[]>([]);
const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null);

const managedUsers = ref<Profile[]>([]);
const usersCount = ref(0);
const usersLoading = ref(false);
const usersError = ref("");
const userActionLoadingId = ref<string | null>(null);
const userActionMessage = ref("");
const userActionError = ref("");
const selectedUserId = ref<string | null>(null);
const userSearch = ref("");
const userPage = ref(0);
const USER_PAGE_SIZE = 10;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const defaultToolForm = (): ToolDraft => ({
  id: null,
  name: "",
  category: "OFFICIAL",
  url: "",
  source: "",
  description: "",
  emoji: "",
  icon: "",
});

const defaultMessageForm = (): MessageDraft => ({
  id: null,
  title: "",
  content: "",
  channelId: channels.value[0]?.id ?? 0,
  buttons: [],
  publishAt: "",
  expiresAt: "",
});

const toolForm = ref<ToolDraft>(defaultToolForm());
const messageForm = ref<MessageDraft>(defaultMessageForm());

const toolActionLoading = ref(false);
const toolActionError = ref("");
const toolActionSuccess = ref("");
const messageActionLoading = ref(false);
const messageActionError = ref("");
const messageActionSuccess = ref("");

const canManage = computed(() => !!session.value && ["admin", "editor"].includes(session.value.role));
const canManageUsers = computed(() => session.value?.role === "admin");
const isEditingTool = computed(() => toolForm.value.id !== null);
const isEditingMessage = computed(() => messageForm.value.id !== null);

const managedTools = computed<Tool[]>(() =>
  [...tools.value.official, ...tools.value.students, ...tools.value.resource].sort((a, b) => a.name.localeCompare(b.name, "fr")),
);

const selectedUser = computed(() => managedUsers.value.find((user) => user.id === selectedUserId.value) ?? null);
const userPageCount = computed(() => Math.max(1, Math.ceil(usersCount.value / USER_PAGE_SIZE)));
const visibleUserPages = computed(() => {
  const total = userPageCount.value;
  const current = userPage.value;
  const start = Math.max(0, current - 2);
  const end = Math.min(total, start + 5);
  return Array.from({ length: end - start }, (_, index) => start + index);
});

const categoryOptions = [
  { label: "Officiel", value: "OFFICIAL", style: "neutral" as const },
  { label: "Etudiants", value: "STUDENTS", style: "neutral" as const },
  { label: "Ressource", value: "RESOURCE", style: "neutral" as const },
];

const roleOptions = [
  { label: "Administrateur", value: "admin", style: "neutral" as const },
  { label: "Editeur", value: "editor", style: "neutral" as const },
  { label: "Etudiant", value: "reader", style: "neutral" as const },
];

const messageButtonStyleOptions = [
  { label: "Neutre", value: "NEUTRAL", style: "neutral" as const },
  { label: "Principal", value: "PRIMARY", style: "neutral" as const },
  { label: "Succes", value: "SUCCESS", style: "neutral" as const },
  { label: "Danger", value: "DANGER", style: "danger" as const },
  { label: "Lien", value: "LINK", style: "neutral" as const },
];

const adminTabs = computed(() => {
  const tabs: { id: AdminTab; label: string; description: string }[] = [
    { id: "publications" as const, label: "Publications", description: "Canaux, publications et diffusion" },
    { id: "catalogue" as const, label: "Catalogue", description: "Outils et liens mis en avant" },
  ];

  if (canManageUsers.value) {
    tabs.push({ id: "users" as const, label: "Utilisateurs", description: "Comptes, roles et statut" });
  }

  return tabs;
});

const channelOptions = computed(() =>
  channels.value.map((channel) => ({
    label: channel.title,
    value: channel.id,
    style: "neutral" as const,
  })),
);

const dashboardStats = computed(() => {
  const now = Date.now();
  const scheduledMessages = managedMessages.value.filter((message) => message.publishAt && new Date(message.publishAt).getTime() > now).length;
  const expiringMessages = managedMessages.value.filter((message) => message.expiresAt && new Date(message.expiresAt).getTime() > now).length;
  return [
    { label: "Outils", value: managedTools.value.length, tone: "text-primary" },
    { label: "Publications", value: managedMessages.value.length, tone: "text-sky-400" },
    { label: "Planifiees", value: scheduledMessages, tone: "text-amber-400" },
    { label: "Utilisateurs", value: usersCount.value, tone: "text-emerald-400" },
    { label: "Desactives", value: managedUsers.value.filter((user) => !user.is_active).length, tone: "text-rose-400" },
    { label: "A surveiller", value: expiringMessages, tone: "text-fuchsia-400" },
  ];
});

const fetchManagedMessages = async () => {
  const result = await query<Message>("messages", {
    select:
      "id,title,content,channelId:channel_id,buttons,createdAt:created_at,publishAt:publish_at,expiresAt:expires_at",
    orderBy: "created_at",
    ascending: false,
  });
  managedMessages.value = result.data ?? [];
};

const fetchManagedUsers = async () => {
  if (!canManageUsers.value) return;

  usersLoading.value = true;
  usersError.value = "";
  try {
    const result = await listProfilesForAdmin({
      search: userSearch.value,
      page: userPage.value,
      pageSize: USER_PAGE_SIZE,
    });

    if (result.error) {
      usersError.value = result.error.message;
      return;
    }

    managedUsers.value = result.profiles;
    usersCount.value = result.count;

    if (selectedUserId.value && !result.profiles.some((user) => user.id === selectedUserId.value)) {
      selectedUserId.value = result.profiles[0]?.id ?? null;
    }

    if (!selectedUserId.value) {
      selectedUserId.value = result.profiles[0]?.id ?? null;
    }
  } finally {
    usersLoading.value = false;
  }
};

const refreshAdminData = async () => {
  await Promise.all([
    fetchTools(),
    fetchChannels(),
    fetchManagedMessages(),
    fetchManagedUsers(),
  ]);
};

const toDateTimeLocal = (input?: string | null) => {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatShortDate = (input?: string | null) => {
  if (!input) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input));
};

const resolveRoleLabel = (role: Role) => {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "editor":
      return "Editeur";
    default:
      return "Etudiant";
  }
};

const resolveMessageStatus = (message: Message) => {
  const now = Date.now();
  if (message.publishAt && new Date(message.publishAt).getTime() > now) {
    return { label: "Differee", tone: "bg-amber-500/15 text-amber-300 border-amber-400/30" };
  }
  if (message.expiresAt && new Date(message.expiresAt).getTime() <= now) {
    return { label: "Expiree", tone: "bg-rose-500/15 text-rose-300 border-rose-400/30" };
  }
  return { label: "Active", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" };
};

const clearToolFeedback = () => {
  toolActionError.value = "";
  toolActionSuccess.value = "";
};

const clearMessageFeedback = () => {
  messageActionError.value = "";
  messageActionSuccess.value = "";
};

const clearUserFeedback = () => {
  userActionError.value = "";
  userActionMessage.value = "";
};

const resetToolForm = () => {
  toolForm.value = defaultToolForm();
  clearToolFeedback();
};

const resetMessageForm = () => {
  messageForm.value = defaultMessageForm();
  clearMessageFeedback();
};

const startToolEdit = (tool: Tool) => {
  clearToolFeedback();
  toolForm.value = {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    url: tool.url,
    source: tool.source ?? "",
    description: tool.description ?? "",
    emoji: tool.emoji ?? "",
    icon: tool.icon ?? "",
  };
};

const startMessageEdit = (message: Message) => {
  clearMessageFeedback();
  messageForm.value = {
    id: message.id,
    title: message.title,
    content: message.content,
    channelId: message.channelId,
    buttons: (Array.isArray(message.buttons) ? [...message.buttons] : []) as ManagedMessageButton[],
    publishAt: toDateTimeLocal(message.publishAt),
    expiresAt: toDateTimeLocal(message.expiresAt),
  };
};

const addMessageButton = () => {
  messageForm.value.buttons.push({
    label: "Nouveau bouton",
    link: "https://",
    style: "NEUTRAL",
  });
};

const removeMessageButton = (index: number) => {
  messageForm.value.buttons.splice(index, 1);
};

const submitTool = async () => {
  clearToolFeedback();

  if (!toolForm.value.name.trim() || !toolForm.value.url.trim()) {
    toolActionError.value = "Le nom et l'URL sont obligatoires.";
    return;
  }

  toolActionLoading.value = true;
  try {
    const payload = {
      name: toolForm.value.name.trim(),
      category: toolForm.value.category,
      url: toolForm.value.url.trim(),
      source: toolForm.value.source.trim() || null,
      description: toolForm.value.description.trim() || null,
      emoji: toolForm.value.emoji.trim() || null,
      icon: toolForm.value.icon.trim() || null,
    };

    if (isEditingTool.value && toolForm.value.id !== null) {
      await update<Tool>("tools", String(toolForm.value.id), payload);
      toolActionSuccess.value = "Outil mis a jour.";
    } else {
      await insert<Tool>("tools", payload as Record<string, unknown>);
      toolActionSuccess.value = "Outil ajoute au catalogue.";
    }

    resetToolForm();
    await fetchTools();
  } catch (error) {
    toolActionError.value = error instanceof Error ? error.message : "Impossible de sauvegarder l'outil.";
  } finally {
    toolActionLoading.value = false;
  }
};

const deleteTool = async (tool: Tool) => {
  if (!window.confirm(`Supprimer l'outil "${tool.name}" ?`)) return;

  clearToolFeedback();
  toolActionLoading.value = true;
  try {
    await remove("tools", String(tool.id));
    if (toolForm.value.id === tool.id) resetToolForm();
    toolActionSuccess.value = "Outil supprime.";
    await fetchTools();
  } catch (error) {
    toolActionError.value = error instanceof Error ? error.message : "Impossible de supprimer l'outil.";
  } finally {
    toolActionLoading.value = false;
  }
};

const submitMessage = async () => {
  clearMessageFeedback();

  if (!messageForm.value.title.trim() || !messageForm.value.content.trim()) {
    messageActionError.value = "Le titre et le contenu sont obligatoires.";
    return;
  }

  messageActionLoading.value = true;
  try {
    const payload = {
      title: messageForm.value.title.trim(),
      content: messageForm.value.content.trim(),
      channelId: messageForm.value.channelId,
      buttons: messageForm.value.buttons
        .filter((button) => button.label.trim() && button.link.trim())
        .map((button) => ({
          label: button.label.trim(),
          link: button.link.trim(),
          style: button.style,
        })),
      publishAt: messageForm.value.publishAt ? new Date(messageForm.value.publishAt).toISOString() : undefined,
      expiresAt: messageForm.value.expiresAt ? new Date(messageForm.value.expiresAt).toISOString() : undefined,
    };

    if (isEditingMessage.value && messageForm.value.id !== null) {
      await updateMessage(messageForm.value.id, payload);
      messageActionSuccess.value = "Publication mise a jour.";
    } else {
      await publishMessage(payload);
      messageActionSuccess.value = "Publication publiee.";
    }

    resetMessageForm();
    await fetchManagedMessages();
  } catch (error) {
    messageActionError.value = error instanceof Error ? error.message : "Impossible de sauvegarder la publication.";
  } finally {
    messageActionLoading.value = false;
  }
};

const deleteAdminMessage = async (message: Message) => {
  if (!window.confirm(`Supprimer la publication "${message.title}" ?`)) return;

  clearMessageFeedback();
  messageActionLoading.value = true;
  try {
    await removeMessage(message.id);
    if (messageForm.value.id === message.id) resetMessageForm();
    messageActionSuccess.value = "Publication retiree.";
    await fetchManagedMessages();
  } catch (error) {
    messageActionError.value = error instanceof Error ? error.message : "Impossible de supprimer la publication.";
  } finally {
    messageActionLoading.value = false;
  }
};

const updateSelectedUserRole = async (role: Role) => {
  if (!selectedUser.value) return;

  clearUserFeedback();
  userActionLoadingId.value = selectedUser.value.id;
  try {
    const result = await updateProfileRoleForAdmin(selectedUser.value.id, role);
    if (result.error) {
      userActionError.value = result.error.message;
      return;
    }
    userActionMessage.value = "Role mis a jour.";
    await fetchManagedUsers();
  } finally {
    userActionLoadingId.value = null;
  }
};

const toggleSelectedUserActiveState = async (nextState: boolean) => {
  if (!selectedUser.value) return;

  clearUserFeedback();
  userActionLoadingId.value = selectedUser.value.id;
  try {
    const result = await updateProfileActiveStateForAdmin(selectedUser.value.id, nextState);
    if (result.error) {
      userActionError.value = result.error.message;
      return;
    }
    userActionMessage.value = nextState ? "Compte reactive." : "Compte desactive.";
    await fetchManagedUsers();
  } finally {
    userActionLoadingId.value = null;
  }
};

const deleteSelectedUser = async () => {
  if (!selectedUser.value) return;
  if (!window.confirm(`Supprimer definitivement le compte de ${selectedUser.value.prenom} ${selectedUser.value.nom} ?`)) return;

  clearUserFeedback();
  userActionLoadingId.value = selectedUser.value.id;
  try {
    const result = await deleteUserForAdmin(selectedUser.value.id);
    if (result.error) {
      userActionError.value = result.error.message;
      return;
    }
    userActionMessage.value = "Compte supprime.";
    selectedUserId.value = null;
    await fetchManagedUsers();
  } finally {
    userActionLoadingId.value = null;
  }
};

watch(
  channels,
  (nextChannels) => {
    if (!messageForm.value.channelId && nextChannels.length) {
      messageForm.value.channelId = nextChannels[0]!.id;
    }
  },
  { immediate: true },
);

watch(userSearch, () => {
  userPage.value = 0;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    void fetchManagedUsers();
  }, 220);
});

watch(userPage, () => {
  void fetchManagedUsers();
});

watch(canManageUsers, (nextValue) => {
  if (!nextValue && activeTab.value === "users") {
    activeTab.value = "publications";
  }
});

onMounted(async () => {
  await refreshAdminData();
  refreshTimer.value = setInterval(() => {
    void refreshAdminData();
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer.value) clearInterval(refreshTimer.value);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <main class="container mx-auto my-6 flex max-w-7xl flex-col gap-6 lg:gap-8">
    <div class="flex flex-col gap-3 rounded-4xl border border-surface-border bg-surface/90 px-6 py-7 shadow-[0_30px_80px_rgba(2,6,23,0.18)] backdrop-blur-xl lg:px-8">
      <span class="w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Administration
      </span>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight">Tableau de bord admin</h1>
          <p class="max-w-3xl text-sm text-subtext">
            Separe la gestion des publications, du catalogue et des utilisateurs dans des espaces distincts et plus faciles a piloter.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <article
            v-for="stat in dashboardStats"
            :key="stat.label"
            class="rounded-2xl border border-surface-border bg-popup/70 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-subtext">{{ stat.label }}</p>
            <p class="mt-2 text-2xl font-bold" :class="stat.tone">{{ stat.value }}</p>
          </article>
        </div>
      </div>
    </div>

    <div
      v-if="session && !canManage"
      class="rounded-4xl border border-danger/25 bg-danger/10 p-8 text-center shadow-[0_24px_80px_rgba(127,29,29,0.25)]"
    >
      <h2 class="text-3xl font-bold text-danger">Acces refuse</h2>
      <p class="mx-auto mt-3 max-w-xl text-subtext">
        Cette zone est reservee aux comptes `admin` et `editor`. La session actuelle n'a pas les droits necessaires.
      </p>
    </div>

    <template v-else>
      <section class="grid gap-3 rounded-4xl border border-surface-border bg-surface/90 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl md:grid-cols-3">
        <button
          v-for="tab in adminTabs"
          :key="tab.id"
          class="rounded-3xl border px-5 py-4 text-left transition-all"
          :class="activeTab === tab.id ? 'border-primary bg-primary/10 shadow-[0_12px_30px_rgba(34,197,94,0.12)]' : 'border-surface-border bg-popup/70 hover:border-primary/30'"
          @click="activeTab = tab.id"
        >
          <p class="text-sm font-semibold">{{ tab.label }}</p>
          <p class="mt-1 text-xs text-subtext">{{ tab.description }}</p>
        </button>
      </section>

      <section v-if="activeTab === 'publications'" class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/80 pb-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Publications</p>
              <h2 class="mt-1 text-2xl font-bold">{{ isEditingMessage ? "Modifier la publication" : "Publier un nouveau message" }}</h2>
            </div>
            <Button v-if="isEditingMessage" label="Nouvelle publication" btnStyle="NEUTRAL" :handler="resetMessageForm" />
          </div>

          <div class="mt-6 flex flex-col gap-5">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Titre</span>
                <input v-model="messageForm.title" class="w-full rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="Soiree BDE, maintenance, rappel..." />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Canal</span>
                <Select :options="channelOptions" v-model="messageForm.channelId" />
              </label>
            </div>

            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-subtext">Contenu</span>
              <textarea v-model="messageForm.content" rows="7" class="w-full rounded-3xl border border-surface-border bg-popup px-4 py-4 outline-none transition focus:border-primary" placeholder="Redige ici la publication complete..." />
            </label>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Publication differree</span>
                <input v-model="messageForm.publishAt" type="datetime-local" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Expiration</span>
                <input v-model="messageForm.expiresAt" type="datetime-local" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" />
              </label>
            </div>

            <div class="rounded-3xl border border-surface-border bg-popup/60 p-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold">Boutons d'action</h3>
                  <p class="text-sm text-subtext">Ajoute des CTA directement associes a la publication.</p>
                </div>
                <Button label="Ajouter un bouton" btnStyle="NEUTRAL" :handler="addMessageButton" />
              </div>

              <div v-if="messageForm.buttons.length" class="mt-4 space-y-4">
                <div v-for="(button, index) in messageForm.buttons" :key="`${index}-${button.label}`" class="grid gap-3 rounded-[1.25rem] border border-surface-border bg-surface/70 p-4 md:grid-cols-[1fr_1fr_180px_auto]">
                  <input v-model="button.label" class="rounded-xl border border-surface-border bg-popup px-3 py-2 outline-none focus:border-primary" placeholder="Label" />
                  <input v-model="button.link" class="rounded-xl border border-surface-border bg-popup px-3 py-2 outline-none focus:border-primary" placeholder="https://..." />
                  <Select :options="messageButtonStyleOptions" v-model="button.style" />
                  <Button label="Supprimer" btnStyle="DANGER" :handler="() => removeMessageButton(index)" />
                </div>
              </div>
            </div>

            <div v-if="messageActionError" class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {{ messageActionError }}
            </div>
            <div v-if="messageActionSuccess" class="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {{ messageActionSuccess }}
            </div>

            <div class="flex flex-wrap gap-3">
              <Button :label="isEditingMessage ? 'Mettre a jour' : 'Publier'" btnStyle="PRIMARY" :loading="messageActionLoading" :handler="submitMessage" />
              <Button v-if="isEditingMessage" label="Annuler" btnStyle="NEUTRAL" :handler="resetMessageForm" />
            </div>
          </div>
        </article>

        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="flex items-end justify-between gap-3 border-b border-surface-border/80 pb-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Historique</p>
              <h2 class="mt-1 text-2xl font-bold">Dernieres publications</h2>
            </div>
            <span class="text-sm text-subtext">{{ managedMessages.length }} element(s)</span>
          </div>

          <div v-if="managedMessages.length === 0" class="mt-6 rounded-2xl border border-dashed border-surface-border p-6 text-sm text-subtext">
            Aucune publication n'est encore en base.
          </div>

          <div v-else class="mt-6 flex flex-col gap-4">
            <article v-for="message in managedMessages" :key="message.id" class="rounded-3xl border border-surface-border bg-popup/60 p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold">{{ message.title }}</h3>
                  <p class="mt-1 text-sm text-subtext line-clamp-3">{{ message.content }}</p>
                </div>
                <span class="rounded-full border px-3 py-1 text-xs font-semibold" :class="resolveMessageStatus(message).tone">
                  {{ resolveMessageStatus(message).label }}
                </span>
              </div>
              <div class="mt-4 flex flex-wrap gap-4 text-xs text-subtext">
                <span>Creation : {{ formatShortDate(message.createdAt) }}</span>
                <span v-if="message.publishAt">Publication : {{ formatShortDate(message.publishAt) }}</span>
                <span v-if="message.expiresAt">Expiration : {{ formatShortDate(message.expiresAt) }}</span>
              </div>
              <div class="mt-4 flex flex-wrap gap-3">
                <Button label="Modifier" btnStyle="NEUTRAL" :handler="() => startMessageEdit(message)" />
                <Button label="Supprimer" btnStyle="DANGER" :handler="() => deleteAdminMessage(message)" />
              </div>
            </article>
          </div>
        </article>
      </section>

      <section v-else-if="activeTab === 'catalogue'" class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/80 pb-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Catalogue</p>
              <h2 class="mt-1 text-2xl font-bold">{{ isEditingTool ? "Modifier l'outil" : "Ajouter un outil" }}</h2>
            </div>
            <Button v-if="isEditingTool" label="Nouvel outil" btnStyle="NEUTRAL" :handler="resetToolForm" />
          </div>

          <div class="mt-6 flex flex-col gap-5">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Nom</span>
                <input v-model="toolForm.name" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="UVSQ, Vencat, PlanUP..." />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Categorie</span>
                <Select :options="categoryOptions" v-model="toolForm.category" />
              </label>
            </div>

            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-subtext">URL</span>
              <input v-model="toolForm.url" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="https://..." />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-subtext">Source</span>
              <input v-model="toolForm.source" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="Lien GitHub optionnel" />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-subtext">Description</span>
              <textarea v-model="toolForm.description" rows="5" class="rounded-3xl border border-surface-border bg-popup px-4 py-4 outline-none transition focus:border-primary" placeholder="Resume rapide de l'outil..." />
            </label>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Emoji</span>
                <input v-model="toolForm.emoji" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="🏠" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Icone</span>
                <input v-model="toolForm.icon" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="Nom d'icone optionnel" />
              </label>
            </div>

            <div v-if="toolActionError" class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {{ toolActionError }}
            </div>
            <div v-if="toolActionSuccess" class="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {{ toolActionSuccess }}
            </div>

            <div class="flex flex-wrap gap-3">
              <Button :label="isEditingTool ? 'Mettre a jour' : 'Ajouter au catalogue'" btnStyle="PRIMARY" :loading="toolActionLoading" :handler="submitTool" />
              <Button v-if="isEditingTool" label="Annuler" btnStyle="NEUTRAL" :handler="resetToolForm" />
            </div>
          </div>
        </article>

        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="flex items-end justify-between gap-3 border-b border-surface-border/80 pb-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Catalogue</p>
              <h2 class="mt-1 text-2xl font-bold">Derniers outils</h2>
            </div>
            <span class="text-sm text-subtext">{{ managedTools.length }} outil(s)</span>
          </div>

          <div v-if="managedTools.length === 0" class="mt-6 rounded-2xl border border-dashed border-surface-border p-6 text-sm text-subtext">
            Aucun outil n'est encore disponible.
          </div>

          <div v-else class="mt-6 flex flex-col gap-4">
            <article v-for="tool in managedTools" :key="tool.id" class="rounded-3xl border border-surface-border bg-popup/60 p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ tool.emoji || "🔗" }}</span>
                    <div>
                      <h3 class="text-lg font-semibold">{{ tool.name }}</h3>
                      <p class="text-xs uppercase tracking-[0.18em] text-subtext">{{ tool.category }}</p>
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-subtext">{{ tool.description }}</p>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-3">
                <Button label="Modifier" btnStyle="NEUTRAL" :handler="() => startToolEdit(tool)" />
                <Button label="Supprimer" btnStyle="DANGER" :handler="() => deleteTool(tool)" />
              </div>
            </article>
          </div>
        </article>
      </section>

      <section v-else-if="activeTab === 'users'" class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="flex flex-col gap-4 border-b border-surface-border/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Utilisateurs</p>
              <h2 class="mt-1 text-2xl font-bold">Derniers comptes inscrits</h2>
              <p class="mt-2 text-sm text-subtext">Recherche globale sur nom, prenom, email d'usage et email UVSQ.</p>
            </div>
            <div class="w-full max-w-md">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-subtext">Recherche</span>
                <input v-model="userSearch" class="rounded-2xl border border-surface-border bg-popup px-4 py-3 outline-none transition focus:border-primary" placeholder="Nom, prenom, email, email UVSQ..." />
              </label>
            </div>
          </div>

          <div v-if="usersError" class="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ usersError }}
          </div>

          <div class="mt-5 overflow-hidden rounded-3xl border border-surface-border">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-surface-border text-sm">
                <thead class="bg-popup/80 text-subtext">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold">Prenom</th>
                    <th class="px-4 py-3 text-left font-semibold">Nom</th>
                    <th class="px-4 py-3 text-left font-semibold">Email</th>
                    <th class="px-4 py-3 text-left font-semibold">Email UVSQ</th>
                    <th class="px-4 py-3 text-left font-semibold">Role</th>
                    <th class="px-4 py-3 text-left font-semibold">Statut</th>
                    <th class="px-4 py-3 text-left font-semibold">Inscription</th>
                    <th class="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-border bg-surface/70">
                  <tr v-if="usersLoading">
                    <td colspan="8" class="px-4 py-6 text-center text-subtext">Chargement des comptes...</td>
                  </tr>
                  <tr v-else-if="managedUsers.length === 0">
                    <td colspan="8" class="px-4 py-6 text-center text-subtext">Aucun compte ne correspond a la recherche.</td>
                  </tr>
                  <tr
                    v-for="user in managedUsers"
                    :key="user.id"
                    class="transition hover:bg-popup/40"
                    :class="selectedUserId === user.id ? 'bg-primary/5' : ''"
                  >
                    <td class="px-4 py-3 font-medium">{{ user.prenom }}</td>
                    <td class="px-4 py-3">{{ user.nom }}</td>
                    <td class="px-4 py-3">{{ user.email_auth }}</td>
                    <td class="px-4 py-3">{{ user.email_uvsq }}</td>
                    <td class="px-4 py-3">{{ resolveRoleLabel(user.role) }}</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full border px-3 py-1 text-xs font-semibold" :class="user.is_active ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300' : 'border-rose-400/30 bg-rose-500/15 text-rose-300'">
                        {{ user.is_active ? "Actif" : "Desactive" }}
                      </span>
                    </td>
                    <td class="px-4 py-3">{{ formatShortDate(user.created_at) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <Button label="Modifier" btnStyle="NEUTRAL" :handler="() => { selectedUserId = user.id; }" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p class="text-sm text-subtext">
              {{ usersCount }} compte(s) au total, page {{ userPage + 1 }} / {{ userPageCount }}.
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <Button label="Precedent" btnStyle="NEUTRAL" :disabled="userPage === 0" :handler="() => { userPage = Math.max(0, userPage - 1); }" />
              <button
                v-for="pageIndex in visibleUserPages"
                :key="pageIndex"
                class="h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition"
                :class="pageIndex === userPage ? 'border-primary bg-primary/10 text-primary' : 'border-surface-border bg-popup/70 hover:border-primary/30'"
                @click="userPage = pageIndex"
              >
                {{ pageIndex + 1 }}
              </button>
              <Button label="Suivant" btnStyle="NEUTRAL" :disabled="userPage >= userPageCount - 1" :handler="() => { userPage = Math.min(userPageCount - 1, userPage + 1); }" />
            </div>
          </div>
        </article>

        <article class="rounded-4xl border border-white/10 bg-surface/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:p-8">
          <div class="border-b border-surface-border/80 pb-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Fiche compte</p>
            <h2 class="mt-1 text-2xl font-bold">Modification utilisateur</h2>
          </div>

          <div v-if="!selectedUser" class="mt-6 rounded-2xl border border-dashed border-surface-border p-6 text-sm text-subtext">
            Selectionne un compte dans le tableau pour modifier son role, son statut ou le supprimer.
          </div>

          <template v-else>
            <div class="mt-6 space-y-5">
              <div class="rounded-3xl border border-surface-border bg-popup/60 p-5">
                <p class="text-xs uppercase tracking-[0.18em] text-subtext">Identite</p>
                <h3 class="mt-2 text-2xl font-bold">{{ selectedUser.prenom }} {{ selectedUser.nom }}</h3>
                <div class="mt-4 space-y-2 text-sm text-subtext">
                  <p><span class="font-semibold text-white">Email :</span> {{ selectedUser.email_auth }}</p>
                  <p><span class="font-semibold text-white">Email UVSQ :</span> {{ selectedUser.email_uvsq }}</p>
                  <p><span class="font-semibold text-white">Inscription :</span> {{ formatShortDate(selectedUser.created_at) }}</p>
                </div>
              </div>

              <div class="rounded-3xl border border-surface-border bg-popup/60 p-5">
                <label class="flex flex-col gap-2">
                  <span class="text-sm font-semibold text-subtext">Role</span>
                  <Select :options="roleOptions" :model-value="selectedUser.role" :handler="(value) => updateSelectedUserRole(value as Role)" />
                </label>
              </div>

              <div class="rounded-3xl border border-surface-border bg-popup/60 p-5">
                <p class="text-sm font-semibold text-subtext">Etat du compte</p>
                <div class="mt-4 flex flex-wrap gap-3">
                  <Button
                    :label="selectedUser.is_active ? 'Desactiver le compte' : 'Reactiver le compte'"
                    :btnStyle="selectedUser.is_active ? 'DANGER' : 'SUCCESS'"
                    :loading="userActionLoadingId === selectedUser.id"
                    :handler="() => toggleSelectedUserActiveState(!selectedUser?.is_active)"
                  />
                  <Button
                    label="Supprimer definitivement"
                    btnStyle="DANGER"
                    :loading="userActionLoadingId === selectedUser.id"
                    :handler="deleteSelectedUser"
                  />
                </div>
              </div>

              <div v-if="userActionError" class="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {{ userActionError }}
              </div>
              <div v-if="userActionMessage" class="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                {{ userActionMessage }}
              </div>
            </div>
          </template>
        </article>
      </section>
    </template>
  </main>
</template>
