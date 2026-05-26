import { GPS_CONFIG } from '../utils/constants';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface GPSError {
  code: number;
  message: string;
}

class GPSService {
  private watchId: number | null = null;
  private isTracking = false;
  private listeners: Set<(position: GPSPosition) => void> = new Set();
  private errorListeners: Set<(error: GPSError) => void> = new Set();

  /**
   * Inicia rastreamento de GPS
   */
  startTracking(
    onPosition: (position: GPSPosition) => void,
    onError: (error: GPSError) => void
  ): void {
    if (this.isTracking) return;

    if (!navigator.geolocation) {
      onError({
        code: 0,
        message: 'Geolocalização não suportada neste navegador',
      });
      return;
    }

    this.listeners.add(onPosition);
    this.errorListeners.add(onError);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };

        this.listeners.forEach((listener) => listener(gpsPosition));
      },
      (error) => {
        const gpsError: GPSError = {
          code: error.code,
          message: this.getErrorMessage(error.code),
        };

        this.errorListeners.forEach((listener) => listener(gpsError));
      },
      {
        enableHighAccuracy: GPS_CONFIG.ENABLE_HIGH_ACCURACY,
        timeout: GPS_CONFIG.TIMEOUT,
        maximumAge: 0,
      }
    );

    this.isTracking = true;
  }

  /**
   * Para rastreamento de GPS
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    this.listeners.clear();
    this.errorListeners.clear();
  }

  /**
   * Obtém posição atual
   */
  getCurrentPosition(): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocalização não suportada',
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code),
          });
        },
        {
          enableHighAccuracy: GPS_CONFIG.ENABLE_HIGH_ACCURACY,
          timeout: GPS_CONFIG.TIMEOUT,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Retorna em metros
  }

  /**
   * Verifica se está rastreando
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Converte graus para radianos
   */
  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  /**
   * Retorna mensagem de erro
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permissão de localização negada';
      case 2:
        return 'Posição não disponível';
      case 3:
        return 'Requisição de localização expirou';
      default:
        return 'Erro desconhecido';
    }
  }
}

export const gpsService = new GPSService();
