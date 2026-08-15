"use client";

import { useState } from "react";
import { Users, History, Crown } from "lucide-react";
import PointRowActions from "./PointRowActions";
import { PointRecord } from "@/lib/database/types";

interface TeamDetailTabsProps {
  teamId: string;
  participants: { id: string; name: string; isLeader: boolean }[];
  history: PointRecord[];
  competitions: { id: string; name: string }[];
  showActions: boolean;
  onUpdate: (id: string, points: number, description: string, revalidatePathStr: string) => Promise<void>;
  onDelete: (id: string, revalidatePathStr: string) => Promise<void>;
}

type Tab = "participants" | "points";

export default function TeamDetailTabs({
  teamId,
  participants,
  history,
  competitions,
  showActions,
  onUpdate,
  onDelete,
}: TeamDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("participants");

  return (
    <div className="bg-white rounded-2xl border-2 border-[#d4af37]/30 shadow-lg overflow-hidden">
      <div className="flex bg-[#8b4513]">
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-bold italic transition-colors ${
            activeTab === "participants" ? "bg-[#5c4033] text-white" : "text-white/70 hover:bg-[#5c4033]/50"
          }`}
        >
          <Users className="w-5 h-5" />
          Participantes
        </button>
        <button
          onClick={() => setActiveTab("points")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-bold italic transition-colors ${
            activeTab === "points" ? "bg-[#5c4033] text-white" : "text-white/70 hover:bg-[#5c4033]/50"
          }`}
        >
          <History className="w-5 h-5" />
          Pontos
        </button>
      </div>

      {activeTab === "participants" && (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d4af37]/30 bg-[#fdf6e3] text-[#5c4033] font-medium"
            >
              {p.isLeader && <Crown className="w-4 h-4 text-[#d4af37] shrink-0" aria-label="Líder" />}
              <span>{p.name}</span>
            </div>
          ))}
          {participants.length === 0 && (
            <p className="col-span-full text-center text-gray-400 italic py-4">
              Nenhum participante cadastrado nesta equipe.
            </p>
          )}
        </div>
      )}

      {activeTab === "points" && (
        <table className="w-full text-left">
          <thead className="bg-[#fdf6e3] border-b border-[#d4af37]/20 text-[#8b4513]">
            <tr>
              <th className="px-6 py-3 font-bold text-sm">Data</th>
              <th className="px-6 py-3 font-bold text-sm">Beneficiário</th>
              <th className="px-6 py-3 font-bold text-sm">Prova / Motivo</th>
              <th className="px-6 py-3 font-bold text-sm">Valor</th>
              {showActions && <th className="px-6 py-3 font-bold text-sm w-24">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10">
            {history.map((record) => {
              const participant = participants.find((p) => p.id === record.participantId);
              return (
                <tr key={record.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    {participant ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                        {participant.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100">
                        Equipe
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#5c4033]">
                      {competitions.find((c) => c.id === record.competitionId)?.name || "Lançamento Avulso"}
                    </p>
                    <p className="text-sm text-[#8b4513] italic">{record.description}</p>
                  </td>
                  <td className={`px-6 py-4 font-black ${record.points >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {record.points > 0 ? `+${record.points}` : record.points}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <PointRowActions
                        record={record}
                        revalidatePath={`/equipe/${teamId}`}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr>
                <td colSpan={showActions ? 5 : 4} className="px-6 py-12 text-center text-gray-400 italic">
                  Nenhum registro de pontuação encontrado até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
