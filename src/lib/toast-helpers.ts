import { toast as sonnerToast } from "sonner";

const createToast = (
  type: "success" | "error" | "info" | "warning",
  message: string,
) => {
  const configs = {
    success: {
      bg: "linear-gradient(135deg, #00a63e 0%, #008a33 100%)",
    },
    error: {
      bg: "linear-gradient(135deg, #d4183d 0%, #b01530 100%)",
    },
    info: {
      bg: "linear-gradient(135deg, #1964e5 0%, #1450c2 100%)",
    },
    warning: {
      bg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    },
  };

  const config = configs[type];

  const toastFn =
    type === "success"
      ? sonnerToast.success
      : type === "error"
        ? sonnerToast.error
        : type === "warning"
          ? sonnerToast.warning
          : sonnerToast.info;

  toastFn(message, {
    style: {
      background: config.bg,
      color: "#ffffff",
      border: "none",
      borderRadius: "12px",
      padding: "16px 20px",
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "1.5",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)",
      minWidth: "320px",
      maxWidth: "500px",
    },
    className: "custom-toast",
    duration: 4000,
  });
};

export const toast = {
  success: (message: string) => {
    createToast("success", message);
  },
  error: (message: string) => {
    createToast("error", message);
  },
  info: (message: string) => {
    createToast("info", message);
  },
  warning: (message: string) => {
    createToast("warning", message);
  },
};
