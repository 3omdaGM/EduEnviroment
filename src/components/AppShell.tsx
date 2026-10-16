import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ChevronDown, GraduationCap, Landmark, LogIn, Menu } from 'lucide-react';
import { environmentName } from '../data/catalog';
import { Button, Drawer } from './ui';

const navigation = [
  { to: '/', label: 'الرئيسية' }, { to: '/goals', label: 'أهداف البيئة' },
  { to: '/guide', label: 'دليل المتدرب' }, { to: '/content', label: 'المحتوى التعليمي' },
  { to: '/contact', label: 'اتصل بنا' },
];

function NavigationLink({ item, onNavigate, className = '' }: { item: { to: string; label: string }; onNavigate?: () => void; className?: string }) {
  const { pathname } = useLocation();
  const active = item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`) || (item.to === '/content' && pathname.startsWith('/modules/'));
  return <Link to={item.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`${className} ${active ? 'active' : ''}`}>{item.label}</Link>;
}

export function BrandHeader() {
  return <div className="brand-header container">
    <div className="brand-placeholder" aria-label="موضع شعار جامعة الزقازيق"><span className="brand-mark"><Landmark size={27} aria-hidden="true" /></span><span>موضع شعار<br /><b>الجامعة</b></span></div>
    <div className="brand-title"><p>جامعة الزقازيق <span>•</span> كلية التربية النوعية</p><Link to="/" className="environment-name">{environmentName}</Link></div>
    <div className="brand-placeholder" aria-label="موضع شعار الكلية أو القسم"><span className="brand-mark faculty-mark"><GraduationCap size={29} aria-hidden="true" /></span><span>موضع شعار<br /><b>الكلية / القسم</b></span></div>
  </div>;
}

function AssessmentMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  return <li ref={root} className="assessment-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(hover:hover) and (pointer:fine)').matches) setOpen(true); }}
    onPointerLeave={() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }}>
    <button ref={button} className={`nav-link ${pathname.startsWith('/assessment') ? 'active' : ''}`} aria-expanded={open} aria-controls="assessment-navigation" onClick={() => setOpen(!open)}>التقويم <ChevronDown size={14} aria-hidden="true" /></button>
    {open && <ul id="assessment-navigation" className="assessment-dropdown"><li><NavLink to="/assessment/pre/instructions" onClick={() => setOpen(false)}>التقويم القبلي <span>قيد التجهيز</span></NavLink></li><li><NavLink to="/assessment/post/instructions" onClick={() => setOpen(false)}>التقويم البعدي <span>مقفل حتى إكمال المسار</span></NavLink></li></ul>}
  </li>;
}

export function DesktopNav() {
  return <nav className="desktop-nav" aria-label="التنقل الرئيسي"><ul>
    {navigation.slice(0, 3).map(item => <li key={item.to}><NavigationLink item={item} className="nav-link" /></li>)}
    <AssessmentMenu />
    {navigation.slice(3).map(item => <li key={item.to}><NavigationLink item={item} className="nav-link" /></li>)}
  </ul></nav>;
}
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-nav"><Button variant="ghost" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}><Menu size={21} aria-hidden="true" />قائمة التنقل الرئيسية</Button>
    <Drawer open={open} onClose={() => setOpen(false)} title="قائمة التنقل الرئيسية">
      <nav aria-label="التنقل الرئيسي للهاتف" className="drawer-navigation">
        {navigation.slice(0, 3).map(item => <NavigationLink key={item.to} item={item} onNavigate={() => setOpen(false)} />)}
        <div className="drawer-nav-group"><p>التقويم</p><NavLink to="/assessment/pre/instructions" onClick={() => setOpen(false)}>التقويم القبلي <small>قيد التجهيز</small></NavLink><NavLink to="/assessment/post/instructions" onClick={() => setOpen(false)}>التقويم البعدي <small>مقفل</small></NavLink></div>
        {navigation.slice(3).map(item => <NavigationLink key={item.to} item={item} onNavigate={() => setOpen(false)} />)}
      </nav>
    </Drawer>
  </div>;
}

export default function AppShell() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = `${environmentName} | جامعة الزقازيق`;
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">تجاوز إلى المحتوى</a>
    <header className="site-header"><BrandHeader /><div className="navigation-bar"><div className="container navigation-inner"><DesktopNav /><MobileNav /><Link to="/login" className="login-link"><LogIn size={17} aria-hidden="true" /><span>دخول المتدرب</span></Link></div></div></header>
    <main id="main-content" ref={main} tabIndex={-1} className="main-content container"><Suspense fallback={<div role="status" aria-busy="true" className="loading-state">جارٍ تحميل الصفحة…</div>}><div key={pathname} className="page-transition"><Outlet /></div></Suspense></main>
    <footer className="site-footer"><div className="container footer-inner"><p><GraduationCap size={18} aria-hidden="true" />كلية التربية النوعية <span>—</span> جامعة الزقازيق</p><p>معاينة البيئة التدريبية <span>·</span> المحتوى بانتظار الاعتماد</p><Link to="/contact">تواصل مع الباحث</Link></div></footer>
  </div>;
}
