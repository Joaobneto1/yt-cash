# YouTube Rewards — Sistema 100% Automatizado

## ✅ Automações Implementadas

### 1. **Triggers Automáticos no Banco de Dados**

#### ✨ Após Inserção de Avaliação (`after_evaluation_insert`)
- Calcula automaticamente `approval_rate` do usuário
- Calcula automaticamente `avg_eval_time_seconds`
- Atualiza progresso de todas as missões ativas
- Completa missões automaticamente quando atingem o target
- Concede pontos de bônus automaticamente

#### 👤 Após Criação de Usuário (`after_user_insert`)
- Inicializa `quota_reset_daily_at` e `quota_reset_weekly_at`
- Cria automaticamente todas as missões ativas para o usuário
- Define status inicial como "open"

#### ⏰ Atualização Automática de Timestamps
- `withdrawals.updated_at`
- `refund_requests.updated_at`
- `support_tickets.updated_at`
- `billing_payments.updated_at`

### 2. **Funções PostgreSQL Automatizadas**

#### 🎯 `update_user_metrics(user_id)`
```sql
-- Chamada automaticamente após cada avaliação
-- Calcula:
- approval_rate = validadas / total
- avg_eval_time_seconds = média de elapsed_seconds
```

#### 🏆 `update_mission_progress(user_id)`
```sql
-- Chamada automaticamente após cada avaliação
-- Para cada missão:
- D0: Tour (manual)
- D1: 5 avaliações válidas com ≥80% aprovação
- D2: Ler regras (manual)
- D3: 10 avaliações com ≥90% aprovação
-- Auto-completa e concede bonus_points quando target atingido
```

#### 🔄 `reset_user_quotas()`
```sql
-- Reseta quotas diárias e semanais automaticamente
-- Chamada por:
1. Trigger antes de iniciar avaliação
2. Edge Function /auto-quota-reset (cron)
3. Função can_start_evaluation
```

#### 🎮 `can_start_evaluation(user_id)`
```sql
-- Verifica e reseta quotas automaticamente
-- Retorna JSON com:
{
  "allowed": true/false,
  "reason": "quota_exceeded",
  "plan": "free|pro|pro_plus",
  "daily_cap": 10|50|100,
  "weekly_cap": 40|250|700
}
```

#### 💰 `get_user_balance(user_id)`
```sql
-- Retorna saldo atual do usuário
-- Cache: STABLE function
```

### 3. **Edge Functions Automatizadas**

#### 🤖 `/auto-process-evaluation` (JWT required)
**Processa avaliação completa automaticamente:**
1. Valida watch_time (≥20s)
2. Gera hash SHA-256 do insight
3. Detecta duplicatas (últimas 50)
4. Verifica coerência scores ↔ insight (≥0.6)
5. Insere avaliação como válida
6. Atualiza session (submitted_at, elapsed, status)
7. Concede 20 pontos no ledger
8. Incrementa quotas (daily + weekly)
9. **Triggers automáticos disparam:**
   - Atualização de métricas
   - Progresso de missões
   - Bônus de missão completada

**Payload:**
```json
{
  "session_id": "uuid",
  "scores": {
    "hook": 0-10,
    "retention": 0-10,
    "clarity": 0-10,
    "cta": 0-10
  },
  "insight_text": "Problem → Change → Why",
  "ai_prenote_json": {...},
  "ai_insight_draft": "..."
}
```

#### 💳 `/webhook-payment` (No JWT)
**Processa pagamentos automaticamente:**

**Event: `payment.succeeded`**
1. Insere registro em `billing_payments` (status: paid)
2. Atualiza `users`:
   - `plan_tier`: pro | pro_plus
   - `plan_status`: active
   - `plan_renews_at`: +1 month | +1 year
   - `ia_upgrade`: true
   - `ia_upgrade_at`: now()
   - Reseta quotas para 0

**Event: `subscription.canceled`**
1. Atualiza `users`:
   - `plan_status`: canceled
   - `plan_tier`: free
   - `ia_upgrade`: false

**Payload:**
```json
{
  "event": "payment.succeeded | subscription.canceled",
  "user_id": "uuid",
  "product": "pro_month | pro_plus_year",
  "provider": "stripe | mercadopago",
  "amount": 900,
  "external_id": "stripe_payment_id"
}
```

#### ⏰ `/auto-quota-reset` (No JWT - Cron)
**Reseta quotas periodicamente:**
- Roda a cada 1 hora via cron
- Reseta `daily_quota_used` quando `quota_reset_daily_at` ≤ now()
- Reseta `weekly_quota_used` quando `quota_reset_weekly_at` ≤ now()
- Retorna contadores de resets executados

### 4. **IA Edge Functions (JWT required)**

#### 🎯 `/ai-prenote`
Gera pré-scores 0-10 para Hook, Retention, Clarity, CTA
```json
{
  "hook": 7,
  "retention": 8,
  "clarity": 6,
  "cta": 5,
  "rationale": ["bullet1", "bullet2", "bullet3"]
}
```

#### ✍️ `/ai-insight-draft`
Gera insight de 22-28 palavras no formato:
`(Problema visível) → (Mudança específica) → (Por que melhora 3s/clareza/CTA)`

#### 🔍 `/ai-coherence`
Valida coerência entre scores e insight
```json
{
  "score": 0.75,
  "notes": ["Alignment check passed", "..."]
}
```

## 🎮 Fluxo Automatizado Completo

### Novo Usuário
1. ✅ Usuário cria conta
2. ✅ **Trigger** inicializa quotas reset times
3. ✅ **Trigger** cria 4 missões automaticamente (D0-D3)

### Avaliação de Vídeo
1. ✅ Cliente chama `can_start_evaluation` → reseta quotas se necessário
2. ✅ Usuário assiste vídeo, preenche scores e insight
3. ✅ Cliente chama `/auto-process-evaluation`
4. ✅ **Edge Function** valida tudo automaticamente
5. ✅ **Edge Function** salva avaliação + pontos + atualiza quotas
6. ✅ **Trigger** atualiza métricas do usuário
7. ✅ **Trigger** atualiza progresso das missões
8. ✅ **Trigger** completa missões e concede bônus

### Pagamento (Webhook)
1. ✅ Stripe/MercadoPago envia webhook para `/webhook-payment`
2. ✅ **Edge Function** salva payment record
3. ✅ **Edge Function** ativa plano PRO/PRO+
4. ✅ **Edge Function** ativa AI Coach
5. ✅ **Edge Function** reseta quotas

### Reset de Quotas
1. ✅ **Cron** chama `/auto-quota-reset` a cada hora
2. ✅ Ou `can_start_evaluation` reseta on-demand
3. ✅ Usuários automaticamente recuperam quotas

## 📊 Dados Calculados Automaticamente

| Campo | Como é Calculado | Quando |
|-------|------------------|--------|
| `approval_rate` | valid / total evaluations | Após cada avaliação |
| `avg_eval_time_seconds` | AVG(elapsed_seconds) | Após cada avaliação |
| `mission.progress_current` | COUNT(valid evals) com filtros | Após cada avaliação |
| `mission.status` | 'completed' quando progress ≥ target | Após cada avaliação |
| `balance` | SUM(points_ledger.points) | Via função `get_user_balance()` |
| `daily_quota_used` | Incrementado após eval | Durante submit |
| `weekly_quota_used` | Incrementado após eval | Durante submit |

## 🔐 Validações Automáticas

### Watch Time
- ❌ Inválida se < 20s
- ✅ `reason_invalid: 'watch_time'`

### Duplicatas
- ❌ SHA-256 hash já existe nas últimas 50 avaliações
- ✅ `reason_invalid: 'duplicate'`, `dup_flag: true`

### Coerência
- ❌ Score < 0.6 entre scores e insight
- ✅ `reason_invalid: 'coherence'`
- Exemplos:
  - Insight critica áudio MAS Retention = 9 → incoerente
  - Insight diz "missing CTA" MAS CTA score = 9 → incoerente

## 🚀 Configuração de Cron (Recomendado)

```bash
# Resetar quotas a cada hora
0 * * * * curl -X POST https://[PROJECT].supabase.co/functions/v1/auto-quota-reset \
  -H "Authorization: Bearer [ANON_KEY]"
```

Ou usar Supabase Cron (pg_cron):
```sql
SELECT cron.schedule(
  'reset-quotas',
  '0 * * * *',
  'SELECT reset_user_quotas()'
);
```

## 💡 Sem Intervenção Manual

- ✅ Missões progridem automaticamente
- ✅ Bônus concedidos automaticamente
- ✅ Métricas atualizadas em tempo real
- ✅ Quotas resetam automaticamente
- ✅ Pagamentos processados via webhook
- ✅ Validações aplicadas automaticamente
- ✅ Pontos creditados automaticamente

## 📋 Checklist de Configuração

- [x] ✅ Migrations aplicadas (triggers + functions)
- [x] ✅ Edge Functions deployed
- [x] ✅ Seed data inserido (missions, app_limits)
- [ ] ⚠️ Configurar Cron para `/auto-quota-reset`
- [ ] ⚠️ Configurar webhook URL em Stripe/MercadoPago
- [ ] ⚠️ Testar fluxo completo de avaliação

## 🎯 Resultado

**100% automatizado. Zero intervenção manual necessária para operação normal do sistema.**
