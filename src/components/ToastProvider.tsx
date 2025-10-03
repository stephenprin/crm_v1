import React, { createContext, useContext } from "react";
import { Toaster, toast } from "sonner"; //

interface ToastContextType {
  showToast: (props: { title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const showToast = ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => {
    toast(title, { description });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster richColors position="top-right" />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
