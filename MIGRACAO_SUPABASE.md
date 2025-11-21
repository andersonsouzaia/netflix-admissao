# Migração do SQLite para Supabase

Este documento descreve a migração do banco de dados SQLite para Supabase (PostgreSQL).

## O que foi alterado

### 1. Schema do Banco de Dados
- **Arquivo**: `lib/db/schema.sql`
- **Mudanças**: 
  - Convertido de SQLite para PostgreSQL
  - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
  - `DATETIME` → `TIMESTAMP WITH TIME ZONE`
  - `BOOLEAN DEFAULT 1` → `BOOLEAN DEFAULT true`

### 2. Cliente do Banco de Dados
- **Arquivo**: `lib/db.ts`
- **Mudanças**:
  - Removido `better-sqlite3`
  - Adicionado `@supabase/supabase-js`
  - Função `getDatabase()` agora retorna um cliente Supabase

### 3. Seed de Dados
- **Arquivo**: `lib/db/seed.ts`
- **Mudanças**:
  - Convertido para usar queries assíncronas do Supabase
  - Mantidos os mesmos dados mockados

### 4. APIs Atualizadas
Todas as rotas de API foram atualizadas para usar Supabase:
- `app/api/admissao/courses/**`
- `app/api/admissao/units/**`
- `app/api/admissao/processes/**`
- `app/api/admissao/steps/**`
- `app/api/admissao/registrations/**`
- `app/api/admissao/evaluations/**`
- `app/api/certificates/**`

### 5. Dependências
- **Arquivo**: `package.json`
- **Removido**: `better-sqlite3`, `@types/better-sqlite3`
- **Adicionado**: `@supabase/supabase-js`

## Como configurar

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL do projeto e a chave anônima (anon key)

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Executar o schema SQL
1. Acesse o SQL Editor no painel do Supabase
2. Copie o conteúdo de `lib/db/schema.sql`
3. Execute o script SQL no editor

### 4. Popular com dados mockados
Execute o comando:
```bash
npm run init-db
```

## Estrutura do Banco de Dados

O banco de dados possui as seguintes tabelas:

- `courses` - Cursos disponíveis
- `units` - Unidades dos cursos
- `admission_processes` - Processos seletivos
- `admission_steps` - Passos do formulário de admissão
- `step_fields` - Campos personalizados
- `step_documents` - Documentos exigidos
- `step_evaluations` - Avaliações
- `step_evaluation_modules` - Módulos de conteúdo
- `step_evaluation_questions` - Questões das avaliações
- `registrations` - Inscrições
- `registration_data` - Dados preenchidos nas inscrições
- `registration_documents` - Documentos enviados
- `registration_evaluations` - Respostas das avaliações
- `certificate_configs` - Configurações de certificados
- `certificates` - Certificados emitidos

## Dados Mockados

O seed inclui:
- 4 cursos (Administração, Psicologia, MBA, Marketing Digital)
- 5 unidades
- 6 processos seletivos
- Passos de formulário com campos, documentos e avaliações

## Notas Importantes

1. **Segurança**: As chaves do Supabase são públicas no frontend, mas as políticas RLS (Row Level Security) devem ser configuradas no Supabase para proteger os dados.

2. **Migração de Dados**: Se você já tinha dados no SQLite, será necessário criar um script de migração para transferir os dados para o Supabase.

3. **Performance**: O Supabase usa PostgreSQL, que é mais robusto que SQLite para aplicações em produção.

4. **Backup**: O Supabase oferece backups automáticos, mas é recomendado configurar backups adicionais se necessário.

