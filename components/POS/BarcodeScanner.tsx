"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Camera, 
  CameraOff, 
  Scan, 
  X, 
  Loader2,
  Keyboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@prisma/client';

interface BarcodeScannerProps {
  products: Product[];
  onProductScanned: (product: Product) => void;
  className?: string;
}

export interface BarcodeScannerRef {
  focusInput: () => void;
}

const BarcodeScanner = forwardRef<BarcodeScannerRef, BarcodeScannerProps>(({
  products,
  onProductScanned,
  className = ""
}, ref) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<any>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 800;

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }));

  // Initialize ZXing code reader
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
        setCameraError('Camera scanning not supported on this device');
      }
    };

    initializeScanner();

    return () => {
      // The reset logic is handled by the stopCameraScanning function,
      // which is called in the main unmount effect.
      // This prevents calling reset() on a non-active reader.
    };
  }, []);

  // Handle manual barcode input
  const handleManualScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processBarcode(barcodeInput.trim());
    }
  };

  // Sanitize and normalize barcode input
  const sanitizeBarcode = (input: string) => {
    // Remove control chars (incl. GS1 separators), zero-width chars, and trim
    return input
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
  };

  const digitsOnly = (input: string) => input.replace(/\D/g, '');

  const extractGtin = (raw: string) => {
    const s = sanitizeBarcode(raw);
    const m = s.match(/\(?01\)?[^\d]*(\d{14})/);
    if (m && m[1]) return m[1];
    return '';
  };

  const generateBarcodeVariants = (raw: string) => {
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
    // UPC-A (12) <-> EAN-13 (leading 0)
    if (code.length === 12) variants.add('0' + code);
    if (code.length === 13 && code.startsWith('0')) variants.add(code.slice(1));
    if (digits.length === 12) variants.add('0' + digits);
    if (digits.length === 13 && digits.startsWith('0')) variants.add(digits.slice(1));
    return variants;
  };

  // Process scanned barcode
  const processBarcode = (code: string) => {
    const variants = generateBarcodeVariants(code);
    if (variants.size === 0) {
      toast.error('Please scan or enter a barcode');
      return;
    }
    const normalizedFirst = Array.from(variants)[0] || '';
    const now = Date.now();
    if (
      lastScannedCodeRef.current === normalizedFirst &&
      now - lastScanTimeRef.current < SCAN_COOLDOWN_MS
    ) {
      return;
    }
    const scannedProduct = products.find(p => {
      const productCode = sanitizeBarcode(p.productCode || '');
      if (!productCode) return false;
      if (variants.has(productCode)) return true;
      const productDigits = digitsOnly(productCode);
      return productDigits ? variants.has(productDigits) : false;
    });
    
    if (scannedProduct) {
      lastScannedCodeRef.current = normalizedFirst;
      lastScanTimeRef.current = now;
      if (scannedProduct.stockQty <= 0) {
        toast.error(`${scannedProduct.name} is out of stock`);
      } else {
        onProductScanned(scannedProduct);
        toast.success(`Added ${scannedProduct.name} to cart`);
        setBarcodeInput('');
        
        // If camera is open, keep it open for continuous scanning
        if (!isCameraOpen) {
          // Focus back to input for continuous manual scanning
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    } else {
      const shown = Array.from(variants)[0] || '';
      toast.error(`Product not found for barcode: ${shown}`);
      setBarcodeInput('');
    }
  };

  // Start camera scanning
  const startCameraScanning = async () => {
    if (!codeReaderRef.current) {
      toast.error('Camera scanning not available');
      return;
    }

    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Request camera permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Start scanning
        codeReaderRef.current.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result: any, error: any) => {
            if (result) {
              processBarcode(result.getText());
            }
            // Ignore errors for continuous scanning
          }
        );
        
        setIsCameraOpen(true);
        setScanMode('camera');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      toast.error('Camera access denied or not available');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera scanning
  const stopCameraScanning = () => {
    if (codeReaderRef.current && isCameraOpen) {
      codeReaderRef.current.reset();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
    setScanMode('manual');
    setCameraError(null);
    
    // Focus back to manual input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Switch between manual and camera modes
  const toggleScanMode = () => {
    if (isCameraOpen) {
      stopCameraScanning();
    } else {
      startCameraScanning();
    }
  };

  // Focus on manual input when component mounts
  useEffect(() => {
    if (scanMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraScanning();
    };
  }, []);

  return (
    <div className={`barcode-scanner ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (isCameraOpen) stopCameraScanning();
                setScanMode('manual');
              }}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleScanMode}
              disabled={isLoading || !!cameraError}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isCameraOpen ? (
                <CameraOff className="h-4 w-4 mr-2" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Starting...' : isCameraOpen ? 'Stop Camera' : 'Camera'}
            </Button>
          </div>

          {/* Manual Input Mode */}
          {scanMode === 'manual' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Scan or Enter Barcode
              </label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Scan barcode or type product code..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleManualScan}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={() => processBarcode(barcodeInput.trim())}
                  disabled={!barcodeInput.trim()}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Press Enter or click Add after scanning/typing
              </p>
            </div>
          )}

          {/* Camera Scanning Mode */}
          {scanMode === 'camera' && (
            <div className="space-y-2">
              {cameraError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScanMode('manual')}
                    className="mt-2"
                  >
                    Switch to Manual Input
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {isCameraOpen && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning overlay */}
                      <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-center text-white text-sm bg-black bg-opacity-50 rounded p-1">
                        Point camera at barcode to scan
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Manual Mode:</strong> Use barcode scanner or type product code</p>
            <p><strong>Camera Mode:</strong> Point camera at barcode for automatic scanning</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BarcodeScanner.displayName = 'BarcodeScanner';

export default BarcodeScanner; 