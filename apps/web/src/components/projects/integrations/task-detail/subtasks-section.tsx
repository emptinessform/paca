import { Plus } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/lib/integration-api";
import type { ProjectMember, TaskStatus, TaskType } from "@/lib/project-api";
import { SubtaskRow } from "./subtask-row";

interface SubtasksSectionProps {
	projectId?: string;
	parentTaskId: string;
	subtasks: Task[];
	statuses: TaskStatus[];
	taskTypes?: TaskType[];
	members?: ProjectMember[];
	canEdit?: boolean;
	task: Task;
	onSubtaskUpdate?: (
		subtaskId: string,
		payload: Partial<{ status_id: string | null }>,
	) => void;
	onSubtaskCreate?: (payload: {
		title: string;
		status_id?: string | null;
		task_type_id?: string | null;
	}) => void;
}

export function SubtasksSection({
	subtasks,
	statuses,
	canEdit = true,
	onSubtaskCreate,
}: SubtasksSectionProps) {
	const [adding, setAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");

	function handleCreate() {
		const trimmed = newTitle.trim();
		if (!trimmed) return;
		onSubtaskCreate?.({ title: trimmed });
		setNewTitle("");
		setAdding(false);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
					Subtasks
				</span>
				{canEdit && (
					<button
						type="button"
						onClick={() => setAdding(true)}
						className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold transition-colors"
					>
						<Plus className="size-3.5" />
						Add Task
					</button>
				)}
			</div>

			{subtasks.length > 0 && (
				<div className="rounded-xl border border-border/40 bg-card divide-y divide-border/30 overflow-hidden">
					{subtasks.map((sub) => (
						<SubtaskRow key={sub.id} task={sub} statuses={statuses} />
					))}
				</div>
			)}

			{adding && (
				<form
					className="flex items-center gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						handleCreate();
					}}
				>
					<input
						// biome-ignore lint/a11y/noAutofocus: intentional for inline form
						autoFocus
						type="text"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						placeholder="Subtask title..."
						className="flex-1 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setAdding(false);
								setNewTitle("");
							}
						}}
					/>
					<button
						type="submit"
						className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						Add
					</button>
					<button
						type="button"
						onClick={() => {
							setAdding(false);
							setNewTitle("");
						}}
						className="rounded-lg border border-border/50 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>
				</form>
			)}

			{!adding && subtasks.length === 0 && (
				<p className="text-sm text-muted-foreground/40 italic px-1">
					No subtasks yet — click "Add Task" to create one.
				</p>
			)}
		</div>
	);
}
