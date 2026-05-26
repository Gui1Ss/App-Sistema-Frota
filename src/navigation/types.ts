export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  EntregasList: undefined;
  EntregaDetails: { entregaId: string };
  ConfirmacaoEntrega: { entregaId: string };
  Historico: undefined;
};
