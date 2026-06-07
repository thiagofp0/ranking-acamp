"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface CompetitionRowActionsProps {
  competition: { id: string; name: string; description?: string };
  onUpdate: (id: string, name: string, description?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CompetitionRowActions({ competition, onUpdate, onDelete }: CompetitionRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(competition.name);
  const [newDescription, setNewDescription] = useState(competition.description || "");

  const handleUpdate = async () => {
    if (newName.trim()) {
      await onUpdate(competition.id, newName, newDescription);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir a prova "${competition.name}"? Isso removerá o histórico de pontos vinculado a ela.`)) {
      await onDelete(competition.id);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white rounded border border-[#d4af37] shadow-sm">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da Prova"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          autoFocus
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Descrição"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513] min-h-[60px]"
        />
        <div className="flex justify-end gap-2 text-xs">
          <button onClick={handleUpdate} className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded">
            <Check className="w-3 h-3" /> Salvar
          </button>
          <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded">
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Editar Prova"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Excluir Prova"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
