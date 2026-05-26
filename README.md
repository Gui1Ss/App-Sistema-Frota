# Sistema Frota - App React Native

Aplicação React Native (Expo) para gerenciamento de entregas e rotas de motoristas.

## Tecnologias

- **React Native** com **Expo** (SDK 56)
- **TypeScript**
- **React Navigation** (navegação nativa)
- **AsyncStorage** (persistência local)
- **expo-location** (GPS)
- **expo-image-picker** (câmera e galeria)
- **react-native-signature-canvas** (assinatura do destinatário)
- **react-native-safe-area-context** (safe area)

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx       # Botão com variantes (primary, secondary, success, danger)
│   ├── Card.tsx         # Card com suporte a clique
│   ├── Header.tsx       # Cabeçalho com info do motorista
│   ├── Input.tsx        # Campo de entrada com label e erro
│   ├── Loading.tsx      # Indicador de carregamento
│   └── StatusBadge.tsx  # Badge de status da entrega
├── contexts/            # Contextos React
│   ├── AuthContext.tsx  # Autenticação e dados do motorista
│   ├── EntregasContext.tsx  # Estado das entregas
│   └── ToastContext.tsx # Notificações toast globais
├── hooks/               # Custom hooks
│   └── useToast.ts
├── navigation/          # Configuração de navegação
│   ├── AppNavigator.tsx # Navegador principal
│   └── types.ts         # Tipos das rotas
├── screens/             # Telas da aplicação
│   ├── LoginScreen.tsx          # Login com CPF e senha
│   ├── DashboardScreen.tsx      # Dashboard com estatísticas
│   ├── EntregasListScreen.tsx   # Lista de entregas com filtros
│   ├── EntregaDetailsScreen.tsx # Detalhes e ações da entrega
│   ├── ConfirmacaoEntregaScreen.tsx  # Foto + assinatura + GPS
│   ├── HistoricoScreen.tsx      # Histórico por data
│   └── LoadingScreen.tsx        # Tela de carregamento
├── services/            # Serviços
│   └── api.ts           # Cliente HTTP com AsyncStorage
├── types/               # Tipos TypeScript
│   ├── auth.ts
│   └── entrega.ts
└── utils/               # Utilitários
    ├── constants.ts     # Constantes (API_URL, cores, status)
    └── formatters.ts    # Formatadores de data, CPF, etc.
```

## API Endpoints

Backend em `http://192.168.1.178:8000`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/drivers/login` | Login do motorista |
| `GET` | `/drivers` | Dados do dashboard |
| `GET` | `/entregas/rota/:rotaId` | Listar entregas da rota |
| `GET` | `/entregas/:id` | Detalhes da entrega |
| `PUT` | `/entregas/:id/status` | Atualizar status |
| `POST` | `/entregas/:id/confirmar` | Confirmar com foto e assinatura |
| `GET` | `/entregas?status=entregue&data=YYYY-MM-DD` | Histórico |

## Como Executar

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go no celular (Android/iOS) **ou** emulador

### Instalação

```bash
cd SistemaFrotaApp
npm install
```

### Executar

```bash
# Iniciar o servidor de desenvolvimento
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

Escaneie o QR Code com o aplicativo **Expo Go** no celular.

> **Importante:** O celular e o computador devem estar na **mesma rede Wi-Fi** para acessar o backend em `192.168.1.178`.

## Build para Produção (APK Android)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar o projeto
eas build:configure

# Build APK
eas build --platform android --profile preview
```

## Funcionalidades

- **Login** com CPF e senha (hash)
- **Dashboard** com estatísticas de entregas e dados do motorista
- **Lista de Entregas** com filtros por status e busca por endereço
- **Detalhes da Entrega** com endereço completo e ações
- **Confirmação de Entrega** com:
  - Foto via câmera ou galeria
  - Assinatura digital do destinatário
  - Localização GPS automática
- **Histórico** de entregas por data com navegação por dia
- **Persistência local** com AsyncStorage (token e dados do motorista)
- **Pull-to-refresh** nas telas de lista
- **Notificações Toast** para feedback ao usuário
