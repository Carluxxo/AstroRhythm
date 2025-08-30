## Diretrizes de Animações e Transições - AstroRhythm

Para complementar os aprimoramentos visuais e criar uma experiência de usuário mais fluida, dinâmica e premium, proponho a adição das seguintes animações e transições sutis:

**1. Transições de Tela:**

*   **Tipo:** Fade Suave (Cross-fade) ou Slide Horizontal Sutil.
*   **Implementação:** Utilizar as opções de animação da biblioteca de navegação (`@react-navigation/stack`) ou `react-native-reanimated` para transições mais customizadas.
*   **Duração:** Rápida (250-350ms) para não parecer lento.
*   **Objetivo:** Tornar a navegação entre as telas principais (Dashboard, Biblioteca, Calendário) mais elegante e menos abrupta.

**2. Carregamento de Conteúdo (Loading States):**

*   **Tipo:**
    *   **Skeleton Screens:** Para listas ou cards (eventos, meditações, APOD) enquanto os dados estão sendo carregados. Usar formas que mimetizam o layout final com uma animação de brilho pulsante (shimmer effect) usando cores neutras escuras.
    *   **Fade-in:** Aplicar um fade-in suave (opacidade de 0 a 1) quando o conteúdo real (imagens, texto) estiver pronto para ser exibido após o carregamento.
*   **Implementação:** Bibliotecas como `react-native-skeleton-placeholder` ou implementação customizada com `react-native-reanimated`.
*   **Objetivo:** Melhorar a percepção de performance e fornecer feedback visual durante o carregamento, em vez de apenas um `ActivityIndicator` genérico (embora este ainda possa ser usado em conjunto ou para carregamentos muito rápidos).

**3. Interações com Componentes:**

*   **Botões (Toque):**
    *   **Tipo:** Leve scale down (ex: 0.98) e/ou mudança sutil no brilho/cor do fundo ao ser pressionado.
    *   **Implementação:** `TouchableOpacity` (já usado, mas pode ser ajustado) ou `Pressable` com `react-native-reanimated` para mais controle.
    *   **Objetivo:** Fornecer feedback tátil e visual imediato à interação do usuário.
*   **Cards (Toque):**
    *   **Tipo:** Leve scale up (ex: 1.02) ou mudança na sombra/brilho ao ser pressionado, antes de navegar para a próxima tela (se aplicável).
    *   **Implementação:** Similar aos botões.
    *   **Objetivo:** Indicar que o card é interativo e responder ao toque.
*   **Seleção de Categoria (Biblioteca):**
    *   **Tipo:** Animação suave na mudança do estado ativo/inativo (ex: transição de cor do fundo/borda).
    *   **Implementação:** `LayoutAnimation` ou `react-native-reanimated`.
    *   **Objetivo:** Tornar a seleção de filtro mais visualmente agradável.

**4. Aparição de Elementos:**

*   **Itens de Lista/Grid (Eventos, Meditações):**
    *   **Tipo:** Staggered fade-in e/ou slide-up leve para cada item quando a lista é carregada ou filtrada.
    *   **Implementação:** `FlatList` ou `ScrollView` com `react-native-reanimated` para animar os itens individualmente com um pequeno atraso entre eles.
    *   **Objetivo:** Adicionar um toque de dinamismo e sofisticação à exibição de listas.
*   **Modal (Dicas de Visualização):**
    *   **Tipo:** Manter o slide-up atual (`animationType="slide"`), mas garantir que seja suave. Considerar um fade-in no overlay escuro de fundo.
    *   **Implementação:** Props do componente `Modal`.
    *   **Objetivo:** Transição clara para o conteúdo do modal.

**5. Ícones Animados (Opcional/Avançado):**

*   **Tipo:** Usar Lottie para animações mais complexas em ícones específicos (ex: ícone de play/pause no player, ícone de carregamento personalizado, ícone de sino de notificação).
*   **Implementação:** Biblioteca `lottie-react-native`.
*   **Objetivo:** Adicionar personalidade e feedback visual mais rico em pontos chave da interface.
*   **Consideração:** Usar com moderação para não sobrecarregar a interface ou impactar a performance.

**Princípios Gerais:**

*   **Sutileza:** As animações devem ser sutis e rápidas, complementando a experiência sem distrair ou atrapalhar o usuário.
*   **Performance:** Priorizar animações performáticas (usar `useNativeDriver: true` sempre que possível, preferir `opacity` e `transform` sobre `layout` properties).
*   **Propósito:** Cada animação deve ter um propósito claro (feedback, indicar mudança de estado, guiar o usuário, melhorar a percepção de performance).
*   **Consistência:** Manter um estilo e timing consistentes para as animações em todo o aplicativo.

Estas diretrizes fornecem uma base para adicionar movimento e fluidez à interface do AstroRhythm, contribuindo para uma experiência de usuário mais polida e premium.

===

## Paleta de Cores Refinada - AstroRhythm

Baseado na análise do design atual e nas tendências de UI/UX para 2025 (dark mode, glassmorphism, temas cósmicos), proponho a seguinte paleta refinada:

**Cores Base (Escuras):**

*   `#050810` (Azul Meia-Noite Muito Escuro): Fundo principal, mais profundo que o `#0a0a0f` atual, para maior imersão.
*   `#111528` (Azul Marinho Escuro): Cor secundária para containers e cards, ligeiramente mais claro que o fundo principal, similar ao `#121330` atual mas com um tom mais azulado.
*   `#1E2245` (Índigo Escuro): Cor para elementos de fundo terciários ou bordas sutis, oferecendo uma variação suave.

**Cores de Destaque (Vibrantes e Cósmicas):**

*   `#8A4FFF` (Roxo Elétrico): Cor primária de destaque (similar ao `#6b3fa0` atual, mas mais vibrante e energético). Ideal para botões principais, ícones ativos, indicadores de progresso.
*   `#4ECDC4` (Turquesa Brilhante): Cor secundária de destaque (similar ao `#47d6a0` atual, mas um pouco mais suave e azulado). Para elementos interativos secundários, ícones informativos, destaques sutis.
*   `#FF6B6B` (Coral Vivo): Cor terciária de destaque (nova). Para alertas, notificações importantes ou elementos que precisam de atenção imediata. Usar com moderação.
*   `#F7B801` (Dourado Cósmico): Cor quaternária de destaque (nova). Para indicar conteúdo premium, estrelas, ou elementos especiais. Evoca um senso de valor e raridade.

**Cores Neutras (Texto e Ícones):**

*   `#FFFFFF` (Branco Puro): Para títulos principais e textos de alta importância.
*   `#E0E0E0` (Branco Gelo): Para textos secundários e descrições, oferecendo bom contraste sem ser tão forte quanto o branco puro.
*   `#A0A0B0` (Cinza Claro Azulado): Para textos de menor importância, placeholders, ícones inativos. Mantém a harmonia com os fundos azulados.
*   `#606075` (Cinza Médio Azulado): Para bordas muito sutis ou divisores.

**Considerações Adicionais:**

*   **Gradientes:** Usar gradientes sutis com as cores de destaque sobre os fundos escuros para adicionar profundidade e interesse visual (ex: `#8A4FFF` para `#4ECDC4`).
*   **Glassmorphism:** Aplicar efeitos de vidro fosco (blur e transparência) em modais, barras de navegação ou painéis sobrepostos, usando as cores base escuras com baixa opacidade.
*   **Consistência:** Manter o uso consistente das cores em todo o aplicativo para criar uma identidade visual forte.

Esta paleta visa manter a atmosfera escura e cósmica, mas introduz mais vibração e contraste nos elementos de destaque, alinhando-se com tendências premium e melhorando a hierarquia visual.

===

## Diretrizes de Layout Responsivo - AstroRhythm

Para garantir que o AstroRhythm ofereça uma experiência visual consistente e agradável em uma variedade de tamanhos de tela e densidades de pixel de dispositivos móveis, proponho as seguintes diretrizes para o layout responsivo:

**1. Utilização Primária de Flexbox:**

*   **Estratégia:** Continuar utilizando Flexbox como a principal ferramenta para estruturar layouts. Aproveitar `flexDirection`, `justifyContent`, `alignItems`, `flexWrap` e `flex` para criar arranjos flexíveis.
*   **Exemplo:** Usar `flex: 1` para componentes que devem ocupar o espaço disponível, `justifyContent: 'space-between'` para distribuir itens, e `flexWrap: 'wrap'` para grids (como a lista de meditações).
*   **Justificativa:** Flexbox é o padrão do React Native e oferece controle robusto sobre o posicionamento e dimensionamento dos elementos em uma única dimensão.

**2. Dimensionamento Relativo (Porcentagens e Aspect Ratio):**

*   **Estratégia:** Onde apropriado, usar porcentagens para larguras e alturas em relação ao container pai, especialmente para elementos que devem ocupar uma fração da tela (ex: colunas em um grid).
    *   Exemplo: `width: '48%'` para cards em um grid de duas colunas, permitindo um pequeno espaço entre eles.
*   **Aspect Ratio:** Utilizar `aspectRatio` para manter as proporções de elementos como imagens ou cards quadrados/retangulares, garantindo que eles se redimensionem corretamente sem distorção.
    *   Exemplo: `aspectRatio: 1` para cards de meditação quadrados.
*   **Justificativa:** Permite que os elementos se adaptem fluidamente ao tamanho da tela disponível.

**3. Evitar Dimensões Fixas (Hardcoded Pixels) Sempre que Possível:**

*   **Estratégia:** Minimizar o uso de valores fixos de `width` e `height` em pixels, especialmente para containers principais ou elementos que precisam se adaptar. Usar pixels fixos principalmente para elementos pequenos e bem definidos (ícones, bordas finas, paddings/margins específicos).
*   **Alternativas:** Preferir `padding`, `margin`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` e dimensionamento relativo.
*   **Justificativa:** Dimensões fixas não se adaptam bem a diferentes tamanhos de tela e densidades, podendo levar a layouts quebrados ou conteúdo cortado.

**4. Teste em Diferentes Dispositivos/Simuladores:**

*   **Estratégia:** Testar o layout regularmente em simuladores de diferentes tamanhos (ex: iPhone SE, iPhone Pro Max, Android de tela pequena, Android de tela grande/tablet) e, se possível, em dispositivos físicos.
*   **Foco:** Verificar alinhamentos, quebras de linha inesperadas, sobreposições, áreas de toque e legibilidade geral.
*   **Justificativa:** Garante que o design funcione como esperado em cenários reais de uso.

**5. Tratamento de Orientação (Paisagem/Retrato - Opcional/Futuro):**

*   **Estratégia:** Inicialmente, focar em um layout otimizado para a orientação retrato (portrait), que é a mais comum para aplicativos móveis. Se a orientação paisagem (landscape) for um requisito futuro, planejar layouts alternativos usando a API `Dimensions` ou hooks como `useWindowDimensions` para detectar a orientação e aplicar estilos condicionais.
*   **Justificativa:** Simplifica o desenvolvimento inicial, mas mantém a porta aberta para suporte futuro se necessário.

**6. Densidade de Pixel:**

*   **Estratégia:** O React Native geralmente lida bem com diferentes densidades de pixel. Garantir que imagens fornecidas tenham resolução suficiente (@2x, @3x) para telas de alta densidade.
*   **Justificativa:** Evita imagens pixeladas em telas de alta resolução.

**Revisão dos Componentes Atuais:**

*   **Grids (Meditações):** O uso atual de `width: '48%'` e `justifyContent: 'space-between'` já é uma boa prática responsiva.
*   **Calendário:** O uso de `width: '14.28%'` e `aspectRatio: 1` para os dias também é adequado para um grid semanal.
*   **Cards:** Verificar se os paddings internos e tamanhos de fonte se adaptam bem em telas menores.

Ao seguir estas diretrizes, o layout do AstroRhythm se manterá flexível e visualmente consistente em uma ampla gama de dispositivos, contribuindo para a experiência premium desejada.

===

## Diretrizes de Tipografia - AstroRhythm

Baseado na análise do design atual, nas tendências de UI/UX para 2025 e na pesquisa de fontes (Google Fonts), proponho as seguintes diretrizes de tipografia para melhorar a legibilidade, hierarquia visual e estética geral do aplicativo AstroRhythm:

**Fontes Escolhidas (Google Fonts):**

1.  **Space Grotesk:**
    *   **Uso:** Títulos principais (telas, seções grandes), elementos de destaque que precisam de personalidade.
    *   **Pesos:** Bold (700) para títulos principais, Medium (500) para subtítulos ou destaques menores.
    *   **Justificativa:** Fonte sans-serif geométrica com um toque moderno e levemente futurista, alinhada ao tema espacial. Boa legibilidade em tamanhos maiores.

2.  **Inter:**
    *   **Uso:** Corpo de texto (descrições, explicações), textos de botões, legendas, elementos de UI menores (duração, categorias).
    *   **Pesos:** Regular (400) para corpo de texto principal, Medium (500) para textos de botões ou ênfase leve, SemiBold (600) para subtítulos menores ou ênfase moderada.
    *   **Justificativa:** Fonte sans-serif altamente legível, especialmente em interfaces digitais e tamanhos menores. Possui excelente clareza em dark mode e oferece uma ampla gama de pesos para criar hierarquia sutil.

**Hierarquia e Tamanhos:**

*   **Título Principal (Ex: Nome da Tela):**
    *   Fonte: Space Grotesk
    *   Peso: Bold (700)
    *   Tamanho: 26pt - 28pt
*   **Título de Seção (Ex: "Em Destaque", "Eventos Astronômicos"):**
    *   Fonte: Space Grotesk
    *   Peso: Medium (500)
    *   Tamanho: 20pt - 22pt
*   **Subtítulo (Ex: Descrição da tela, Título de Card Grande):**
    *   Fonte: Inter
    *   Peso: SemiBold (600)
    *   Tamanho: 18pt
*   **Corpo de Texto Principal (Ex: Descrições, Explicações APOD):**
    *   Fonte: Inter
    *   Peso: Regular (400)
    *   Tamanho: 15pt - 16pt
    *   Line Height: 1.5x (Aprox. 24pt)
*   **Texto Secundário (Ex: Duração da meditação, Categoria, Data):**
    *   Fonte: Inter
    *   Peso: Regular (400)
    *   Tamanho: 13pt - 14pt
    *   Opacidade: Usar cores neutras mais suaves (ex: `#A0A0B0`)
*   **Texto de Botão:**
    *   Fonte: Inter
    *   Peso: Medium (500) ou SemiBold (600)
    *   Tamanho: 15pt - 16pt
*   **Texto Pequeno/Legenda (Ex: Copyright, Texto de Ícone):**
    *   Fonte: Inter
    *   Peso: Regular (400)
    *   Tamanho: 11pt - 12pt
    *   Opacidade: Usar cores neutras mais suaves (ex: `#A0A0B0`)

**Considerações Adicionais:**

*   **Consistência:** Aplicar rigorosamente a hierarquia e os estilos definidos em todas as telas.
*   **Espaçamento:** Ajustar o espaçamento entre letras (tracking) e linhas (leading/line-height) para otimizar a legibilidade, especialmente para blocos de texto mais longos.
*   **Contraste:** Garantir contraste suficiente entre o texto e o fundo, utilizando as cores neutras definidas na paleta.
*   **Teste:** Testar a legibilidade em diferentes tamanhos de tela e densidades de pixel.

Estas diretrizes visam criar uma experiência de leitura confortável e uma hierarquia visual clara, reforçando a estética moderna e premium do aplicativo.

===

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
