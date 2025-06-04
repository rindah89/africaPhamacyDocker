import { useState, useRef, useEffect, useCallback } from 'react';
import { Product } from '@prisma/client';
import toast from 'react-hot-toast';

interface UseBarcodeScanner {
  products: Product[];
  onProductFound: (product: Product) => void;
  enableSound?: boolean;
}

interface BarcodeScannerState {
  isScanning: boolean;
  error: string | null;
  lastScannedCode: string | null;
  scanCount: number;
}

export const useBarcodeScanner = ({ 
  products, 
  onProductFound, 
  enableSound = true 
}: UseBarcodeScanner) => {
  const [state, setState] = useState<BarcodeScannerState>({
    isScanning: false,
    error: null,
    lastScannedCode: null,
    scanCount: 0
  });

  const codeReaderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize ZXing library
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        codeReaderRef.current = new BrowserMultiFormatReader();
      } catch (error) {
        console.error('Failed to initialize barcode scanner:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Barcode scanning not supported on this device' 
        }));
      }
    };

    initializeScanner();

    // Initialize audio context for scan sounds
    if (enableSound && typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Audio context not supported');
      }
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enableSound]);

  // Play scan sound
  const playSound = useCallback((frequency: number = 800, duration: number = 200) => {
    if (!enableSound || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.log('Sound playback failed');
    }
  }, [enableSound]);

  // Process scanned barcode
  const processBarcode = useCallback((code: string) => {
    if (!code || code === state.lastScannedCode) return;

    const product = products.find(p => p.productCode === code);
    
    setState(prev => ({
      ...prev,
      lastScannedCode: code,
      scanCount: prev.scanCount + 1
    }));

    if (product) {
      if (product.stockQty <= 0) {
        toast.error(`${product.name} is out of stock`);
        playSound(400, 500); // Lower pitch for error
      } else {
        onProductFound(product);
        toast.success(`Added ${product.name}`);
        playSound(800, 200); // Higher pitch for success
      }
    } else {
      toast.error(`Product not found: ${code}`);
      playSound(400, 500); // Lower pitch for error
    }
  }, [products, onProductFound, playSound, state.lastScannedCode]);

  // Start camera scanning
  const startScanning = useCallback(async (videoElement?: HTMLVideoElement) => {
    if (!codeReaderRef.current) {
      setState(prev => ({ 
        ...prev, 
        error: 'Scanner not initialized' 
      }));
      return false;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isScanning: true, 
        error: null 
      }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      const video = videoElement || videoRef.current;

      if (video) {
        video.srcObject = stream;
        await video.play();

        // Start continuous scanning
        codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          video,
          (result: any, error: any) => {
            if (result) {
              processBarcode(result.getText());
            }
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to start camera:', error);
      setState(prev => ({ 
        ...prev, 
        isScanning: false, 
        error: 'Failed to access camera. Please check permissions.' 
      }));
      return false;
    }
  }, [processBarcode]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({ 
      ...prev, 
      isScanning: false, 
      error: null,
      lastScannedCode: null
    }));
  }, []);

  // Manual barcode processing
  const scanManual = useCallback((code: string) => {
    processBarcode(code.trim());
  }, [processBarcode]);

  // Check if camera is available
  const checkCameraAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }, []);

  return {
    // State
    isScanning: state.isScanning,
    error: state.error,
    scanCount: state.scanCount,
    
    // Methods
    startScanning,
    stopScanning,
    scanManual,
    checkCameraAvailability,
    
    // Refs for external use
    videoRef,
    
    // Utils
    isReady: !!codeReaderRef.current
  };
}; 