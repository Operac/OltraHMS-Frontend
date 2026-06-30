import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
    /** Prevent closing while an async operation is running */
    loading?: boolean;
}

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg', loading = false }: ModalProps) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose, loading]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={loading ? undefined : onClose}
        >
            <div
                className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} my-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default Modal;
