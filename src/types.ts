export type ToolCategory =
  | "image"
  | "document"
  | "ai"
  | "productivity"
  | "writing"
  | "security"
  | "developer";

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  categoryLabel: string;
  iconName: string;
  featureCount: number;
  features: string[];
  keywords: string[];
  badge?: string;
  isClientSideOnly: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: "planning" | "active" | "in_progress" | "review" | "completed";
  startDate: string;
  dueDate: string;
  tasks: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface ProcessedImageItem {
  id: string;
  originalFile: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputWidth?: number;
  outputHeight?: number;
  format: "image/jpeg" | "image/png" | "image/webp";
  quality: number;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}
