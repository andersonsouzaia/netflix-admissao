-- Schema PostgreSQL para Sistema de Admissão (Supabase)

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  type TEXT NOT NULL, -- 'livre', 'graduacao', 'pos_graduacao'
  modality TEXT NOT NULL, -- 'ead', 'presencial', 'hibrido'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Unidades
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de Processos Seletivos
CREATE TABLE IF NOT EXISTS admission_processes (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- Tabela de Passos do Formulário
CREATE TABLE IF NOT EXISTS admission_steps (
  id SERIAL PRIMARY KEY,
  process_id INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'basic_data', 'complementary_data', 'documents', 'evaluation', 'payment', 'contract', 'instructions'
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  config TEXT, -- JSON com configurações específicas do passo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (process_id) REFERENCES admission_processes(id) ON DELETE CASCADE
);

-- Tabela de Campos Personalizados (para passo Dados Complementares)
CREATE TABLE IF NOT EXISTS step_fields (
  id SERIAL PRIMARY KEY,
  step_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'email', 'number', 'date', 'select', 'textarea'
  is_required BOOLEAN DEFAULT false,
  options TEXT, -- JSON array para campos select
  validation_rules TEXT, -- JSON com regras de validação
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
);

-- Tabela de Documentos Exigidos (para passo Documentos)
CREATE TABLE IF NOT EXISTS step_documents (
  id SERIAL PRIMARY KEY,
  step_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  accepted_formats TEXT, -- JSON array: ['pdf', 'jpg', 'png']
  max_size_mb INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
);

-- Tabela de Avaliações (para passo Avaliação)
CREATE TABLE IF NOT EXISTS step_evaluations (
  id SERIAL PRIMARY KEY,
  step_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_type TEXT NOT NULL, -- 'online', 'presencial'
  location TEXT, -- Para avaliações presenciais
  date TIMESTAMP WITH TIME ZONE, -- Para avaliações presenciais
  instructions TEXT,
  time_limit_minutes INTEGER, -- Para avaliações online
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
);

-- Tabela de Módulos de Conteúdo (para avaliações)
CREATE TABLE IF NOT EXISTS step_evaluation_modules (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  content TEXT, -- Conteúdo do módulo (pode ser HTML/markdown)
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
);

-- Tabela de Questões (para avaliações online)
CREATE TABLE IF NOT EXISTS step_evaluation_questions (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'essay'
  options TEXT, -- JSON array para questões de múltipla escolha
  correct_answer TEXT, -- Resposta correta ou JSON para múltiplas respostas
  points REAL DEFAULT 1.0,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
);

-- Tabela de Inscrições
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  process_id INTEGER NOT NULL,
  user_id TEXT NOT NULL, -- ID do usuário do sistema
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'approved', 'rejected', 'cancelled'
  current_step_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (process_id) REFERENCES admission_processes(id) ON DELETE CASCADE,
  FOREIGN KEY (current_step_id) REFERENCES admission_steps(id)
);

-- Tabela de Dados Preenchidos (para cada passo)
CREATE TABLE IF NOT EXISTS registration_data (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
);

-- Tabela de Documentos Enviados
CREATE TABLE IF NOT EXISTS registration_documents (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES step_documents(id) ON DELETE CASCADE
);

-- Tabela de Respostas de Avaliações
CREATE TABLE IF NOT EXISTS registration_evaluations (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL,
  evaluation_id INTEGER NOT NULL,
  answers TEXT, -- JSON com as respostas
  score REAL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'passed', 'failed'
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
);

-- Tabela de Configurações de Certificados
CREATE TABLE IF NOT EXISTS certificate_configs (
  id SERIAL PRIMARY KEY,
  course_id INTEGER,
  background_image_url TEXT,
  background_image_width INTEGER,
  background_image_height INTEGER,
  title TEXT,
  subtitle TEXT,
  signature_line TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de Certificados Emitidos
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE, -- Código único para validação
  public_url TEXT NOT NULL, -- URL pública para validação via QR code
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pdf_path TEXT, -- Caminho do arquivo PDF gerado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_units_course_id ON units(course_id);
CREATE INDEX IF NOT EXISTS idx_admission_processes_unit_id ON admission_processes(unit_id);
CREATE INDEX IF NOT EXISTS idx_admission_steps_process_id ON admission_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_registrations_process_id ON registrations(process_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_data_registration_id ON registration_data(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_documents_registration_id ON registration_documents(registration_id);
CREATE INDEX IF NOT EXISTS idx_step_evaluation_questions_evaluation_id ON step_evaluation_questions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_code ON certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_configs_course_id ON certificate_configs(course_id);
