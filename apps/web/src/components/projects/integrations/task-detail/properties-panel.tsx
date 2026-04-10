import {
	ArrowRight,
	CalendarDays,
	Check,
	Clock,
	GitBranch,
	Link2,
	Minus,
	Plus,
	User,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Sprint, Task } from "@/lib/integration-api";
import type { ProjectMember, TaskStatus, TaskType } from "@/lib/project-api";
import type { PriorityMeta } from "../priority";
import { AddFieldDialog } from "./add-field-dialog";
import { FieldRow, FieldValue } from "./primitives";
import type { CustomFieldDef } from "./types";

type UpdatePayload = Partial<{
	status_id: string | null;
	task_type_id: string | null;
	assignee_id: string | null;
	reporter_id: string | null;
	importance: number;
	start_date: string | null;
	due_date: string | null;
	tags: string[];
	sprint_id: string | null;
}>;

function toDateInput(iso?: string | null) {
	if (!iso) return "";
	return iso.substring(0, 10);
}

function displayDate(iso?: string | null) {
	if (!iso) return null;
	const d = new Date(iso);
	return d.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

interface PropertiesPanelProps {
	task: Task;
	status: TaskStatus | undefined;
	taskType: TaskType | undefined;
	priority: PriorityMeta;
	assignee: ProjectMember | undefined;
	reporter: ProjectMember | undefined;
	statuses?: TaskStatus[];
	taskTypes?: TaskType[];
	members?: ProjectMember[];
	sprints?: Sprint[];
	initialCustomFields?: CustomFieldDef[];
	canEdit?: boolean;
	onUpdate?: (payload: UpdatePayload) => void;
}

export function PropertiesPanel({
	task,
	status,
	taskType,
	assignee,
	reporter,
	statuses = [],
	taskTypes = [],
	members = [],
	sprints = [],
	initialCustomFields = [],
	canEdit = true,
	onUpdate,
}: PropertiesPanelProps) {
	const [localCustomFields, setLocalCustomFields] =
		useState<CustomFieldDef[]>(initialCustomFields);
	const [addFieldOpen, setAddFieldOpen] = useState(false);
	const [tagInput, setTagInput] = useState("");
	const [importanceValue, setImportanceValue] = useState(task.importance ?? 0);
	const tagRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setLocalCustomFields(initialCustomFields);
	}, [initialCustomFields]);

	useEffect(() => {
		setImportanceValue(task.importance ?? 0);
	}, [task.importance]);

	const localTags: string[] = task.tags ?? [];

	function handleAddTag(tag: string) {
		const trimmed = tag.trim();
		if (!trimmed || localTags.includes(trimmed)) return;
		onUpdate?.({ tags: [...localTags, trimmed] });
		setTagInput("");
	}

	function handleRemoveTag(tag: string) {
		onUpdate?.({ tags: localTags.filter((t) => t !== tag) });
	}

	return (
		<>
			<div className="divide-y divide-border/30 rounded-xl border border-border/40 bg-card px-4 py-1">
				{/* Status */}
				<FieldRow label="Status">
					{canEdit && statuses.length > 0 ? (
						<Popover>
							<PopoverTrigger
								type="button"
								className={status
									? "inline-flex items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-sm font-medium text-muted-foreground hover:border-border transition-colors"
									: "inline-flex items-center gap-1.5 text-sm text-muted-foreground/40 italic hover:text-muted-foreground transition-colors"}
							>
								{status ? (
									<>
										<span
											className="size-2 rounded-full shrink-0"
											style={{ background: status.color ?? "var(--muted-foreground)" }}
										/>
										{status.name}
									</>
								) : "No status"}
							</PopoverTrigger>
							<PopoverContent className="w-52 p-1" align="start">
								{statuses.map((s) => (
									<button
										key={s.id}
										type="button"
										className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
										onClick={() => onUpdate?.({ status_id: s.id })}
									>
										<span
											className="size-2 rounded-full shrink-0"
											style={{
												background: s.color ?? "var(--muted-foreground)",
											}}
										/>
										{s.name}
										{s.id === status?.id && (
											<Check className="size-3.5 ml-auto text-primary" />
										)}
									</button>
								))}
							</PopoverContent>
						</Popover>
					) : status ? (
						<button
							type="button"
							className="inline-flex items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-sm font-medium text-muted-foreground"
						>
							<span
								className="size-2 rounded-full shrink-0"
								style={{
									background: status.color ?? "var(--muted-foreground)",
								}}
							/>
							{status.name}
						</button>
					) : (
						<FieldValue empty />
					)}
				</FieldRow>

				{/* Dates */}
				<FieldRow label="Dates">
					<div className="flex items-center gap-2 flex-wrap">
						{canEdit ? (
							<>
								<label className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-border/70 hover:bg-muted/60 transition-colors cursor-pointer">
									<CalendarDays className="size-3.5 shrink-0" />
									<span>{displayDate(task.start_date) ?? "Start date"}</span>
									<input
										type="date"
										className="sr-only"
										value={toDateInput(task.start_date)}
										onChange={(e) =>
											onUpdate?.({ start_date: e.target.value || null })
										}
									/>
								</label>
								<Minus className="size-3 text-border/60 shrink-0" />
								<label className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-border/70 hover:bg-muted/60 transition-colors cursor-pointer">
									<CalendarDays className="size-3.5 shrink-0" />
									<span>{displayDate(task.due_date) ?? "Due date"}</span>
									<input
										type="date"
										className="sr-only"
										value={toDateInput(task.due_date)}
										onChange={(e) =>
											onUpdate?.({ due_date: e.target.value || null })
										}
									/>
								</label>
							</>
						) : (
							<>
								<span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
									<CalendarDays className="size-3.5 shrink-0" />
									{displayDate(task.start_date) ?? "Start date"}
								</span>
								<Minus className="size-3 text-border/60 shrink-0" />
								<span className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
									<CalendarDays className="size-3.5 shrink-0" />
									{displayDate(task.due_date) ?? "Due date"}
								</span>
							</>
						)}
					</div>
				</FieldRow>

				{/* Track Time */}
				<FieldRow label="Track Time">
					<button
						type="button"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<Clock className="size-3.5" />
						Add time
					</button>
				</FieldRow>

				{/* Type */}
				{(taskType || (canEdit && taskTypes.length > 0)) && (
					<FieldRow label="Type">
						{canEdit && taskTypes.length > 0 ? (
							<Popover>
								<PopoverTrigger
									type="button"
									className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-border/70 hover:bg-muted/60 transition-colors"
								>
									{taskType?.name ?? "No type"}
								</PopoverTrigger>
								<PopoverContent className="w-48 p-1" align="start">
									{taskTypes.map((tt) => (
										<button
											key={tt.id}
											type="button"
											className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
											onClick={() => onUpdate?.({ task_type_id: tt.id })}
										>
											{tt.name}
											{tt.id === taskType?.id && (
												<Check className="size-3.5 ml-auto text-primary" />
											)}
										</button>
									))}
								</PopoverContent>
							</Popover>
						) : (
							<FieldValue>{taskType?.name}</FieldValue>
						)}
					</FieldRow>
				)}

				{/* Relationships */}
				<FieldRow label="Relationships">
					<button
						type="button"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<Link2 className="size-3.5" />
						<FieldValue empty />
					</button>
				</FieldRow>

				{/* Assignees */}
				<FieldRow label="Assignees">
					{canEdit && members.length > 0 ? (
						<Popover>
							<PopoverTrigger
								type="button"
								className={assignee
									? "flex items-center gap-2 hover:opacity-80 transition-opacity"
									: "inline-flex items-center gap-1.5 text-sm text-muted-foreground/40 italic hover:text-muted-foreground transition-colors"}
							>
								{assignee ? (
									<>
										<div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold ring-1 ring-border/40">
											{(assignee.full_name || assignee.username)
												.slice(0, 1)
												.toUpperCase()}
										</div>
										<span className="text-sm text-foreground/80">
											{assignee.full_name || assignee.username}
										</span>
									</>
								) : (
									<>
										<User className="size-3.5" />
										Empty
									</>
								)}
							</PopoverTrigger>
							<PopoverContent className="w-56 p-1" align="start">
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
									onClick={() => onUpdate?.({ assignee_id: null })}
								>
									<User className="size-3.5" />
									Unassigned
									{!assignee && (
										<Check className="size-3.5 ml-auto text-primary" />
									)}
								</button>
								{members.map((m) => (
									<button
										key={m.user_id}
										type="button"
										className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
										onClick={() => onUpdate?.({ assignee_id: m.user_id })}
									>
										<div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
											{(m.full_name || m.username).slice(0, 1).toUpperCase()}
										</div>
										<span className="truncate">
											{m.full_name || m.username}
										</span>
										{m.user_id === assignee?.user_id && (
											<Check className="size-3.5 ml-auto text-primary" />
										)}
									</button>
								))}
							</PopoverContent>
						</Popover>
					) : assignee ? (
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold ring-1 ring-border/40">
								{(assignee.full_name || assignee.username)
									.slice(0, 1)
									.toUpperCase()}
							</div>
							<span className="text-sm text-foreground/80">
								{assignee.full_name || assignee.username}
							</span>
						</div>
					) : (
						<button
							type="button"
							className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/40 italic hover:text-muted-foreground transition-colors"
						>
							<User className="size-3.5" />
							Empty
						</button>
					)}
				</FieldRow>

				{/* Importance */}
				<FieldRow label="Importance">
					{canEdit ? (
						<input
							type="number"
							min="0"
							value={importanceValue}
							onChange={(e) => setImportanceValue(Math.max(0, Number(e.target.value)))}
							onBlur={() => {
								const val = Math.max(0, importanceValue);
								if (val !== (task.importance ?? 0)) onUpdate?.({ importance: val });
							}}
							className="w-16 rounded-md border border-border/40 bg-muted/40 px-2 py-1 text-sm text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					) : (
						<span className="text-sm tabular-nums text-foreground/80">
							{task.importance ?? 0}
						</span>
					)}
				</FieldRow>

				{/* Tags */}
				<FieldRow label="Tags">
					<div className="flex flex-wrap items-center gap-1.5 min-h-[1.75rem]">
						{localTags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-foreground/70 border border-border/30"
							>
								{tag}
								{canEdit && (
									<button
										type="button"
										onClick={() => handleRemoveTag(tag)}
										className="hover:text-destructive transition-colors"
									>
										<X className="size-3" />
									</button>
								)}
							</span>
						))}
						{canEdit && (
							<Popover>
								<PopoverTrigger
									type="button"
									className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/40 px-2 py-0.5 text-xs text-muted-foreground hover:border-border/70 hover:text-foreground transition-colors"
								>
									<Plus className="size-3" />
									Add tag
								</PopoverTrigger>
								<PopoverContent className="w-52 p-2" align="start">
									<form
										onSubmit={(e) => {
											e.preventDefault();
											handleAddTag(tagInput);
										}}
									>
										<input
											ref={tagRef}
											// biome-ignore lint/a11y/noAutofocus: intentional for popover
											autoFocus
											type="text"
											value={tagInput}
											onChange={(e) => setTagInput(e.target.value)}
											placeholder="Add tag..."
											className="w-full rounded-md border border-border/40 bg-muted/40 px-2.5 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleAddTag(tagInput);
												}
											}}
										/>
									</form>
								</PopoverContent>
							</Popover>
						)}
					</div>
				</FieldRow>

				{/* Reporter (conditional) */}
				{reporter && (
					<FieldRow label="Reporter">
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold ring-1 ring-border/40">
								{(reporter.full_name || reporter.username)
									.slice(0, 1)
									.toUpperCase()}
							</div>
							<span className="text-sm text-foreground/80">
								{reporter.full_name || reporter.username}
							</span>
						</div>
					</FieldRow>
				)}

				{/* Sprint (conditional) */}
				{(task.sprint_id || (canEdit && sprints.length > 0)) && (
					<FieldRow label="Sprint">
						{canEdit && sprints.length > 0 ? (
							<Popover>
								<PopoverTrigger
									type="button"
									className={task.sprint_id
										? "inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-border/70 hover:bg-muted/60 transition-colors"
										: "inline-flex items-center gap-1.5 text-sm text-muted-foreground/40 italic hover:text-muted-foreground transition-colors"}
								>
									<GitBranch className="size-3.5 shrink-0" />
									{task.sprint_id
										? (sprints.find((s) => s.id === task.sprint_id)?.name ?? task.sprint_id)
										: "No sprint"}
								</PopoverTrigger>
								<PopoverContent className="w-52 p-1" align="start">
									<button
										type="button"
										className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
										onClick={() => onUpdate?.({ sprint_id: null })}
									>
										<GitBranch className="size-3.5 shrink-0" />
										No sprint
										{!task.sprint_id && (
											<Check className="size-3.5 ml-auto text-primary" />
										)}
									</button>
									{sprints.map((s) => (
										<button
											key={s.id}
											type="button"
											className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
											onClick={() => onUpdate?.({ sprint_id: s.id })}
										>
											<GitBranch className="size-3.5 shrink-0 text-muted-foreground" />
											<span className="flex-1 truncate">{s.name}</span>
											{s.id === task.sprint_id && (
												<Check className="size-3.5 ml-auto text-primary shrink-0" />
											)}
										</button>
									))}
								</PopoverContent>
							</Popover>
						) : (
							<div className="flex items-center gap-1.5">
								<GitBranch className="size-3.5 text-muted-foreground shrink-0" />
								<span className="text-sm text-foreground/80 truncate">
									{sprints.find((s) => s.id === task.sprint_id)?.name ?? task.sprint_id}
								</span>
							</div>
						)}
					</FieldRow>
				)}

				{/* Parent task (conditional) */}
				{task.parent_task_id && (
					<FieldRow label="Parent task">
						<button
							type="button"
							className="flex items-center gap-1.5 text-sm text-primary hover:underline"
						>
							<ArrowRight className="size-3.5 shrink-0" />
							<span className="truncate">{task.parent_task_id}</span>
						</button>
					</FieldRow>
				)}

				{/* Custom fields */}
				{localCustomFields.map((cf) => {
					const rawVal = task.custom_fields?.[cf.field_key];
					const hasVal = rawVal != null && rawVal !== "";
					return (
						<FieldRow key={cf.id} label={cf.display_name}>
							{hasVal ? (
								<FieldValue>{String(rawVal)}</FieldValue>
							) : (
								<FieldValue empty />
							)}
						</FieldRow>
					);
				})}
			</div>

			{/* Add fields */}
			{canEdit && (
				<button
					type="button"
					onClick={() => setAddFieldOpen(true)}
					className="mt-3 flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
				>
					<Plus className="size-3.5" />
					Add fields
				</button>
			)}

			<AddFieldDialog
				open={addFieldOpen}
				onOpenChange={setAddFieldOpen}
				onAdd={(field) => setLocalCustomFields((prev) => [...prev, field])}
			/>
		</>
	);
}
