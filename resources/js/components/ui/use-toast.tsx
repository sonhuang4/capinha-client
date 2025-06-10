// If you don't have a toast component, you can use this simple implementation
// Create this file: hooks/useToast.ts

import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    // Simple alert for now - you can replace with proper toast component later
    alert(`${options.title}${options.description ? '\n' + options.description : ''}`);
    
    // Or if you want to show in console:
    console.log(`Toast: ${options.title}`, options.description);
  };

  return { toast };
};

// Alternative: Replace toast usage in AdminDashboard with simple alerts
// Just replace:
// toast({ title: "Link Copied!", description: "Short link copied to clipboard" });
// with:
// alert("Link Copied! Short link copied to clipboard");