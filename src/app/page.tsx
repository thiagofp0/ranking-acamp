import { getTeamRanking, getParticipantRanking } from "@/lib/ranking";
import RankingDashboard from "@/components/RankingDashboard";
import { getDatabase } from "@/lib/database/sqlite";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const teamRanking = await getTeamRanking();
  const participantRankingRaw = await getParticipantRanking();
  const session = await getSession();
  
  // Para exibir o nome da equipe no ranking individual
  const db = getDatabase();
  const teams = await db.getTeams();
  
  const participantRanking = participantRankingRaw.map(p => ({
    ...p,
    teamName: teams.find(t => t.id === p.teamId)?.name
  }));

  return (
    <main>
      <RankingDashboard 
        initialTeamRanking={teamRanking} 
        initialParticipantRanking={participantRanking}
        isLoggedIn={!!session}
      />
    </main>
  );
}

