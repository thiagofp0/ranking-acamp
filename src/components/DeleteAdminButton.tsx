"use client";

import { Trash2 } from "lucide-react";

interface DeleteAdminButtonProps {
  id: string;
  isCurrentUser: boolean;
  onDelete: (formData: FormData) => void;
}

export default function DeleteAdminButton({ id, isCurrentUser, onDelete }: DeleteAdminButtonProps) {
  if (isCurrentUser) {
    return <span className="text-gray-400 italic text-xs">Auto-exclusão protegida</span>;
  }

  const actionWithConfirm = async (formData: FormData) => {
    if (confirm("Tem certeza que deseja remover este escriba?")) {
      await onDelete(formData);
    }
  };

  return (
    <form action={actionWithConfirm}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
