'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Camera, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualId, setManualId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScannerActive = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (['Manager', 'Admin', 'SuperAdmin'].indexOf(data.user.role) === -1) {
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check failed', error);
            }
        };
        checkAuth();

        return () => {
            if (scannerRef.current && isScannerActive.current) {
                scannerRef.current.stop().catch(err => console.warn('Scanner cleanup warning:', err));
            }
        };
    }, [router]);

    const startScanning = async () => {
        setError(null);
        setScanning(true);
        if (isScannerActive.current) return;

        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                (err) => { /* ignore failures */ }
            );
            isScannerActive.current = true;
        } catch (err: any) {
            console.error("Error starting scanner:", err);
            setScanning(false);
            isScannerActive.current = false;
            setError('Failed to start camera. Please ensure you gave permission.');
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScannerActive.current) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.warn("Failed to stop scanner", err);
            }
            isScannerActive.current = false;
        }
        setScanning(false);
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (scannerRef.current && isScannerActive.current) {
            try { await scannerRef.current.pause(); } catch (e) { }
        }
        await verifyTicket(decodedText);
        await stopScanning();
    };

    const verifyTicket = async (qrData: string) => {
        setVerifying(true);
        setError(null);
        try {
            const res = await fetch('/api/ticket/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCodeData: qrData.trim() }),
            });
            const data = await res.json();
            setScanResult(data);
        } catch (err) {
            console.error(err);
            setScanResult({ status: 'Error', message: 'Verification failed' });
        } finally {
            setVerifying(false);
        }
    };

    const handleManualVerify = () => {
        if (!manualId) return;
        verifyTicket(manualId);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Manager Dashboard</h1>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </header>

            <div className="max-w-md mx-auto space-y-6">
                {/* Result Card */}
                {scanResult && (
                    <Card className={`border-2 ${scanResult.status === 'Valid' ? 'border-green-500 bg-green-50' :
                            scanResult.status === 'Already Scanned' ? 'border-yellow-500 bg-yellow-50' :
                                'border-red-500 bg-red-50'
                        }`}>
                        <CardHeader>
                            <CardTitle className={`text-center text-2xl ${scanResult.status === 'Valid' ? 'text-green-700' :
                                    scanResult.status === 'Already Scanned' ? 'text-yellow-700' :
                                        'text-red-700'
                                }`}>
                                {scanResult.status}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="font-medium text-lg">{scanResult.message}</p>
                            {scanResult.user && (
                                <div className="mt-4 text-left bg-white/50 p-3 rounded">
                                    <p><strong>Name:</strong> {scanResult.user.name}</p>
                                    <p><strong>Role:</strong> {scanResult.user.role}</p>
                                    <p><strong>College:</strong> {scanResult.user.college || '-'}</p>
                                    <p className="text-xs text-muted-foreground mt-2">ID: {scanResult.user._id}</p>
                                </div>
                            )}
                            <Button className="mt-4 w-full" onClick={() => { setScanResult(null); setManualId(''); }}>
                                Scan Next
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Scanner Section */}
                {!scanResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Scan QR Code</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden mb-4 min-h-[300px] relative">
                                {!scanning && <div className="absolute inset-0 flex items-center justify-center text-white/50">Camera Off</div>}
                            </div>

                            {!scanning ? (
                                <Button onClick={startScanning} className="w-full">
                                    <Camera className="w-4 h-4 mr-2" /> Start Camera
                                </Button>
                            ) : (
                                <Button variant="destructive" onClick={stopScanning} className="w-full">
                                    Stop Camera
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Manual Entry Section */}
                {!scanResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual Entry</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter QR Data or User ID"
                                    value={manualId}
                                    onChange={e => setManualId(e.target.value)}
                                />
                                <Button onClick={handleManualVerify} disabled={verifying || !manualId}>
                                    {verifying ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
