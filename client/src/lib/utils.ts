import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = now.getTime() - target.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    return formatDate(date);
  }
}

export function getProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "research":
      return "bg-blue-100 text-blue-800";
    case "draft":
      return "bg-green-100 text-green-800";
    case "revision":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "research":
      return "Research";
    case "draft":
      return "Draft";
    case "revision":
      return "Revision";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

export function getDueDateUrgency(dueDate: string | Date): "overdue" | "urgent" | "soon" | "normal" {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMs < 0) {
    return "overdue";
  } else if (diffInDays <= 1) {
    return "urgent";
  } else if (diffInDays <= 7) {
    return "soon";
  } else {
    return "normal";
  }
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "urgent":
      return "bg-red-50 text-red-600 border-red-200";
    case "soon":
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200";
  }
}

export function getUrgencyLabel(urgency: string): string {
  switch (urgency) {
    case "overdue":
      return "Overdue";
    case "urgent":
      return "Due Tomorrow";
    case "soon":
      return "Due Soon";
    default:
      return "Due Later";
  }
}
