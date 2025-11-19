import Database from 'better-sqlite3'
import { join } from 'path'
import { readFileSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) {
    return db
  }

  // Caminho para o arquivo do banco de dados
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'admission.db')
  
  // Criar diretório se não existir
  const dbDir = join(process.cwd(), 'data')
  try {
    const fs = require('fs')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
  } catch (error) {
    console.error('Error creating data directory:', error)
  }

    db = new Database(dbPath)
  
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON')
    
  // Executar schema se necessário
  initializeDatabase(db)
  
  return db
}

function initializeDatabase(database: Database.Database) {
  // Verificar se as tabelas já existem
  const tableExists = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='courses'")
    .get()

  if (!tableExists) {
    // Ler e executar schema
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql')
    try {
      const schema = readFileSync(schemaPath, 'utf-8')
      database.exec(schema)
      console.log('Database schema initialized successfully')
    } catch (error) {
      console.error('Error reading schema file:', error)
      // Criar schema inline se o arquivo não existir
      createSchemaInline(database)
    }
  }
}

function createSchemaInline(database: Database.Database) {
  // Schema inline como fallback
  const schema = `
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      type TEXT NOT NULL,
      modality TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admission_processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admission_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL,
      step_type TEXT NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      is_required BOOLEAN DEFAULT 1,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (process_id) REFERENCES admission_processes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_id INTEGER NOT NULL,
      field_name TEXT NOT NULL,
      field_label TEXT NOT NULL,
      field_type TEXT NOT NULL,
      is_required BOOLEAN DEFAULT 0,
      options TEXT,
      validation_rules TEXT,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_required BOOLEAN DEFAULT 1,
      accepted_formats TEXT,
      max_size_mb INTEGER DEFAULT 10,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      evaluation_type TEXT NOT NULL,
      location TEXT,
      date DATETIME,
      instructions TEXT,
      time_limit_minutes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_evaluation_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS step_evaluation_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'multiple_choice',
      options TEXT,
      correct_answer TEXT,
      points REAL DEFAULT 1.0,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      current_step_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      FOREIGN KEY (process_id) REFERENCES admission_processes(id) ON DELETE CASCADE,
      FOREIGN KEY (current_step_id) REFERENCES admission_steps(id)
    );

    CREATE TABLE IF NOT EXISTS registration_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_id INTEGER NOT NULL,
      step_id INTEGER NOT NULL,
      field_name TEXT NOT NULL,
      field_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
      FOREIGN KEY (step_id) REFERENCES admission_steps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registration_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_id INTEGER NOT NULL,
      document_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES step_documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registration_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_id INTEGER NOT NULL,
      evaluation_id INTEGER NOT NULL,
      answers TEXT,
      score REAL,
      status TEXT NOT NULL DEFAULT 'pending',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
      FOREIGN KEY (evaluation_id) REFERENCES step_evaluations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_units_course_id ON units(course_id);
    CREATE INDEX IF NOT EXISTS idx_admission_processes_unit_id ON admission_processes(unit_id);
    CREATE INDEX IF NOT EXISTS idx_admission_steps_process_id ON admission_steps(process_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_process_id ON registrations(process_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_registration_data_registration_id ON registration_data(registration_id);
    CREATE INDEX IF NOT EXISTS idx_registration_documents_registration_id ON registration_documents(registration_id);
    CREATE INDEX IF NOT EXISTS idx_step_evaluation_questions_evaluation_id ON step_evaluation_questions(evaluation_id);
  `
  
  database.exec(schema)
  console.log('Database schema created inline')
}

// Helper para fechar a conexão (útil em desenvolvimento)
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
