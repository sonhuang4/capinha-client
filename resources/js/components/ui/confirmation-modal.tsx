// components/ui/confirmation-modal.tsx
import React from 'react';
import { AlertTriangle, X, Trash2, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    itemName?: string;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger',
    itemName,
    isLoading = false
}) => {
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: Trash2,
                    iconBg: 'bg-red-100 dark:bg-red-900/30',
                    iconColor: 'text-red-600 dark:text-red-400',
                    confirmBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
                    gradientFrom: 'from-red-50',
                    gradientTo: 'to-red-100',
                    darkGradientFrom: 'dark:from-red-950/20',
                    darkGradientTo: 'dark:to-red-900/20'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    confirmBg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600',
                    gradientFrom: 'from-amber-50',
                    gradientTo: 'to-amber-100',
                    darkGradientFrom: 'dark:from-amber-950/20',
                    darkGradientTo: 'dark:to-amber-900/20'
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    iconBg: 'bg-green-100 dark:bg-green-900/30',
                    iconColor: 'text-green-600 dark:text-green-400',
                    confirmBg: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
                    gradientFrom: 'from-green-50',
                    gradientTo: 'to-green-100',
                    darkGradientFrom: 'dark:from-green-950/20',
                    darkGradientTo: 'dark:to-green-900/20'
                };
            default: // info
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
                    gradientFrom: 'from-blue-50',
                    gradientTo: 'to-blue-100',
                    darkGradientFrom: 'dark:from-blue-950/20',
                    darkGradientTo: 'dark:to-blue-900/20'
                };
        }
    };

    const config = getTypeConfig();
    const IconComponent = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl">
                {/* Header with gradient background */}
                <div className={`
                    bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} 
                    ${config.darkGradientFrom} ${config.darkGradientTo}
                    p-6 relative
                `}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Fechar"
                    >
                        {/* <X className="w-4 h-4 text-slate-600 dark:text-slate-400" /> */}
                    </button>

                    {/* Icon and Title */}
                    <div className="flex items-start gap-4">
                        <div className={`
                            ${config.iconBg} 
                            p-3 rounded-full flex-shrink-0
                        `}>
                            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Item highlight if provided */}
                    {itemName && (
                        <div className="mt-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/80 dark:border-slate-700/80">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Item:
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {itemName}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="p-6 bg-white dark:bg-slate-900">
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="min-w-[100px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            {cancelText}
                        </Button>
                        
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`
                                min-w-[100px] text-white border-0 font-semibold
                                ${config.confirmBg}
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-200
                                hover:shadow-lg hover:scale-[1.02]
                                active:scale-[0.98]
                            `}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processando...</span>
                                </div>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>

                    {/* Warning note for dangerous actions */}
                    {type === 'danger' && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                            <p className="text-xs text-red-700 dark:text-red-300 text-center">
                                ⚠️ Esta ação não pode ser desfeita
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};