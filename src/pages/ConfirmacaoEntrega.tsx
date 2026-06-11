import React, { useEffect, useState, type SyntheticEvent } from "react";
import { useLocation } from "wouter";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
// import { Loading } from '../components/Loading';
import { useEntregas } from "../contexts/EntregasContext";
// import {
//   BarcodeFormat,
//   BarcodeScanner,
// } from "@capacitor-mlkit/barcode-scanning";
// import { apiService } from '../services/api';
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";
// import { Toast } from "@capacitor/toast";
import { Input } from "../components/Input";
// import { useToast } from '../components/Toast';
// import { gpsService } from '../services/gps';
// import type { GPSPosition } from '../services/gps';

export const ConfirmacaoEntrega: React.FC = () => {
  console.log("MONTADO");
  const [, setLocation] = useLocation();
  const { entregaSelecionada } = useEntregas();
  const [codigoNota, setCodigoNota] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // const [caminhoFoto, setCaminhoFoto] = useState < MediaResult >()

  const handleChangeCodigoNota = (event: any) => {
    console.log(event.target.value);
    setCodigoNota(event.target.value);
  };

  useEffect(() => {
    // const blob = await fetch(photo.webPath).then((r) => r.blob());

    // // continuar upload aqui
    // const formData = new FormData();

    // formData.append("file", blob, `foto.${photo.format}`);

    // const { value: codigoLido } = await Preferences.get({
    //   key: "codigoEntrega",
    // });

    // console.log(codigoLido);

    // const response = await fetch(
    //   `http://192.168.1.178:8001/upload-canhoto/${codigoLido}`,
    //   {
    //     method: "POST",
    //     body: formData,
    //   },
    // );

    // console.log(await response.text());
    // await Toast.show({
    //   text: "Upload realizado com sucesso!",
    // });

    console.log("RETORNOU!");
  }, []);

  // async function abrirCamera() {
  //   try {
  //     const result = await Camera.takePhoto({
  //       quality: 90,
  //       includeMetadata: true,
  //     });

  //     // result.webPath can be set directly as the src of an image element
  //     const ImagePath = result.webPath;
  //     console.log(ImagePath)
  //     // On native: pass result.uri to the Filesystem API to get the full-resolution base64,
  //     // or use result.thumbnail for a lower-resolution base64 preview.
  //     // On Web: result.thumbnail contains the full image base64 encoded.

  //     console.log('Format:', result.metadata?.format);
  //     console.log('Resolution:', result.metadata?.resolution);

  //     setCaminhoFoto(result)
  //   } catch (e) {
  //     const error = e as any;
  //     // error.code contains the structured error code (e.g. 'OS-PLUG-CAMR-0003')
  //     // when thrown by the native layer. See the Errors section for all codes.
  //     const message = error.code ? `[${error.code}] ${error.message}` : error.message;
  //     console.error('takePhoto failed:', message);
  //   }
  // };
  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];

    console.log(file.size / 1024 / 1024, "MB");
    console.log(file.type);

    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const ConfirmarEntrega = () => {};

  const abrirCamera = async () => {
    // const photo = data.data;

    // console.log("FOTO RECUPERADA", photo);

    // const blob = await fetch(photo.webPath).then((r) => r.blob());

    // // continuar upload aqui
    // const formData = new FormData();

    // formData.append("file", blob, `foto.${photo.format}`);

    // const { value: codigoLido } = await Preferences.get({
    //   key: "codigoEntrega",
    // });

    // console.log(codigoLido);

    // const response = await fetch(
    //   `http://192.168.1.178:8001/upload-canhoto/${codigoLido}`,
    //   {
    //     method: "POST",
    //     body: formData,
    //   },
    // );

    // console.log(await response.text());
    // await Toast.show({
    //   text: "Upload realizado com sucesso!",
    // });

    try {
      const permission = await Camera.requestPermissions();

      if (permission.camera !== "granted") {
        alert("Permissão da câmera negada");
        return;
      }

      await Preferences.set({
        key: "entregaAtual",
        value: JSON.stringify({
          pagina: `confirmar/${entregaSelecionada?.id}`,
          pedido: entregaSelecionada?.ordernumber,
          codigoNota: codigoNota,
          fotoPendente: true,
        }),
      });

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      console.log(photo);

      // Carrega entregas da rota atual
      // if () {
      //   await carregarEntregas(response.rotaAtual.id);
      // }
    } catch (error) {
      console.error(error);
      alert("Erro ao abrir scanner");
      console.log("ERRO! DFEBUUG DO CÓDIGO, ERRO NA REQUISIÇÃO " + error);
    }
  };
  //   try {
  //     console.log("ANTES DA FOTO");

  //     const photo = await Camera.getPhoto({
  //       quality: 30,
  //       width: 1024,
  //       height: 1024,
  //       allowEditing: false,
  //       resultType: CameraResultType.Uri,
  //       source: CameraSource.Camera,
  //     });

  //     console.log("DEPOIS DA FOTO");
  //     console.log(photo);
  //     } catch (e) {
  //     console.error(e);
  //     }
  // };
  // const { show: showToast } = useToast();

  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const cameraInputRef = useRef<HTMLInputElement>(null);

  // const [foto, setFoto] = useState<File | null>(null);
  // const [fotoPreview, setFotoPreview] = useState<string>('');
  // const [assinatura, setAssinatura] = useState<string>('');
  // const [isDrawing, setIsDrawing] = useState(false);
  // const [gpsPosition, setGpsPosition] = useState<GPSPosition | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isGPSLoading, setIsGPSLoading] = useState(false);

  // Inicializa GPS
  // useEffect(() => {
  //   setIsGPSLoading(true);
  //   gpsService.startTracking(
  //     (position) => {
  //       setGpsPosition(position);
  //       setIsGPSLoading(false);
  //     },
  //     (error) => {
  //       showToast(`Erro de GPS: ${error.message}`, 'warning');
  //       setIsGPSLoading(false);
  //     }
  //   );

  //   return () => {
  //     gpsService.stopTracking();
  //   };
  // }, [showToast]);

  // Inicializa canvas para assinatura
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (canvas) {
  //     const ctx = canvas.getContext('2d');
  //     if (ctx) {
  //       ctx.fillStyle = '#ffffff';
  //       ctx.fillRect(0, 0, canvas.width, canvas.height);
  //       ctx.strokeStyle = '#000000';
  //       ctx.lineWidth = 2;
  //       ctx.lineCap = 'round';
  //       ctx.lineJoin = 'round';
  //     }
  //   }
  // }, []);

  // Captura foto da câmera
  // const handleCapturePhoto = async () => {
  //   if (cameraInputRef.current) {
  //     cameraInputRef.current.click();
  //   }
  // };

  // const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFoto(file);

  // Cria preview
  // const reader = new FileReader();
  // reader.onload = (event) => {
  //   setFotoPreview(event.target?.result as string);
  // };
  // reader.readAsDataURL(file);
  //   }
  // };

  // Desenha assinatura
  // const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   setIsDrawing(true);
  //   const ctx = canvas.getContext('2d');
  //   if (ctx) {
  //     const rect = canvas.getBoundingClientRect();
  //     ctx.beginPath();
  //     ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  //   }
  // };

  // const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  //   if (!isDrawing) return;

  //   const canvas = canvasRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext('2d');
  //   if (ctx) {
  //     const rect = canvas.getBoundingClientRect();
  //     ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  //     ctx.stroke();
  //   }
  // };

  // const handleMouseUp = () => {
  //   setIsDrawing(false);

  //   // Salva assinatura como base64
  //   const canvas = canvasRef.current;
  //   if (canvas) {
  //     setAssinatura(canvas.toDataURL('image/png'));
  //   }
  // };

  // const handleLimparAssinatura = () => {
  //   const canvas = canvasRef.current;
  //   if (canvas) {
  //     const ctx = canvas.getContext('2d');
  //     if (ctx) {
  //       ctx.fillStyle = '#ffffff';
  //       ctx.fillRect(0, 0, canvas.width, canvas.height);
  //       setAssinatura('');
  //     }
  //   }
  // };

  // const handleConfirmar = async () => {
  //   if (!foto) {
  //     showToast('Foto é obrigatória', 'warning');
  //     return;
  //   }

  //   if (!assinatura) {
  //     showToast('Assinatura é obrigatória', 'warning');
  //     return;
  //   }

  // if (!gpsPosition) {
  //   showToast('GPS não disponível', 'warning');
  //   return;
  // }

  // if (!entregaSelecionada) {
  //   showToast('Entrega não selecionada', 'error');
  //   return;
  // }

  // setIsLoading(true);

  // try {
  //   await confirmarEntrega({
  //     entregaId: entregaSelecionada.id,
  //     foto,
  //     assinatura,
  //     latitude: gpsPosition.latitude,
  //     longitude: gpsPosition.longitude,
  //   });

  //   showToast('Entrega confirmada com sucesso!', 'success');
  //   setLocation('/entregas');
  // } catch (error: any) {
  //   showToast(error.message || 'Erro ao confirmar entrega', 'error');
  // } finally {
  //   setIsLoading(false);
  // }
  // };

  // if (!entregaSelecionada) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <Card>
  //         <p className="text-danger mb-4">Entrega não selecionada</p>
  //         <Button onClick={() => setLocation('/entregas')}>Voltar</Button>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Confirmar Entrega"
        subtitle={entregaSelecionada?.address}
      />

      <main className="max-w-4xl mx-auto flex flex-col justify-between h-[calc(100vh-116px)] px-4 py-8 sm:px-6 lg:px-8">
        {/* Foto */}

        <div className="flex gap-5 mb-6 items-center justify-between grow-2 flex-col">
          <Input
            id="cpf"
            type="number"
            placeholder="Digite o número da nota "
            value={codigoNota}
            onChange={handleChangeCodigoNota}
            className={"border-red-500"}
          />
          {/* Image Preview Window */}
          {previewUrl ? (
            <div style={{ marginTop: "15px" }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: "300px", borderRadius: "8px" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full grow-1">
              <label className="flex flex-col items-center justify-center w-full h-full bg-neutral-secondary-medium border border-dashed rounded-xl border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
                <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  accept="image/*"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {/* <Button variant="primary" size="lg" fullWidth onClick={abrirCamera}>
            📷 Tirar Foto
          </Button> */}
          <Card className="w-full">
            <div className="space-y-3">
              <Button
                variant="success"
                size="lg"
                fullWidth
                onClick={ConfirmarEntrega}
              >
                ✓ Confirmar Entrega
              </Button>

              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setLocation("/entregas")}
              >
                ← Cancelar
              </Button>
            </div>
          </Card>
        </div>
        {/* GPS */}
        {/* <Card className="mb-6">
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
        </Card> */}

        {/* Ações */}
      </main>
    </div>
  );
};
