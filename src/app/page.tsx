import { getTeamRanking, getParticipantRanking } from "@/lib/ranking";
import RankingDashboard from "@/components/RankingDashboard";
import { getDatabase } from "@/lib/database/sqlite";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const teamRanking = await getTeamRanking();
  const participantRankingRaw = await getParticipantRanking();
  const session = await getSession();
  
  const db = getDatabase();
  const teams = await db.getTeams();
  const competitions = await db.getCompetitions();
  const allPoints = await db.getPointsHistory({});
  
  const participantRanking = participantRankingRaw.map(p => ({
    ...p,
    teamName: teams.find(t => t.id === p.teamId)?.name
  }));

  return (
    <main>
      <RankingDashboard 
        initialTeamRanking={teamRanking} 
        initialParticipantRanking={participantRanking}
        competitions={competitions}
        teams={teams}
        allPoints={allPoints}
        isLoggedIn={!!session}
      />
    </main>
  );
}

