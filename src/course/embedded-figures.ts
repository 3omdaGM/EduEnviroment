/** Drawing functions and 25 figure definitions transferred from the linked reference; see imported-content.json for provenance. */
const SH = {
  /* ب — T شكل حرف T */
  T(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';
    c.beginPath();
    c.moveTo(W*.16,H*.13);c.lineTo(W*.84,H*.13);
    c.lineTo(W*.84,H*.43);c.lineTo(W*.62,H*.43);
    c.lineTo(W*.62,H*.87);c.lineTo(W*.38,H*.87);
    c.lineTo(W*.38,H*.43);c.lineTo(W*.16,H*.43);
    c.closePath();
    c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';c.stroke();
  },
  /* ز — crown / zigzag */
  crown(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';
    c.beginPath();
    c.moveTo(W*.07,H*.88);c.lineTo(W*.07,H*.38);
    c.lineTo(W*.28,H*.16);c.lineTo(W*.5,H*.38);
    c.lineTo(W*.72,H*.16);c.lineTo(W*.93,H*.38);
    c.lineTo(W*.93,H*.88);c.closePath();
    c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';c.stroke();
  },
  /* س — square with X diagonals (envelope) */
  envelope(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.strokeRect(W*.1,H*.1,W*.8,H*.8);
    c.beginPath();c.moveTo(W*.1,H*.1);c.lineTo(W*.9,H*.9);c.stroke();
    c.beginPath();c.moveTo(W*.9,H*.1);c.lineTo(W*.1,H*.9);c.stroke();
  },
  /* هـ — cube top rhombus face */
  cubeTop(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.5,H*.08);c.lineTo(W*.9,H*.32);
    c.lineTo(W*.5,H*.56);c.lineTo(W*.1,H*.32);
    c.closePath();c.stroke();
  },
  /* ج — small 3-D cube */
  cube3d(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    // front face
    c.strokeRect(W*.12,H*.36,W*.46,H*.46);
    // top face
    c.beginPath();
    c.moveTo(W*.12,H*.36);c.lineTo(W*.38,H*.14);
    c.lineTo(W*.82,H*.14);c.lineTo(W*.58,H*.36);c.stroke();
    // right face
    c.beginPath();
    c.moveTo(W*.58,H*.36);c.lineTo(W*.82,H*.14);
    c.lineTo(W*.82,H*.6);c.lineTo(W*.58,H*.82);c.stroke();
  },
  /* و — triangle */
  tri(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.88,H*.9);c.lineTo(W*.12,H*.9);c.closePath();
    c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';c.stroke();
  },
  /* ل — horizontal rectangle */
  rect(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;
    c.strokeRect(W*.06,H*.3,W*.88,H*.4);
  },
  /* د — house pentagon */
  house(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.07);c.lineTo(W*.93,H*.42);
    c.lineTo(W*.93,H*.93);c.lineTo(W*.07,H*.93);c.lineTo(W*.07,H*.42);c.closePath();c.stroke();
  },
  /* ح — trapezoid */
  trap(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.22,H*.22);c.lineTo(W*.78,H*.22);
    c.lineTo(W*.94,H*.78);c.lineTo(W*.06,H*.78);c.closePath();c.stroke();
  },
  /* ع — plus/cross */
  plus(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.35,H*.06);c.lineTo(W*.65,H*.06);c.lineTo(W*.65,H*.35);
    c.lineTo(W*.94,H*.35);c.lineTo(W*.94,H*.65);c.lineTo(W*.65,H*.65);
    c.lineTo(W*.65,H*.94);c.lineTo(W*.35,H*.94);c.lineTo(W*.35,H*.65);
    c.lineTo(W*.06,H*.65);c.lineTo(W*.06,H*.35);c.lineTo(W*.35,H*.35);
    c.closePath();c.stroke();
  },
  /* ف — rectangle with notch (crown-rect / stadium) */
  notchRect(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.06,H*.22);c.lineTo(W*.94,H*.22);
    c.lineTo(W*.94,H*.78);c.lineTo(W*.62,H*.78);c.lineTo(W*.62,H*.56);
    c.lineTo(W*.38,H*.56);c.lineTo(W*.38,H*.78);c.lineTo(W*.06,H*.78);
    c.closePath();c.stroke();
  },
  /* hexagon */
  hex(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();
    const r=W*.42,cx=W*.5,cy=H*.5;
    for(let i=0;i<6;i++){
      const a=Math.PI/3*i-Math.PI/6;
      if (i === 0) c.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); else c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    }
    c.closePath();c.stroke();
  },
  /* star */
  star(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2;c.lineJoin='round';
    c.beginPath();
    for(let i=0;i<10;i++){
      const a=Math.PI/5*i-Math.PI/2,r=i%2===0?W*.44:W*.2;
      const x=W*.5+Math.cos(a)*r,y=H*.5+Math.sin(a)*r;
      if (i === 0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.closePath();c.stroke();
  },
  /* perspective box (diamond on top) */
  perspTop(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.5,H*.08);c.lineTo(W*.9,H*.34);
    c.lineTo(W*.5,H*.6);c.lineTo(W*.1,H*.34);c.closePath();c.stroke();
  },
  /* shelves (3 stacked rects) */
  shelves(c: CanvasRenderingContext2D, W: number, H: number, cl?: string){
    cl=cl||'#1b6b5a';c.strokeStyle=cl;c.lineWidth=2.5;
    for(let i=0;i<3;i++) c.strokeRect(W*.1,H*(.1+i*.28),W*.8,H*.25);
  }
};

/* ================================================================
   COMPLEX SHAPE DRAWERS — draw the complex/embedded figure
================================================================ */
const CX = {
  /* Complex 1: large diamond with internal lines — T hidden inside */
  cx_T_diamond(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.96,H*.5);c.lineTo(W*.5,H*.96);c.lineTo(W*.04,H*.5);c.closePath();c.stroke();
    [[W*.5,H*.04,W*.5,H*.96],[W*.04,H*.5,W*.96,H*.5],
     [W*.26,H*.26,W*.74,H*.26],[W*.26,H*.74,W*.74,H*.74],
     [W*.26,H*.26,W*.74,H*.74],[W*.74,H*.26,W*.26,H*.74]].forEach(([x1=0,y1=0,x2=0,y2=0])=>{
      c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    });
  },
  /* Complex 2: square with both diagonals + grid — crown hidden */
  cx_crown_sqgrid(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.strokeRect(W*.06,H*.06,W*.88,H*.88);
    c.strokeRect(W*.22,H*.22,W*.56,H*.56);
    c.beginPath();c.moveTo(W*.06,H*.06);c.lineTo(W*.94,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.94,H*.06);c.lineTo(W*.06,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.5,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.5);c.lineTo(W*.94,H*.5);c.stroke();
  },
  /* Complex 3: large square + inner square — envelope hidden */
  cx_envelope_sq(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.strokeRect(W*.05,H*.05,W*.9,H*.9);
    c.strokeRect(W*.25,H*.25,W*.5,H*.5);
    c.beginPath();c.moveTo(W*.05,H*.05);c.lineTo(W*.95,H*.95);c.stroke();
    c.beginPath();c.moveTo(W*.95,H*.05);c.lineTo(W*.05,H*.95);c.stroke();
  },
  /* Complex 4: 3D cube body — cubeTop hidden as top face */
  cx_cubeTop_3dcube(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.strokeRect(W*.06,H*.32,W*.6,H*.6);
    c.beginPath();c.moveTo(W*.06,H*.32);c.lineTo(W*.38,H*.06);c.lineTo(W*.92,H*.06);c.lineTo(W*.66,H*.32);c.stroke();
    c.beginPath();c.moveTo(W*.66,H*.32);c.lineTo(W*.92,H*.06);c.lineTo(W*.92,H*.66);c.lineTo(W*.66,H*.92);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.32);c.lineTo(W*.66,H*.32);c.stroke();
    c.beginPath();c.moveTo(W*.38,H*.06);c.lineTo(W*.5,H*.5);c.stroke();
    c.beginPath();c.moveTo(W*.92,H*.06);c.lineTo(W*.5,H*.5);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.32);c.lineTo(W*.5,H*.5);c.stroke();
  },
  /* Complex 5: big 3D cube — small cube hidden */
  cx_cube3d_big(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.strokeRect(W*.06,H*.34,W*.56,H*.58);
    c.beginPath();c.moveTo(W*.06,H*.34);c.lineTo(W*.38,H*.06);c.lineTo(W*.9,H*.06);c.lineTo(W*.62,H*.34);c.stroke();
    c.beginPath();c.moveTo(W*.62,H*.34);c.lineTo(W*.9,H*.06);c.lineTo(W*.9,H*.64);c.lineTo(W*.62,H*.92);c.stroke();
    c.strokeRect(W*.2,H*.5,W*.22,H*.2);
    c.beginPath();c.moveTo(W*.42,H*.34);c.lineTo(W*.42,H*.92);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.6);c.lineTo(W*.62,H*.6);c.stroke();
  },
  /* Complex 6: triangle with inner lines — triangle hidden */
  cx_tri_inner(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.94,H*.96);c.lineTo(W*.06,H*.96);c.closePath();c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.5,H*.96);c.stroke();
    c.beginPath();c.moveTo(W*.28,H*.5);c.lineTo(W*.72,H*.5);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.28,H*.5);c.lineTo(W*.72,H*.5);c.closePath();c.stroke();
    // extra lines
    c.beginPath();c.moveTo(W*.5,H*.5);c.lineTo(W*.94,H*.96);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.5);c.lineTo(W*.06,H*.96);c.stroke();
  },
  /* Complex 7: irregular hexagon — rectangle hidden */
  cx_rect_hexagon(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.1,H*.22);c.lineTo(W*.9,H*.16);c.lineTo(W*.96,H*.58);
    c.lineTo(W*.82,H*.84);c.lineTo(W*.12,H*.88);c.lineTo(W*.04,H*.52);c.closePath();c.stroke();
    c.beginPath();c.moveTo(W*.1,H*.5);c.lineTo(W*.9,H*.5);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.16);c.lineTo(W*.5,H*.84);c.stroke();
    c.beginPath();c.moveTo(W*.1,H*.22);c.lineTo(W*.9,H*.84);c.stroke();
  },
  /* CX SEC2-1: concentric diamonds — star hidden */
  cx_star_diamonds(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    [W*.44,W*.3,W*.15].forEach(r=>{
      c.beginPath();c.moveTo(W*.5,H*.5-r);c.lineTo(W*.5+r,H*.5);c.lineTo(W*.5,H*.5+r);c.lineTo(W*.5-r,H*.5);c.closePath();c.stroke();
    });
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.5,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.5);c.lineTo(W*.94,H*.5);c.stroke();
  },
  /* CX SEC2-2: 2 skewed parallelograms (distractors) + 1 genuine unskewed rectangle — rect hidden */
  cx_rect_para(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    [[W*.06,H*.06,W*.4,H*.28,W*.1],[W*.28,H*.36,W*.4,H*.28,0],[W*.5,H*.66,W*.4,H*.28,W*.1]].forEach(([x=0,y=0,w=0,h=0,sk=0])=>{
      c.beginPath();c.moveTo(x+sk,y);c.lineTo(x+w+sk,y);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.closePath();c.stroke();
    });
  },
  /* CX SEC2-3: square with radial lines from corner — crown hidden */
  cx_crown_sunburst(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.strokeRect(W*.06,H*.06,W*.88,H*.88);
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2;
      c.beginPath();c.moveTo(W*.94,H*.94);c.lineTo(W*.94+Math.cos(a)*W*1.3,H*.94+Math.sin(a)*H*1.3);c.stroke();
    }
    c.beginPath();c.moveTo(W*.06,H*.06);c.lineTo(W*.94,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.94,H*.06);c.lineTo(W*.06,H*.94);c.stroke();
  },
  /* CX SEC2-4: vertical-line grid (distractor) + genuine shelves shape hidden within it */
  cx_shelves_grid(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.6;
    for(let i=0;i<=4;i++){
      const v=W*(.08+i*.21);
      c.beginPath();c.moveTo(v,H*.06);c.lineTo(v,H*.94);c.stroke();
    }
    c.lineWidth=2;c.strokeRect(W*.06,H*.06,W*.88,H*.88);
    /* الشكل البسيط الحقيقي (الرفوف) — نفس أبعاد SH.shelves تمامًا */
    c.lineWidth=1.6;
    for(let i=0;i<3;i++) c.strokeRect(W*.1,H*(.1+i*.28),W*.8,H*.25);
  },
  /* CX SEC2-5: octagon with diagonals — T hidden */
  cx_T_octagon(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    const p: [number, number][]=[[.5,.04],[.82,.18],[.96,.5],[.82,.82],[.5,.96],[.18,.82],[.04,.5],[.18,.18]];
    c.beginPath();c.moveTo(W*p[0]![0],H*p[0]![1]);p.forEach(q=>c.lineTo(W*q[0],H*q[1]));c.closePath();c.stroke();
    [[W*.04,H*.5,W*.96,H*.5],[W*.5,H*.04,W*.5,H*.96],[W*.18,H*.18,W*.82,H*.82],[W*.82,H*.18,W*.18,H*.82]].forEach(([x1=0,y1=0,x2=0,y2=0])=>{
      c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    });
  },
  /* CX SEC2-6: cross/plus shape with hatch — trap hidden */
  cx_trap_cross(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();
    c.moveTo(W*.34,H*.06);c.lineTo(W*.66,H*.06);c.lineTo(W*.66,H*.34);c.lineTo(W*.94,H*.34);
    c.lineTo(W*.94,H*.66);c.lineTo(W*.66,H*.66);c.lineTo(W*.66,H*.94);c.lineTo(W*.34,H*.94);
    c.lineTo(W*.34,H*.66);c.lineTo(W*.06,H*.66);c.lineTo(W*.06,H*.34);c.lineTo(W*.34,H*.34);
    c.closePath();c.stroke();
    c.globalAlpha=.12;
    for(let i=-4;i<10;i++){c.beginPath();c.moveTo(W*i*.15,0);c.lineTo(W*(i*.15+1),H);c.stroke();}
    c.globalAlpha=1;
  },
  /* CX SEC2-7: house with detail — house hidden */
  cx_house_detail(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.93,H*.4);c.lineTo(W*.93,H*.93);c.lineTo(W*.07,H*.93);c.lineTo(W*.07,H*.4);c.closePath();c.stroke();
    c.strokeRect(W*.14,H*.54,W*.2,H*.2);c.strokeRect(W*.66,H*.54,W*.2,H*.2);
    c.strokeRect(W*.38,H*.58,W*.24,H*.35);
    c.beginPath();c.moveTo(W*.07,H*.4);c.lineTo(W*.93,H*.4);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.5,H*.4);c.stroke();
  },
  /* CX SEC2-8: hexagon with hatching — trap hidden */
  cx_trap_hex(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.9,H*.28);c.lineTo(W*.9,H*.72);c.lineTo(W*.5,H*.94);c.lineTo(W*.1,H*.72);c.lineTo(W*.1,H*.28);c.closePath();c.stroke();
    c.globalAlpha=.2;for(let i=0;i<7;i++){c.beginPath();c.moveTo(W*.1,H*(.14+i*.12));c.lineTo(W*.9,H*(.14+i*.12));c.stroke();}c.globalAlpha=1;
    c.beginPath();c.moveTo(W*.1,H*.28);c.lineTo(W*.9,H*.72);c.stroke();
  },
  /* CX SEC2-9: hexagon/rounded hex — hex hidden */
  cx_hex_rounded(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.9,H*.3);c.lineTo(W*.9,H*.7);c.lineTo(W*.5,H*.94);c.lineTo(W*.1,H*.7);c.lineTo(W*.1,H*.3);c.closePath();c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.06);c.lineTo(W*.5,H*.94);c.stroke();
    c.beginPath();c.moveTo(W*.1,H*.3);c.lineTo(W*.9,H*.7);c.stroke();
    c.beginPath();c.moveTo(W*.9,H*.3);c.lineTo(W*.1,H*.7);c.stroke();
    c.globalAlpha=.18;for(let i=0;i<8;i++){c.beginPath();c.moveTo(W*.1,H*(.1+i*.11));c.lineTo(W*.9,H*(.1+i*.11));c.stroke();}c.globalAlpha=1;
  },
  /* SEC3 CX shapes */
  cx_tri_starburst(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    for(let i=0;i<10;i++){
      const a1=i/10*Math.PI*2,a2=(i+.5)/10*Math.PI*2;
      c.beginPath();c.moveTo(W*.5,H*.5);c.lineTo(W*.5+Math.cos(a1)*W*.46,H*.5+Math.sin(a1)*H*.46);c.lineTo(W*.5+Math.cos(a2)*W*.22,H*.5+Math.sin(a2)*H*.22);c.stroke();
    }
  },
  cx_crown_diaghatch(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.strokeRect(W*.06,H*.06,W*.88,H*.88);
    c.globalAlpha=.15;for(let i=-4;i<10;i++){c.beginPath();c.moveTo(W*i*.15,0);c.lineTo(W*(i*.15+1),H);c.stroke();c.beginPath();c.moveTo(W*i*.15,H);c.lineTo(W*(i*.15+1),0);c.stroke();}c.globalAlpha=1;
    c.beginPath();c.moveTo(W*.06,H*.06);c.lineTo(W*.94,H*.94);c.stroke();
  },
  cx_cube_roof3d(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.strokeRect(W*.06,H*.36,W*.56,H*.58);
    c.beginPath();c.moveTo(W*.06,H*.36);c.lineTo(W*.38,H*.06);c.lineTo(W*.9,H*.06);c.lineTo(W*.62,H*.36);c.stroke();
    c.beginPath();c.moveTo(W*.62,H*.36);c.lineTo(W*.9,H*.06);c.lineTo(W*.9,H*.64);c.lineTo(W*.62,H*.92);c.stroke();
    c.strokeRect(W*.18,H*.52,W*.2,H*.18);
  },
  cx_shelves_xgrid(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.6;c.strokeRect(W*.04,H*.04,W*.92,H*.92);
    for(let i=1;i<4;i++){const x=W*(.04+i*.23);c.beginPath();c.moveTo(x,H*.04);c.lineTo(x,H*.96);c.stroke();}
    c.globalAlpha=.22;for(let i=-3;i<6;i++){c.beginPath();c.moveTo(W*i*.25,0);c.lineTo(W*(i*.25+1),H);c.stroke();c.beginPath();c.moveTo(W*i*.25,H);c.lineTo(W*(i*.25+1),0);c.stroke();}c.globalAlpha=1;
  },
  cx_plus_shelfgrid(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.strokeRect(W*.06,H*.06,W*.88,H*.88);
    for(let r=1;r<4;r++){const y=H*(.06+r*.22);c.beginPath();c.moveTo(W*.06,y);c.lineTo(W*.94,y);c.stroke();}
    c.beginPath();c.moveTo(W*.38,H*.06);c.lineTo(W*.38,H*.94);c.stroke();
  },
  cx_shelves_parahatch(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.06,H*.32);c.lineTo(W*.76,H*.06);c.lineTo(W*.94,H*.68);c.lineTo(W*.24,H*.94);c.closePath();c.stroke();
    c.globalAlpha=.18;for(let i=-3;i<8;i++){c.beginPath();c.moveTo(W*i*.16,0);c.lineTo(W*(i*.16+1),H);c.stroke();}c.globalAlpha=1;
  },
  cx_rect_openbox(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.strokeRect(W*.06,H*.24,W*.76,H*.62);
    c.beginPath();c.moveTo(W*.06,H*.24);c.lineTo(W*.32,H*.06);c.lineTo(W*.92,H*.06);c.lineTo(W*.82,H*.24);c.stroke();
    c.beginPath();c.moveTo(W*.82,H*.24);c.lineTo(W*.92,H*.06);c.lineTo(W*.92,H*.64);c.lineTo(W*.82,H*.86);c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.24);c.lineTo(W*.5,H*.54);c.stroke();
    c.beginPath();c.moveTo(W*.82,H*.24);c.lineTo(W*.5,H*.54);c.stroke();
  },
  cx_rect_diagbox(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;
    c.strokeRect(W*.06,H*.22,W*.88,H*.56);
    c.beginPath();c.moveTo(W*.06,H*.22);c.lineTo(W*.94,H*.78);c.stroke();
    c.beginPath();c.moveTo(W*.94,H*.22);c.lineTo(W*.06,H*.78);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.22);c.lineTo(W*.5,H*.78);c.stroke();
  },
  cx_notch_diamhatch(c: CanvasRenderingContext2D, W: number, H: number) {
    c.strokeStyle='#374151';c.lineWidth=1.8;c.lineJoin='round';
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.94,H*.5);c.lineTo(W*.5,H*.96);c.lineTo(W*.06,H*.5);c.closePath();c.stroke();
    c.beginPath();c.moveTo(W*.06,H*.5);c.lineTo(W*.94,H*.5);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.04);c.lineTo(W*.5,H*.96);c.stroke();
    c.globalAlpha=.17;for(let i=-4;i<8;i++){c.beginPath();c.moveTo(W*i*.15,0);c.lineTo(W*(i*.15+1),H);c.stroke();c.beginPath();c.moveTo(W*i*.15,H);c.lineTo(W*(i*.15+1),0);c.stroke();}c.globalAlpha=1;
  }
};

/* ================================================================
   QUESTIONS DATA
   sf  = simple shape function (what the student must find)
   cf  = complex shape function (the embedded figure)
   ans = correct polygon [{x,y}] in 0..1 — THIS IS WHAT GETS DRAWN IN GREEN
   lbl = question label
================================================================ */
export const embeddedFigures = [
  // ===== SEC 1 — TRAINING (7q, 120s) =====
  { sec:1, sf:SH.T,       cf:CX.cx_T_diamond,
    lbl:'(١) وضح حدود الشكل البسيط (ب) داخل الشكل المعقد',
    ans:[{x:.16,y:.14},{x:.84,y:.14},{x:.84,y:.43},{x:.62,y:.43},{x:.62,y:.86},{x:.38,y:.86},{x:.38,y:.43},{x:.16,y:.43}]
  },
  { sec:1, sf:SH.crown,   cf:CX.cx_crown_sqgrid,
    lbl:'(٢) وضح حدود الشكل البسيط (ز) داخل الشكل المعقد',
    ans:[{x:.07,y:.88},{x:.07,y:.38},{x:.28,y:.16},{x:.5,y:.38},{x:.72,y:.16},{x:.93,y:.38},{x:.93,y:.88}]
  },
  { sec:1, sf:SH.envelope, cf:CX.cx_envelope_sq,
    lbl:'(٣) وضح حدود الشكل البسيط (س) داخل الشكل المعقد',
    ans:[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}]
  },
  { sec:1, sf:SH.cubeTop,  cf:CX.cx_cubeTop_3dcube,
    lbl:'(٤) وضح حدود الشكل البسيط (هـ) داخل الشكل المعقد',
    ans:[{x:.06,y:.32},{x:.38,y:.06},{x:.92,y:.06},{x:.66,y:.32},{x:.5,y:.5}]
  },
  { sec:1, sf:SH.cube3d,   cf:CX.cx_cube3d_big,
    lbl:'(٥) وضح حدود الشكل البسيط (ج) داخل الشكل المعقد',
    ans:[{x:.12,y:.36},{x:.58,y:.36},{x:.58,y:.82},{x:.12,y:.82}]
  },
  { sec:1, sf:SH.tri,      cf:CX.cx_tri_inner,
    lbl:'(٦) وضح حدود الشكل البسيط (و) داخل الشكل المعقد',
    ans:[{x:.5,y:.04},{x:.72,y:.5},{x:.28,y:.5}]
  },
  { sec:1, sf:SH.rect,     cf:CX.cx_rect_hexagon,
    lbl:'(٧) وضح حدود الشكل البسيط (ل) داخل الشكل المعقد',
    ans:[{x:.06,y:.32},{x:.94,y:.32},{x:.94,y:.68},{x:.06,y:.68}]
  },

  // ===== SEC 2 (9q, 300s) =====
  { sec:2, sf:SH.star,     cf:CX.cx_star_diamonds,
    lbl:'(١) وضح حدود الشكل البسيط (ز) داخل الشكل المعقد',
    ans:[{x:.5,y:.06},{x:.64,y:.36},{x:.94,y:.36},{x:.72,y:.56},{x:.82,y:.9},{x:.5,y:.72},{x:.18,y:.9},{x:.28,y:.56},{x:.06,y:.36},{x:.36,y:.36}]
  },
  { sec:2, sf:SH.rect,     cf:CX.cx_rect_para,
    lbl:'(٢) وضح حدود الشكل البسيط (ل) داخل الشكل المعقد',
    ans:[{x:.28,y:.36},{x:.68,y:.36},{x:.68,y:.64},{x:.28,y:.64}]
  },
  { sec:2, sf:SH.crown,    cf:CX.cx_crown_sunburst,
    lbl:'(٣) وضح حدود الشكل البسيط (ز) داخل الشكل المعقد',
    ans:[{x:.07,y:.88},{x:.07,y:.38},{x:.28,y:.16},{x:.5,y:.38},{x:.72,y:.16},{x:.93,y:.38},{x:.93,y:.88}]
  },
  { sec:2, sf:SH.shelves,  cf:CX.cx_shelves_grid,
    lbl:'(٤) وضح حدود الشكل البسيط (هـ) داخل الشكل المعقد',
    ans:[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.91},{x:.1,y:.91}]
  },
  { sec:2, sf:SH.T,        cf:CX.cx_T_octagon,
    lbl:'(٥) وضح حدود الشكل البسيط (ب) داخل الشكل المعقد',
    ans:[{x:.16,y:.14},{x:.84,y:.14},{x:.84,y:.43},{x:.62,y:.43},{x:.62,y:.86},{x:.38,y:.86},{x:.38,y:.43},{x:.16,y:.43}]
  },
  { sec:2, sf:SH.trap,     cf:CX.cx_trap_cross,
    lbl:'(٦) وضح حدود الشكل البسيط (ح) داخل الشكل المعقد',
    ans:[{x:.18,y:.2},{x:.82,y:.2},{x:.94,y:.78},{x:.06,y:.78}]
  },
  { sec:2, sf:SH.house,    cf:CX.cx_house_detail,
    lbl:'(٧) وضح حدود الشكل البسيط (د) داخل الشكل المعقد',
    ans:[{x:.5,y:.06},{x:.93,y:.4},{x:.93,y:.93},{x:.07,y:.93},{x:.07,y:.4}]
  },
  { sec:2, sf:SH.trap,     cf:CX.cx_trap_hex,
    lbl:'(٨) وضح حدود الشكل البسيط (ح) داخل الشكل المعقد',
    ans:[{x:.12,y:.28},{x:.88,y:.28},{x:.88,y:.72},{x:.12,y:.72}]
  },
  { sec:2, sf:SH.hex,      cf:CX.cx_hex_rounded,
    lbl:'(٩) وضح حدود الشكل البسيط (ق) داخل الشكل المعقد',
    ans:[{x:.5,y:.06},{x:.9,y:.3},{x:.9,y:.7},{x:.5,y:.94},{x:.1,y:.7},{x:.1,y:.3}]
  },

  // ===== SEC 3 (9q, 300s) =====
  { sec:3, sf:SH.tri,      cf:CX.cx_tri_starburst,
    lbl:'(١) وضح حدود الشكل البسيط (و) داخل الشكل المعقد',
    ans:[{x:.5,y:.06},{x:.84,y:.84},{x:.16,y:.84}]
  },
  { sec:3, sf:SH.crown,    cf:CX.cx_crown_diaghatch,
    lbl:'(٢) وضح حدود الشكل البسيط (ز) داخل الشكل المعقد',
    ans:[{x:.07,y:.88},{x:.07,y:.36},{x:.28,y:.14},{x:.5,y:.36},{x:.72,y:.14},{x:.93,y:.36},{x:.93,y:.88}]
  },
  { sec:3, sf:SH.cube3d,   cf:CX.cx_cube_roof3d,
    lbl:'(٣) وضح حدود الشكل البسيط (ج) داخل الشكل المعقد',
    ans:[{x:.12,y:.36},{x:.58,y:.36},{x:.58,y:.82},{x:.12,y:.82}]
  },
  { sec:3, sf:SH.shelves,  cf:CX.cx_shelves_xgrid,
    lbl:'(٤) وضح حدود الشكل البسيط (هـ) داخل الشكل المعقد',
    ans:[{x:.04,y:.04},{x:.96,y:.04},{x:.96,y:.96},{x:.04,y:.96}]
  },
  { sec:3, sf:SH.plus,     cf:CX.cx_plus_shelfgrid,
    lbl:'(٥) وضح حدود الشكل البسيط (ع) داخل الشكل المعقد',
    ans:[{x:.35,y:.06},{x:.65,y:.06},{x:.65,y:.35},{x:.94,y:.35},{x:.94,y:.65},{x:.65,y:.65},{x:.65,y:.94},{x:.35,y:.94},{x:.35,y:.65},{x:.06,y:.65},{x:.06,y:.35},{x:.35,y:.35}]
  },
  { sec:3, sf:SH.shelves,  cf:CX.cx_shelves_parahatch,
    lbl:'(٦) وضح حدود الشكل البسيط (هـ) داخل الشكل المعقد',
    ans:[{x:.06,y:.06},{x:.94,y:.06},{x:.94,y:.94},{x:.06,y:.94}]
  },
  { sec:3, sf:SH.rect,     cf:CX.cx_rect_openbox,
    lbl:'(٧) وضح حدود الشكل البسيط (ل) داخل الشكل المعقد',
    ans:[{x:.06,y:.34},{x:.82,y:.34},{x:.82,y:.64},{x:.06,y:.64}]
  },
  { sec:3, sf:SH.rect,     cf:CX.cx_rect_diagbox,
    lbl:'(٨) وضح حدود الشكل البسيط (ل) داخل الشكل المعقد',
    ans:[{x:.06,y:.22},{x:.94,y:.22},{x:.94,y:.78},{x:.06,y:.78}]
  },
  { sec:3, sf:SH.notchRect,cf:CX.cx_notch_diamhatch,
    lbl:'(٩) وضح حدود الشكل البسيط (ف) داخل الشكل المعقد',
    ans:[{x:.06,y:.22},{x:.94,y:.22},{x:.94,y:.78},{x:.62,y:.78},{x:.62,y:.56},{x:.38,y:.56},{x:.38,y:.78},{x:.06,y:.78}]
  }
];

/* ================================================================
   SIMPLE SHAPES REFERENCE (for sidebar display)
================================================================ */
