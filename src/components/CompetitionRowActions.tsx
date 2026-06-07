"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface CompetitionRowActionsProps {
  competition: { 
    id: string; 
    name: string; 
    description?: string;
    pointsValue: number;
    isCompleted: boolean;
    winnerTeamId?: string;
  };
  teams: { id: string; name: string }[];
  onUpdate: (id: string, name: string, description?: string, pointsValue?: number, isCompleted?: boolean, winnerTeamId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CompetitionRowActions({ competition, teams, onUpdate, onDelete }: CompetitionRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(competition.name);
  const [newDescription, setNewDescription] = useState(competition.description || "");
  const [newPoints, setNewPoints] = useState(competition.pointsValue);
  const [newIsCompleted, setNewIsCompleted] = useState(competition.isCompleted);
  const [newWinnerId, setNewWinnerId] = useState(competition.winnerTeamId || "");

  const handleUpdate = async () => {
    if (newName.trim()) {
      await onUpdate(competition.id, newName, newDescription, newPoints, newIsCompleted, newWinnerId || undefined);
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
      <div className="flex flex-col gap-2 p-3 bg-white rounded border-2 border-[#d4af37] shadow-lg absolute right-0 top-0 z-10 w-64 translate-x-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da Prova"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          autoFocus
        />
        <input
          type="number"
          value={newPoints}
          onChange={(e) => setNewPoints(Number(e.target.value))}
          placeholder="Pontos"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Descrição"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513] min-h-[50px]"
        />
        
        <label className="flex items-center gap-2 text-sm text-[#5c4033]">
          <input 
            type="checkbox" 
            checked={newIsCompleted} 
            onChange={(e) => setNewIsCompleted(e.target.checked)}
            className="rounded text-[#8b4513] focus:ring-[#8b4513]"
          />
          Concluída
        </label>

        {newIsCompleted && (
          <select
            value={newWinnerId}
            onChange={(e) => setNewWinnerId(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
          >
            <option value="">Selecione Equipe Vencedora</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-2 mt-1">
          <button onClick={handleUpdate} className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs font-bold">
            <Check className="w-3 h-3" /> SALVAR
          </button>
          <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">
            <X className="w-3 h-3" /> CANCELAR
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
