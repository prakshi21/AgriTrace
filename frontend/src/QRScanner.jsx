import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // create a new scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const successCallback = (decodedText, decodedResult) => {
      // pause scanner or clear it when successful
      scanner.clear();
      
      // If the decoded text is a full URL, extract the batch parameter
      // e.g. http://localhost:5173/?batch=BATCH-001 -> BATCH-001
      let batchId = decodedText;
      try {
        const url = new URL(decodedText);
        if (url.searchParams.has('batch')) {
          batchId = url.searchParams.get('batch');
        }
      } catch (e) {
        // Not a URL, treat as raw batch ID string
      }
      
      onScanSuccess(batchId);
    };

    const errorCallback = (errorMessage) => {
      if (onScanFailure) onScanFailure(errorMessage);
    };

    scanner.render(successCallback, errorCallback);

    // cleanup on unmount
    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full">
      <div id="qr-reader" className="overflow-hidden rounded-xl border-2 border-brand-200"></div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default QRScanner;
