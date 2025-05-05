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
