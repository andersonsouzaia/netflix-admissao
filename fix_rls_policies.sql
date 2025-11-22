-- Políticas RLS (Row Level Security) para permitir acesso às tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS ou criar políticas para tabelas públicas (leitura)

-- Tabela: courses (pública - leitura)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for courses"
ON courses FOR SELECT
USING (true);

-- Tabela: units (pública - leitura)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for units"
ON units FOR SELECT
USING (true);

-- Tabela: admission_processes (pública - leitura)
ALTER TABLE admission_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for admission_processes"
ON admission_processes FOR SELECT
USING (true);

-- Tabela: admission_steps (pública - leitura)
ALTER TABLE admission_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for admission_steps"
ON admission_steps FOR SELECT
USING (true);

-- Tabela: step_fields (pública - leitura)
ALTER TABLE step_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for step_fields"
ON step_fields FOR SELECT
USING (true);

-- Tabela: step_documents (pública - leitura)
ALTER TABLE step_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for step_documents"
ON step_documents FOR SELECT
USING (true);

-- Tabela: step_evaluations (pública - leitura)
ALTER TABLE step_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for step_evaluations"
ON step_evaluations FOR SELECT
USING (true);

-- Tabela: step_evaluation_modules (pública - leitura)
ALTER TABLE step_evaluation_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for step_evaluation_modules"
ON step_evaluation_modules FOR SELECT
USING (true);

-- Tabela: step_evaluation_questions (pública - leitura)
ALTER TABLE step_evaluation_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for step_evaluation_questions"
ON step_evaluation_questions FOR SELECT
USING (true);

-- Tabela: certificate_configs (pública - leitura)
ALTER TABLE certificate_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for certificate_configs"
ON certificate_configs FOR SELECT
USING (true);

-- 2. Tabelas com acesso baseado em user_id

-- Tabela: registrations (usuário pode ver apenas suas próprias inscrições)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos (necessário para APIs server-side)
CREATE POLICY "Public read access for registrations"
ON registrations FOR SELECT
USING (true);

-- Permitir inserção para todos
CREATE POLICY "Public insert access for registrations"
ON registrations FOR INSERT
WITH CHECK (true);

-- Permitir atualização para todos
CREATE POLICY "Public update access for registrations"
ON registrations FOR UPDATE
USING (true)
WITH CHECK (true);

-- Tabela: registration_data (acesso baseado em registration_id)
ALTER TABLE registration_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for registration_data"
ON registration_data FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela: registration_documents (acesso baseado em registration_id)
ALTER TABLE registration_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for registration_documents"
ON registration_documents FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela: registration_evaluations (acesso baseado em registration_id)
ALTER TABLE registration_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for registration_evaluations"
ON registration_evaluations FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela: certificates (pública - leitura para validação)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para validação de certificados)
CREATE POLICY "Public read access for certificates"
ON certificates FOR SELECT
USING (true);

-- Permitir inserção para todos (para gerar certificados)
CREATE POLICY "Public insert access for certificates"
ON certificates FOR INSERT
WITH CHECK (true);

-- 3. Políticas para Storage (bucket de certificados)
-- NOTA: As políticas de storage devem ser configuradas via interface do Supabase
-- ou usando a função storage.create_policy() se disponível
-- 
-- Para configurar via interface:
-- 1. Vá em Storage > certificates > Policies
-- 2. Clique em "New Policy"
-- 3. Para leitura: Operation = SELECT, Policy = true, Target roles = public
-- 4. Para escrita: Operation = INSERT, Policy = true, Target roles = public
--
-- Alternativamente, você pode tornar o bucket público:
-- Storage > certificates > Settings > Public bucket = ON

