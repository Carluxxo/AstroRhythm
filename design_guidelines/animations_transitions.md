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
