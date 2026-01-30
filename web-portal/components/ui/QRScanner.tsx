import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export const QRScanner = ({ onScan, onError, onClose }: QRScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Success
        onScan(decodedText);
        // Optionally stop scanning or let parent handle it
        // scanner.clear(); 
      },
      (errorMessage) => {
        // Error (scanning in progress, no code found yet)
        // console.log(errorMessage); 
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div id="reader" className="w-full"></div>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
};
