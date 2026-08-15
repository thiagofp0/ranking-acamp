import { getTeams, getParticipants, createParticipant, updateParticipantAction, deleteParticipantAction } from "@/lib/data-actions";
import { ScrollText } from "lucide-react";
import ParticipantsTable from "@/components/ParticipantsTable";

export const dynamic = "force-dynamic";

export default async function ParticipantesPage() {
  const teams = await getTeams();
  const participants = await getParticipants();

  const handleCreate = async (formData: FormData) => {
    "use server";
    const name = formData.get("name") as string;
    const teamId = formData.get("teamId") as string;
    const isLeader = formData.get("isLeader") === "on";
    if (name && teamId) await createParticipant(name, teamId, isLeader);
  };

  const handleUpdate = async (id: string, name: string, teamId: string, isLeader: boolean) => {
    "use server";
    await updateParticipantAction(id, name, teamId, isLeader);
  };

  const handleDelete = async (id: string) => {
    "use server";
    await deleteParticipantAction(id);
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <ScrollText className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Gerenciar Participantes</h1>
      </div>

      <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-[#fdf6e3] rounded-lg border border-[#d4af37]/30">
        <input
          name="name"
          placeholder="Nome do Participante"
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          required
        />
        <select
          name="teamId"
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          required
        >
          <option value="">Selecione a Equipe</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-1 text-[#5c4033] font-medium">
          <input
            type="checkbox"
            name="isLeader"
            className="rounded text-[#8b4513] focus:ring-[#8b4513]"
          />
          Líder da equipe
        </label>
        <button
          type="submit"
          className="px-6 py-2 bg-[#8b4513] text-white font-bold rounded-md hover:bg-[#5c4033] transition-colors"
        >
          Cadastrar Participante
        </button>
      </form>

      <ParticipantsTable
        participants={participants}
        teams={teams}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
