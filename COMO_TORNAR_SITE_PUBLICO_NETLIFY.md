# Como Tornar o Site Público na Netlify

## Problema
O site está com acesso restrito e outras pessoas não conseguem acessar.

## Solução: Tornar o Site Público

### Método 1: Verificar Configurações de Acesso (Recomendado)

1. **Acesse o painel da Netlify:**
   - Vá para https://app.netlify.com
   - Faça login na sua conta

2. **Selecione seu site:**
   - Clique no site que você quer tornar público

3. **Verifique as configurações de acesso:**
   - No menu superior, clique em **"Site settings"** ou **"Site configuration"**
   - No menu lateral, procure por **"Access control"** ou **"Password protection"**

4. **Desative proteção por senha (se estiver ativa):**
   - Se houver **"Password protection"** ou **"Site password"** ativado, desative
   - Se houver **"Access control"** restrito, configure para **"Public"**

### Método 2: Verificar Deploy Status

1. **Vá na aba "Deploys":**
   - No menu superior do site, clique em **"Deploys"**

2. **Verifique o status do deploy:**
   - O deploy mais recente deve estar com status **"Published"** (verde)
   - Se estiver como **"Draft"** ou **"Unpublished"**, você precisa publicá-lo

3. **Publicar um deploy:**
   - Clique no deploy que você quer publicar
   - Clique no botão **"Publish deploy"** ou **"Publish"**

### Método 3: Verificar Domínio e DNS

1. **Verifique o domínio:**
   - Vá em **"Site settings"** > **"Domain management"**
   - Confirme que há um domínio configurado (ex: `seu-site.netlify.app`)

2. **Verifique se o domínio está ativo:**
   - O domínio padrão da Netlify deve estar ativo
   - Se você adicionou um domínio customizado, verifique se está configurado corretamente

### Método 4: Verificar Branch Deploy Settings

1. **Vá em "Site settings":**
   - Clique em **"Build & deploy"**
   - Role até **"Branch deploys"**

2. **Configure os branches:**
   - **Production branch:** deve ser `main` (ou `master`)
   - **Branch deploys:** pode estar como "None" - mude para "All" ou "Deploy only the production branch"

### Método 5: Verificar Site Visibility

1. **Verifique se o site está oculto:**
   - Vá em **"Site settings"** > **"General"**
   - Procure por opções como **"Hide from search engines"** ou **"Private"**
   - Se estiver marcado, desmarque

## Checklist Rápido

- [ ] Site não tem senha de proteção ativa
- [ ] Deploy mais recente está publicado (status "Published")
- [ ] Domínio está configurado e ativo
- [ ] Branch de produção está configurado corretamente
- [ ] Site não está marcado como privado

## Teste

Após fazer as alterações:

1. **Acesse o site em modo anônimo:**
   - Abra uma janela anônima/privada do navegador
   - Acesse a URL do site: `https://seu-site.netlify.app`
   - Você deve conseguir acessar sem pedir senha

2. **Compartilhe o link:**
   - Envie o link para outra pessoa testar
   - Ela deve conseguir acessar sem problemas

## Problemas Comuns

### "Site requires password"
**Solução:** Desative a proteção por senha em Site settings > Access control

### "404 Not Found"
**Solução:** 
- Verifique se o deploy está publicado
- Verifique se o domínio está correto
- Faça um novo deploy se necessário

### "Site is private"
**Solução:** 
- Verifique as configurações de visibilidade
- Certifique-se de que não há restrições de acesso

### Deploy não está publicado
**Solução:**
- Vá em Deploys
- Clique no deploy mais recente
- Clique em "Publish deploy"

## Ainda não funciona?

Se após seguir todos os passos o site ainda não estiver público:

1. **Verifique os logs:**
   - Vá em Deploys > clique no deploy > veja os logs
   - Procure por erros ou avisos

2. **Faça um novo deploy:**
   - Vá em Deploys > Trigger deploy > Deploy site
   - Aguarde o deploy terminar
   - Certifique-se de que está publicado

3. **Contate o suporte da Netlify:**
   - Se nada funcionar, pode ser um problema da conta
   - Acesse: https://www.netlify.com/support

