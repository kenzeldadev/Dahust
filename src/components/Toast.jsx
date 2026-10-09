// Toast stack, top-right. Teaches: props + CSS keyframes in modules.
import s from './Toast.module.css';
export default function Toast({ toasts }) { return <div className={s.wrap}>{toasts.map(t => <div key={t.id} className={s.toast}>{t.msg}</div>)}</div> }
