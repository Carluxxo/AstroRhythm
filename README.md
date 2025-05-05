# AstroRhythm - Entrega Parcial (Melhorias Visuais)

Este pacote contém o código atualizado do aplicativo móvel AstroRhythm, com **melhorias visuais significativas** implementadas para uma experiência mais premium e imersiva, além da remoção da dependência da API local para o calendário.

## Funcionalidades Implementadas (e Modificadas)

1.  **Melhorias Visuais (Geral):
    *   **Nova Paleta de Cores:** Implementada uma paleta de cores escura e sofisticada, com tons de azul profundo, roxo e acentos vibrantes (ciano, magenta, amarelo), inspirada no cosmos.
    *   **Tipografia Refinada:** Utilização das fontes `Space Grotesk` (títulos) e `Inter` (corpo) para melhor legibilidade e estética moderna (requer instalação/configuração correta no projeto final).
    *   **Glassmorphism:** Aplicação de efeitos de desfoque (`BlurView`) na barra de navegação inferior e modais para um visual translúcido e moderno.
    *   **Ícones Atualizados:** Substituição de emojis por ícones vetoriais da biblioteca `@expo/vector-icons` (Ionicons, MaterialCommunityIcons) para maior consistência e clareza.
    *   **Componentes Aprimorados:** Cards, botões, listas e outros elementos de UI foram redesenhados com cantos arredondados, sombras sutis e melhor espaçamento.
    *   **Layouts Refinados:** Melhor organização visual e hierarquia de informações em todas as telas.
    *   **Estados de Carregamento:** Adicionados indicadores de atividade e placeholders (skeleton screens) mais elegantes.

2.  **Calendário Astronômico (`CalendarScreen.tsx`):
    *   **Dados Locais:** Carrega eventos do arquivo `src/data/astronomical_events.json`.
    *   **Visual:** Calendário redesenhado com melhor espaçamento, indicadores de eventos coloridos, destaque para o dia atual e modal de detalhes com efeito de glassmorphism.
    *   **Meditações Especiais:** Exibição em scroll horizontal com cards redesenhados.

3.  **Meditação Cósmica:
    *   **Biblioteca (`LibraryScreen.tsx`):** Layout aprimorado com card de destaque maior, grid de meditações com placeholders de imagem/ícone, filtro de categorias redesenhado (pílulas), e badges "Premium" mais visíveis.
    *   **Player (`PlayerScreen.tsx`):** Interface completamente redesenhada com visualização maior (placeholder de imagem/ícone), controles de mídia mais intuitivos (Play/Pause, Avançar/Retroceder 15s), slider de progresso aprimorado e botões de ações adicionais (Favorito, etc.) com ícones.

4.  **Dashboard (`DashboardScreen.tsx`):
    *   **APOD:** Seção "Imagem Astronômica do Dia" mantida, com busca e exibição de dados da API APOD da NASA.
    *   **Visual:** Layout geral alinhado com a nova identidade visual.

## Arquivos Incluídos/Modificados (Principais)

*   `AstroRhythm_App/`: Código fonte atualizado do aplicativo React Native.
    *   `src/screens/DashboardScreen.tsx` (Modificado)
    *   `src/screens/CalendarScreen.tsx` (Modificado)
    *   `src/screens/LibraryScreen.tsx` (Modificado)
    *   `src/screens/PlayerScreen.tsx` (Modificado)
    *   `src/data/astronomical_events.json` (Existente)
    *   `src/data/meditations.json` (Existente)
    *   `package.json` / `package-lock.json` (Adicionadas dependências: `expo-blur`, `@expo/vector-icons`, `@react-native-community/slider`)
*   `design_guidelines/`: Pasta com arquivos markdown detalhando as diretrizes de design (cores, tipografia, etc.).
*   `README.md`: Este arquivo (Atualizado).

## Próximos Passos (Sugestões)

*   **Fontes Customizadas:** Garantir o carregamento correto das fontes `Space Grotesk` e `Inter` no Expo.
*   **Mídia Real:** Substituir placeholders por imagens e URLs de áudio reais para as meditações.
*   **Funcionalidades:** Implementar funcionalidade completa dos botões desabilitados (shuffle, repetir, favorito, download, compartilhar, detalhes, perfil, etc.).
*   **Navegação Calendário:** Implementar navegação dinâmica entre meses.
*   **Testes:** Realizar testes extensivos em dispositivos reais (iOS/Android) para performance e layout.
*   **Otimização:** Otimizar o carregamento de imagens e áudio.
*   **Login/Premium:** Implementar sistema de autenticação e gerenciamento de assinaturas.

## Como Executar

1.  **Pré-requisitos:** Node.js, npm/yarn, Expo CLI, Expo Go (para testes) ou ambiente de build nativo.
2.  **Navegue** até o diretório `AstroRhythm_App/AstroRhythm`.
3.  **Instale** as dependências: `npm install` (ou `yarn install`).
4.  **(Opcional mas Recomendado)** Configure as fontes customizadas (`SpaceGrotesk`, `Inter`) no seu projeto Expo.
5.  **(Importante)** Atualize os caminhos/URLs em `src/data/meditations.json` para arquivos de áudio/imagem válidos.
6.  **Inicie** o aplicativo: `npm start` (ou `yarn start`) e abra no Expo Go ou emulador/dispositivo.


