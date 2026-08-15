"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Users, User } from "lucide-react";

interface TargetComboboxProps {
  teams: { id: string; name: string }[];
  participants: { id: string; name: string; teamId: string }[];
}

type FilterType = "all" | "team" | "participant";

export default function TargetCombobox({ teams, participants }: TargetComboboxProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<{ type: "team" | "participant"; id: string; label: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const teamResults = filterType === "participant" ? [] : teams
      .filter(t => t.name.toLowerCase().includes(normalizedQuery))
      .map(t => ({ type: "team" as const, id: t.id, label: t.name, sublabel: "Equipe" }));

    const participantResults = filterType === "team" ? [] : participants
      .filter(p => p.name.toLowerCase().includes(normalizedQuery))
      .map(p => ({
        type: "participant" as const,
        id: p.id,
        label: p.name,
        sublabel: teams.find(t => t.id === p.teamId)?.name || "Sem equipe",
      }));

    return [...teamResults, ...participantResults];
  }, [query, filterType, teams, participants]);

  const handleSelect = (item: { type: "team" | "participant"; id: string; label: string }) => {
    setSelected(item);
    setQuery(item.label);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-bold text-[#8b4513] font-serif">Destino (Equipe ou Participante)</label>

      <div className="flex gap-2 mb-1">
        {(["all", "team", "participant"] as FilterType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
              filterType === type
                ? "bg-[#8b4513] text-white border-[#8b4513]"
                : "bg-white text-[#8b4513] border-[#d4af37]"
            }`}
          >
            {type === "all" ? "Todos" : type === "team" ? "Equipes" : "Participantes"}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b4513]/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Buscar equipe ou participante..."
          className="w-full pl-9 p-2 rounded-md border border-[#d4af37] bg-white font-sans"
          autoComplete="off"
        />

        {isOpen && results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-auto bg-white border border-[#d4af37] rounded-md shadow-lg">
            {results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#fdf6e3] transition-colors"
                >
                  {item.type === "team" ? (
                    <Users className="w-4 h-4 text-[#8b4513] shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-[#8b4513] shrink-0" />
                  )}
                  <span className="text-[#5c4033] font-medium">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-auto">{item.sublabel}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {isOpen && query.trim() && results.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-[#d4af37] rounded-md shadow-lg px-3 py-2 text-sm text-gray-500 italic">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>

      <input type="hidden" name="targetType" value={selected?.type || ""} />
      <input type="hidden" name="targetId" value={selected?.id || ""} />
    </div>
  );
}
