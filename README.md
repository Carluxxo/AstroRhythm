# AstroRhythm - Instruções de Instalação e Execução

Este documento fornece as instruções necessárias para configurar e executar o projeto AstroRhythm em seu ambiente de desenvolvimento.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em seu sistema:

- **Node.js**: Versão LTS recomendada (inclui npm). Você pode baixar em [nodejs.org](https://nodejs.org/).
- **Expo CLI**: Interface de linha de comando para projetos Expo. Instale globalmente via npm:
  ```bash
  npm install -g expo-cli
  ```
- **Git**: Para clonar o repositório (se você estiver obtendo o código de um repositório Git).
- **Um emulador Android ou iOS configurado**, ou um dispositivo físico para testar o aplicativo.

## Configuração do Projeto

1.  **Descompacte o Código-Fonte:**
    Se você recebeu o projeto como um arquivo `.tar.gz` (por exemplo, `AstroRhythm_corrigido.tar.gz`), descompacte-o em um diretório de sua escolha.
    ```bash
    tar -xzf AstroRhythm_corrigido.tar.gz -C /caminho/para/seu/diretorio_de_projetos
    cd /caminho/para/seu/diretorio_de_projetos/Astro_v2 
    ```
    (Ajuste o nome do arquivo e o caminho conforme necessário. O diretório interno no .tar pode ser `Astro_v2` ou similar, dependendo de como foi compactado.)

2.  **Instale as Dependências:**
    Navegue até o diretório raiz do projeto (onde o arquivo `package.json` está localizado) e execute o seguinte comando para instalar todas as dependências necessárias:
    ```bash
    npm install
    ```
    Este comando lerá o arquivo `package.json` e baixará todas as bibliotecas listadas nas seções `dependencies` e `devDependencies`.

## Executando o Aplicativo

Após a instalação bem-sucedida das dependências, você pode iniciar o servidor de desenvolvimento do Expo com o seguinte comando:

```bash
npx expo start
```

Este comando iniciará o Metro Bundler e exibirá um QR code no terminal. Você pode então:

-   **No Android:**
    -   Abra o aplicativo Expo Go em seu dispositivo Android (disponível na Play Store).
    -   Escaneie o QR code exibido no terminal.
    -   Alternativamente, se estiver usando um emulador Android, você pode pressionar `a` no terminal onde o Expo está rodando.

-   **No iOS:**
    -   Abra o aplicativo Câmera em seu dispositivo iOS e escaneie o QR code.
    -   O Expo Go será aberto (se não estiver instalado, você será solicitado a instalá-lo pela App Store).
    -   Alternativamente, se estiver usando um simulador iOS, você pode pressionar `i` no terminal onde o Expo está rodando.

-   **Na Web (para desenvolvimento e testes rápidos, algumas funcionalidades nativas podem não funcionar perfeitamente):**
    -   Pressione `w` no terminal onde o Expo está rodando.

## Solução de Problemas Comuns

-   **Erro de Cache do Metro Bundler:**
    Se encontrar problemas estranhos, tente limpar o cache do Metro Bundler:
    ```bash
    npx expo start --clear
    ```

-   **Problemas com `node_modules` ou `package-lock.json`:**
    Se suspeitar de problemas com as dependências, você pode tentar remover a pasta `node_modules` e o arquivo `package-lock.json` (ou `yarn.lock` se estiver usando Yarn) e reinstalar:
    ```bash
    rm -rf node_modules package-lock.json 
npm install
    ```

-   **Verifique a Versão do Expo CLI:**
    Certifique-se de que sua `expo-cli` está atualizada:
    ```bash
    npm install -g expo-cli
    ```

## Estrutura do Projeto (Visão Geral)

-   `/src`: Contém todo o código-fonte principal do aplicativo.
    -   `/assets`: Fontes, imagens e outros ativos estáticos.
    -   `/components`: Componentes reutilizáveis da UI.
    -   `/contexts`: Contextos React para gerenciamento de estado global (ex: PlayerContext).
    -   `/data`: Arquivos JSON com dados mock/estáticos (meditações, eventos).
    -   `/navigation`: Configuração da navegação (React Navigation).
    -   `/screens`: Componentes de tela principais do aplicativo.
    -   `/services`: Lógica para interagir com APIs externas (ex: APOD, tradução).
    -   `/styles`: Estilos globais ou temas (se aplicável).
    -   `/utils`: Funções utilitárias.
-   `App.tsx`: Ponto de entrada principal do aplicativo.
-   `package.json`: Lista as dependências do projeto e scripts.
-   `tsconfig.json`: Configurações do compilador TypeScript.

Se precisar de mais assistência, não hesite em perguntar!

