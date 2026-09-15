import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle2, Clock, AlertCircle, Search, Filter, Download, UploadCloud, ChevronRight, CheckSquare, Tag, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { downloadText, downloadBlob } from "../../utils/fileHelpers";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: string;
  subtasks: Subtask[];
  createdAt: string;
}

const DEFAULT_TASKS: ProjectTask[] = [
  {
    id: "task-1",
    title: "Finalize Scholarship Portfolio Dossier",
    description: "Prepare comprehensive multi-tool codebase documentation and performance benchmarks for university review.",
    status: "in_progress",
    priority: "urgent",
    category: "Academic",
    dueDate: "2026-10-15",
    createdAt: "2026-09-10",
    subtasks: [
      { id: "sub-1", title: "Complete architectural review of client-side canvas tools", completed: true },
      { id: "sub-2", title: "Verify WCAG AA compliance across all components", completed: true },
      { id: "sub-3", title: "Draft technical methodology statement", completed: false },
    ],
  },
  {
    id: "task-2",
    title: "Implement Web Crypto Random Password Generator",
    description: "Ensure cryptographically secure entropy calculation using window.crypto.getRandomValues.",
    status: "done",
    priority: "high",
    category: "Security",
    dueDate: "2026-09-20",
    createdAt: "2026-09-11",
    subtasks: [
      { id: "sub-4", title: "Add NIST special publication entropy scoring", completed: true },
      { id: "sub-5", title: "Support pronounceable passphrase algorithm", completed: true },
    ],
  },
  {
    id: "task-3",
    title: "Audit Canvas Image Transcoding Pipeline",
    description: "Measure memory allocation spikes during multi-file 4K JPEG to WebP batch conversions.",
    status: "todo",
    priority: "medium",
    category: "Performance",
    dueDate: "2026-10-01",
    createdAt: "2026-09-12",
    subtasks: [
      { id: "sub-6", title: "Profile garbage collection cycles in Chrome DevTools", completed: false },
      { id: "sub-7", title: "Implement blob URL lifecycle cleanup", completed: false },
    ],
  },
  {
    id: "task-4",
    title: "Peer Code Review & Technical Defense",
    description: "Rehearse live demonstration walkthrough for engineering scholarship committee.",
    status: "review",
    priority: "high",
    category: "Academic",
    dueDate: "2026-10-18",
    createdAt: "2026-09-14",
    subtasks: [
      { id: "sub-8", title: "Prepare 5-minute system architecture pitch", completed: false },
      { id: "sub-9", title: "Verify offline fallback resilience", completed: false },
    ],
  },
];

export const ProjectManager: React.FC = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    const saved = localStorage.getItem("toolnest_project_tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved project tasks", e);
      }
    }
    return DEFAULT_TASKS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<"todo" | "in_progress" | "review" | "done">("todo");
  const [formPriority, setFormPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [formCategory, setFormCategory] = useState("Engineering");
  const [formDueDate, setFormDueDate] = useState("");
  const [formSubtasks, setFormSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    localStorage.setItem("toolnest_project_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormStatus("todo");
    setFormPriority("medium");
    setFormCategory("Engineering");
    setFormDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
    setFormSubtasks([]);
    setIsModalOpen(true);
  };

  const openEditModal = (task: ProjectTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate);
    setFormSubtasks([...task.subtasks]);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formTitle.trim(),
                description: formDesc.trim(),
                status: formStatus,
                priority: formPriority,
                category: formCategory.trim() || "General",
                dueDate: formDueDate,
                subtasks: formSubtasks,
              }
            : t
        )
      );
    } else {
      const newTask: ProjectTask = {
        id: "task-" + Date.now(),
        title: formTitle.trim(),
        description: formDesc.trim(),
        status: formStatus,
        priority: formPriority,
        category: formCategory.trim() || "General",
        dueDate: formDueDate || new Date().toISOString().split("T")[0],
        subtasks: formSubtasks,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMoveStatus = (id: string, nextStatus: "todo" | "in_progress" | "review" | "done") => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updated = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updated };
      })
    );
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => t.status !== "done" && t.dueDate && t.dueDate < todayStr).length;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesQuery && matchesPriority && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(tasks.map((t) => t.category)));

  // Exports
  const exportAsJson = () => {
    downloadText(JSON.stringify(tasks, null, 2), "toolnest-project-tasks.json", "application/json");
  };

  const exportAsCsv = () => {
    const headers = ["ID", "Title", "Status", "Priority", "Category", "DueDate", "SubtasksCount", "CompletedSubtasks"];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      `"${t.category}"`,
      t.dueDate,
      t.subtasks.length,
      t.subtasks.filter((s) => s.completed).length,
    ]);
    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadText(csvString, "toolnest-project-tasks.csv", "text/csv");
  };

  const COLUMNS: { id: "todo" | "in_progress" | "review" | "done"; title: string; color: string }[] = [
    { id: "todo", title: "Backlog / To Do", color: "border-slate-300 dark:border-slate-700" },
    { id: "in_progress", title: "In Progress", color: "border-indigo-500" },
    { id: "review", title: "Review & Testing", color: "border-amber-500" },
    { id: "done", title: "Completed", color: "border-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Project & Task Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kanban workflow manager with checklist subtasks, milestone tracking, and local device persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="project-new-task-btn"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tasks</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalTasks}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">In Flight</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{inProgressTasks}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completion</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
            <span className="text-xs text-slate-400">({completedTasks} done)</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Overdue</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{overdueTasks}</p>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAsCsv}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={exportAsJson}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> JSON
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    col.id === "todo" ? "bg-slate-400" :
                    col.id === "in_progress" ? "bg-indigo-500" :
                    col.id === "review" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {col.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No tasks in this lane
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completedSubs = task.subtasks.filter((s) => s.completed).length;
                    const isOverdue = task.status !== "done" && task.dueDate && task.dueDate < todayStr;

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              task.priority === "urgent"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : task.priority === "high"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : task.priority === "medium"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 truncate max-w-[100px]">
                            {task.category}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks progress */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Checklist</span>
                              <span>
                                {completedSubs}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                              <div
                                className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${(completedSubs / task.subtasks.length) * 100}%` }}
                              />
                            </div>
                            <div className="space-y-1 pt-1">
                              {task.subtasks.slice(0, 3).map((sub) => (
                                <label
                                  key={sub.id}
                                  className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={sub.completed}
                                    onChange={() => handleToggleSubtask(task.id, sub.id)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                  />
                                  <span className={sub.completed ? "line-through text-slate-400" : ""}>
                                    {sub.title}
                                  </span>
                                </label>
                              ))}
                              {task.subtasks.length > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{task.subtasks.length - 3} more items
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Due Date & Action controls */}
                        <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-400">
                          <span
                            className={`flex items-center gap-1 text-[11px] ${
                              isOverdue ? "text-rose-600 font-bold" : ""
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 hover:text-slate-900 dark:hover:text-white"
                              title="Edit Task"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:text-rose-600"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Move Column 1-Click buttons */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {col.id !== "todo" && (
                            <button
                              onClick={() =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === "done"
                                    ? "review"
                                    : col.id === "review"
                                    ? "in_progress"
                                    : "todo"
                                )
                              }
                              className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              ← Back
                            </button>
                          )}
                          {col.id !== "done" && (
                            <button
                              onClick={() =>
                                handleMoveStatus(
                                  task.id,
                                  col.id === "todo"
                                    ? "in_progress"
                                    : col.id === "in_progress"
                                    ? "review"
                                    : "done"
                                )
                              }
                              className="ml-auto text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal (Create / Edit) */}
      {isModalOpen && (
        <div
          id="project-task-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="project-task-modal-container"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Audit API Rate Limits"
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Details, acceptance criteria..."
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="todo">Backlog / To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Engineering, Research..."
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Subtasks management */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Checklist Subtasks
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {formSubtasks.map((st, idx) => (
                    <div key={st.id} className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                      <span className="truncate">{st.title}</span>
                      <button
                        type="button"
                        onClick={() => setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a checklist item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newSubtaskTitle.trim()) {
                          setFormSubtasks([
                            ...formSubtasks,
                            { id: "sub-" + Date.now(), title: newSubtaskTitle.trim(), completed: false },
                          ]);
                          setNewSubtaskTitle("");
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubtaskTitle.trim()) {
                        setFormSubtasks([
                          ...formSubtasks,
                          { id: "sub-" + Date.now(), title: newSubtaskTitle.trim(), completed: false },
                        ]);
                        setNewSubtaskTitle("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
