import { getTeams, getParticipants, getCompetitions } from "@/lib/data-actions";
import { BookOpen, Users, Trophy, ScrollText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const teams = await getTeams();
  const participants = await getParticipants();
  const competitions = await getCompetitions();

  const stats = [
    { label: "Equipes", value: teams.length, icon: Users, color: "text-blue-600", href: "/admin/equipes" },
    { label: "Participantes", value: participants.length, icon: ScrollText, color: "text-green-600", href: "/admin/participantes" },
    { label: "Provas", value: competitions.length, icon: Trophy, color: "text-amber-600", href: "/admin/provas" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-serif text-[#5c4033]">Painel do Escriba</h1>
        <p className="text-[#8b4513] italic">Gerencie o ranking e as atividades do acampamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-6 bg-white rounded-xl border-2 border-[#d4af37] shadow-sm hover:shadow-md transition-shadow cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-[#5c4033]">{stat.value}</p>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
            </div>
          </Link>
        ))}
      </div>

      <div className="p-8 bg-[#fdf6e3] rounded-2xl border-2 border-dashed border-[#d4af37] text-center">
        <BookOpen className="w-12 h-12 text-[#8b4513] mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-serif font-bold text-[#5c4033] mb-2">Bem-vindo, Administrador!</h2>
        <p className="text-[#8b4513] max-w-md mx-auto">
          Utilize o menu lateral para gerenciar as tribos, registrar os servos e lançar os resultados das provações.
        </p>
      </div>
    </div>
  );
}
