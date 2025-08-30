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
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 800;

  // Initialize ZXing library
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        try {
          const { DecodeHintType, BarcodeFormat } = await import('@zxing/library');
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.CODE_128,
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.ITF,
            BarcodeFormat.CODE_39,
            BarcodeFormat.QR_CODE,
          ]);
          hints.set(DecodeHintType.TRY_HARDER, true);
          const reader = new BrowserMultiFormatReader();
          try { (reader as any).hints = hints; } catch (_) {}
          codeReaderRef.current = reader;
        } catch (_) {
          codeReaderRef.current = new BrowserMultiFormatReader();
        }
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

  // Sanitize and normalize barcodes
  const sanitizeBarcode = useCallback((input: string) => {
    return input
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
  }, []);

  const digitsOnly = useCallback((input: string) => input.replace(/\D/g, ''), []);

  const extractGtin = useCallback((raw: string) => {
    const s = sanitizeBarcode(raw);
    const m = s.match(/\(?01\)?[^\d]*(\d{14})/);
    if (m && m[1]) return m[1];
    return '';
  }, [sanitizeBarcode]);

  const generateBarcodeVariants = useCallback((raw: string) => {
    const code = sanitizeBarcode(raw);
    const variants = new Set<string>();
    if (!code) return variants;
    variants.add(code);
    const digits = digitsOnly(code);
    if (digits) variants.add(digits);
    const gtin14 = extractGtin(code);
    if (gtin14) {
      variants.add(gtin14);
      variants.add(digitsOnly(gtin14));
    }
    if (code.length === 12) variants.add('0' + code);
    if (code.length === 13 && code.startsWith('0')) variants.add(code.slice(1));
    if (digits.length === 12) variants.add('0' + digits);
    if (digits.length === 13 && digits.startsWith('0')) variants.add(digits.slice(1));
    return variants;
  }, [sanitizeBarcode, digitsOnly, extractGtin]);

  // Process scanned barcode
  const processBarcode = useCallback((code: string) => {
    const variants = generateBarcodeVariants(code);
    const normalizedFirst = Array.from(variants)[0] || '';
    if (variants.size === 0) return;
    const now = Date.now();
    if (normalizedFirst === state.lastScannedCode && now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) return;

    const product = products.find(p => {
      const pc = sanitizeBarcode(p.productCode || '');
      if (!pc) return false;
      if (variants.has(pc)) return true;
      const pd = digitsOnly(pc);
      return pd ? variants.has(pd) : false;
    });
    
    setState(prev => ({
      ...prev,
      lastScannedCode: normalizedFirst,
      scanCount: prev.scanCount + 1
    }));
    lastScanTimeRef.current = Date.now();

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
      toast.error(`Product not found: ${normalizedFirst}`);
      playSound(400, 500); // Lower pitch for error
    }
  }, [products, onProductFound, playSound, state.lastScannedCode, generateBarcodeVariants, sanitizeBarcode]);

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