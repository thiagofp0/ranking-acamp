import { getTeams, getParticipants, getCompetitions, addPointsAction } from "@/lib/data-actions";
import { ScrollText, Plus } from "lucide-react";

export default async function PontosPage() {
  const teams = await getTeams();
  const participants = await getParticipants();
  const competitions = await getCompetitions();

  const handleAddPoints = async (formData: FormData) => {
    "use server";
    
    const targetType = formData.get("targetType") as string;
    const targetId = formData.get("targetId") as string;
    const points = parseInt(formData.get("points") as string);
    const competitionId = formData.get("competitionId") as string;
    const description = formData.get("description") as string;

    await addPointsAction({
      teamId: targetType === "team" ? targetId : undefined,
      participantId: targetType === "participant" ? targetId : undefined,
      competitionId: competitionId || undefined,
      points,
      description
    });
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <ScrollText className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Lançamento de Pontuação</h1>
      </div>

      <div className="bg-[#fdf6e3] p-8 rounded-lg border border-[#d4af37]/30 shadow-inner">
        <form action={handleAddPoints} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#8b4513] font-serif">Tipo de Pontuação</label>
            <select 
              name="targetType" 
              className="w-full p-2 rounded-md border border-[#d4af37] bg-white"
              required
            >
              <option value="team">Equipe</option>
              <option value="participant">Participante Individual</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#8b4513] font-serif">Destino (Equipe ou Participante)</label>
            <select 
              name="targetId" 
              className="w-full p-2 rounded-md border border-[#d4af37] bg-white font-sans"
              required
            >
              <optgroup label="Equipes">
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
              <optgroup label="Participantes">
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({teams.find(t => t.id === p.teamId)?.name})</option>
                ))}
              </optgroup>
            </select>
          </div>

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
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#8b4513] text-white font-bold rounded-lg hover:bg-[#5c4033] transition-all shadow-lg border-b-4 border-[#3d2b1f]"
            >
              <Plus className="w-5 h-5" />
              Lançar Pontos no Pergaminho
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#fdf6e3] p-4 rounded-lg border border-dashed border-[#d4af37] text-center">
        <p className="text-[#8b4513] italic font-serif">
          "Pois onde estiver o vosso tesouro, aí estará também o vosso coração." — Lucas 12:34
        </p>
      </div>
    </div>
  );
}
