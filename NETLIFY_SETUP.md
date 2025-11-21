# Configuração para Netlify

## Correções Implementadas

### 1. ✅ DialogTitle adicionado ao CourseModal
- Corrigido aviso de acessibilidade do Radix UI
- Adicionado `DialogTitle` com classe `sr-only` para leitores de tela

### 2. ✅ APIs de Certificados migradas para Supabase Storage
- **Problema**: Netlify tem sistema de arquivos read-only (exceto `/tmp`)
- **Solução**: Certificados agora são salvos no Supabase Storage
- Arquivos modificados:
  - `app/api/certificates/generate/route.ts`
  - `app/api/certificates/mock/route.ts`
  - `app/api/certificates/[id]/download/route.ts`

### 3. ✅ Tratamento de erros melhorado
- APIs agora retornam mensagens de erro mais detalhadas
- Logs melhorados para debugging

## Configuração Necessária na Netlify

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel da Netlify:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NEXT_PUBLIC_BASE_URL=https://seu-site.netlify.app
```

**Nota**: A URL base é detectada automaticamente usando `DEPLOY_PRIME_URL` ou `URL` (variáveis nativas da Netlify), mas você pode definir `NEXT_PUBLIC_BASE_URL` manualmente se preferir.

**Onde encontrar:**
- Acesse o painel do Supabase: https://app.supabase.com
- Vá em Settings > API
- Copie a URL e a anon key

### 2. Criar Bucket no Supabase Storage

1. Acesse o painel do Supabase
2. Vá em Storage
3. Clique em "New bucket"
4. Nome: `certificates`
5. Marque como **Public** (para permitir downloads)
6. Clique em "Create bucket"

### 3. Configurar Políticas de Storage (RLS)

No Supabase, vá em Storage > Policies e crie uma política para o bucket `certificates`:

**Política de Leitura (SELECT):**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');
```

**Política de Escrita (INSERT):**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');
```

### 4. Build Settings na Netlify

No painel da Netlify, configure:

- **Build command**: `npm run build` ou `pnpm build`
- **Publish directory**: `.next`

### 5. Verificar Deploy

Após o deploy, teste:

1. ✅ Acessar página de certificados: `/certificados`
2. ✅ Gerar certificado mockado
3. ✅ Baixar PDF do certificado
4. ✅ Validar certificado pelo código

## Troubleshooting

### Erro: "Failed to upload certificate PDF"
- Verifique se o bucket `certificates` existe no Supabase
- Verifique se as políticas de storage estão configuradas
- Verifique se as variáveis de ambiente estão corretas

### Erro: "Failed to fetch registrations"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas
- Verifique se a tabela `registrations` existe no banco de dados

### Erro: "Permission denied"
- Verifique as políticas RLS (Row Level Security) no Supabase
- Certifique-se de que o usuário está autenticado

## Notas Importantes

- O sistema de arquivos local (`uploads/`) não funciona na Netlify
- Todos os PDFs devem ser armazenados no Supabase Storage
- A URL base é detectada automaticamente, mas você pode definir `NEXT_PUBLIC_BASE_URL` manualmente

