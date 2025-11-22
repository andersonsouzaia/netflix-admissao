# Como Corrigir "Acesso Recusado" no Supabase

## Problema

Quando você acessa o site e recebe "acesso recusado", geralmente é porque as **políticas RLS (Row Level Security)** do Supabase estão bloqueando o acesso às tabelas.

## Solução: Configurar Políticas RLS

### Método 1: Via SQL Editor (Recomendado)

1. **Acesse o Supabase:**
   - Vá para https://app.supabase.com
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**

3. **Execute o script:**
   - Abra o arquivo `fix_rls_policies.sql` que está na raiz do projeto
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifique se funcionou:**
   - Você deve ver mensagens de sucesso para cada política criada
   - Se houver erros, verifique se as tabelas existem

### Método 2: Via Interface (Política por Política)

Se preferir configurar manualmente:

1. **Para cada tabela:**
   - Vá em **"Table Editor"** no menu lateral
   - Selecione a tabela (ex: `courses`)
   - Clique na aba **"Policies"**
   - Clique em **"New Policy"**
   - Selecione **"For SELECT"** (leitura)
   - Em **"Policy definition"**, digite: `true`
   - Dê um nome: `Public read access`
   - Clique em **"Save"**

2. **Repita para todas as tabelas:**
   - `courses`
   - `units`
   - `admission_processes`
   - `admission_steps`
   - `step_fields`
   - `step_documents`
   - `step_evaluations`
   - `step_evaluation_modules`
   - `step_evaluation_questions`
   - `certificate_configs`
   - `registrations` (SELECT, INSERT, UPDATE)
   - `registration_data` (ALL)
   - `registration_documents` (ALL)
   - `registration_evaluations` (ALL)
   - `certificates` (SELECT, INSERT)

### Método 3: Desabilitar RLS Temporariamente (NÃO RECOMENDADO)

⚠️ **Atenção:** Isso remove toda a segurança. Use apenas para testes.

```sql
-- Desabilitar RLS em todas as tabelas (NÃO RECOMENDADO PARA PRODUÇÃO)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE admission_processes DISABLE ROW LEVEL SECURITY;
ALTER TABLE admission_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE step_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE step_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE step_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE step_evaluation_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE step_evaluation_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
```

## Configurar Políticas de Storage

Para o bucket de certificados funcionar:

1. **Vá em Storage:**
   - No menu lateral, clique em **"Storage"**
   - Selecione o bucket **"certificates"**

2. **Configure as políticas:**
   - Clique na aba **"Policies"**
   - Clique em **"New Policy"**

   **Política de Leitura:**
   - Nome: `Public read access`
   - Operation: `SELECT`
   - Policy definition: `true`
   - Target roles: `public`

   **Política de Escrita:**
   - Nome: `Public write access`
   - Operation: `INSERT`
   - Policy definition: `true`
   - Target roles: `public`

## Verificar se Funcionou

Após configurar as políticas:

1. **Teste o site:**
   - Acesse o site na Netlify
   - Tente acessar a página de certificados
   - Tente gerar um certificado mockado

2. **Verifique os logs:**
   - Se ainda houver erro, verifique os logs no console do navegador
   - Verifique os logs do deploy na Netlify

## Troubleshooting

### Erro: "permission denied for table"
- **Solução:** As políticas RLS não foram criadas. Execute o script SQL novamente.

### Erro: "bucket not found"
- **Solução:** Crie o bucket `certificates` no Storage do Supabase.

### Erro: "policy already exists"
- **Solução:** Isso é normal. As políticas já existem, pode ignorar.

### Ainda não funciona após configurar
- Verifique se você fez um novo deploy na Netlify após as mudanças
- Limpe o cache do navegador
- Verifique se as variáveis de ambiente estão corretas

