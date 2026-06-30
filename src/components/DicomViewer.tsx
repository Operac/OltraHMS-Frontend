import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Sun, Contrast, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface DicomViewerProps {
    urls: string[];
    findings?: string;
    impression?: string;
    patientName?: string;
    testName?: string;
    onClose: () => void;
}

const DicomViewer = ({ urls, findings, impression, patientName, testName, onClose }: DicomViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [windowWidth, setWindowWidth] = useState(400);
    const [windowCenter, setWindowCenter] = useState(40);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const currentUrl = urls[currentIndex] || '';
    const isDicomFile = currentUrl.toLowerCase().endsWith('.dcm') ||
        currentUrl.toLowerCase().includes('/dicom');

    useEffect(() => {
        if (!currentUrl) return;
        setLoading(true);
        setError(null);

        if (isDicomFile) {
            loadDicom(currentUrl);
        } else {
            // Regular image — no dwv needed
            setLoading(false);
        }
    }, [currentUrl]);

    const loadDicom = async (url: string) => {
        try {
            // Dynamically import dwv to avoid blocking non-DICOM users
            const dwv = await import('dwv');
            const { App } = dwv;

            if (appRef.current) {
                appRef.current.abortLoad();
            }

            const app = new App();
            appRef.current = app;

            if (!containerRef.current) return;

            const { ViewConfig: DwvViewConfig, ToolConfig: DwvToolConfig, AppOptions: DwvAppOptions } = dwv;
            const viewConfig = new DwvViewConfig('dwv-container');
            const options = new DwvAppOptions({ '*': [viewConfig] });
            options.tools = {
                Scroll: new DwvToolConfig(),
                ZoomAndPan: new DwvToolConfig(),
                WindowLevel: new DwvToolConfig(),
            };
            app.init(options);

            app.addEventListener('loadend', () => {
                setLoading(false);
                // Get initial window/level from DICOM tags if available
                try {
                    const di = app.getImage('0');
                    if (di) {
                        const ww = di.getMeta?.()?.WindowWidth;
                        const wc = di.getMeta?.()?.WindowCenter;
                        if (ww) setWindowWidth(Number(ww));
                        if (wc) setWindowCenter(Number(wc));
                    }
                } catch { /* ignore */ }
            });

            app.addEventListener('error', () => {
                setError('Failed to load DICOM file. The file may be corrupted or inaccessible.');
                setLoading(false);
            });

            await app.loadURLs([url]);
        } catch (err) {
            setError('DICOM viewer failed to initialize. Try downloading the file instead.');
            setLoading(false);
        }
    };

    const handleZoom = (direction: 'in' | 'out') => {
        if (isDicomFile && appRef.current) {
            try {
                const newScale = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
                appRef.current.zoom(direction === 'in' ? 1.2 : 0.83, { x: 0, y: 0 });
                setZoom(newScale);
            } catch { /* ignore */ }
        } else {
            setZoom(z => direction === 'in' ? Math.min(z * 1.3, 5) : Math.max(z / 1.3, 0.2));
        }
    };

    const handleRotate = () => {
        setRotation(r => (r + 90) % 360);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && currentIndex < urls.length - 1) setCurrentIndex(i => i + 1);
            if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(i => i - 1);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [currentIndex, urls.length, onClose]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{patientName}</p>
                    <p className="text-xs text-gray-400 truncate">{testName} {isDicomFile ? '· DICOM' : '· Image'} · {currentIndex + 1}/{urls.length}</p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 mx-4">
                    <button onClick={() => handleZoom('in')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleZoom('out')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    {!isDicomFile && (
                        <button onClick={handleRotate} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Rotate 90°">
                            <RotateCw className="w-4 h-4" />
                        </button>
                    )}
                    {isDicomFile && (
                        <>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <div className="flex items-center gap-2 text-xs">
                                <Sun className="w-3.5 h-3.5 text-gray-400" />
                                <input type="range" min="1" max="4000" value={windowWidth}
                                    onChange={e => { setWindowWidth(Number(e.target.value)); }}
                                    className="w-20 accent-sky-400" title="Window Width" />
                                <Contrast className="w-3.5 h-3.5 text-gray-400" />
                                <input type="range" min="-1000" max="3000" value={windowCenter}
                                    onChange={e => { setWindowCenter(Number(e.target.value)); }}
                                    className="w-20 accent-sky-400" title="Window Center" />
                            </div>
                        </>
                    )}
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <a href={currentUrl} download className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                    </a>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Close (Esc)">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center min-h-0">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10">
                        <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm">{isDicomFile ? 'Loading DICOM file…' : 'Loading image…'}</p>
                    </div>
                )}

                {error ? (
                    <div className="text-center text-gray-400 p-8">
                        <p className="text-red-400 mb-3">{error}</p>
                        <a href={currentUrl} download className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm">
                            <Download className="w-4 h-4" /> Download file instead
                        </a>
                    </div>
                ) : isDicomFile ? (
                    <div id="dwv-container" ref={containerRef} className="w-full h-full" style={{ visibility: loading ? 'hidden' : 'visible' }} />
                ) : (
                    <img
                        src={currentUrl}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-h-full max-w-full object-contain select-none"
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transition: 'transform 0.2s ease',
                        }}
                        onLoad={() => setLoading(false)}
                        onError={() => { setError('Failed to load image'); setLoading(false); }}
                        draggable={false}
                    />
                )}

                {/* Navigation arrows */}
                {urls.length > 1 && (
                    <>
                        <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                            disabled={currentIndex === 0}
                            className="absolute left-3 p-2.5 bg-black/60 text-white rounded-full hover:bg-black/80 disabled:opacity-20 transition-all">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentIndex(i => Math.min(urls.length - 1, i + 1))}
                            disabled={currentIndex === urls.length - 1}
                            className="absolute right-3 p-2.5 bg-black/60 text-white rounded-full hover:bg-black/80 disabled:opacity-20 transition-all">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Findings & Impression Panel */}
            {(findings || impression) && (
                <div className="bg-gray-900 text-white px-6 py-4 shrink-0 max-h-36 overflow-y-auto border-t border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {findings && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Findings</p>
                                <p className="text-sm text-gray-200 leading-relaxed">{findings}</p>
                            </div>
                        )}
                        {impression && (
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Impression</p>
                                <p className="text-sm text-gray-200 leading-relaxed">{impression}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail Strip */}
            {urls.length > 1 && (
                <div className="flex gap-2 px-4 py-2.5 bg-gray-900 overflow-x-auto shrink-0 border-t border-gray-800">
                    {urls.map((url, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-sky-400 opacity-100' : 'border-gray-700 opacity-60 hover:opacity-90'}`}>
                            {url.toLowerCase().endsWith('.dcm') ? (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-[10px] font-mono">
                                    DCM {i + 1}
                                </div>
                            ) : (
                                <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DicomViewer;
