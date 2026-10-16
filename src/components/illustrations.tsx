import { useId } from 'react';

/** Decorative vector, not a university logo. All instructional text is HTML. */
export function LearningIllustration() {
  const id = useId();
  return <svg width="410" height="260" viewBox="0 0 410 260" className="learning-illustration" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#106b88" /><stop offset="1" stopColor="#0b3c5d" /></linearGradient></defs>
    <ellipse cx="208" cy="228" rx="150" ry="17" fill="#0b3c5d" opacity=".08" />
    <path d="M70 132C34 87 92 28 161 38c57-42 164-10 174 68 40 69-15 114-97 105-72 23-143-1-168-79Z" fill="#d8eef2" />
    <g transform="rotate(-8 112 140)"><rect x="58" y="100" width="85" height="108" rx="9" fill="#d9a876" /><rect x="65" y="94" width="85" height="108" rx="9" fill="#fff4e6" /><path d="M81 121h50m-50 14h42m-42 14h50m-50 14h33" stroke="#b58c67" strokeWidth="4" strokeLinecap="round" /><path d="M79 94v108" stroke="#e0bd95" strokeWidth="3" /></g>
    <rect x="132" y="71" width="195" height="133" rx="13" fill={`url(#${id})`} />
    <rect x="143" y="82" width="173" height="108" rx="6" fill="#f6fbfd" />
    <rect x="155" y="95" width="149" height="14" rx="4" fill="#d7e9ed" /><circle cx="296" cy="102" r="3" fill="#0891b2" />
    <rect x="238" y="122" width="55" height="52" rx="6" fill="#d3eff1" /><path d="m251 149 10 9 19-23" fill="none" stroke="#0e7490" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M157 129h65m-65 15h52m-52 15h58m-58 15h39" stroke="#a8c5d0" strokeWidth="5" strokeLinecap="round" />
    <path d="M119 204h223l-12 13H131Z" fill="#7b9fab" /><path d="M192 204h79l-7 6h-65Z" fill="#b9d5dd" />
    <g transform="rotate(12 320 60)"><rect x="290" y="30" width="57" height="57" rx="15" fill="#fff" stroke="#cae0e7" /><path d="m303 56 15 8 16-8-16-8Z" fill="#0e7490" /><path d="M308 62v9c9 6 15 6 22 0v-9" fill="none" stroke="#0e7490" strokeWidth="3" /></g>
    <circle cx="96" cy="62" r="6" fill="#dfb483" /><circle cx="354" cy="172" r="5" fill="#0891b2" opacity=".6" />
    <path d="M176 25v12m-6-6h12M353 112v12m-6-6h12" stroke="#6aa6b4" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

export function IntegrationDiagram() {
  return <svg width="560" height="180" viewBox="0 0 560 180" role="img" aria-label="ثلاث دوائر يصل بينها خط، تمثل الهدف التعليمي والنشاط والأداة الرقمية" className="integration-diagram">
    <path d="M130 90h300" stroke="#91bdc9" strokeWidth="3" strokeDasharray="6 7" />
    <circle cx="130" cy="90" r="57" fill="#e7f1f7" stroke="#aecbd8" /><circle cx="280" cy="90" r="57" fill="#e0f2f1" stroke="#95c4c7" /><circle cx="430" cy="90" r="57" fill="#fcf0e1" stroke="#dbb98f" />
    <g stroke="#0b3c5d" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="130" cy="90" r="24" /><circle cx="130" cy="90" r="10" /><path d="m130 90 22-23m-9 0h9v9" /></g>
    <g stroke="#0e7490" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m259 90 17 17 27-32" /><path d="M257 66h40v47h-40Z" opacity=".35" /></g>
    <g stroke="#9a6236" strokeWidth="4" fill="none" strokeLinecap="round"><rect x="406" y="70" width="48" height="33" rx="4" /><path d="M430 104v9m-16 0h32" /></g>
  </svg>;
}
