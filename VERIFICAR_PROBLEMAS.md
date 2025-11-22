# Guia para Verificar e Corrigir Problemas

## Problema 1: Cursos não aparecem na página de admissão

### Possíveis causas:

1. **Banco de dados vazio** - Não há cursos cadastrados
2. **Políticas RLS bloqueando acesso** - As políticas do Supabase estão muito restritivas
3. **Erro na conexão com Supabase** - Variáveis de ambiente incorretas

### Como verificar:

#### 1. Verificar se há dados no banco:

1. Acesse o Supabase: https://app.supabase.com
2. Vá em **"Table Editor"**
3. Clique na tabela **"courses"**
4. Verifique se há registros

**Se não houver cursos:**
- Execute o script de seed (veja abaixo)

#### 2. Verificar políticas RLS:

1. No Supabase, vá em **"Table Editor"** > **"courses"**
2. Clique na aba **"Policies"**
3. Deve haver uma política chamada **"Public read access for courses"**
4. Se não houver, execute o script `fix_rls_policies.sql` novamente

#### 3. Verificar variáveis de ambiente no Vercel:

1. Acesse o Vercel: https://vercel.com
2. Vá no seu projeto
3. **Settings** > **Environment Variables**
4. Verifique se estão configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Solução: Fazer seed do banco de dados

Se o banco estiver vazio, você precisa popular com dados:

**Opção 1: Via script local:**
```bash
npm run seed-force
```

**Opção 2: Via Supabase SQL Editor:**
1. Acesse o Supabase
2. Vá em **"SQL Editor"**
3. Execute o script de seed (veja `lib/db/seed.ts` para referência)

**Opção 3: Criar cursos manualmente:**
1. No Supabase, vá em **"Table Editor"** > **"courses"**
2. Clique em **"Insert"** > **"Insert row"**
3. Preencha:
   - `name`: Nome do curso
   - `type`: `livre`, `graduacao` ou `pos_graduacao`
   - `modality`: `ead`, `presencial` ou `hibrido`
   - `description`: Descrição do curso (opcional)

## Problema 2: Certificados não estão sendo gerados

### Possíveis causas:

1. **Bucket de storage não existe** - O bucket `certificates` não foi criado
2. **Políticas de storage bloqueando** - Não tem permissão para fazer upload
3. **Erro na geração do PDF** - Problema com pdf-lib ou QRCode
4. **Falta inscrição aprovada** - Não há registrations com status 'approved'

### Como verificar:

#### 1. Verificar bucket de storage:

1. No Supabase, vá em **"Storage"**
2. Verifique se existe o bucket **"certificates"**
3. Se não existir, crie:
   - Clique em **"New bucket"**
   - Nome: `certificates`
   - Marque como **Public**
   - Clique em **"Create bucket"**

#### 2. Verificar políticas de storage:

1. No Supabase, vá em **"Storage"** > **"certificates"** > **"Policies"**
2. Deve haver duas políticas:
   - **"Public read access"** (SELECT) - Policy: `true`
   - **"Public write access"** (INSERT) - Policy: `true`
3. Se não houver, crie-as

#### 3. Verificar se há inscrições aprovadas:

1. No Supabase, vá em **"Table Editor"** > **"registrations"**
2. Verifique se há registros com `status = 'approved'`
3. Se não houver, você precisa:
   - Criar uma inscrição
   - Ou aprovar uma inscrição existente

#### 4. Verificar logs de erro:

1. No Vercel, vá em **"Deployments"**
2. Clique no deploy mais recente
3. Veja os **"Function Logs"**
4. Procure por erros relacionados a certificados

### Solução: Testar geração de certificado mockado

1. Acesse: `https://seu-site.vercel.app/certificados`
2. Clique em **"Gerar Certificado Mockado"**
3. Se der erro, verifique os logs no console do navegador (F12)

## Checklist de Diagnóstico

### Banco de Dados:
- [ ] Tabela `courses` tem pelo menos 1 registro
- [ ] Tabela `units` tem registros relacionados aos cursos
- [ ] Tabela `admission_processes` tem processos ativos
- [ ] Tabela `registrations` tem pelo menos 1 registro com status 'approved'

### Políticas RLS:
- [ ] Todas as tabelas têm políticas de leitura pública
- [ ] Tabela `registrations` tem políticas de INSERT e UPDATE
- [ ] Tabela `certificates` tem políticas de SELECT e INSERT

### Storage:
- [ ] Bucket `certificates` existe
- [ ] Bucket está marcado como público
- [ ] Políticas de storage estão configuradas (SELECT e INSERT)

### Variáveis de Ambiente:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada no Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada no Vercel
- [ ] Valores estão corretos (sem espaços extras)

## Comandos Úteis

### Verificar dados no banco (via SQL):
```sql
-- Contar cursos
SELECT COUNT(*) FROM courses;

-- Ver cursos
SELECT * FROM courses;

-- Ver inscrições aprovadas
SELECT * FROM registrations WHERE status = 'approved';

-- Ver certificados
SELECT * FROM certificates;
```

### Criar curso de teste:
```sql
INSERT INTO courses (name, type, modality, description)
VALUES ('Curso de Teste', 'livre', 'ead', 'Curso para testes do sistema');
```

## Ainda não funciona?

1. **Verifique os logs do Vercel:**
   - Vá em Deployments > Function Logs
   - Procure por erros específicos

2. **Teste localmente:**
   - Configure `.env.local` com as variáveis do Supabase
   - Execute `npm run dev`
   - Teste as funcionalidades

3. **Verifique o console do navegador:**
   - Abra DevTools (F12)
   - Veja a aba Console
   - Procure por erros de API

