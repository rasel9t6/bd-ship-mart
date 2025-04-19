"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa6";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";
import { useRouter } from "next/navigation";

export default function Delete({ id, item }: { id: string; item: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onDelete() {
    try {
      setLoading(true);
      const endpoint =
        item === "product" ? `/api/products/${id}` : `/api/categories/${id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }

      toast.success(`${item} deleted successfully`);
      router.refresh();
    } catch (error) {
      console.error(`[${item}]_DELETE`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <span className="inline-flex h-10 items-center justify-center rounded-md bg-danger px-3 py-2 text-white">
          <FaTrash className="size-4" />
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-gray-1">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-danger">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. This will permanently delete your
            ${item}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="hover:bg-danger bg-danger/90 text-white"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : `Delete`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
