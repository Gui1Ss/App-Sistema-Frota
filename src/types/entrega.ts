export interface Entrega {
  id: string;
  routeid: string;
  ordernumber: string;
  clientname: string;
  driver_name: string;
  vehicle_anem?: string;
  status: 'pendente' | 'em_andamento' | 'em_rota' | 'entregue' | 'falha';
  address?: string;
  address_number?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  // campos alternativos/alias em português (opcionais)
  endereco?: string;
  numero?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  tentativas?: number;
  criadoEm?: string;
  criado_at?: string;
  criadoAt?: string;
  criadoEm_iso?: string;
  createdat?: string;
  atualizadoEm?: string;
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
