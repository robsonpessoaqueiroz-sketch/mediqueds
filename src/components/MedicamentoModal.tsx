import { useState, useEffect, FormEvent } from 'react';
import { Medicamento, MedicamentoFormData } from '@/types';
import { XIcon } from '@/components/icons';

const FREQUENCIAS = [
  'Diário',
  '2 vezes ao dia',
  '3 vezes ao dia',
  '4 vezes ao dia',
  '6 em 6 horas',
  '8 em 8 horas',
  '12 em 12 horas',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Conforme necessário',
];

interface MedicamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MedicamentoFormData) => Promise<void>;
  medicamento?: Medicamento | null;
  loading?: boolean;
}

const EMPTY_FORM: MedicamentoFormData = {
  nome: '',
  dosagem: '',
  horario: '',
  frequencia: '',
  observacao: '',
};

export function MedicamentoModal({
  isOpen,
  onClose,
  onSave,
  medicamento,
  loading = false,
}: MedicamentoModalProps) {
  const [form, setForm] = useState<MedicamentoFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<MedicamentoFormData>>({});

  const isEditing = !!medicamento;

  useEffect(() => {
    if (medicamento) {
      setForm({
        nome: medicamento.nome,
        dosagem: medicamento.dosagem,
        horario: medicamento.horario.slice(0, 5), // HH:MM
        frequencia: medicamento.frequencia,
        observacao: medicamento.observacao ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [medicamento, isOpen]);

  const validate = () => {
    const newErrors: Partial<MedicamentoFormData> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório.';
    if (!form.dosagem.trim()) newErrors.dosagem = 'Dosagem é obrigatória.';
    if (!form.horario) newErrors.horario = 'Horário é obrigatório.';
    if (!form.frequencia) newErrors.frequencia = 'Frequência é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  };

  const handleField = (field: keyof MedicamentoFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isEditing ? 'Editar Medicamento' : 'Adicionar Medicamento'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Atualize as informações do medicamento.' : 'Preencha os dados do novo medicamento.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome do medicamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => handleField('nome', e.target.value)}
                placeholder="Ex: Paracetamol, Losartana..."
                className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 placeholder-slate-400 text-sm outline-none transition-all
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                  ${errors.nome ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
            </div>

            {/* Dosagem */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Dosagem <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.dosagem}
                onChange={(e) => handleField('dosagem', e.target.value)}
                placeholder="Ex: 500mg, 1 comprimido, 10ml..."
                className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 placeholder-slate-400 text-sm outline-none transition-all
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                  ${errors.dosagem ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              {errors.dosagem && <p className="mt-1 text-xs text-red-600">{errors.dosagem}</p>}
            </div>

            {/* Horário + Frequência */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Horário <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.horario}
                  onChange={(e) => handleField('horario', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 text-sm outline-none transition-all
                    focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                    ${errors.horario ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                />
                {errors.horario && <p className="mt-1 text-xs text-red-600">{errors.horario}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Frequência <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.frequencia}
                  onChange={(e) => handleField('frequencia', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-800 text-sm outline-none transition-all
                    focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                    ${errors.frequencia ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <option value="">Selecione...</option>
                  {FREQUENCIAS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                {errors.frequencia && <p className="mt-1 text-xs text-red-600">{errors.frequencia}</p>}
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Observação{' '}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacao}
                onChange={(e) => handleField('observacao', e.target.value)}
                placeholder="Ex: Tomar após as refeições, evitar com leite..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Salvando...' : 'Adicionando...'}
                </span>
              ) : isEditing ? (
                'Salvar alterações'
              ) : (
                'Adicionar medicamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
