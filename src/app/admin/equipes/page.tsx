import { getTeams, getParticipants, createTeam, updateTeamAction, deleteTeamAction } from "@/lib/data-actions";
import { BookMarked, AlertTriangle } from "lucide-react";
import TeamRowActions from "@/components/TeamRowActions";

export const dynamic = "force-dynamic";

export default async function EquipesPage() {
  const teams = await getTeams();
  const participants = await getParticipants();

  const handleCreate = async (formData: FormData) => {
    "use server";
    const name = formData.get("name") as string;
    if (name) await createTeam(name);
  };

  const handleUpdate = async (id: string, name: string) => {
    "use server";
    await updateTeamAction(id, name);
  };

  const handleDelete = async (id: string) => {
    "use server";
    await deleteTeamAction(id);
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <BookMarked className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Gerenciar Equipes</h1>
      </div>

      <form action={handleCreate} className="flex gap-4 p-6 bg-[#fdf6e3] rounded-lg border border-[#d4af37]/30">
        <input
          name="name"
          placeholder="Nome da Equipe (Ex: Tribo de Judá)"
          className="flex-1 px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[#8b4513] text-white font-bold rounded-md hover:bg-[#5c4033] transition-colors"
        >
          Cadastrar Equipe
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-[#d4af37]">
        <table className="w-full text-left">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="px-6 py-3 font-serif italic">Nome da Equipe</th>
              <th className="px-6 py-3 font-serif italic">Pontos Acumulados</th>
              <th className="px-6 py-3 font-serif italic w-32">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/30">
            {teams.map((team) => {
              const hasLeader = participants.some(p => p.teamId === team.id && p.isLeader);
              return (
              <tr key={team.id} className="hover:bg-[#fdf6e3] transition-colors group">
                <td className="px-6 py-4 text-[#5c4033] font-medium">
                  <span className="flex items-center gap-2">
                    {team.name}
                    {!hasLeader && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Sem líder definido
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#8b4513] font-bold">{team.points}</td>
                <td className="px-6 py-4">
                  <TeamRowActions 
                    team={team} 
                    onUpdate={handleUpdate} 
                    onDelete={handleDelete} 
                  />
                </td>
              </tr>
              );
            })}
            {teams.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                  Nenhuma equipe cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
