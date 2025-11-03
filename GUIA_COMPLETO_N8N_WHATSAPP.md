# 📱 Guia COMPLETO e DEFINITIVO: N8N + WhatsApp + Supabase

## 🎯 Visão Geral

Este guia passo-a-passo mostra **exatamente** como configurar o N8N para enviar notificações no WhatsApp quando um lembrete chegar a hora.

### ✅ Fluxo Completo:

1. **Usuário cria lembrete** → Salvo no Supabase (status: 'pendente')
2. **N8N monitora Supabase** → Verifica lembretes pendentes periodicamente
3. **Quando chegar a hora** → N8N envia WhatsApp para o usuário
4. **N8N atualiza status** → Status muda para 'enviado'

---

## 📋 Pré-requisitos

- ✅ Tabela `reminders` criada no Supabase
- ✅ Tabela `profiles` com campo `phone` existente
- ✅ Acesso ao N8N: `https://n8n-n8n-start.kof6cn.easypanel.host`
- ✅ Integração WhatsApp configurada (seu endpoint/API)

---

## 🔧 Passo 1: Obter Credenciais do Supabase

### 1.1 Service Role Key (Necessária para N8N)

1. Acesse: https://supabase.com/dashboard/project/wgtntctzljufpikogvur/settings/api
2. Vá em **Settings** → **API**
3. Role até a seção **Project API keys**
4. Copie a **`service_role` key** (NÃO a `anon` key!)
   - ⚠️ **IMPORTANTE:** A service_role key tem permissões totais, use com cuidado
   - ✅ Ela permite ler todos os dados (necessário para o N8N)

### 1.2 URL do Supabase

- **Supabase URL:** `https://wgtntctzljufpikogvur.supabase.co`
- **Service Role Key:** (copie do passo 1.1)

---

## 🔧 Passo 2: Criar Workflow no N8N

### 2.1 Acessar N8N

1. Abra seu navegador
2. Acesse: `https://n8n-n8n-start.kof6cn.easypanel.host`
3. Faça login (se necessário)

### 2.2 Criar Novo Workflow

1. Clique em **"Workflows"** no menu lateral
2. Clique no botão **"+"** ou **"New Workflow"**
3. Nome do workflow: **"Lembretes → WhatsApp"**
4. Clique em **"Save"** para salvar

---

## 🔧 Passo 3: Configurar Trigger (Schedule)

### 3.1 Adicionar Nó Schedule Trigger

1. No workflow, clique no botão **"+"** para adicionar nó
2. Busque por **"Schedule Trigger"**
3. Clique em **"Schedule Trigger"** para adicionar

### 3.2 Configurar Schedule Trigger

**Configurações:**

- **Trigger Interval:** Selecione **"Every 15 minutes"**
  - Ou escolha outro intervalo:
    - "Every 5 minutes" (mais rápido, mais consumo)
    - "Every 15 minutes" (recomendado)
    - "Every hour" (mais lento, menos consumo)
  
- **Timezone:** Selecione **"America/Sao_Paulo"**
  - Ou seu timezone local

**Exemplo de configuração:**
```
Trigger Interval: Every 15 minutes
Timezone: America/Sao_Paulo
```

4. Clique em **"Save"** para salvar o nó

---

## 🔧 Passo 4: Configurar Conexão com Supabase

### 4.1 Adicionar Nó Supabase

1. Clique no nó **Schedule Trigger**
2. Clique no **"+"** que aparece ao lado
3. Busque por **"Supabase"**
4. Clique em **"Supabase"** para adicionar

### 4.2 Configurar Credenciais do Supabase

**Primeira vez configurando:**

1. No nó Supabase, clique em **"Create New Credential"** ou **"Add Credential"**
2. Preencha:
   - **Credential Name:** `Supabase Assistente Financeiro`
   - **Host:** `wgtntctzljufpikogvur.supabase.co`
   - **Service Role Key:** (cole a service_role key do Passo 1.1)
   - **Port:** `5432` (ou deixe padrão)
   - **Database:** `postgres` (ou deixe padrão)
3. Clique em **"Save"** para salvar as credenciais

**Se já tem credenciais:**
- Selecione a credencial existente no dropdown

### 4.3 Configurar Query SQL (Opção Recomendada)

**Esta é a MELHOR opção - faz tudo em uma query:**

1. No nó Supabase, configure:
   - **Operation:** Selecione **"Execute Query"** ou **"SQL Query"**
   - **Query:** Cole o SQL abaixo:

```sql
SELECT 
  r.id,
  r.user_id,
  r.titulo,
  r.descricao,
  r.data_lembrete,
  r.status,
  r.tipo,
  r.valor,
  p.phone,
  p.name as user_name
FROM reminders r
JOIN profiles p ON r.user_id = p.id
WHERE r.status = 'pendente' 
  AND r.data_lembrete <= now()
  AND p.phone IS NOT NULL
ORDER BY r.data_lembrete ASC
LIMIT 100
```

**Explicação da Query:**
- `JOIN profiles` - Busca o telefone do usuário
- `WHERE status = 'pendente'` - Apenas lembretes pendentes
- `AND data_lembrete <= now()` - Apenas lembretes que já passaram
- `AND p.phone IS NOT NULL` - Apenas usuários com telefone
- `ORDER BY data_lembrete ASC` - Mais antigos primeiro
- `LIMIT 100` - Máximo 100 por execução (evita sobrecarga)

2. Clique em **"Execute Node"** para testar
3. Verifique se retorna dados (ou array vazio se não houver lembretes)
4. Clique em **"Save"** para salvar

### 4.4 Alternativa: Usar List + Get (Opção 2)

**Se preferir fazer em dois passos:**

**Nó 2: Listar Lembretes**

1. Configure:
   - **Operation:** `List`
   - **Table:** `reminders`
   - **Filter:** 
     ```
     status = 'pendente' AND data_lembrete <= now()
     ```
   - **Order By:** `data_lembrete` (ascending)
   - **Limit:** `100`

**Nó 3: Buscar Telefone**

1. Adicione outro nó **Supabase**
2. Configure:
   - **Operation:** `Get`
   - **Table:** `profiles`
   - **ID:** `{{$json.user_id}}`
   - Isso retornará o `phone` do usuário

**Nota:** A opção SQL única (Passo 4.3) é mais eficiente e recomendada.

---

## 🔧 Passo 5: Processar Cada Lembrete

### 5.1 Adicionar Nó Split In Batches

1. Clique no nó **Supabase**
2. Clique no **"+"** ao lado
3. Busque por **"Split In Batches"**
4. Adicione o nó

### 5.2 Configurar Split In Batches

**Configurações:**

- **Batch Size:** `1`
  - Isso permite processar cada lembrete individualmente
  - Útil para evitar que um erro em um lembrete pare todos

**Explicação:**
- Se você tem 5 lembretes pendentes, este nó vai processar 1 por vez
- Cada execução do próximo nó receberá 1 lembrete

4. Clique em **"Save"**

---

## 🔧 Passo 6: Enviar WhatsApp

### 6.1 Verificar Sua Integração WhatsApp

Você já tem uma integração WhatsApp funcionando. Verifique:
- Qual é o endpoint/API que você usa?
- Qual é o formato da requisição?
- Quais são os parâmetros necessários?

### 6.2 Opção A: Usar HTTP Request (Recomendado)

**Se você tem um webhook/API do WhatsApp:**

1. Adicione um nó **HTTP Request**
2. Configure:
   - **Method:** `POST`
   - **URL:** Seu endpoint do WhatsApp
     - Exemplo: `https://api.whatsapp.com/send`
     - Ou o endpoint que você já usa
   
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer SEU_TOKEN_AQUI (se necessário)
   ```

4. **Body (JSON):**
   ```json
   {
     "to": "{{$json.phone}}",
     "message": "🔔 *Lembrete: {{$json.titulo}}*\n\n{{$json.descricao || ''}}\n\n📅 *Data:* {{$json.data_lembrete}}\n{{$json.valor ? '💰 *Valor:* R$ ' + $json.valor.toFixed(2) : ''}}\n\n📝 *Tipo:* {{$json.tipo}}\n\nNão esqueça!"
   }
   ```

**Se usou SQL com JOIN (Passo 4.3):**
- Use `{{$json.phone}}` diretamente
- Use `{{$json.titulo}}`, `{{$json.descricao}}`, etc.

**Se usou dois passos (Passo 4.4):**
- Use `{{$('Supabase').item.json.phone}}`
- Use `{{$('Supabase').item.json.titulo}}`

### 6.3 Opção B: Usar Nó WhatsApp (se disponível)

**Se o N8N tem nó WhatsApp nativo:**

1. Adicione nó **WhatsApp**
2. Configure conforme o nó exige
3. Use as mesmas expressões para telefone e mensagem

### 6.4 Formatar Mensagem com Code Node (Opcional)

**Para mensagens mais complexas:**

1. Adicione um nó **Code** (JavaScript)
2. Configure:
   ```javascript
   // Formatar data
   const dataLembrete = new Date($input.item.json.data_lembrete);
   const dataFormatada = dataLembrete.toLocaleString('pt-BR', {
     day: '2-digit',
     month: '2-digit',
     year: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   });
   
   // Formatar valor
   const valorFormatado = $input.item.json.valor 
     ? `R$ ${parseFloat($input.item.json.valor).toFixed(2).replace('.', ',')}` 
     : '';
   
   // Montar mensagem
   let mensagem = `🔔 *Lembrete: ${$input.item.json.titulo}*\n\n`;
   
   if ($input.item.json.descricao) {
     mensagem += `${$input.item.json.descricao}\n\n`;
   }
   
   mensagem += `📅 *Data:* ${dataFormatada}\n`;
   
   if (valorFormatado) {
     mensagem += `💰 *Valor:* ${valorFormatado}\n`;
   }
   
   mensagem += `📝 *Tipo:* ${$input.item.json.tipo}\n\n`;
   mensagem += `Não esqueça!`;
   
   return {
     json: {
       ...$input.item.json,
       mensagem_formatada: mensagem,
       phone: $input.item.json.phone
     }
   };
   ```

3. No nó HTTP Request, use:
   ```json
   {
     "to": "{{$json.phone}}",
     "message": "{{$json.mensagem_formatada}}"
   }
   ```

### 6.5 Exemplo de Mensagem Final

**Mensagem que será enviada:**
```
🔔 *Lembrete: Conta de luz*

Pagamento mensal da conta de luz

📅 *Data:* 15/01/2024 às 10:00
💰 *Valor:* R$ 150,00
📝 *Tipo:* Conta a Pagar

Não esqueça!
```

---

## 🔧 Passo 7: Atualizar Status no Supabase

### 7.1 Adicionar Nó Supabase Update

1. Após o nó WhatsApp/HTTP Request, adicione outro nó **Supabase**
2. Configure:
   - **Operation:** `Update`
   - **Table:** `reminders`
   - **ID:** `{{$json.id}}`
     - Se usou SQL único: `{{$json.id}}`
     - Se usou dois passos: `{{$('Supabase').item.json.id}}`

### 7.2 Configurar Campos para Atualizar

**Fields to Update:**

- **status:** `'enviado'`

**Exemplo de configuração:**
```
Fields to Update:
  status: enviado
```

3. Clique em **"Save"**

---

## 🔧 Passo 8: Tratamento de Erros (Opcional mas Recomendado)

### 8.1 Adicionar Nó IF para Verificar Sucesso

1. Adicione um nó **IF**
2. Configure:
   - **Condition:** Verifique se o WhatsApp foi enviado
   - **Value 1:** `{{$json.statusCode}}` ou `{{$json.success}}`
   - **Operation:** `equals`
   - **Value 2:** `200` ou `true` (depende da resposta do WhatsApp)

### 8.2 Se Sucesso → Atualizar Status

- O nó Supabase Update já faz isso (Passo 7)

### 8.3 Se Erro → Log ou Manter Pendente

1. Na branch de erro do IF, adicione um nó **Set**
2. Configure para manter status como `'pendente'`
3. Ou adicione um nó **Code** para logar o erro

**Exemplo:**
```javascript
// Logar erro
console.error('Erro ao enviar WhatsApp:', $input.item.json);
return $input.item.json;
```

---

## 🔧 Passo 9: Ativar Workflow

### 9.1 Salvar Workflow

1. Clique em **"Save"** no canto superior direito
2. Dê um nome ao workflow: **"Lembretes → WhatsApp"**

### 9.2 Ativar Workflow

1. No canto superior direito, encontre o toggle **"Inactive"**
2. Clique para mudar para **"Active"**
3. O workflow agora está rodando!

**Verificação:**
- O botão deve mostrar **"Active"** (verde)
- O workflow será executado automaticamente a cada 15 minutos

---

## 📋 Estrutura Final do Workflow

```
┌─────────────────────┐
│  Schedule Trigger   │ (Every 15 min)
│  (Nó 1)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase          │ (SQL Query com JOIN)
│  Execute Query     │ (Busca reminders + phone)
│  (Nó 2)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Split In Batches  │ (Batch Size: 1)
│  (Nó 3)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  HTTP Request      │ (Enviar WhatsApp)
│  / WhatsApp        │
│  (Nó 4)            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase          │ (Update status)
│  Update            │ (status = 'enviado')
│  (Nó 5)            │
└─────────────────────┘
```

---

## 🧪 Passo 10: Testar o Workflow

### 10.1 Criar Lembrete de Teste

1. Acesse sua aplicação: `/reminders`
2. Crie um lembrete de teste:
   - **Título:** "Teste N8N"
   - **Data e Hora:** 5 minutos no futuro
   - **Tipo:** Lembrete
   - **Descrição:** "Este é um teste"

3. Clique em **"Criar Lembrete"**

### 10.2 Executar Workflow Manualmente

1. No N8N, vá para o workflow **"Lembretes → WhatsApp"**
2. Clique em **"Execute Workflow"** (botão play)
3. Aguarde a execução
4. Verifique os logs de cada nó

### 10.3 Verificar Resultados

**Verificar no N8N:**
1. Cada nó deve mostrar ✅ (verde) se sucesso
2. Clique em cada nó para ver os dados processados
3. Verifique o nó HTTP Request - deve mostrar resposta 200

**Verificar no Supabase:**
1. Execute este SQL:
   ```sql
   SELECT * FROM reminders 
   WHERE titulo = 'Teste N8N' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
2. Verifique se `status = 'enviado'`

**Verificar WhatsApp:**
- Você deve ter recebido a mensagem no WhatsApp

---

## 🔧 Passo 11: Configurar Webhook (Opcional - Mais Rápido)

**Se quiser que o N8N seja acionado IMEDIATAMENTE quando um lembrete for criado:**

### 11.1 Criar Webhook no N8N

1. No workflow, adicione um nó **Webhook** no INÍCIO (antes do Schedule)
2. Configure:
   - **HTTP Method:** `POST`
   - **Path:** `/reminders-webhook`
   - **Response Mode:** `Last Node`

3. **Salve o workflow** para gerar o URL do webhook
4. **Copie o URL do webhook** que aparece:
   - Exemplo: `https://n8n-n8n-start.kof6cn.easypanel.host/webhook/abc123-def456-ghi789`

### 11.2 Configurar Webhook no Supabase

1. Acesse: https://supabase.com/dashboard/project/wgtntctzljufpikogvur/database/webhooks
2. Vá em **Database** → **Webhooks**
3. Clique em **"New Webhook"** ou **"Create Webhook"**
4. Configure:
   - **Name:** `reminders_insert`
   - **Table:** `reminders`
   - **Events:** Marque apenas **"INSERT"**
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** Cole o URL do webhook do N8N (Passo 11.1)
   - **HTTP Headers:** (deixe vazio ou adicione se necessário)
5. Clique em **"Save"**

**Agora:**
- Quando um lembrete for criado, o Supabase enviará imediatamente para o N8N
- O workflow será acionado em tempo real (não precisa esperar 15 minutos)

**Nota:** Se usar webhook, pode desativar o Schedule Trigger ou usar ambos.

---

## ⚙️ Configurações Avançadas

### 12.1 Enviar Lembretes Antecipados

**Para enviar 1 dia antes, 1 hora antes, etc.:**

Crie workflows separados:

**Workflow 1: Lembrete 1 Dia Antes**

No nó Supabase, ajuste a query SQL:
```sql
SELECT 
  r.id,
  r.user_id,
  r.titulo,
  r.descricao,
  r.data_lembrete,
  r.status,
  r.tipo,
  r.valor,
  p.phone,
  p.name as user_name
FROM reminders r
JOIN profiles p ON r.user_id = p.id
WHERE r.status = 'pendente' 
  AND r.data_lembrete <= now() + interval '1 day'
  AND r.data_lembrete > now() + interval '23 hours'
  AND p.phone IS NOT NULL
ORDER BY r.data_lembrete ASC
```

**Workflow 2: Lembrete 1 Hora Antes**

```sql
WHERE r.status = 'pendente' 
  AND r.data_lembrete <= now() + interval '1 hour'
  AND r.data_lembrete > now()
  AND p.phone IS NOT NULL
```

### 12.2 Personalizar Mensagens por Tipo

**Usar nó Code para personalizar:**

```javascript
const tipo = $input.item.json.tipo;
const titulo = $input.item.json.titulo;
const valor = $input.item.json.valor;
const data = $input.item.json.data_lembrete;

let mensagem = '';

if (tipo === 'conta_pagar') {
  mensagem = `💰 *CONTA A PAGAR*\n\n`;
  mensagem += `*${titulo}*\n\n`;
  mensagem += `💵 Valor: R$ ${parseFloat(valor || 0).toFixed(2).replace('.', ',')}\n`;
  mensagem += `📅 Vencimento: ${new Date(data).toLocaleString('pt-BR')}\n\n`;
  mensagem += `⚠️ Não esqueça de pagar!`;
} else if (tipo === 'lembrete') {
  mensagem = `📅 *LEMBRETE*\n\n`;
  mensagem += `*${titulo}*\n\n`;
  if ($input.item.json.descricao) {
    mensagem += `${$input.item.json.descricao}\n\n`;
  }
  mensagem += `⏰ Data: ${new Date(data).toLocaleString('pt-BR')}\n\n`;
  mensagem += `Lembre-se!`;
} else {
  mensagem = `🔔 *${titulo}*\n\n`;
  mensagem += `⏰ ${new Date(data).toLocaleString('pt-BR')}`;
}

return {
  json: {
    ...$input.item.json,
    mensagem_personalizada: mensagem
  }
};
```

### 12.3 Adicionar Retry (Tentar Novamente)

**Se o WhatsApp falhar, tentar novamente:**

1. Adicione um nó **Wait** após o HTTP Request
2. Configure:
   - **Wait Time:** `5 minutes`
3. Adicione um nó **IF** para verificar se status ainda é `'pendente'`
4. Se sim, volte para o nó HTTP Request (loop)

**Ou use o nó "Error Trigger"** para capturar erros e tentar novamente.

---

## ❓ Troubleshooting Completo

### Problema 1: Workflow não executa

**Sintomas:**
- Workflow está Active mas não executa
- Não aparecem execuções no histórico

**Soluções:**
1. Verifique se o workflow está **Active** (toggle verde)
2. Verifique se o Schedule Trigger está configurado corretamente
3. Verifique timezone do Schedule Trigger
4. Execute manualmente para testar
5. Verifique logs do N8N

### Problema 2: Nó Supabase retorna vazio

**Sintomas:**
- Nó Supabase executa mas não retorna dados
- Array vazio `[]`

**Soluções:**
1. Verifique se há lembretes pendentes no Supabase:
   ```sql
   SELECT * FROM reminders 
   WHERE status = 'pendente' 
   AND data_lembrete <= now();
   ```
2. Verifique se os usuários têm telefone:
   ```sql
   SELECT r.*, p.phone 
   FROM reminders r
   JOIN profiles p ON r.user_id = p.id
   WHERE r.status = 'pendente' 
   AND r.data_lembrete <= now()
   AND p.phone IS NOT NULL;
   ```
3. Verifique se a query SQL está correta
4. Verifique se está usando Service Role Key (não anon key)
5. Teste a query diretamente no Supabase SQL Editor

### Problema 3: Erro ao buscar telefone

**Sintomas:**
- Erro "phone is null" ou similar
- Nó Supabase retorna erro

**Soluções:**
1. Verifique se a tabela `profiles` tem o campo `phone`
2. Verifique se o `user_id` do lembrete corresponde ao `id` do profile
3. Adicione filtro `AND p.phone IS NOT NULL` na query SQL
4. Verifique se o JOIN está correto: `ON r.user_id = p.id`

### Problema 4: WhatsApp não envia

**Sintomas:**
- Nó HTTP Request retorna erro
- Status code diferente de 200

**Soluções:**
1. Verifique se o URL do WhatsApp está correto
2. Verifique se o formato do telefone está correto:
   - Deve ser: `+5511999999999` (com código do país)
   - Não: `11999999999` (sem código)
3. Verifique se o token/API key está correto (se necessário)
4. Verifique logs do endpoint do WhatsApp
5. Teste o endpoint manualmente (Postman/curl)

### Problema 5: Status não atualiza

**Sintomas:**
- WhatsApp envia mas status continua `'pendente'`

**Soluções:**
1. Verifique se o nó Supabase Update está configurado corretamente
2. Verifique se o ID está correto: `{{$json.id}}`
3. Verifique se está usando Service Role Key (não anon key)
4. Verifique permissões RLS (pode precisar de Service Role para atualizar)
5. Verifique logs do nó Supabase Update

### Problema 6: Webhook não funciona

**Sintomas:**
- Lembrete criado mas workflow não executa
- Webhook não recebe dados

**Soluções:**
1. Verifique se o webhook está ativo no Supabase
2. Verifique se o URL do webhook está correto
3. Verifique se o método HTTP está correto (POST)
4. Teste o webhook manualmente:
   - No N8N, clique no nó Webhook
   - Copie o URL
   - Use Postman para enviar POST para esse URL
5. Verifique logs do Supabase (Database → Webhooks → Logs)

### Problema 7: Mensagem formatada incorretamente

**Sintomas:**
- Mensagem aparece com `{{$json.titulo}}` literal
- Variáveis não são substituídas

**Soluções:**
1. Verifique se está usando expressões corretas: `{{$json.titulo}}`
2. Verifique se o modo do body está correto (JSON)
3. Use nó Code para formatar antes de enviar
4. Teste as expressões no nó anterior (clique no nó para ver os dados)

---

## 📊 Monitoramento e Logs

### 13.1 Ver Execuções do Workflow

1. No N8N, vá para o workflow
2. Clique em **"Executions"** (aba no topo)
3. Veja todas as execuções com status:
   - ✅ Sucesso (verde)
   - ❌ Erro (vermelho)
   - ⚠️ Aviso (amarelo)

### 13.2 Ver Logs Detalhados

1. Clique em uma execução
2. Veja cada nó e seus dados
3. Clique em um nó para ver:
   - Input (dados recebidos)
   - Output (dados enviados)
   - Erros (se houver)

### 13.3 Criar Dashboard de Monitoramento

**Adicione nó para logar estatísticas:**

1. Após o nó Supabase (query), adicione nó **Code**:
   ```javascript
   const totalLembretes = $input.all().length;
   console.log(`📊 Total de lembretes pendentes: ${totalLembretes}`);
   
   return $input.all();
   ```

---

## ✅ Checklist Final Completo

### Configuração Inicial
- [ ] Service Role Key do Supabase obtida
- [ ] Workflow criado no N8N
- [ ] Nome do workflow: "Lembretes → WhatsApp"

### Trigger
- [ ] Schedule Trigger configurado
- [ ] Intervalo: Every 15 minutes (ou desejado)
- [ ] Timezone: America/Sao_Paulo
- [ ] Workflow está Active

### Supabase
- [ ] Credenciais do Supabase configuradas no N8N
- [ ] Query SQL configurada (ou List + Get)
- [ ] Query testada e retorna dados
- [ ] Filtro inclui `status = 'pendente'`
- [ ] Filtro inclui `data_lembrete <= now()`
- [ ] JOIN com profiles está funcionando

### Processamento
- [ ] Split In Batches configurado (Batch Size: 1)
- [ ] Cada lembrete é processado individualmente

### WhatsApp
- [ ] Integração WhatsApp configurada
- [ ] URL/endpoint correto
- [ ] Formato do telefone correto (+55...)
- [ ] Mensagem formatada corretamente
- [ ] Headers configurados (se necessário)
- [ ] Token/API key configurado (se necessário)

### Atualização
- [ ] Nó Supabase Update configurado
- [ ] ID do lembrete correto: `{{$json.id}}`
- [ ] Status atualizado para `'enviado'`

### Teste
- [ ] Lembrete de teste criado
- [ ] Workflow executado manualmente
- [ ] WhatsApp enviado com sucesso
- [ ] Status atualizado no Supabase
- [ ] Workflow executando automaticamente

### Webhook (Opcional)
- [ ] Webhook criado no N8N
- [ ] URL do webhook copiado
- [ ] Webhook configurado no Supabase
- [ ] Evento: INSERT
- [ ] Testado e funcionando

---

## 🎉 Pronto!

Agora seus lembretes são enviados automaticamente no WhatsApp quando chegar a hora!

### Fluxo Completo Funcionando:

```
1. Usuário cria lembrete no frontend
   ↓
2. Lembrete salvo no Supabase (status: 'pendente')
   ↓
3. N8N executa a cada 15 minutos (ou via webhook imediato)
   ↓
4. N8N busca lembretes pendentes com telefone
   ↓
5. N8N envia WhatsApp para cada usuário
   ↓
6. N8N atualiza status para 'enviado'
   ↓
7. ✅ Usuário recebe notificação no WhatsApp!
```

---

## 📚 Recursos Adicionais

- **Documentação N8N:** https://docs.n8n.io/
- **Documentação Supabase:** https://supabase.com/docs
- **Suporte N8N:** https://community.n8n.io/

---

**Desenvolvido para:** Assistente Financeiro  
**Data:** 2024

