"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface TeamFolderActionsProps {
  team: { id: string; name: string };
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TeamRowActions({ team, onUpdate, onDelete }: TeamFolderActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(team.name);

  const handleUpdate = async () => {
    if (newName.trim() && newName !== team.name) {
      await onUpdate(team.id, newName);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir a equipe "${team.name}"? Isso removerá todos os participantes e pontos vinculados a ela.`)) {
      await onDelete(team.id);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="px-2 py-1 text-sm border border-[#d4af37] rounded bg-white text-[#5c4033] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          autoFocus
        />
        <button onClick={handleUpdate} className="text-green-600 hover:bg-green-50 p-1 rounded">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={() => setIsEditing(false)} className="text-red-600 hover:bg-red-50 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Editar Equipe"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Excluir Equipe"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
