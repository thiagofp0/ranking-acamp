"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface PointRowActionsProps {
  record: { id: string; points: number; description: string };
  revalidatePath: string;
  onUpdate: (id: string, points: number, description: string, path: string) => Promise<void>;
  onDelete: (id: string, path: string) => Promise<void>;
}

export default function PointRowActions({ record, revalidatePath, onUpdate, onDelete }: PointRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPoints, setNewPoints] = useState(record.points);
  const [newDescription, setNewDescription] = useState(record.description);

  const handleUpdate = async () => {
    await onUpdate(record.id, newPoints, newDescription, revalidatePath);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este registro de pontos? O total da equipe/participante será atualizado.")) {
      await onDelete(record.id, revalidatePath);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-white rounded border border-[#d4af37] shadow-sm min-w-[200px]">
        <input
          type="number"
          value={newPoints}
          onChange={(e) => setNewPoints(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          autoFocus
        />
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          placeholder="Descrição"
        />
        <div className="flex justify-end gap-2 text-xs">
          <button onClick={handleUpdate} className="text-green-600 hover:bg-green-50 p-1 rounded font-bold">
            SALVAR
          </button>
          <button onClick={() => setIsEditing(false)} className="text-red-600 hover:bg-red-50 p-1 rounded font-bold">
            CANCELAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 px-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded text-xs"
      >
        Editar
      </button>
      <button
        onClick={handleDelete}
        className="p-1 px-2 text-red-600 hover:bg-red-50 border border-red-200 rounded text-xs"
      >
        Excluir
      </button>
    </div>
  );
}
