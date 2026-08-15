import { getPointsHistory, updatePointsAction, deletePointsAction } from "@/lib/data-actions";
import { getDatabase } from "@/lib/database/sqlite";
import { getSession } from "@/lib/auth";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import TeamDetailTabs from "@/components/TeamDetailTabs";
import { redirect } from "next/navigation";

export default async function EquipeDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const db = getDatabase();

  const teams = await db.getTeams();
  const team = teams.find(t => t.id === id);

  if (!team) {
    redirect("/");
  }

  const participants = await db.getParticipants();
  const teamParticipants = participants.filter(p => p.teamId === id);
  const history = await getPointsHistory({ teamId: id });
  const competitions = await db.getCompetitions();

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

        <TeamDetailTabs
          teamId={id}
          participants={teamParticipants}
          history={history}
          competitions={competitions}
          showActions={!!session}
          onUpdate={updatePointsAction}
          onDelete={deletePointsAction}
        />
      </div>
    </div>
  );
}
