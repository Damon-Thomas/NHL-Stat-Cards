import { useEffect, useState } from "react";

interface NotificationToastProps {
  message: string;
  type: "error" | "warning" | "success" | "info";
  duration?: number;
  onClose: () => void;
}

export default function NotificationToast({
  message,
  type,
  duration = 5000,
  onClose,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-500 border-red-600 text-white";
      case "warning":
        return "bg-yellow-500 border-yellow-600 text-white";
      case "success":
        return "bg-green-500 border-green-600 text-white";
      case "info":
        return "bg-blue-500 border-blue-600 text-white";
      default:
        return "bg-gray-500 border-gray-600 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return "⚠️";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Modal Content */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4 transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className={`rounded-lg border-2 p-6 shadow-xl ${getTypeStyles()}`}>
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">{getIcon()}</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium break-words leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0 ml-2 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
