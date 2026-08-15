"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { addPointsAction } from "@/lib/data-actions";
import { useToast } from "./ToastProvider";
import TargetCombobox from "./TargetCombobox";

interface PontosFormProps {
  teams: { id: string; name: string }[];
  participants: { id: string; name: string; teamId: string }[];
  competitions: { id: string; name: string }[];
}

export default function PontosForm({ teams, participants, competitions }: PontosFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const targetType = formData.get("targetType") as string;
    const targetId = formData.get("targetId") as string;

    if (!targetType || !targetId) {
      showToast("Selecione uma equipe ou participante como destino.", "error");
      return;
    }

    const points = parseInt(formData.get("points") as string);
    const competitionId = formData.get("competitionId") as string;
    const description = formData.get("description") as string;

    startTransition(async () => {
      const result = await addPointsAction({
        teamId: targetType === "team" ? targetId : undefined,
        participantId: targetType === "participant" ? targetId : undefined,
        competitionId: competitionId || undefined,
        points,
        description,
      });

      if (result.success) {
        showToast("Pontos lançados com sucesso!", "success");
        formRef.current?.reset();
      } else {
        showToast(result.error || "Erro ao lançar pontos.", "error");
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TargetCombobox teams={teams} participants={participants} />

      <div className="space-y-2">
        <label className="block text-sm font-bold text-[#8b4513] font-serif">Prova/Evento (Opcional)</label>
        <select
          name="competitionId"
          className="w-full p-2 rounded-md border border-[#d4af37] bg-white"
        >
          <option value="">Nenhum</option>
          {competitions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-[#8b4513] font-serif">Pontos</label>
        <input
          name="points"
          type="number"
          placeholder="Ex: 50"
          className="w-full p-2 rounded-md border border-[#d4af37] bg-white font-sans"
          required
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="block text-sm font-bold text-[#8b4513] font-serif">Motivo / Descrição</label>
        <input
          name="description"
          placeholder="Ex: Primeiro lugar na gincana bíblica"
          className="w-full p-2 rounded-md border border-[#d4af37] bg-white font-sans"
          required
        />
      </div>

      <div className="md:col-span-2 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#8b4513] text-white font-bold rounded-lg hover:bg-[#5c4033] transition-all shadow-lg border-b-4 border-[#3d2b1f] disabled:opacity-60"
        >
          <Plus className="w-5 h-5" />
          {isPending ? "Lançando..." : "Lançar Pontos no Pergaminho"}
        </button>
      </div>
    </form>
  );
}
