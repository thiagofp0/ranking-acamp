import { getPointsHistory, updatePointsAction, deletePointsAction, getTeams } from "@/lib/data-actions";
import { getDatabase } from "@/lib/database/sqlite";
import { getSession } from "@/lib/auth";
import { ArrowLeft, History, Trophy } from "lucide-react";
import Link from "next/link";
import PointRowActions from "@/components/PointRowActions";
import { redirect } from "next/navigation";

export default async function EquipeDetalhesPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getSession();
  const db = getDatabase();
  
  const teams = await db.getTeams();
  const team = teams.find(t => t.id === id);
  
  if (!team) {
    redirect("/");
  }

  const participants = await db.getParticipants();
  const history = await getPointsHistory({ teamId: id });
  const competitions = await db.getCompetitions();

  const handleUpdate = async (pointId: string, points: number, description: string, path: string) => {
    "use server";
    await updatePointsAction(pointId, points, description, path);
  };

  const handleDelete = async (pointId: string, path: string) => {
    "use server";
    await deletePointsAction(pointId, path);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] p-6 md:p-12 font-serif">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-[#8b4513] hover:underline mb-4 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Ranking
        </Link>

        <div className="bg-white p-8 rounded-2xl border-4 border-[#d4af37] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 text-[#8b4513]" />
          </div>
          
          <h1 className="text-4xl font-bold text-[#5c4033] mb-2 uppercase tracking-tighter">
            {team.name}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-6xl font-black text-[#8b4513]">{team.points}</span>
            <span className="text-xl font-bold text-[#d4af37] uppercase tracking-widest">Pontos Totais</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#d4af37]/30 shadow-lg overflow-hidden">
          <div className="bg-[#8b4513] p-4 flex items-center gap-2 text-white">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-bold italic">Histórico de Providências</h2>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-[#fdf6e3] border-b border-[#d4af37]/20 text-[#8b4513]">
              <tr>
                <th className="px-6 py-3 font-bold text-sm">Data</th>
                <th className="px-6 py-3 font-bold text-sm">Beneficiário</th>
                <th className="px-6 py-3 font-bold text-sm">Prova / Motivo</th>
                <th className="px-6 py-3 font-bold text-sm">Valor</th>
                {session && <th className="px-6 py-3 font-bold text-sm w-24">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {history.map((record) => {
                const participant = participants.find(p => p.id === record.participantId);
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
                        {competitions.find(c => c.id === record.competitionId)?.name || "Lançamento Avulso"}
                      </p>
                      <p className="text-sm text-[#8b4513] italic">{record.description}</p>
                    </td>
                    <td className={`px-6 py-4 font-black ${record.points >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {record.points > 0 ? `+${record.points}` : record.points}
                    </td>
                    {session && (
                      <td className="px-6 py-4">
                        <PointRowActions 
                          record={record} 
                          revalidatePath={`/equipe/${id}`}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
              {history.length === 0 && (
                <tr>
                  <td colSpan={session ? 4 : 3} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhum registro de pontuação encontrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
