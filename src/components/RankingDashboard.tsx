"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Trophy, Users, User, ScrollText, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface RankingItem {
  id: string;
  name: string;
  points: number;
  teamName?: string;
}

export default function RankingDashboard({
  initialTeamRanking,
  initialParticipantRanking,
  isLoggedIn = false,
}: {
  initialTeamRanking: RankingItem[];
  initialParticipantRanking: RankingItem[];
  isLoggedIn?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"teams" | "participants">("teams");

  const data = activeTab === "teams" ? initialTeamRanking : initialParticipantRanking;

  const exportToCSV = () => {
    const headers = activeTab === "teams" ? "Posicao,Equipe,Pontos" : "Posicao,Nome,Equipe,Pontos";
    const rows = data.map((item, index) => {
        if (activeTab === "teams") return `${index + 1},${item.name},${item.points}`;
        return `${index + 1},${item.name},${item.teamName || 'N/A'},${item.points}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ranking_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] font-serif p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-[#8b4513] rounded-full shadow-2xl border-4 border-[#d4af37]"
          >
            <Trophy className="w-12 h-12 text-[#d4af37]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-[#5c4033] italic tracking-tight"
          >
            Gincana Jeremias 29:13
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#8b4513] text-lg italic max-w-2xl mx-auto"
          >
            "Buscar-me-eis e me achareis, quando me buscardes de todo o vosso coração."
          </motion.p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex bg-[#5c4033] p-1 rounded-xl border-2 border-[#d4af37] shadow-lg">
            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all ${
                activeTab === "teams" 
                  ? "bg-[#d4af37] text-[#5c4033] font-bold shadow-inner" 
                  : "text-white hover:text-[#d4af37]"
              }`}
            >
              <Users className="w-5 h-5" />
              Equipes
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all ${
                activeTab === "participants" 
                  ? "bg-[#d4af37] text-[#5c4033] font-bold shadow-inner" 
                  : "text-white hover:text-[#d4af37]"
              }`}
            >
              <User className="w-5 h-5" />
              Individuais
            </button>
          </div>

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#8b4513] text-[#8b4513] rounded-xl hover:bg-[#8b4513] hover:text-white transition-all font-bold group shadow-md"
          >
            <Download className="w-5 h-5 group-hover:bounce" />
            Exportar Ranking
          </button>

          {isLoggedIn && (
            <Link 
              href="/admin"
              className="flex items-center gap-2 px-6 py-3 bg-[#5c4033] text-white rounded-xl hover:bg-[#8b4513] transition-all font-bold shadow-md border-2 border-[#d4af37]"
            >
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              Painel do Escriba
            </Link>
          )}
        </div>

        {/* Ranking List */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {data.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center p-6 bg-white border-b-4 rounded-2xl shadow-md border-[#d4af37]/30 hover:border-[#d4af37] transition-all group overflow-hidden relative overflow-hidden`}
                >
                  {/* Background Ornament */}
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ScrollText className="w-40 h-40 text-[#5c4033]" />
                  </div>

                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl mr-6 ${
                    index === 0 ? "bg-yellow-400 text-yellow-900 border-2 border-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.5)]" :
                    index === 1 ? "bg-gray-300 text-gray-700 border-2 border-gray-400" :
                    index === 2 ? "bg-amber-600 text-amber-100 border-2 border-amber-800" :
                    "bg-[#fdf6e3] text-[#5c4033]"
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#5c4033]">{item.name}</h3>
                    {item.teamName && (
                        <p className="text-sm text-[#8b4513] font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" /> {item.teamName}
                        </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black text-[#8b4513] group-hover:scale-110 transition-transform">
                      {item.points}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">PONTOS</div>
                  </div>
                </motion.div>
              ))}
              
              {data.length === 0 && (
                <div className="text-center py-20 text-[#8b4513] italic opacity-50">
                  Ainda não há pergaminhos registrados para este ranking.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="text-center pt-12 border-t border-[#d4af37]/20">
            <p className="text-[#8b4513]/60 text-sm">Escrito sob a luz da aurora para o Ranking Acampamento 2026</p>
        </footer>
      </div>
    </div>
  );
}
