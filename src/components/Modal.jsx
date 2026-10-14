// Accessible reusable dialog with Escape and focus handling. Teaches: effects + refs.
import { useEffect, useRef } from 'react';
import s from './Modal.module.css';

export default function Modal({ title, onClose, children, labelledBy }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    closeButton.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialog.current) {
        const items = [
          ...dialog.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((item) => item.offsetParent !== null);
        if (!items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div
      className={s.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'modal-title'}
      >
        <header className={s.header}>
          <h2 id={labelledBy || 'modal-title'}>{title}</h2>
          <button
            ref={closeButton}
            type="button"
            className={s.close}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className={s.body}>{children}</div>
      </section>
    </div>
  );
}
