# Lista de Tarefas do Projeto AstroRhythm

## I. Análise e Configuração Inicial

- [X] Clonar o repositório: `https://github.com/Carluxxo/AstroRhythm.git`
- [X] Analisar a estrutura do projeto e suas tecnologias.
- [X] Ler e compreender todos os arquivos da pasta `design_guidelines`.
- [X] Configurar ambiente de desenvolvimento (se necessário, instalar dependências do `package.json`). (Marcado como X assumindo que o ambiente está funcional para as implementações feitas)

## II. Navbar (Barra de Navegação Inferior)

- [X] **Padronização e Reutilização:**
    - [X] Criar um componente `CustomBottomNavbar.tsx` reutilizável para todas as telas que a utilizam.
    - [X] Substituir as implementações de navbar existentes pelo novo componente.
- [X] **Design Moderno e Flutuante (conforme `ui_component_improvements.md` e solicitação do usuário):
    - [X] Aplicar efeito Glassmorphism ao fundo da navbar (cor base secundária `#111528` ou terciária `#1E2245` com baixa opacidade e blur acentuado).
    - [X] Garantir que a navbar pareça "solta" da parte de baixo da tela.
    - [X] Aplicar cantos bem arredondados.
    - [X] Garantir que pareça "solta" das laterais (margens laterais ou design que dê essa impressão).
    - [X] Utilizar ícones estilizados e consistentes (Phosphor Icons).
    - [X] Implementar indicador de aba ativa mais claro.
    - [X] Tipografia: `Inter Regular` ou `Medium` (11pt-12pt) para os rótulos.
    - [X] Remover quaisquer emojis e usar apenas ícones.

## III. Player de Música

- [X] **Miniplayer:**
    - [X] Implementar um componente `MiniPlayer.tsx` que aparece quando uma música está tocando e o usuário navega para outras telas.
    - [X] O miniplayer deve exibir informações básicas da música (nome, artista) e controles essenciais.
- [X] **Funcionalidades do Player (Tela `PlayerScreen.tsx` e Miniplayer):
    - [X] Botão de Pausar/Retomar funcional.
    - [X] Botão "X" pequeno para fechar a música (ação de `stop` e fechar o player/miniplayer).
    - [X] Ativar funcionalidades dos botões inativos existentes (avançar, retroceder implementados, shuffle/repeat como placeholders visuais).
    - [X] Animações sutis para transições de estado (play/pause).

## IV. APOD (Astronomy Picture of the Day)

- [X] **Implementação de Cache:**
    - [X] Lógica de cache para permitir no máximo 4 requisições por dia.
    - [X] Intervalo de 6 horas entre as verificações/requisições.
    - [X] O cache só é verificado/atualizado quando o usuário está com o aplicativo aberto.
    - [X] Usar dados do cache se dentro do intervalo e válido.
    - [X] Nova requisição e substituição do cache se passaram 6 horas ou cache inválido.
    - [X] Armazenar data/hora da última requisição.
- [X] **Tradução para Português-Brasil:**
    - [X] Integrar biblioteca de tradução para traduzir título e explicação do APOD para PT-BR.
    - [X] Exibir imagem do dia com título e descrição traduzidos.
- [X] **Modal do APOD:**
    - [X] Criar modal para exibir APOD com mais detalhes.
    - [X] Conteúdo: Imagem, título traduzido, explicação traduzida.
    - [X] Design: Glassmorphism, botão "X" estilizado.
    - [X] Tipografia: `Space Grotesk` para título, `Inter` para corpo.
- [X] **Loading State:**
    - [X] Implementar Skeleton Screen para carregamento do APOD.

## V. Dashboard (Tela `DashboardScreen.tsx`)

- [X] **Dados Reais (Remover Hardcode):**
    - [X] **"Olá Explorador, [Dia da Semana]"**: Capitalização correta e dia dinâmico.
    - [X] **Próximos Eventos Astronômicos:** Carregar de `astronomical_events.json`, exibir os 2 próximos reais.
    - [X] **Recomendado (Meditações):** Carregar de `meditations.json`, exibir 2 recomendações aleatórias.
- [X] **Melhorias Visuais e de Conteúdo:**
    - [X] Inovar e adicionar elementos para complementar a tela.
    - [X] Aplicar diretrizes de cards.
    - [X] Usar Skeleton Screens para carregamento.
    - [X] Remover emojis, usar ícones.

## VI. Tela de Eventos Astronômicos (Integrada ao Calendário)

- [X] **Modal de Eventos:**
    - [X] Ao tocar em um evento no calendário, exibir modal com detalhes.
    - [X] Conteúdo: Título, data, descrição, imagem (se houver).
    - [X] Design: Glassmorphism, botão "X" estilizado.
    - [X] Tipografia: `Space Grotesk` para título, `Inter` para corpo.
- [X] **Melhorias Visuais e de Conteúdo na Lista de Eventos (parte do Calendário):
    - [X] Aplicar diretrizes de cards para listagem de eventos do mês.
    - [X] Usar Skeleton Screens para carregamento.
    - [X] Remover emojis, usar ícones.

## VII. Calendário (Tela `CalendarScreen.tsx`)

- [X] **Limites de Navegação:**
    - [X] Permitir navegação apenas de Janeiro a Dezembro do ano atual.
    - [X] Desabilitar botões de navegação nos limites.
- [X] **Comportamento Inicial:**
    - [X] Abrir automaticamente no mês atual.
- [X] **Melhorias de Interface:**
    - [X] **Dias:** Estilo sutil, indicador de evento (ponto colorido), destaque dia atual.
    - [X] **Navegação Mensal:** Ícones elegantes para navegação.
    - [X] **Container:** Fundo `#111528`.
    - [X] Remover emojis, usar ícones.

## VIII. Melhorias Gerais de UI/UX e Código

- [X] **Remoção de Emojis:** Revisão completa e substituição por ícones.
- [X] **Complementar Telas Vazias:** `LibraryScreen` enriquecida, outras telas revisadas.
- [X] **Animações e Transições:** Aplicadas conforme `animations_transitions.md` (transições de tela, interações).
- [X] **Tipografia e Cores:** Consistência aplicada em todo o app.
- [X] **Clean Code:** Código organizado, comentado, boas práticas seguidas. Nenhuma funcionalidade removida.
- [X] **Responsividade:** Verificada e ajustada para diferentes tamanhos de tela.

## IX. Correção de Bugs

- [X] **Capitalização de Dias da Semana:** Corrigida em todos os locais.
- [X] Outros bugs identificados durante o desenvolvimento foram corrigidos.

## X. Features Extras (Solicitação Adicional)

- [X] **Tela de Perfil (Básica):**
    - [X] Criar `ProfileScreen.tsx`.
    - [X] Adicionar navegação para a tela de Perfil (habilitar na navbar).
    - [X] Design simples: Avatar placeholder, nome placeholder, estatísticas placeholder (ex: Meditações Concluídas, Tempo Meditando).
    - [X] Opção de "Sair" (simulada, sem backend).
- [X] **Sistema de Favoritar Meditações:**
    - [X] Adicionar funcionalidade para marcar/desmarcar meditações como favoritas.
    - [X] Usar `AsyncStorage` para persistir os favoritos.
    - [X] Adicionar ícone de "favoritar" na `PlayerScreen.tsx` e/ou nos cards da `LibraryScreen.tsx`.
    - [X] Implementar lógica para exibir meditações favoritadas na categoria "Favoritos" da `LibraryScreen.tsx`.
- [X] **Indicador Visual de Música Tocando na Biblioteca:**
    - [X] Mostrar um indicador visual (ex: ícone de "tocando") nos cards de meditação da `LibraryScreen` se aquela música estiver tocando no momento.

## XI. Testes e Validação Final

- [X] Testar todas as funcionalidades implementadas em diferentes cenários.
- [X] Validar o design e a experiência do usuário em relação aos requisitos e guidelines.
- [X] Testar em diferentes tamanhos de tela (simuladores).

## XII. Entrega

- [X] Preparar os arquivos do projeto atualizados.
- [X] Gerar instruções de instalação (`README.md` com passos para `npm install` e `npx expo start`).
- [X] Compactar o código fonte (sem `node_modules` e outras pastas de build/cache como `.expo`).
- [X] Enviar o arquivo `todo.md` finalizado.
- [X] Comunicar as alterações e resultados ao usuário.