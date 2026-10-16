import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { ChevronDown, LogIn, Menu } from 'lucide-react';
import { environmentName } from '../data/catalog';
import { brandLogos } from '../data/branding';
import { Button, Drawer } from './ui';
import { useTraining } from '../state/training-context';
import { assessmentAccess } from '../domain/training';
import { demoToolsEnabled } from '../demo/flags';

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
    <div className="brand-logo-slot"><img className="brand-logo" src={brandLogos.university.src} alt={brandLogos.university.alt} width={brandLogos.university.width} height={brandLogos.university.height} decoding="async" /></div>
    <div className="brand-title"><Link to="/" className="environment-name">{environmentName}</Link></div>
    <div className="brand-logo-slot"><img className="brand-logo" src={brandLogos.faculty.src} alt={brandLogos.faculty.alt} width={brandLogos.faculty.width} height={brandLogos.faculty.height} decoding="async" /></div>
  </div>;
}

function AssessmentMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { catalog, snapshot } = useTraining();
  const preLabel = snapshot.data?.learner.active ? 'متاح' : 'يحتاج تجربة دخول';
  const postLabel = snapshot.data && assessmentAccess(snapshot.data, catalog, 'post').allowed ? 'متاح' : 'مقفل حتى إكمال المسار';
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
    {open && <ul id="assessment-navigation" className="assessment-dropdown"><li><NavLink to="/assessment/pre/instructions" onClick={() => setOpen(false)}>التقويم القبلي <span>{preLabel}</span></NavLink></li><li><NavLink to="/assessment/post/instructions" onClick={() => setOpen(false)}>التقويم البعدي <span>{postLabel}</span></NavLink></li></ul>}
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
  const { catalog, snapshot } = useTraining();
  const preLabel = snapshot.data?.learner.active ? 'متاح' : 'يحتاج تجربة دخول';
  const postLabel = snapshot.data && assessmentAccess(snapshot.data, catalog, 'post').allowed ? 'متاح' : 'مقفل حتى إكمال المسار';
  return <div className="mobile-nav"><Button variant="ghost" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}><Menu size={21} aria-hidden="true" /><span className="sr-only">قائمة التنقل الرئيسية</span></Button>
    <Drawer open={open} onClose={() => setOpen(false)} title="قائمة التنقل الرئيسية">
      <nav aria-label="التنقل الرئيسي للهاتف" className="drawer-navigation">
        {navigation.slice(0, 3).map(item => <NavigationLink key={item.to} item={item} onNavigate={() => setOpen(false)} />)}
        <div className="drawer-nav-group"><p>التقويم</p><NavLink to="/assessment/pre/instructions" onClick={() => setOpen(false)}>التقويم القبلي <small>{preLabel}</small></NavLink><NavLink to="/assessment/post/instructions" onClick={() => setOpen(false)}>التقويم البعدي <small>{postLabel}</small></NavLink></div>
        {navigation.slice(3).map(item => <NavigationLink key={item.to} item={item} onNavigate={() => setOpen(false)} />)}
      </nav>
    </Drawer>
  </div>;
}

function SessionControl() {
  const { adapter, snapshot } = useTraining();
  const navigate = useNavigate();
  const [sessionError, setSessionError] = useState('');
  return <div className="footer-session"><div className="session-control">{snapshot.data?.learner.active ? <><span className="session-name">{snapshot.data.learner.name}</span><button className="login-link" onClick={async () => { const r = await adapter.execute({ type: 'logout' }); if (r.ok) navigate('/login'); else setSessionError(r.error); }}>خروج تجريبي</button></> : <Link to="/login" className="login-link"><LogIn size={17} aria-hidden="true" /><span>دخول المتدرب</span></Link>}</div>{sessionError && <p role="alert">{sessionError}</p>}</div>;
}

export default function AppShell() {
  const { pathname } = useLocation();
  const goalsPage = pathname === '/goals' || pathname.startsWith('/goals/');
  const compactPage = pathname === '/' || goalsPage;
  const { snapshot } = useTraining();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = `${environmentName} | جامعة الزقازيق`;
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return <div className={`app-shell${pathname === '/' ? ' home-shell' : goalsPage ? ' goals-shell' : ''}`}>
    <a className="skip-link" href="#main-content">تجاوز إلى المحتوى</a>
    <header className="site-header"><BrandHeader /><div className="navigation-bar"><div className="container navigation-inner"><DesktopNav /><MobileNav /></div></div></header>
    {snapshot.celebration && <div role="status" className="celebration">{snapshot.celebration}</div>}
    <main id="main-content" ref={main} tabIndex={-1} className="main-content container"><Suspense fallback={<div role="status" aria-busy="true" className="loading-state">جارٍ تحميل الصفحة…</div>}><div key={pathname} className="page-transition"><Outlet /></div></Suspense></main>
    <footer className="site-footer"><div className="container footer-inner"><SessionControl /><p>{compactPage ? 'نسخة تجريبية' : <>تجربة تدريب محلية <span>·</span> المحتوى بانتظار الاعتماد</>}</p>{!compactPage && <Link to="/contact">اتصل بنا</Link>}{demoToolsEnabled && <Link to="/demo-tools">أدوات العرض</Link>}</div></footer>
  </div>;
}
