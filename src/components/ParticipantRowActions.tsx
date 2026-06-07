"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface ParticipantRowActionsProps {
  participant: { id: string; name: string; teamId: string };
  teams: { id: string; name: string }[];
  onUpdate: (id: string, name: string, teamId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ParticipantRowActions({ participant, teams, onUpdate, onDelete }: ParticipantRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(participant.name);
  const [newTeamId, setNewTeamId] = useState(participant.teamId);

  const handleUpdate = async () => {
    if (newName.trim() && newTeamId) {
      await onUpdate(participant.id, newName, newTeamId);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir o participante "${participant.name}"? Isso removerá o histórico de pontos e diminuirá o total da equipe.`)) {
      await onDelete(participant.id);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="px-2 py-1 text-sm border border-[#d4af37] rounded bg-white text-[#5c4033] focus:outline-none focus:ring-1 focus:ring-[#8b4513] w-40"
          autoFocus
        />
        <select
          value={newTeamId}
          onChange={(e) => setNewTeamId(e.target.value)}
          className="px-2 py-1 text-sm border border-[#d4af37] rounded bg-white text-[#5c4033] focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
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
        title="Editar Participante"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Excluir Participante"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
