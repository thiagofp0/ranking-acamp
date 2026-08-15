"use client";

import { useMemo, useState } from "react";
import { Crown, Search } from "lucide-react";
import Link from "next/link";
import ParticipantRowActions from "./ParticipantRowActions";

interface ParticipantsTableProps {
  participants: { id: string; name: string; teamId: string; points: number; isLeader: boolean }[];
  teams: { id: string; name: string }[];
  onUpdate: (id: string, name: string, teamId: string, isLeader: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ParticipantsTable({ participants, teams, onUpdate, onDelete }: ParticipantsTableProps) {
  const [nameQuery, setNameQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = nameQuery.trim().toLowerCase();
    return participants.filter((p) => {
      const matchesName = !normalizedQuery || p.name.toLowerCase().includes(normalizedQuery);
      const matchesTeam = !teamFilter || p.teamId === teamFilter;
      return matchesName && matchesTeam;
    });
  }, [participants, nameQuery, teamFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#fdf6e3] rounded-lg border border-[#d4af37]/30">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b4513]/60" />
          <input
            type="text"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-9 px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          />
        </div>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        >
          <option value="">Todas as Equipes</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d4af37]">
        <table className="w-full text-left">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="px-6 py-3 font-serif italic">Nome</th>
              <th className="px-6 py-3 font-serif italic">Equipe</th>
              <th className="px-6 py-3 font-serif italic">Pontos Individuais</th>
              <th className="px-6 py-3 font-serif italic w-32">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/30">
            {filteredParticipants.map((participant) => (
              <tr key={participant.id} className="hover:bg-[#fdf6e3] transition-colors group">
                <td className="px-6 py-4 text-[#5c4033] font-medium">
                  <Link
                    href={`/participante/${participant.id}`}
                    className="flex items-center gap-1.5 hover:underline hover:text-[#8b4513] w-fit"
                  >
                    {participant.name}
                    {participant.isLeader && (
                      <Crown className="w-4 h-4 text-[#d4af37]" aria-label="Líder" />
                    )}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#5c4033]">{teams.find(t => t.id === participant.teamId)?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-[#8b4513] font-bold">{participant.points}</td>
                <td className="px-6 py-4">
                  <ParticipantRowActions
                    participant={participant}
                    teams={teams}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
            {filteredParticipants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  {participants.length === 0
                    ? "Nenhum participante cadastrado ainda."
                    : "Nenhum participante encontrado com os filtros selecionados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
