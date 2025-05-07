import {
  ChatBubbleLeftIcon,
  UsersIcon,
  StarIcon,
  PhoneIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export const menuItemsTop = [
  {
    icon: ChatBubbleLeftIcon,
    label: "Discussions",
    path: "/chat",
    viewName: "chat",
    action: (setView) => setView("chat"),
  },
  {
    icon: UsersIcon,
    label: "Groupes",
    path: "/groups",
    viewName: "groups",
    action: (setView) => setView("groups"),
  },
  {
    icon: StarIcon,
    label: "Status",
    path: "/status",
    viewName: "status",
    action: (setView) => setView("status"),
  },
  {
    icon: PhoneIcon,
    label: "Historique",
    path: "/history",
    viewName: "calls",
    action: (setView) => setView("calls"),
  },
];

export const menuItemsBottom = [
  {
    icon: Cog6ToothIcon,
    label: "Paramètres",
    path: "/settings",
    viewName: "settings",
    action: (setIsSettingsPanelOpen) => setIsSettingsPanelOpen(true),
    position: "bottom",
  },
  {
    icon: UserIcon,
    label: "Profil",
    path: "/profile",
    viewName: "profile",
    position: "bottom",
  },
];