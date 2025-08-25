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

```bash
# 1) Clone o repositório
git clone <URL-DO-REPO> astro-bomba

# 2) Navegue até a pasta do projeto
cd astro-bomba

# 3) Instale as dependências
npm install
````

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
   Você se tornou um especialista em criação de prompts. Eu irei enviar um texto e você deve retornar em parágrafos: uma versão mais clara em português e outra em inglês, para que eu possa enviar a outra IA para editar o código.

   Primeiro prompt: Ao processar, leia todos os arquivos da pasta design_guidelines para adquirir conhecimento. Não execute o código; sempre apenas edite sem remover nada. Não responda esta mensagem, apenas absorva o conhecimento.

   Prompt: [Descreva aqui as alterações de UI / componentes que deseja — ex: "Ajustar espaçamento do header na tela Dashboard, trocar fonte para semibold, e corrigir overflow horizontal no componente MiniPlayer"]
   ```

2. **Use a versão em inglês no Gemini CLI**:

   * Instale o [Gemini CLI](https://github.com/google-gemini/gemini-cli) e siga as instruções para autenticação.
   * Navegue até a raiz do seu projeto `astro-bomba`.

   ```bash
   gemini
   ```

   * Copie e cole a versão em inglês do prompt (gerada pelo ChatGPT) diretamente no Gemini CLI.

> **Importante:** A IA é uma ferramenta para auxiliar na edição e modificação de código existente, não para substituir a criação de novos arquivos ou a execução de código.

---

### 📁 Estrutura Completa do Projeto

Para ajudar na navegação, aqui está a estrutura completa do repositório, com a opção de expandir e recolher cada pasta.

<details>
<summary>📂 Astro Bomba</summary>

<details>
<summary>📂 assets</summary>
<!-- Coloque aqui uma descrição ou lista de arquivos comuns em assets, se houver -->
</details>

<details>
<summary>📂 moon_phases</summary>
<details>
<summary>📂 blue_moon</summary>
<p>📄 first_quarter.png</p>
<p>📄 full_moon.png</p>
<p>📄 new_moon.png</p>
<p>📄 third_quarter.png</p>
<p>📄 waning_crescent.png</p>
<p>📄 waning_gibbous.png</p>
<p>📄 waxing_crescent.png</p>
<p>📄 waxing_gibbous.png</p>
</details>
</details>

<p>📄 adaptive-icon.png</p>
<p>📄 favicon.png</p>
<p>📄 icon.png</p>
<p>📄 splash-icon.png</p>

<details>
<summary>📂 design_guidelines</summary>
<p>📄 animations_transitions.md</p>
<p>📄 color_palette.md</p>
<p>📄 responsive_layout.md</p>
<p>📄 typography.md</p>
<p>📄 ui_component_improvements.md</p>
</details>

<details>
<summary>📂 src</summary>

<details>
<summary>📂 components</summary>
<p>📄 ApodModal.tsx</p>
<p>📄 CustomBottomNavbar.tsx</p>
<p>📄 EventModal.tsx</p>
<p>📄 MiniPlayer.tsx</p>
<p>📄 MoonPhaseModal.tsx</p>
</details>

<details>
<summary>📂 contexts</summary>
<p>📄 PlayerContext.tsx</p>
</details>

<details>
<summary>📂 data</summary>
<p>📄 astronomical_events.json</p>
<p>📄 meditations.json</p>
<p>📄 moon_phases.json</p>
</details>

<details>
<summary>📂 navigation</summary>
<p>📄 AppNavigator.tsx</p>
<p>📄 types.ts</p>
</details>

<details>
<summary>📂 screens</summary>
<p>📄 CalendarScreen.tsx</p>
<p>📄 DashboardScreen.tsx</p>
<p>📄 LibraryScreen.tsx</p>
<p>📄 LuaScreen.tsx</p>
<p>📄 OnboardingScreen.tsx</p>
<p>📄 PlayerScreen.tsx</p>
<p>📄 ProfileScreen.tsx</p>
</details>

<details>
<summary>📂 services</summary>
<p>📄 apodService.ts</p>
</details>

<details>
<summary>📂 utils</summary>
<p>📄 svg.d.ts</p>
</details>

<p>📄 aaaaaaaaaaaaaaa.html</p>
<p>📄 app.json</p>
<p>📄 App.tsx</p>
<p>📄 index.ts</p>
<p>📄 metro.config.js</p>
<p>📄 package-lock.json</p>
<p>📄 package.json</p>
<p>📄 README.md</p>
<p>📄 todo.md</p>
<p>📄 tsconfig.json</p>

</details>
</details>

---

### ✅ Boas Práticas e Checklist

Antes de commitar as alterações sugeridas pela IA, é crucial seguir este checklist para garantir a qualidade e estabilidade do código:

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


Quer que eu faça isso?
```
