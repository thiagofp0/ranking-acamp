"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Trophy, Users, User, ScrollText, Download, ShieldCheck, CheckCircle2, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Competition, Team, Participant, PointRecord } from "@/lib/database/types";

interface RankingItem {
  id: string;
  name: string;
  points: number;
  teamName?: string;
}

export default function RankingDashboard({
  initialTeamRanking,
  initialParticipantRanking,
  competitions = [],
  teams = [],
  participants = [],
  allPoints = [],
  isLoggedIn = false,
}: {
  initialTeamRanking: RankingItem[];
  initialParticipantRanking: RankingItem[];
  competitions?: Competition[];
  teams?: Team[];
  participants?: Participant[];
  allPoints?: PointRecord[];
  isLoggedIn?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"teams" | "participants" | "provas">("teams");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const data = activeTab === "teams" ? initialTeamRanking : (activeTab === "participants" ? initialParticipantRanking : []);

  const downloadCSV = (headers: string, rows: string[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRanking = () => {
    const headers = activeTab === "teams" ? "Posicao,Equipe,Pontos" : "Posicao,Nome,Equipe,Pontos";
    const rows = data.map((item, index) => {
        if (activeTab === "teams") return `${index + 1},${item.name},${item.points}`;
        return `${index + 1},${item.name},${item.teamName || 'N/A'},${item.points}`;
    });
    downloadCSV(headers, rows, `ranking_${activeTab}.csv`);
  };

  const exportFullPointsHistory = () => {
    const headers = "Data,Equipe,Participante,Prova/Motivo,Pontos,Descricao";
    const rows = allPoints.map(p => {
      // Find team name
      let teamName = "N/A";
      if (p.teamId) {
        teamName = teams.find(t => t.id === p.teamId)?.name || "N/A";
      } else if (p.participantId) {
        const part = participants.find(part => part.id === p.participantId);
        if (part) {
          teamName = teams.find(t => t.id === part.teamId)?.name || "N/A";
        }
      }

      const participant = participants.find(part => part.id === p.participantId)?.name || "Equipe";
      const comp = competitions.find(c => c.id === p.competitionId)?.name || "Avulso";
      const date = new Date(p.createdAt).toLocaleDateString("pt-BR");
      return `${date},${teamName},${participant},${comp},${p.points},${p.description}`;
    });
    downloadCSV(headers, rows, "historico_completo_pontos.csv");
  };

  const exportParticipantsList = () => {
    const headers = "Nome,Equipe,Pontos Totais";
    const rows = initialParticipantRanking.map(p => `${p.name},${p.teamName || 'N/A'},${p.points}`);
    downloadCSV(headers, rows, "lista_participantes.csv");
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
            {/* ... botões das tabs (já existentes) ... */}
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
            <button
              onClick={() => setActiveTab("provas")}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all ${
                activeTab === "provas" 
                  ? "bg-[#d4af37] text-[#5c4033] font-bold shadow-inner" 
                  : "text-white hover:text-[#d4af37]"
              }`}
            >
              <ScrollText className="w-5 h-5" />
              Provas
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#8b4513] text-[#8b4513] rounded-xl hover:bg-[#8b4513] hover:text-white transition-all font-bold group shadow-md"
            >
              <Download className="w-5 h-5 group-hover:bounce" />
              Exportar Dados
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportOptions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showExportOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white border-2 border-[#d4af37] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => { exportRanking(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-[#fdf6e3] text-[#5c4033] font-medium border-b border-[#d4af37]/10 flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" /> Exportar Ranking Atual
                  </button>
                  <button 
                    onClick={() => { exportParticipantsList(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-[#fdf6e3] text-[#5c4033] font-medium border-b border-[#d4af37]/10 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" /> Lista de Participantes
                  </button>
                  <button 
                    onClick={() => { exportFullPointsHistory(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-[#fdf6e3] text-[#5c4033] font-bold text-[#8b4513] flex items-center gap-2"
                  >
                    <ScrollText className="w-4 h-4" /> Histórico Completo (Excel)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            {activeTab === "provas" ? (
              <motion.div
                key="provas"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {competitions.map((comp, idx) => (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-2xl border-4 border-[#d4af37]/30 shadow-lg relative overflow-hidden group hover:border-[#d4af37] transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${comp.isCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {comp.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-yellow-600" />}
                      </div>
                      <span className="text-xl font-black text-[#8b4513] bg-[#fdf6e3] px-3 py-1 rounded-full border border-[#d4af37]">
                        {comp.pointsValue}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#5c4033] mb-2">{comp.name}</h3>
                    <p className="text-[#8b4513] text-sm italic mb-4 min-h-[40px]">
                      {comp.description || "Nenhuma descrição detalhada fornecida pelos escribas."}
                    </p>

                    <div className="pt-4 border-t border-[#d4af37]/10 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${comp.isCompleted ? 'bg-green-600 text-white' : 'bg-[#5c4033] text-white'}`}>
                        {comp.isCompleted ? "CONCLUÍDA" : "EM ANDAMENTO"}
                      </span>
                      
                      {comp.isCompleted && comp.winnerTeamId && (
                        <div className="text-right">
                          <p className="text-[10px] text-[#8b4513] font-bold">VENCEDOR</p>
                          <p className="text-sm font-bold text-[#5c4033] uppercase">
                            {teams.find(t => t.id === comp.winnerTeamId)?.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                      <Trophy className="w-24 h-24" />
                    </div>
                  </motion.div>
                ))}
                {competitions.length === 0 && (
                  <div className="col-span-full py-20 text-center text-[#8b4513] italic text-xl">
                    "Ainda não há registros das batalhas que virão."
                  </div>
                )}
              </motion.div>
            ) : (
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
                    {/* Background Ornament ... (linhas 157-194 preservadas) */}
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
                      <Link 
                        href={activeTab === 'teams' ? `/equipe/${item.id}` : `/participante/${item.id}`}
                        className="text-2xl font-bold text-[#5c4033] hover:text-[#8b4513] transition-colors decoration-dotted hover:underline"
                      >
                        {item.name}
                      </Link>
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
            )}
          </AnimatePresence>
        </div>

        <footer className="text-center pt-12 border-t border-[#d4af37]/20">
            <p className="text-[#8b4513]/60 text-sm">Escrito sob a luz da aurora para o Ranking Acampamento 2026</p>
        </footer>
      </div>
    </div>
  );
}
