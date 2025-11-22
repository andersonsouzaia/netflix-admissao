-- Script para popular o banco de dados com dados de exemplo
-- Execute este script no SQL Editor do Supabase

-- Limpar dados existentes (opcional - descomente se quiser limpar primeiro)
-- TRUNCATE TABLE certificates CASCADE;
-- TRUNCATE TABLE certificate_configs CASCADE;
-- TRUNCATE TABLE registration_evaluations CASCADE;
-- TRUNCATE TABLE registration_documents CASCADE;
-- TRUNCATE TABLE registration_data CASCADE;
-- TRUNCATE TABLE registrations CASCADE;
-- TRUNCATE TABLE step_evaluation_questions CASCADE;
-- TRUNCATE TABLE step_evaluation_modules CASCADE;
-- TRUNCATE TABLE step_evaluations CASCADE;
-- TRUNCATE TABLE step_documents CASCADE;
-- TRUNCATE TABLE step_fields CASCADE;
-- TRUNCATE TABLE admission_steps CASCADE;
-- TRUNCATE TABLE admission_processes CASCADE;
-- TRUNCATE TABLE units CASCADE;
-- TRUNCATE TABLE courses CASCADE;

-- Inserir cursos
INSERT INTO courses (name, description, image_url, type, modality)
VALUES
  ('Administração', 'Curso de graduação em Administração com foco em gestão estratégica e liderança.', '/business-execution-discipline.jpg', 'graduacao', 'presencial'),
  ('Psicologia', 'Curso de graduação em Psicologia com ênfase em psicologia clínica e organizacional.', '/emotional-intelligence-brain.jpg', 'graduacao', 'presencial'),
  ('MBA em Gestão de Negócios', 'Pós-graduação em Gestão de Negócios com foco em estratégia e inovação.', '/competitive-strategy-business.jpg', 'pos_graduacao', 'ead'),
  ('Marketing Digital', 'Curso livre de Marketing Digital com técnicas avançadas de SEO e redes sociais.', '/digital-marketing-advanced.jpg', 'livre', 'ead')
ON CONFLICT DO NOTHING;

-- Obter IDs dos cursos inseridos
DO $$
DECLARE
  course1_id INTEGER;
  course2_id INTEGER;
  course3_id INTEGER;
  course4_id INTEGER;
  unit1_id INTEGER;
  unit2_id INTEGER;
  unit3_id INTEGER;
  unit4_id INTEGER;
  unit5_id INTEGER;
  process1_id INTEGER;
  process2_id INTEGER;
  process3_id INTEGER;
  process4_id INTEGER;
  process5_id INTEGER;
  process6_id INTEGER;
  step1_id INTEGER;
  step2_id INTEGER;
  step3_id INTEGER;
  step4_id INTEGER;
  step5_id INTEGER;
  step6_id INTEGER;
  evaluation_id INTEGER;
BEGIN
  -- Obter IDs dos cursos
  SELECT id INTO course1_id FROM courses WHERE name = 'Administração' LIMIT 1;
  SELECT id INTO course2_id FROM courses WHERE name = 'Psicologia' LIMIT 1;
  SELECT id INTO course3_id FROM courses WHERE name = 'MBA em Gestão de Negócios' LIMIT 1;
  SELECT id INTO course4_id FROM courses WHERE name = 'Marketing Digital' LIMIT 1;

  -- Inserir unidades
  INSERT INTO units (course_id, name, description)
  VALUES
    (course1_id, 'Unidade Centro', 'Campus localizado no centro da cidade'),
    (course1_id, 'Unidade Norte', 'Campus localizado na zona norte'),
    (course2_id, 'Unidade Principal', 'Campus principal'),
    (course3_id, 'EAD Nacional', 'Modalidade EAD para todo o Brasil'),
    (course4_id, 'Online', 'Curso totalmente online')
  ON CONFLICT DO NOTHING
  RETURNING id INTO unit1_id;

  -- Obter IDs das unidades
  SELECT id INTO unit1_id FROM units WHERE name = 'Unidade Centro' AND course_id = course1_id LIMIT 1;
  SELECT id INTO unit2_id FROM units WHERE name = 'Unidade Norte' AND course_id = course1_id LIMIT 1;
  SELECT id INTO unit3_id FROM units WHERE name = 'Unidade Principal' AND course_id = course2_id LIMIT 1;
  SELECT id INTO unit4_id FROM units WHERE name = 'EAD Nacional' AND course_id = course3_id LIMIT 1;
  SELECT id INTO unit5_id FROM units WHERE name = 'Online' AND course_id = course4_id LIMIT 1;

  -- Inserir processos seletivos
  INSERT INTO admission_processes (unit_id, name, description, is_active)
  VALUES
    (unit1_id, 'Vestibular 2025.1', 'Processo seletivo para o primeiro semestre de 2025', true),
    (unit1_id, 'ENEM', 'Ingresso via nota do ENEM', true),
    (unit2_id, 'Vestibular 2025.1', 'Processo seletivo para o primeiro semestre de 2025', true),
    (unit3_id, 'Processo Seletivo', 'Processo único de seleção', true),
    (unit4_id, 'Inscrição Online', 'Inscrição direta para curso EAD', true),
    (unit5_id, 'Inscrição Livre', 'Inscrição aberta para curso livre', true)
  ON CONFLICT DO NOTHING;

  -- Obter IDs dos processos
  SELECT id INTO process1_id FROM admission_processes WHERE name = 'Vestibular 2025.1' AND unit_id = unit1_id LIMIT 1;
  SELECT id INTO process2_id FROM admission_processes WHERE name = 'ENEM' AND unit_id = unit1_id LIMIT 1;
  SELECT id INTO process3_id FROM admission_processes WHERE name = 'Vestibular 2025.1' AND unit_id = unit2_id LIMIT 1;
  SELECT id INTO process4_id FROM admission_processes WHERE name = 'Processo Seletivo' AND unit_id = unit3_id LIMIT 1;
  SELECT id INTO process5_id FROM admission_processes WHERE name = 'Inscrição Online' AND unit_id = unit4_id LIMIT 1;
  SELECT id INTO process6_id FROM admission_processes WHERE name = 'Inscrição Livre' AND unit_id = unit5_id LIMIT 1;

  -- Inserir passos do formulário para o primeiro processo
  INSERT INTO admission_steps (process_id, step_type, name, order_index, is_required)
  VALUES
    (process1_id, 'basic_data', 'Dados Básicos', 1, true),
    (process1_id, 'complementary_data', 'Endereço', 2, true),
    (process1_id, 'documents', 'Documentos', 3, true),
    (process1_id, 'evaluation', 'Avaliação', 4, true),
    (process1_id, 'payment', 'Pagamento', 5, true),
    (process1_id, 'contract', 'Contrato', 6, true)
  ON CONFLICT DO NOTHING;

  -- Obter IDs dos passos
  SELECT id INTO step1_id FROM admission_steps WHERE process_id = process1_id AND order_index = 1 LIMIT 1;
  SELECT id INTO step2_id FROM admission_steps WHERE process_id = process1_id AND order_index = 2 LIMIT 1;
  SELECT id INTO step3_id FROM admission_steps WHERE process_id = process1_id AND order_index = 3 LIMIT 1;
  SELECT id INTO step4_id FROM admission_steps WHERE process_id = process1_id AND order_index = 4 LIMIT 1;
  SELECT id INTO step5_id FROM admission_steps WHERE process_id = process1_id AND order_index = 5 LIMIT 1;
  SELECT id INTO step6_id FROM admission_steps WHERE process_id = process1_id AND order_index = 6 LIMIT 1;

  -- Inserir campos personalizados
  INSERT INTO step_fields (step_id, field_name, field_label, field_type, is_required, order_index, options)
  VALUES
    (step2_id, 'phone', 'Telefone', 'text', true, 1, NULL),
    (step2_id, 'birth_date', 'Data de Nascimento', 'date', true, 2, NULL),
    (step2_id, 'address', 'Endereço', 'textarea', true, 3, NULL),
    (step2_id, 'city', 'Cidade', 'text', true, 4, NULL),
    (step2_id, 'state', 'Estado', 'select', true, 5, '["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]')
  ON CONFLICT DO NOTHING;

  -- Inserir documentos exigidos
  INSERT INTO step_documents (step_id, name, description, is_required, accepted_formats, max_size_mb, order_index)
  VALUES
    (step3_id, 'RG', 'Cópia do RG ou CNH', true, '["pdf","jpg","png"]', 5, 1),
    (step3_id, 'CPF', 'Cópia do CPF', true, '["pdf","jpg","png"]', 5, 2),
    (step3_id, 'Comprovante de Residência', 'Comprovante de endereço recente', true, '["pdf"]', 10, 3),
    (step3_id, 'Histórico Escolar', 'Histórico escolar do ensino médio', true, '["pdf"]', 10, 4)
  ON CONFLICT DO NOTHING;

  -- Inserir avaliação
  INSERT INTO step_evaluations (step_id, name, description, evaluation_type, instructions, time_limit_minutes)
  VALUES
    (step4_id, 'Prova de Conhecimentos Gerais', 'Avaliação online com questões de múltipla escolha', 'online', 'A prova tem duração de 120 minutos. Leia atentamente cada questão antes de responder.', 120)
  ON CONFLICT DO NOTHING
  RETURNING id INTO evaluation_id;

  -- Obter ID da avaliação
  SELECT id INTO evaluation_id FROM step_evaluations WHERE step_id = step4_id LIMIT 1;

  -- Inserir módulos de conteúdo
  INSERT INTO step_evaluation_modules (evaluation_id, name, content, order_index)
  VALUES
    (evaluation_id, 'Módulo 1: Língua Portuguesa', 'Conteúdo sobre gramática, interpretação de texto e redação.', 1),
    (evaluation_id, 'Módulo 2: Matemática', 'Conteúdo sobre álgebra, geometria e estatística.', 2),
    (evaluation_id, 'Módulo 3: Conhecimentos Gerais', 'Conteúdo sobre história, geografia e atualidades.', 3)
  ON CONFLICT DO NOTHING;

END $$;

-- Verificar se os dados foram inseridos
SELECT 'Cursos inseridos:' as info, COUNT(*) as total FROM courses;
SELECT 'Unidades inseridas:' as info, COUNT(*) as total FROM units;
SELECT 'Processos inseridos:' as info, COUNT(*) as total FROM admission_processes;
SELECT 'Passos inseridos:' as info, COUNT(*) as total FROM admission_steps;

