# App Motorista - Sistema de Entregas

Aplicação React PWA (Progressive Web App) para gerenciar entregas e rotas de motoristas com suporte offline, GPS, câmera e assinatura digital.

## 🚀 Características

- ✅ **Autenticação** - Login com CPF e senha
- ✅ **Dashboard** - Resumo de entregas do dia
- ✅ **Lista de Entregas** - Visualizar e filtrar entregas
- ✅ **Detalhes da Entrega** - Informações completas de cada entrega
- ✅ **GPS** - Rastreamento em tempo real
- ✅ **Câmera** - Captura de fotos de entrega
- ✅ **Assinatura Digital** - Coleta de assinatura do cliente
- ✅ **WhatsApp** - Envio de notificações (integração)
- ✅ **Offline** - Funciona sem conexão com sincronização automática
- ✅ **PWA** - Instalável como app nativo
- ✅ **Responsivo** - Funciona em desktop e mobile

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Backend FastAPI rodando em `http://localhost:8000`

## 🛠️ Instalação

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd app-motorista
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Loading.tsx
│   └── Toast.tsx
├── contexts/           # Contextos React
│   ├── AuthContext.tsx
│   └── EntregasContext.tsx
├── hooks/              # Custom hooks
│   ├── usePWA.ts
│   └── useComposition.ts
├── pages/              # Páginas da aplicação
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── EntregasList.tsx
│   ├── EntregaDetails.tsx
│   ├── ConfirmacaoEntrega.tsx
│   └── Historico.tsx
├── services/           # Serviços
│   ├── api.ts          # Cliente HTTP
│   ├── gps.ts          # Geolocalização
│   └── storage.ts      # IndexedDB
├── types/              # Tipos TypeScript
│   ├── auth.ts
│   ├── entrega.ts
│   └── api.ts
├── utils/              # Utilitários
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx             # Roteamento
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## 🔌 API Endpoints

A aplicação espera os seguintes endpoints do backend:

### Autenticação

- `POST /api/login` - Fazer login
- `GET /api/motoristas/me` - Obter dados do motorista

### Dashboard

- `GET /api/dashboard/motorista` - Dados do dashboard

### Entregas

- `GET /api/entregas/rota/:rotaId` - Listar entregas da rota
- `GET /api/entregas/:id` - Obter detalhes da entrega
- `PUT /api/entregas/:id/status` - Atualizar status
- `POST /api/entregas/:id/confirmar` - Confirmar entrega com foto e assinatura

### WhatsApp (Opcional)

- `POST /api/whatsapp/send` - Enviar mensagem WhatsApp

## 🗂️ Tipos de Dados

### Motorista

```typescript
interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email?: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
}
```

### Entrega

```typescript
interface Entrega {
  id: string;
  rotaId: string;
  pedidoId: string;
  status: 'pendente' | 'em_rota' | 'entregue' | 'falha';
  endereco: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  fotoConfirmacao?: string;
  assinatura?: string;
  tentativas: number;
}
```

## 🔐 Autenticação

A autenticação é feita via token JWT armazenado em `localStorage`:

1. Usuário faz login com CPF e senha
2. Backend retorna token JWT
3. Token é armazenado em `localStorage` como `auth_token`
4. Token é incluído em todas as requisições via header `Authorization: Bearer <token>`

## 📱 Funcionalidades PWA

### Instalação

A aplicação pode ser instalada como app nativo:

1. **Desktop**: Clique no ícone de instalação na barra de endereço
2. **Mobile**: Use "Adicionar à tela inicial" no menu do navegador

### Offline

- Dados são sincronizados via IndexedDB
- Requisições offline são enfileiradas
- Sincronização automática quando conexão é restaurada

### Service Worker

- Caching de assets estáticos
- Network-first para APIs
- Background sync para dados pendentes

## 🎨 Temas e Cores

A aplicação usa Tailwind CSS com as seguintes cores principais:

- **Primary**: `#2563eb` (Azul)
- **Success**: `#16a34a` (Verde)
- **Warning**: `#ea580c` (Laranja)
- **Danger**: `#dc2626` (Vermelho)

## 📊 Fluxo de Entregas

1. **Pendente** - Entrega aguardando motorista
2. **Em Andamento** - Motorista saiu para entrega
3. **Entregue** - Entrega confirmada com foto e assinatura
4. **Falha** - Entrega não foi realizada

## 🏗️ Build

```bash
# Build para produção
pnpm build

# Preview do build
pnpm preview
```

## 📦 Deploy

A aplicação pode ser deployada em qualquer servidor web estático:

```bash
# Build
pnpm build

# Fazer upload da pasta 'dist' para seu servidor
```

### Configurações Necessárias

1. **CORS**: Backend deve permitir requisições do domínio da aplicação
2. **HTTPS**: PWA requer HTTPS em produção
3. **Certificado SSL**: Necessário para PWA
4. **Headers**: Configurar headers de cache apropriados

## 🔧 Variáveis de Ambiente

```env
# API
VITE_API_URL=http://localhost:8000/api

# PWA
VITE_APP_TITLE=App Motorista
VITE_APP_DESCRIPTION=Sistema de Entregas

# Analytics (opcional)
VITE_ANALYTICS_ID=
```

## 🐛 Troubleshooting

### Service Worker não registra

- Verifique se a aplicação está em HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique o console para erros

### GPS não funciona

- Verifique permissões do navegador
- Use HTTPS em produção
- Teste em um dispositivo com GPS

### Offline não funciona

- Verifique suporte a IndexedDB
- Limpe dados do site nos settings
- Teste em modo privado

## 📝 Licença

Proprietary - Sistema de Logística

## 👥 Suporte

Para suporte, entre em contato com o time de desenvolvimento.

## 🚀 Roadmap

- [ ] Integração com Google Maps
- [ ] Notificações push
- [ ] Relatórios avançados
- [ ] Integração com sistemas de pagamento
- [ ] Suporte a múltiplos idiomas
- [ ] Dark mode
- [ ] Sincronização em tempo real com WebSocket

## 📚 Recursos Úteis

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Wouter Router](https://github.com/molefrog/wouter)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
