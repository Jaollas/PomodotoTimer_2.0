# Timer Pomodoro

Um Timer Pomodoro simples e funcional desenvolvido com React e TypeScript. O projeto foca em um desenvolvimento básico frontend para treino, com a intenção de aprender e praticar as tecnologias mencionadas. Transições e designs suaves e simples foram implementados também.

(Gerado por IA):

## 🚀 Funcionalidades

- **Timer Preciso**: Gerenciamento de tempo rigoroso com `useReducer` e `setInterval`.
- **Fluxo Inteligente**: Transição automática entre os modos de Foco e Intervalo (Focus -> Short Break -> Focus).
- **Feedback Sonoro**: Alertas auditivos ao iniciar o timer e ao finalizar um ciclo (com repetições).
- **Customização Total**: Painel de configurações colapsável para ajustar as durações de foco e intervalos (entre 1 e 120 minutos).
- **Design Premium**: Interface responsiva com Glassmorphism, fontes modernas (Inter & Outfit) e temas que mudam dinamicamente conforme o modo do timer.
- **Tipagem Estrita**: Desenvolvido 100% em TypeScript para maior segurança e manutenibilidade.

## 🏗️ Arquitetura

O projeto segue uma estrutura modular clara, facilitando a manutenção e escalabilidade:

- **`src/components/`**: Componentes de UI desacoplados (Display, Controls, ModeSelector, Settings).
- **`src/hooks/`**: Lógica de negócio encapsulada no hook customizado `useTimer.ts`, que gerencia o estado complexo do timer.
- **`src/utils/`**: Funções utilitárias como o `timeFormatter.ts` para formatação de strings de tempo.
- **`src/index.css`**: Sistema de design centralizado usando variáveis CSS para temas dinâmicos.

## 🛠️ Tecnologias Utilizadas

- **React 19** (SPA)
- **TypeScript**
- **Vite** (Build tool rápida)
- **Vanilla CSS** (Custom Design System)

## 🏃 Como Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (recomendado versão LTS).

### Passos
1. **Clonar o repositório:**
   ```bash
   git clone <link-do-repositorio>
   cd <nome-do-diretorio>
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação:**
   Abra o navegador em [http://localhost:5173/](http://localhost:5173/)

---
