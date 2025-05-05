## Aprimoramento de Componentes UI - AstroRhythm

Baseado na análise das telas, tendências de design, paleta de cores e diretrizes de tipografia, proponho os seguintes aprimoramentos para os componentes UI principais do AstroRhythm:

**1. Cards (Eventos, Meditações, APOD):**

*   **Fundo:** Usar a cor base secundária (`#111528`) ou terciária (`#1E2245`) para os cards.
*   **Bordas/Sombras:** Remover bordas explícitas. Usar sombras muito sutis e escuras para criar profundidade ou um leve brilho interno com uma cor de destaque (ex: roxo `#8A4FFF` com baixa opacidade) para um efeito mais etéreo.
*   **Glassmorphism (Opcional):** Para cards em destaque (Featured Meditation, APOD), aplicar um leve efeito de glassmorphism no fundo do card ou em elementos sobrepostos dentro dele.
*   **Espaçamento Interno (Padding):** Aumentar ligeiramente o padding interno (ex: 18pt ou 20pt) para dar mais respiro ao conteúdo.
*   **Cantos Arredondados:** Manter ou aumentar ligeiramente o raio dos cantos arredondados (ex: 16pt a 20pt) para um visual mais suave e moderno.
*   **Imagens:** Garantir que as imagens (ou placeholders) preencham o espaço designado de forma consistente. Adicionar um overlay de gradiente sutil (escuro para transparente) na parte inferior das imagens onde o texto é sobreposto para melhorar a legibilidade.
*   **Tipografia:** Aplicar rigorosamente as novas fontes e hierarquia (`Space Grotesk` para títulos, `Inter` para descrições/durações).

**2. Botões:**

*   **Botões Principais (Ex: Play, Iniciar):**
    *   Usar a cor de destaque primária (`#8A4FFF`) como fundo.
    *   Aplicar um gradiente sutil ou um leve brilho para dar mais destaque.
    *   Usar `Inter Medium` ou `SemiBold` para o texto, na cor branca (`#FFFFFF`).
    *   Adicionar micro-interação no toque (ex: leve scale down ou mudança de brilho).
*   **Botões Secundários/Filtros (Ex: Categorias):**
    *   **Ativo:** Fundo com cor de destaque primária (`#8A4FFF`) ou secundária (`#4ECDC4`). Texto branco (`#FFFFFF`).
    *   **Inativo:** Fundo transparente com borda na cor de destaque correspondente. Texto na cor de destaque ou neutra clara (`#E0E0E0`).
    *   Formato: Manter o formato de pílula (cantos totalmente arredondados).
*   **Botões de Ícone (Ex: Navegação do Calendário, Controles do Player):**
    *   Usar ícones mais refinados e consistentes (considerar bibliotecas como Feather Icons ou Phosphor Icons).
    *   Aplicar cores neutras (`#A0A0B0` ou `#E0E0E0`) para ícones padrão e cores de destaque (`#8A4FFF`, `#4ECDC4`) para ícones ativos ou importantes.
    *   Aumentar a área de toque (padding) para facilitar a interação.

**3. Barra de Navegação Inferior:**

*   **Fundo:** Aplicar efeito de **Glassmorphism** com a cor base secundária (`#111528`) ou terciária (`#1E2245`) com baixa opacidade e blur acentuado. Isso cria um efeito flutuante moderno.
*   **Ícones:** Usar ícones mais estilizados e consistentes com o tema.
*   **Indicador Ativo:** Em vez de apenas mudar a opacidade, usar um indicador mais claro para o item ativo (ex: um fundo de pílula sutil com a cor de destaque primária `#8A4FFF` atrás do ícone/texto ativo, ou apenas mudar a cor do ícone e texto para a cor de destaque primária).
*   **Tipografia:** Usar `Inter Regular` ou `Medium` (11pt-12pt) para os rótulos.

**4. Calendário (`CalendarScreen`):**

*   **Container:** Pode manter o fundo `#111528` ou experimentar o glassmorphism aqui também.
*   **Dias:**
    *   **Círculo do Dia:** Tornar o círculo padrão mais sutil (ex: sem fundo, apenas o número).
    *   **Dia com Evento:** Usar um ponto colorido abaixo do número (com a cor do evento) ou um anel ao redor do número, em vez de preencher todo o círculo. Isso permite visualizar múltiplos eventos ou informações adicionais no futuro.
    *   **Dia Atual:** Destacar com um círculo preenchido com a cor de destaque secundária (`#4ECDC4`) ou um contorno mais forte.
    *   **Tipografia:** Usar `Inter` para os números dos dias.
*   **Navegação Mensal:** Ativar os botões de navegação (◀ ▶) e usar ícones mais elegantes.

**5. Modais (Ex: Dicas de Visualização):**

*   **Fundo:** Aplicar **Glassmorphism** de forma mais pronunciada aqui. Fundo com cor base escura (`#111528` ou `#1E2245`), baixa opacidade e blur significativo.
*   **Tipografia:** Seguir a hierarquia definida (`Space Grotesk` para título, `Inter` para corpo).
*   **Botão Fechar:** Usar um botão mais integrado ao design (ex: um "X" estilizado no canto ou um botão com fundo de cor de destaque).

**Considerações Gerais:**

*   **Animações/Transições:** Introduzir animações sutis nas transições de tela e ao carregar conteúdo (fade-in, slide-up leve) para tornar a experiência mais fluida (Passo 006).
*   **Consistência:** Garantir que espaçamentos, alinhamentos, raios de canto e estilos sejam aplicados consistentemente em todos os componentes e telas.

Estes aprimoramentos visam elevar a qualidade percebida do aplicativo, tornando-o mais moderno, coeso e alinhado com as expectativas de um produto premium.
