export interface Entrega {
  id: string;
  rotaId: string;
  pedidoId: string;
  clienteId: string;
  motorista: string;
  veiculo: string;
  status: 'pendente' | 'em_andamento' | 'entregue' | 'falha';
  endereco: string;
  numero: string;
  complemento?: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  observacoes?: string;
  fotoConfirmacao?: string;
  assinatura?: string;
  tentativas: number;
  dataEntrega?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EntregaDetalhes extends Entrega {
  cliente: {
    nome: string;
    telefone: string;
    email?: string;
  };
  pedido: {
    numero: string;
    valor: number;
    itens: Array<{
      descricao: string;
      quantidade: number;
      valor: number;
    }>;
  };
}

export interface ConfirmacaoEntrega {
  entregaId: string;
  fotoUri: string;      // URI local da foto (React Native)
  assinatura: string;   // Base64 da assinatura
  latitude: number;
  longitude: number;
  observacoes?: string;
}

export interface DashboardData {
  totalEntregas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  rotaAtual: {
    id: string;
    numero: string;
  } | null;
}

export interface EntregasContextType {
  entregas: Entrega[];
  entregaSelecionada: Entrega | null;
  isLoading: boolean;
  error: string | null;
  carregarEntregas: (rotaId: string) => Promise<void>;
  selecionarEntrega: (entrega: Entrega) => void;
  atualizarStatus: (entregaId: string, status: string) => Promise<void>;
  confirmarEntrega: (confirmacao: ConfirmacaoEntrega) => Promise<void>;
}
