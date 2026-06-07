import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle } from 'lucide-react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<string>('qr-reader-' + Date.now());

    useEffect(() => {
        const scanner = new Html5Qrcode(containerRef.current);
        scannerRef.current = scanner;

        scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                scanner.stop().then(() => {
                    onScanSuccess(decodedText);
                }).catch(() => {
                    onScanSuccess(decodedText);
                });
            },
            () => { /* ignore scan failures (no QR found in frame) */ }
        ).catch((err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes('Permission') || message.includes('NotAllowed')) {
                setError('Camera permission denied. Please allow camera access and try again.');
            } else {
                setError('Could not start camera. Make sure no other app is using it.');
            }
        });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="flex flex-col items-center gap-4">
            {error ? (
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 dark:bg-red-500/20">
                        <XCircle size={24} />
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 text-center px-4">{error}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Camera size={14} />
                        <span>Point camera at QR code</span>
                    </div>
                    <div
                        id={containerRef.current}
                        className="w-full rounded-xl overflow-hidden"
                    />
                </div>
            )}
            <button
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
                Back
            </button>
        </div>
    );
}
