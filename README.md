# 🍅 Pomodoro Timer 2.0

Uma evolução do Pomodoro Timer v1 — agora com autenticação, persistência de dados em nuvem e um dashboard analítico completo. Acesse em: **[pomodoro-timer-2-0.vercel.app](https://pomodoro-timer-2-0.vercel.app/)**

> **Comparação com a v1:** A versão original rodava apenas localmente, sem conta de usuário, sem salvamento de sessões e com poucas opções de personalização. A v2 adiciona autenticação via Supabase, salvamento automático de sessões de foco, dashboard com gráficos semanais e streak, além de suporte a temas claro/escuro.

---

## ✨ Funcionalidades

### ⏱️ Timer Pomodoro (público)
- Modos: **Foco**, **Intervalo Curto** e **Intervalo Longo**
- Transição automática entre modos ao término do tempo
- Sons de início e fim de sessão
- Configuração personalizada das durações (1–120 min) via painel de configurações
- Tema claro/escuro persistente

### 📊 Dashboard Analítico (requer login)
- **Streak atual:** dias consecutivos com pelo menos uma sessão de foco
- **Total de foco semanal:** soma de minutos de foco na semana (Dom–Sáb)
- **Gráfico de barras semanal** com destaque no dia atual
- Sessões de foco salvas automaticamente no Supabase ao final de cada ciclo

### 🔐 Autenticação
- Cadastro e login via **Supabase Auth** (e-mail/senha)
- O timer é público (acessível sem login)
- O dashboard é protegido por rota privada (`PrivateRoute`)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                      USUÁRIO                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           FRONTEND — Vercel                         │
│     React 19 + Vite + TypeScript                    │
│     pomodoro-timer-2-0.vercel.app                   │
│                                                     │
│  /           → TimerPage (público)                  │
│  /login      → Login                                │
│  /register   → Register                             │
│  /dashboard  → Dashboard (privado)                  │
└───────────┬─────────────────────┬───────────────────┘
            │                     │
            │ Supabase JS SDK     │ Axios (REST)
            │ (Auth + sessions)   │ (/analytics/{user_id})
            │                     │
┌───────────▼───────────┐ ┌───────▼───────────────────┐
│  BANCO DE DADOS       │ │  BACKEND — Render         │
│  Supabase (PostgreSQL)│ │  FastAPI + Python         │
│                       │ │                           │
│  Tabela: sessions     │ │  GET /analytics/{user_id} │
│  - user_id            │ │  - Minutos de foco/dia    │
│  - mode               │ │  - Streak atual           │
│  - duration_minutes   │ │                           │
│  - created_at         │ └──────────────┬────────────┘
└───────────────────────┘                │ supabase-py
                                         │
                          ┌──────────────▼────────────┐
                          │  BANCO DE DADOS           │
                          │  Supabase (PostgreSQL)    │
                          └───────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 7 | Build tool |
| React Router DOM | 7 | Roteamento SPA |
| `@supabase/supabase-js` | 2 | Auth + banco de dados |
| Recharts | 3 | Gráficos do dashboard |
| Axios | 1 | Consumo da API analytics |
| Lucide React | latest | Ícones |

### Backend
| Tecnologia | Uso |
|---|---|
| FastAPI | Framework da API REST |
| Uvicorn | Servidor ASGI |
| `supabase-py` | Conexão ao Supabase |
| `python-dotenv` | Variáveis de ambiente |

---

## 📁 Estrutura do Projeto

```
PomodoroTimer_2.0/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.tsx   # Gráfico semanal + streak
│   │   │   ├── ModeSelector.tsx    # Foco / Intervalo Curto / Longo
│   │   │   ├── SettingsPanel.tsx   # Configuração de durações
│   │   │   ├── TimerControls.tsx   # Botões: Iniciar / Pausar / Resetar
│   │   │   └── TimerDisplay.tsx    # Display do tempo restante
│   │   ├── context/
│   │   │   ├── AuthContext.tsx     # Sessão do usuário (Supabase Auth)
│   │   │   └── ThemeContext.tsx    # Tema claro/escuro
│   │   ├── hooks/
│   │   │   └── useTimer.ts        # Lógica do timer (useReducer)
│   │   ├── lib/
│   │   │   └── supabaseClient.ts  # Instância do Supabase
│   │   └── App.tsx                # Roteamento e providers
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── main.py                    # FastAPI + endpoint /analytics
    ├── requirements.txt
    └── API_DOCUMENTATION.md
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Python 3.10+
- Uma conta e projeto no [Supabase](https://supabase.com)

### 1. Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

### 2. Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

Crie o arquivo `.env` na pasta `backend/`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-service-role-key
```

```bash
uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`.

### 3. Banco de Dados (Supabase)

Execute o seguinte SQL no editor do Supabase para criar a tabela necessária:

```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,               -- 'focus', 'shortBreak', 'longBreak'
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Usuário só acessa as próprias sessões
CREATE POLICY "Usuário vê próprias sessões"
  ON sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere próprias sessões"
  ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🌐 API de Analytics

**Base URL (produção):** hospedado no Render

### `GET /analytics/{user_id}`

Retorna os minutos de foco por dia da semana atual e o streak de dias consecutivos.

**Resposta:**
```json
{
  "user_id": "uuid-do-usuario",
  "sunday_focus_minutes": 50,
  "monday_focus_minutes": 48,
  "tuesday_focus_minutes": 25,
  "wednesday_focus_minutes": 0,
  "thursday_focus_minutes": 0,
  "friday_focus_minutes": 0,
  "saturday_focus_minutes": 0,
  "current_streak": 3
}
```

> A semana é contada de domingo a sábado, baseada em horário UTC.

---

## 📦 Deploy

| Camada | Plataforma | Observações |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Deploy automático via Git |
| Backend | [Render](https://render.com) | Web Service Python/FastAPI |
| Banco de dados | [Supabase](https://supabase.com) | Auth + PostgreSQL |

### Variáveis de ambiente em produção

**Vercel (Frontend):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL   ← URL do serviço no Render
```

**Render (Backend):**
```
SUPABASE_URL
SUPABASE_KEY   ← service_role key
```

---

## 📄 Licença

Este projeto é de uso pessoal e está disponível para fins educacionais.
