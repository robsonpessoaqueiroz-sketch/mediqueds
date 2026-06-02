import { Medicamento } from '@/types';
import { PencilIcon, TrashIcon, ClockIcon } from '@/components/icons';

interface MedicamentoCardProps {
  medicamento: Medicamento;
  onEdit: (medicamento: Medicamento) => void;
  onDelete: (medicamento: Medicamento) => void;
}

const FREQUENCIA_COLORS: Record<string, string> = {
  'Diário': 'bg-teal-100 text-teal-700',
  '2 vezes ao dia': 'bg-cyan-100 text-cyan-700',
  '3 vezes ao dia': 'bg-blue-100 text-blue-700',
  '4 vezes ao dia': 'bg-indigo-100 text-indigo-700',
  '6 em 6 horas': 'bg-violet-100 text-violet-700',
  '8 em 8 horas': 'bg-purple-100 text-purple-700',
  '12 em 12 horas': 'bg-pink-100 text-pink-700',
  'Semanal': 'bg-orange-100 text-orange-700',
  'Quinzenal': 'bg-amber-100 text-amber-700',
  'Mensal': 'bg-yellow-100 text-yellow-700',
  'Conforme necessário': 'bg-slate-100 text-slate-600',
};

function formatHorario(horario: string) {
  // horario can be "HH:MM:SS" or "HH:MM"
  return horario.slice(0, 5);
}

export function MedicamentoCard({ medicamento, onEdit, onDelete }: MedicamentoCardProps) {
  const badgeColor = FREQUENCIA_COLORS[medicamento.frequencia] || 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate group-hover:text-teal-700 transition-colors">
              {medicamento.nome}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{medicamento.dosagem}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(medicamento)}
              className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
              title="Editar"
            >
              <PencilIcon width={16} height={16} />
            </button>
            <button
              onClick={() => onDelete(medicamento)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Excluir"
            >
              <TrashIcon width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <ClockIcon width={14} height={14} className="text-teal-600" />
            <span className="text-sm font-semibold text-teal-700">{formatHorario(medicamento.horario)}</span>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${badgeColor}`}
          >
            {medicamento.frequencia}
          </span>
        </div>

        {/* Observação */}
        {medicamento.observacao && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-medium">Obs: </span>
              {medicamento.observacao}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
