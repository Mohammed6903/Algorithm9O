import { createContext, useContext } from "react";
import { Toaster, toast as sonnerToast } from "sonner";

const ToastContext = createContext({ toast: sonnerToast });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ toast: sonnerToast }}>
      <Toaster />
      {children}
    </ToastContext.Provider>
  );
}
