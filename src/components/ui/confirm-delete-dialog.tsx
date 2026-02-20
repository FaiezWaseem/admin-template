"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

export function ConfirmDeleteDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone. This will permanently delete the content from our servers.",
    isDeleting = false,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevent modal from closing immediately
                            onConfirm();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
