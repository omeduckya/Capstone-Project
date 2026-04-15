import { useEffect } from "react";

export default function Modal({ children, onClose, cardClassName = "modal-card" }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={() => onClose?.()}>
      <div className={cardClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
