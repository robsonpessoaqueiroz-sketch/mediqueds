-- Tabela de medicamentos
CREATE TABLE medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  horario TIME NOT NULL,
  frequencia TEXT NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualização automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seus próprios medicamentos"
  ON medicamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem apenas seus próprios medicamentos"
  ON medicamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam apenas seus próprios medicamentos"
  ON medicamentos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam apenas seus próprios medicamentos"
  ON medicamentos FOR DELETE
  USING (auth.uid() = user_id);
