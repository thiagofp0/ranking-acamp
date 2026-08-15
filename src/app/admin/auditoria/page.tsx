import { getAuditLogs, getAdmins } from "@/lib/data-actions";
import { History } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  team_created: "Equipe criada",
  team_updated: "Equipe atualizada",
  team_deleted: "Equipe excluída",
  participant_created: "Participante criado",
  participant_updated: "Participante atualizado",
  participant_deleted: "Participante excluído",
  competition_created: "Prova criada",
  competition_updated: "Prova atualizada",
  competition_deleted: "Prova excluída",
  points_added: "Pontos lançados",
  points_updated: "Pontos atualizados",
  points_deleted: "Pontos excluídos",
  admin_created: "Escriba criado",
  admin_updated: "Escriba atualizado",
  admin_deleted: "Escriba excluído",
};

const PAGE_SIZE = 20;

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ actionType?: string; userId?: string; from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;

  const [{ items, total }, admins] = await Promise.all([
    getAuditLogs({
      actionType: params.actionType || undefined,
      userId: params.userId || undefined,
      from: params.from || undefined,
      to: params.to || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    getAdmins(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams();
    if (params.actionType) query.set("actionType", params.actionType);
    if (params.userId) query.set("userId", params.userId);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    query.set("page", String(targetPage));
    return `/admin/auditoria?${query.toString()}`;
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <History className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Auditoria de Ações</h1>
      </div>

      <form
        method="get"
        className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-[#fdf6e3] rounded-lg border border-[#d4af37]/30"
      >
        <select
          name="actionType"
          defaultValue={params.actionType || ""}
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          name="userId"
          defaultValue={params.userId || ""}
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        >
          <option value="">Todos os usuários</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>{admin.username}</option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          defaultValue={params.from || ""}
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to || ""}
          className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
        />

        <button
          type="submit"
          className="px-6 py-2 bg-[#8b4513] text-white font-bold rounded-md hover:bg-[#5c4033] transition-colors"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-[#d4af37]">
        <table className="w-full text-left">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="px-6 py-3 font-serif italic">Data</th>
              <th className="px-6 py-3 font-serif italic">Usuário</th>
              <th className="px-6 py-3 font-serif italic">Ação</th>
              <th className="px-6 py-3 font-serif italic">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/30">
            {items.map((log) => (
              <tr key={log.id} className="hover:bg-[#fdf6e3] transition-colors">
                <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-6 py-4 text-[#5c4033] font-medium">{log.performedByUsername}</td>
                <td className="px-6 py-4 text-[#8b4513] font-bold">
                  {ACTION_LABELS[log.actionType] || log.actionType}
                </td>
                <td className="px-6 py-4 text-[#5c4033]">{log.description}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  Nenhuma ação registrada com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`px-4 py-2 rounded-md border border-[#d4af37] font-bold ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[#fdf6e3]"}`}
          >
            Anterior
          </Link>
          <span className="text-[#8b4513] font-medium">Página {page} de {totalPages}</span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`px-4 py-2 rounded-md border border-[#d4af37] font-bold ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[#fdf6e3]"}`}
          >
            Próxima
          </Link>
        </div>
      )}
    </div>
  );
}
