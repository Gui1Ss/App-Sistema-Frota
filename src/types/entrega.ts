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
  foto: File;
  assinatura: string; // Base64
  latitude: number;
  longitude: number;
  observacoes?: string;
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
