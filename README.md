# 🚀 Astro Rhythm — Guia de Instalação, Fluxo de Trabalho e Automação com Gemini

Bem-vindo ao **Astro Rhythm**! Este guia foi feito para te ajudar a configurar o projeto e a usar um fluxo de trabalho avançado com IAs, utilizando o Gemini CLI para editar e modificar o código de forma eficiente.

-----

### 📚 Sumário

* [🔧 Pré-requisitos](#-pré-requisitos)
* [🛠️ Instalação Rápida](#-instalação-rápida)
* [▶️ Rodando o Projeto (Expo)](#️-rodando-o-projeto-expo)
* [✨ Fluxo de Trabalho com IA](#-fluxo-de-trabalho-com-ia)
* [📁 Estrutura Completa do Projeto](#-estrutura-completa-do-projeto)
* [✅ Boas Práticas e Checklist](#-boas-práticas-e-checklist)
* [🔐 Segurança e Responsabilidade](#-segurança-e-responsabilidade)
* [📌 Observações Finais](#-observações-finais)

-----

### 🔧 Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte instalado:

* **Node.js**: A versão LTS é recomendada e já vem com `npm` e `npx`.
* **Git**: Essencial para clonar o repositório.
* **Expo Go**: Baixe e instale este aplicativo no seu celular (Android ou iOS) para rodar e testar o app.

> **Nota:** Este guia assume que você tem um conhecimento básico de comandos de terminal.

-----

### 🛠️ Instalação Rápida

Abra seu terminal e execute os comandos abaixo para ter o projeto rodando.

## 1) Clone o repositório
```bash
git clone https://github.com/Carluxxo/AstroRhythm.git
```
## 2) Navegue até a pasta do projeto
```bash
cd AstroRhythm
```

## 3) Instale as dependências
```bash
npm install
```

---

### ▶️ Rodando o Projeto (Expo)

Com as dependências instaladas, o próximo passo é iniciar o servidor de desenvolvimento do Expo.

```bash
npx expo start
```

Ao executar o comando, um **QR code** aparecerá no seu terminal. Use a câmera do seu celular para escaneá-lo e o aplicativo será aberto no **Expo Go**.

* **Emulador Android**: Pressione a tecla `a` no terminal.
* **Emulador iOS (macOS)**: Pressione a tecla `i`.
* **Limpar cache**: Se encontrar problemas, use `npx expo start --clear`.

> **Dica:** Se o aplicativo não carregar, tente reiniciar o Expo com a flag `--clear` para limpar o cache do Metro Bundler.

---

### ✨ Fluxo de Trabalho com IA

O objetivo deste fluxo é usar IAs para **editar e modificar** o código de forma eficiente. Em vez de escrever o código do zero, você descreve as alterações desejadas e a IA as aplica diretamente.

#### **Fluxo de Prompts: ChatGPT → Gemini CLI**

1. **Crie o prompt mestre para o ChatGPT**:

   Copie e cole o texto abaixo na sua conversa com o ChatGPT. No final, adicione sua descrição detalhada das alterações.

```text
Você se tornou um especialista em criação de prompts. Eu irei enviar um texto e você deve retornar dois parágrafos: uma versão mais clara em português e outra em inglês, para que eu possa enviar a outra IA para editar o código.

Instrução permanente: Antes de processar qualquer texto, leia todos os arquivos da pasta design_guidelines para adquirir conhecimento. Não execute o código; apenas analise e edite sem remover nada. Não responda a esta mensagem; apenas absorva o conteúdo.

Prompt:
```

2. **Use a versão em inglês no Gemini CLI**:

   * Instale o [Gemini CLI](https://github.com/google-gemini/gemini-cli) e siga as instruções para autenticação.
   * Navegue até a raiz do seu projeto `AstroRhythm`.

   ```bash
   gemini
   ```

   * Copie e cole a versão em inglês do prompt (gerada pelo ChatGPT) diretamente no Gemini CLI.

> **Importante:** A IA é uma ferramenta para auxiliar na edição e modificação de código existente, não para substituir a criação de novos arquivos ou a execução de código.

---

### 📁 Estrutura Completa do Projeto

<details>
<summary>📂 Astro Bomba</summary>

```
📂 Astro Bomba
├─📂 assets
├─📂 moon_phases
│  └─📂 blue_moon
│     ├─📄 first_quarter.png
│     ├─📄 full_moon.png
│     ├─📄 new_moon.png
│     ├─📄 third_quarter.png
│     ├─📄 waning_crescent.png
│     ├─📄 waning_gibbous.png
│     ├─📄 waxing_crescent.png
│     └─📄 waxing_gibbous.png
├─📄 adaptive-icon.png
├─📄 favicon.png
├─📄 icon.png
├─📄 splash-icon.png
├─📂 design_guidelines
│  ├─📄 animations_transitions.md
│  ├─📄 color_palette.md
│  ├─📄 responsive_layout.md
│  ├─📄 typography.md
│  └─📄 ui_component_improvements.md
├─📂 src
│  ├─📂 components
│  │  ├─📄 ApodModal.tsx
│  │  ├─📄 CustomBottomNavbar.tsx
│  │  ├─📄 EventModal.tsx
│  │  ├─📄 MiniPlayer.tsx
│  │  └─📄 MoonPhaseModal.tsx
│  ├─📂 contexts
│  │  └─📄 PlayerContext.tsx
│  ├─📂 data
│  │  ├─📄 astronomical_events.json
│  │  ├─📄 meditations.json
│  │  └─📄 moon_phases.json
│  ├─📂 navigation
│  │  ├─📄 AppNavigator.tsx
│  │  └─📄 types.ts
│  ├─📂 screens
│  │  ├─📄 CalendarScreen.tsx
│  │  ├─📄 DashboardScreen.tsx
│  │  ├─📄 LibraryScreen.tsx
│  │  ├─📄 LuaScreen.tsx
│  │  ├─📄 OnboardingScreen.tsx
│  │  ├─📄 PlayerScreen.tsx
│  │  └─📄 ProfileScreen.tsx
│  ├─📂 services
│  │  └─📄 apodService.ts
│  └─📂 utils
│     └─📄 svg.d.ts
├─📄 aaaaaaaaaaaaaaa.html
├─📄 app.json
├─📄 App.tsx
├─📄 index.ts
├─📄 metro.config.js
├─📄 package-lock.json
├─📄 package.json
├─📄 README.md
├─📄 todo.md
└─📄 tsconfig.json
```

</details>

---

### ✅ Boas Práticas e Checklist

* **Revise o código**: Use `git diff` para inspecionar todas as mudanças.
* **Teste o aplicativo**: Execute a tela afetada manualmente no Expo Go.
* **Documente o prompt**: Adicione uma nota no commit ou Pull Request com o prompt usado.
* **Faça commits claros**: Use mensagens descritivas como `fix:`, `feat:` ou `chore:`.

---

### 🔐 Segurança e Responsabilidade

* **Sempre revise o código** gerado pela IA antes de aceitar.
* **Nunca compartilhe segredos** ou chaves de API nos prompts. Use variáveis de ambiente.

> **Atenção:** Verifique se a IA não removeu arquivos ou partes críticas do código. O prompt mestre instrui a IA a não remover nada, mas a revisão humana é essencial para evitar resultados indesejados.

---

### 📌 Observações Finais

* Mantenha a pasta `design_guidelines` sempre atualizada. Ela é a base de conhecimento para a IA.
* Siga o fluxo de trabalho para otimizar o desenvolvimento e focar em problemas de design e arquitetura, deixando as edições repetitivas para a automação.
