import Link from "next/link";
import { BookOpen, Users, Trophy, ScrollText, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fdf6e3] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#5c4033] text-white p-6 flex flex-col border-r-4 border-[#d4af37]">
        <Link href="/admin" className="flex items-center gap-2 mb-10 pb-6 border-b border-[#d4af37]/30 hover:opacity-80 transition-opacity">
          <BookOpen className="w-8 h-8 text-[#d4af37]" />
          <span className="text-xl font-serif font-bold italic tracking-wider">Tabernáculo</span>
        </Link>

        <nav className="flex-1 space-y-4">
          <Link href="/admin/equipes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#8b4513] transition-colors group">
            <Users className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span className="font-medium">Equipes</span>
          </Link>
          <Link href="/admin/participantes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#8b4513] transition-colors group">
            <ScrollText className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span className="font-medium">Participantes</span>
          </Link>
          <Link href="/admin/provas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#8b4513] transition-colors group">
            <Trophy className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span className="font-medium">Provas</span>
          </Link>
          <Link href="/admin/pontos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#8b4513] transition-colors group">
            <ScrollText className="w-5 h-5 group-hover:text-[#d4af37]" />
            <span className="font-medium">Lançar Pontos</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#8b4513] transition-colors group border-t border-[#d4af37]/20 mt-4 pt-4">
            <Trophy className="w-5 h-5 text-[#d4af37]" />
            <span className="font-medium">Ver Ranking</span>
          </Link>
        </nav>

        <form action={logoutAction}>
          <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-900/40 text-red-200 transition-colors mt-auto">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
