"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteDialogProps = Readonly<{
	id: string;
	label?: string;
	action: (id: string) => Promise<{
		success: boolean;
		message: string;
	}>;
}>;

function DeleteDialog({ id, label = "item", action }: DeleteDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			const response = await action(id);

			if (!response.success) {
				toast.error(response.message);
				return;
			}

			toast.success(response.message);
			setOpen(false);
			router.refresh();
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button type="button" variant="destructive" size="sm">
					<Trash2 className="size-3.5" />
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {label}?</AlertDialogTitle>
					<AlertDialogDescription>
						This cannot be undone. Products connected to existing
						orders will be protected from deletion.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						Cancel
					</AlertDialogCancel>
					<Button
						type="button"
						variant="destructive"
						disabled={isPending}
						onClick={handleDelete}
					>
						{isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							<Trash2 className="size-3.5" />
						)}
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default DeleteDialog;
