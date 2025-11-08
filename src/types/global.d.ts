interface ToastInterface {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

declare global {
  interface Window {
    toast?: ToastInterface;
  }
}

export {};