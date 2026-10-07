import {
  Crosshair,
  UsersRound,
  TrendingUp,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const navigation = [
  {
    href: "/command",
    label: "Command",
    description: "Your next revenue move",
    icon: Crosshair,
  },
  {
    href: "/prospects",
    label: "Prospects",
    description: "People and their context",
    icon: UsersRound,
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    description: "Where money is moving",
    icon: TrendingUp,
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    description: "Offers and conversations",
    icon: BookOpen,
  },
] satisfies NavigationItem[];
