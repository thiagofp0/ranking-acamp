import { getCompetitions, createCompetition, updateCompetitionAction, deleteCompetitionAction } from "@/lib/data-actions";
import { Trophy } from "lucide-react";
import CompetitionRowActions from "@/components/CompetitionRowActions";

export default async function ProvasPage() {
  const competitions = await getCompetitions();

  const handleCreate = async (formData: FormData) => {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    if (name) await createCompetition(name, description);
  };

  const handleUpdate = async (id: string, name: string, description?: string) => {
    "use server";
    await updateCompetitionAction(id, name, description);
  };

  const handleDelete = async (id: string) => {
    "use server";
    await deleteCompetitionAction(id);
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Gerenciar Provas</h1>
      </div>

      <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#fdf6e3] rounded-lg border border-[#d4af37]/30">
        <input
          name="name"
          placeholder="Nome da Prova"
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          required
        />
        <input
          name="description"
          placeholder="Descrição (opcional)"
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[#8b4513] text-white font-bold rounded-md hover:bg-[#5c4033] transition-colors"
        >
          Cadastrar Prova
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => (
          <div key={comp.id} className="relative group p-6 bg-[#fdf6e3] rounded-lg border-2 border-[#d4af37] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold font-serif text-[#5c4033]">{comp.name}</h3>
              <CompetitionRowActions 
                competition={comp} 
                onUpdate={handleUpdate} 
                onDelete={handleDelete} 
              />
            </div>
            <p className="text-sm text-[#8b4513] italic">{comp.description || 'Sem descrição'}</p>
          </div>
        ))}
        {competitions.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 italic">
            Nenhuma prova cadastrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
