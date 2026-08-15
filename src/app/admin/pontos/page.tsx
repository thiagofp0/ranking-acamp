import { getTeams, getParticipants, getCompetitions } from "@/lib/data-actions";
import { ScrollText } from "lucide-react";
import PontosForm from "@/components/PontosForm";

export const dynamic = "force-dynamic";

export default async function PontosPage() {
  const teams = await getTeams();
  const participants = await getParticipants();
  const competitions = await getCompetitions();

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <ScrollText className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Lançamento de Pontuação</h1>
      </div>

      <div className="bg-[#fdf6e3] p-8 rounded-lg border border-[#d4af37]/30 shadow-inner">
        <PontosForm teams={teams} participants={participants} competitions={competitions} />
      </div>

      <div className="bg-[#fdf6e3] p-4 rounded-lg border border-dashed border-[#d4af37] text-center">
        <p className="text-[#8b4513] italic font-serif">
          &ldquo;Pois onde estiver o vosso tesouro, aí estará também o vosso coração.&rdquo; — Lucas 12:34
        </p>
      </div>
    </div>
  );
}
