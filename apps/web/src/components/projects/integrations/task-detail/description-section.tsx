import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UpdateFn = (payload: { description?: string | null }) => void;

interface DescriptionSectionProps {
	description?: string | null;
	canEdit?: boolean;
	onUpdate?: UpdateFn;
}

export function DescriptionSection({
	description,
	canEdit = true,
	onUpdate,
}: DescriptionSectionProps) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(description ?? "");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Sync draft when description changes externally (e.g. after a save)
	useEffect(() => {
		if (!editing) setDraft(description ?? "");
	}, [description, editing]);

	const commitEdit = () => {
		setEditing(false);
		const value = draft.trim() || null;
		if (value !== (description ?? null)) {
			onUpdate?.({ description: value });
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
					Description
				</span>
				<button
					type="button"
					className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
				>
					<Sparkles className="size-3.5" />
					Write with AI
				</button>
			</div>

			{editing ? (
				<textarea
					ref={textareaRef}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onBlur={commitEdit}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setDraft(description ?? "");
							setEditing(false);
						}
					}}
					placeholder="Add description…"
					className="w-full min-h-[120px] resize-y rounded-xl border border-primary/50 bg-card px-5 py-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap outline-none focus:border-primary transition-colors"
					autoFocus
				/>
			) : description ? (
				// biome-ignore lint/a11y/noStaticElementInteractions: click-to-edit description
				<div
					className="rounded-xl border border-border/40 bg-card px-5 py-4 cursor-text hover:border-border/70 transition-colors"
					onClick={() => {
						if (!canEdit) return;
						setDraft(description);
						setEditing(true);
					}}
				>
					<p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
						{description}
					</p>
				</div>
			) : (
				<button
					type="button"
					onClick={() => {
						if (!canEdit) return;
						setDraft("");
						setEditing(true);
					}}
					className="w-full rounded-xl border border-dashed border-border/50 bg-card/50 px-5 py-5 text-left text-sm text-muted-foreground/50 hover:border-border/70 hover:bg-card hover:text-muted-foreground/70 transition-colors"
				>
					Add description…
				</button>
			)}
		</div>
	);
}
