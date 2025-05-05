# Todo - Desenvolvimento AstroRhythm

## Fase 1: Implementação do Calendário Astronômico

- [X] 1.1. Configurar e executar a API de eventos astronômicos localmente.
- [X] 1.2. Implementar a lógica de busca de dados (fetch) da API no `CalendarScreen.tsx`.
- [X] 1.3. Substituir os dados de exemplo (`astronomicalEvents`) pelos dados da API no `CalendarScreen.tsx`.
- [X] 1.4. Atualizar a lógica de renderização do calendário mensal para destacar dias com eventos baseados nos dados da API.
- [X] 1.5. Atualizar a lista "Eventos Astronômicos" para exibir os dados da API (título, descrição).
- [X] 1.6. Implementar a exibição das dicas de visualização (`viewing_tips`) para cada evento (ex: modal ao clicar).
- [X] 1.7. Utilizar as cores fornecidas pela API para os eventos no calendário e na lista.
- [ ] 1.8. (Opcional/Futuro) Implementar funcionalidade básica do botão de notificação (🔔).
- [ ] 1.9. (Opcional/Futuro) Implementar navegação funcional entre meses no calendário.

## Fase 2: Implementação da Meditação Cósmica

- [X] 2.1. Planejar a estrutura de dados para as meditações (áudios, títulos, descrições, categorias).
    - Definir formato JSON com campos: `id` (string), `title` (string), `description` (string), `duration_seconds` (integer), `category` (string), `audio_url` (string - local ou remoto), `image_url` (string, opcional), `is_premium` (boolean).
    - Criar um arquivo `meditations.json` inicial com dados de exemplo.
- [X] 2.2. Integrar a funcionalidade de player de áudio no `PlayerScreen.tsx`.
    - Utilizar uma biblioteca de áudio para React Native (ex: `expo-av` ou `react-native-track-player`).
    - Implementar controles básicos: play, pause, seek, controle de volume.
    - Carregar e reproduzir áudio a partir da `audio_url` fornecida nos dados da meditação.
    - Exibir informações da meditação (título, duração) recebidas via navegação.
- [X] 2.3. Atualizar `LibraryScreen.tsx` para buscar e exibir dados reais de meditação.
    - Carregar dados do arquivo `meditations.json` (ou de uma futura API).
    - Substituir os dados de exemplo (`meditationData`) pelos dados carregados.
    - Implementar a lógica de filtro por categoria (`categories`) com base nos dados reais.
    - Garantir que o clique em um card de meditação navegue para `PlayerScreen` com os parâmetros corretos (`title`, `duration`, `audio_url`, etc.).
- [X] 2.4. Implementar a funcionalidade de "Meditações Especiais" no `CalendarScreen.tsx` vinculada a eventos.
    - Adicionar um campo opcional `related_event_id` (string) ou `related_event_type` (string) aos dados da meditação (`meditations.json`).
    - Filtrar e exibir meditações especiais na seção correspondente do `CalendarScreen.tsx`, possivelmente com base no dia ou tipo de evento astronômico.
    - Substituir os dados de exemplo (`specialMeditations`) pelos dados filtrados.
    - Garantir que o clique navegue para `PlayerScreen` com os parâmetros corretos.
- [X] 2.5. Definir o modelo de monetização (conteúdo gratuito vs. premium).
    - Utilizar o campo `is_premium` (boolean) nos dados da meditação (`meditations.json`).
    - Implementar lógica no `LibraryScreen.tsx` e `PlayerScreen.tsx` para restringir acesso a conteúdo premium.
    - Exibir indicadores visuais para conteúdo premium (ex: cadeado, banner).
    - Manter o botão de login na tela inicial, mas sem funcionalidade de login real nesta versão (conforme solicitado).
    - (Futuro) Integrar um sistema de gerenciamento de assinaturas (ex: RevenueCat) quando o login for implementado.

## Fase 3: Integração API NASA

- [X] 3.1. Pesquisar e selecionar endpoints relevantes da API da NASA para fotos e informações de eventos passados.
    - Foco inicial: API APOD (Astronomy Picture of the Day) para imagens diárias/históricas com descrições.
    - Foco secundário: NASA Image and Video Library para busca de imagens específicas (se necessário).
    - Obter uma chave de API da NASA (ou usar DEMO_KEY inicialmente).
- [X] 3.2. Planejar como integrar esses dados no aplicativo (ex: nova seção, detalhes do evento).
    - Opção 1: Adicionar uma seção "Imagem do Dia" no Dashboard ou Biblioteca.
    - Opção 2: Exibir imagem/informação relevante ao visualizar detalhes de um evento passado no Calendário (requer mapeamento evento <-> data APOD).
    - Definir como o usuário navegará/acessará essas informações.
- [X] 3.3. Implementar a busca e exibição dos dados da NASA.

## Fase 4: Testes e Finalização

- [X] 4.1. Testar todas as funcionalidades implementadas.
- [ ] 4.2. Refinar a interface do usuário e a experiência geral.
- [X] 4.3. Preparar a documentação e os arquivos para entrega.
