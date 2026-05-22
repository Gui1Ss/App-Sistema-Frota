import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'wouter';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { useEntregas } from '../contexts/EntregasContext';
import { useToast } from '../components/Toast';
import { gpsService } from '../services/gps';
import type { GPSPosition } from '../services/gps';

export const ConfirmacaoEntrega: React.FC = () => {
  const [, navigate] = useRouter() as any;
  

  const { entregaSelecionada, confirmarEntrega } = useEntregas();
  const { show: showToast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [assinatura, setAssinatura] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<GPSPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGPSLoading, setIsGPSLoading] = useState(false);

  // Inicializa GPS
  useEffect(() => {
    setIsGPSLoading(true);
    gpsService.startTracking(
      (position) => {
        setGpsPosition(position);
        setIsGPSLoading(false);
      },
      (error) => {
        showToast(`Erro de GPS: ${error.message}`, 'warning');
        setIsGPSLoading(false);
      }
    );

    return () => {
      gpsService.stopTracking();
    };
  }, []);

  // Inicializa canvas para assinatura
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  // Captura foto da câmera
  const handleCapturePhoto = async () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);

      // Cria preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Desenha assinatura
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);

    // Salva assinatura como base64
    const canvas = canvasRef.current;
    if (canvas) {
      setAssinatura(canvas.toDataURL('image/png'));
    }
  };

  const handleLimparAssinatura = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setAssinatura('');
      }
    }
  };

  const handleConfirmar = async () => {
    if (!foto) {
      showToast('Foto é obrigatória', 'warning');
      return;
    }

    if (!assinatura) {
      showToast('Assinatura é obrigatória', 'warning');
      return;
    }

    if (!gpsPosition) {
      showToast('GPS não disponível', 'warning');
      return;
    }

    if (!entregaSelecionada) {
      showToast('Entrega não selecionada', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await confirmarEntrega({
        entregaId: entregaSelecionada.id,
        foto,
        assinatura,
        latitude: gpsPosition.latitude,
        longitude: gpsPosition.longitude,
      });

      showToast('Entrega confirmada com sucesso!', 'success');
      navigate('/entregas');
    } catch (error: any) {
      showToast(error.message || 'Erro ao confirmar entrega', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!entregaSelecionada) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-danger mb-4">Entrega não selecionada</p>
          <Button onClick={() => navigate('/entregas')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Confirmar Entrega"
        subtitle={entregaSelecionada.endereco}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Foto */}
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">📸 Foto da Entrega</h3>

          {fotoPreview ? (
            <div className="mb-4">
              <img
                src={fotoPreview}
                alt="Foto da entrega"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                className="mt-2"
                onClick={() => {
                  setFoto(null);
                  setFotoPreview('');
                }}
              >
                Tirar Outra Foto
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCapturePhoto}
              >
                📷 Tirar Foto
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelected}
                className="hidden"
              />
            </>
          )}
        </Card>

        {/* Assinatura */}
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">✍️ Assinatura</h3>

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full bg-white cursor-crosshair"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleLimparAssinatura}
          >
            Limpar Assinatura
          </Button>
        </Card>

        {/* GPS */}
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">📍 Localização</h3>

          {isGPSLoading ? (
            <div className="text-center py-4">
              <Loading message="Obtendo localização..." />
            </div>
          ) : gpsPosition ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Latitude</p>
                <p className="text-gray-900 font-mono">{gpsPosition.latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Longitude</p>
                <p className="text-gray-900 font-mono">{gpsPosition.longitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precisão</p>
                <p className="text-gray-900">{gpsPosition.accuracy.toFixed(2)}m</p>
              </div>
            </div>
          ) : (
            <p className="text-warning">GPS não disponível</p>
          )}
        </Card>

        {/* Ações */}
        <Card>
          <div className="space-y-3">
            <Button
              variant="success"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onClick={handleConfirmar}
            >
              ✓ Confirmar Entrega
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/entregas')}
            >
              ← Cancelar
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
