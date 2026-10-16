import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui';

/** Reflow whole items into reachable pages when the viewport cannot hold them all. */
export default function FitPages({ items, className = '', label }: { items: readonly ReactNode[]; className?: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(items.length || 1);
  const [position, setPosition] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / capacity));
  const current = Math.min(position, pages - 1);
  useEffect(() => {
    let frame = 0, stopped = false;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const dialog = root.current?.closest('dialog');
        const overflow = dialog ? dialog.scrollHeight > dialog.clientHeight + 1 : document.documentElement.scrollHeight > window.innerHeight + 1;
        if (!stopped && root.current && overflow) setCapacity(value => Math.max(1, value - 1));
      });
    };
    const resize = () => { setCapacity(items.length || 1); setPosition(0); check(); };
    const observer = new ResizeObserver(check);
    if (root.current) observer.observe(root.current);
    observer.observe(document.body);
    void document.fonts.ready.then(check);
    window.addEventListener('resize', resize); check();
    return () => { stopped = true; observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [items.length]);
  const move = (next: number) => { setPosition(next); root.current?.focus({ preventScroll: true }); };
  return <div ref={root} className="fit-pages" tabIndex={-1} role="region" aria-label={label}>
    <div className={className}>{items.slice(current * capacity, (current + 1) * capacity)}</div>
    {pages > 1 && <nav className="fit-pagination" aria-label={`صفحات ${label}`}><Button variant="secondary" disabled={current === 0} onClick={() => move(current - 1)}><ArrowRight size={15} aria-hidden="true" />السابق</Button><span role="status">{current + 1} / {pages}</span><Button variant="secondary" disabled={current === pages - 1} onClick={() => move(current + 1)}>التالي<ArrowLeft size={15} aria-hidden="true" /></Button></nav>}
  </div>;
}
