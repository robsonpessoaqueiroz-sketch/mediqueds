import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Medicamento, MedicamentoFormData } from '@/types';
import { MedicamentoModal } from '@/components/MedicamentoModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MedicamentoCard } from '@/components/MedicamentoCard';
import {
  HamburgerIcon,
  PlusIcon,
  LogoutIcon,
  PillIcon,
  UserIcon,
} from '@/components/icons';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [savingModal, setSavingModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicamento | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMed, setDeletingMed] = useState<Medicamento | null>(null);

  // Menu
  const [menuOpen, setMenuOpen] = useState(false);

  const userName =
    user?.user_metadata?.nome ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuário';

  const fetchMedicamentos = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('horario', { ascending: true });

    if (error) {
      showToast('Erro ao carregar medicamentos.', 'error');
    } else {
      setMedicamentos(data as Medicamento[]);
    }
    setLoadingData(false);
  }, [user, showToast]);

  useEffect(() => {
    fetchMedicamentos();
  }, [fetchMedicamentos]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#header-menu')) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut();
    showToast('Sessão encerrada. Até logo!', 'info');
    navigate('/login');
  };

  // CRUD — Create / Edit
  const handleOpenCreate = () => {
    setEditingMed(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (med: Medicamento) => {
    setEditingMed(med);
    setModalOpen(true);
  };

  const handleSaveMedicamento = async (formData: MedicamentoFormData) => {
    if (!user) return;
    setSavingModal(true);

    if (editingMed) {
      // UPDATE
      const { error } = await supabase
        .from('medicamentos')
        .update({
          nome: formData.nome,
          dosagem: formData.dosagem,
          horario: formData.horario,
          frequencia: formData.frequencia,
          observacao: formData.observacao || null,
        })
        .eq('id', editingMed.id)
        .eq('user_id', user.id);

      if (error) {
        showToast('Erro ao atualizar medicamento.', 'error');
      } else {
        showToast('Medicamento atualizado com sucesso!', 'success');
        setModalOpen(false);
        setEditingMed(null);
        fetchMedicamentos();
      }
    } else {
      // CREATE
      const { error } = await supabase.from('medicamentos').insert({
        user_id: user.id,
        nome: formData.nome,
        dosagem: formData.dosagem,
        horario: formData.horario,
        frequencia: formData.frequencia,
        observacao: formData.observacao || null,
      });

      if (error) {
        showToast('Erro ao adicionar medicamento.', 'error');
      } else {
        showToast('Medicamento adicionado com sucesso!', 'success');
        setModalOpen(false);
        fetchMedicamentos();
      }
    }

    setSavingModal(false);
  };

  // CRUD — Delete
  const handleOpenDelete = (med: Medicamento) => {
    setDeletingMed(med);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMed || !user) return;
    setDeletingId(deletingMed.id);

    const { error } = await supabase
      .from('medicamentos')
      .delete()
      .eq('id', deletingMed.id)
      .eq('user_id', user.id);

    setDeletingId(null);
    setDeleteDialogOpen(false);

    if (error) {
      showToast('Erro ao excluir medicamento.', 'error');
    } else {
      showToast('Medicamento excluído com sucesso!', 'success');
      setDeletingMed(null);
      fetchMedicamentos();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
              <PillIcon width={18} height={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">MediQueds</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User name (desktop) */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <UserIcon width={16} height={16} className="text-slate-400" />
              <span className="font-medium truncate max-w-[140px]">{userName}</span>
            </div>

            {/* Hamburger menu */}
            <div className="relative" id="header-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                aria-label="Menu"
              >
                <HamburgerIcon width={22} height={22} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  {/* User info (mobile) */}
                  <div className="sm:hidden px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogoutIcon width={18} height={18} />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Summary Banner */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-teal-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-teal-100 text-sm mb-1">Olá,</p>
              <h2 className="text-2xl font-bold">{userName} 👋</h2>
              <p className="text-teal-100 text-sm mt-1">
                {medicamentos.length === 0
                  ? 'Nenhum medicamento cadastrado ainda.'
                  : medicamentos.length === 1
                  ? '1 medicamento cadastrado'
                  : `${medicamentos.length} medicamentos cadastrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-4 text-center min-w-[80px]">
                <p className="text-3xl font-bold">{medicamentos.length}</p>
                <p className="text-xs text-teal-100 mt-0.5">
                  {medicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Meus Medicamentos</h3>
            <p className="text-sm text-slate-500">Ordenados por horário</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl shadow-md shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all text-sm"
          >
            <PlusIcon width={18} height={18} />
            <span className="hidden sm:inline">Adicionar</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Content */}
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Carregando medicamentos...</p>
          </div>
        ) : medicamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-dashed border-teal-200 flex items-center justify-center">
              <PillIcon width={36} height={36} className="text-teal-300" />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-medium">Nenhum medicamento cadastrado</p>
              <p className="text-slate-400 text-sm mt-1">
                Clique em "Adicionar" para cadastrar seu primeiro medicamento.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl shadow-md shadow-teal-200 hover:from-teal-600 hover:to-cyan-700 transition-all text-sm"
            >
              <PlusIcon width={18} height={18} />
              Adicionar medicamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicamentos.map((med) => (
              <MedicamentoCard
                key={med.id}
                medicamento={med}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add button (mobile) */}
      <button
        onClick={handleOpenCreate}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl shadow-lg shadow-teal-300 hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center sm:hidden"
        aria-label="Adicionar medicamento"
      >
        <PlusIcon width={24} height={24} />
      </button>

      {/* Medicamento Modal */}
      <MedicamentoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMed(null);
        }}
        onSave={handleSaveMedicamento}
        medicamento={editingMed}
        loading={savingModal}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingMed(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir medicamento"
        description={`Tem certeza que deseja excluir "${deletingMed?.nome}"? Esta ação não pode ser desfeita.`}
        loading={deletingId === deletingMed?.id}
      />
    </div>
  );
}
