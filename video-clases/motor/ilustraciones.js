/* =====================================================================
   ILUSTRACIONES · dibujos SVG planos para las video-clases
   ---------------------------------------------------------------------
   Cada función devuelve un <svg class="ilu"> que ocupa el 100% de la
   caja donde se coloca (E(..., ILU.persona({tipo:'rey'})) ).
   Estilo: plano, sin contorno, sombra suave de bloque (opacity .12–.18),
   paleta común P. Animaciones en bucle por clase CSS: bob, float, spin,
   sway, wig, pulse, clink, clinkr, shine; al aparecer: roll, draw.
   Proporciones de personaje: viewBox 200x300 (caja 2:3).
   ===================================================================== */
const P={sk:"#f2c7a5",sk2:"#dca27e",ink:"#162227",paper:"#f4efe6",card:"#fbf6ec",
  gold:"#ffcf5a",gold2:"#e5a51f",red:"#d9483b",red2:"#a83228",navy:"#2d4170",navy2:"#1f2d4d",
  teal:"#2f9d8f",teal2:"#1f6f66",sky:"#8cc8ff",sky2:"#5fa6e6",mint:"#63d6b5",coral:"#ff7a59",
  brown:"#8a5a34",brown2:"#6b4226",pink:"#f39a8c",grey:"#c9d0d4",hair:"#3a2a22",green:"#4caf6e"};
const svgW=(vb,body,extra="")=>`<svg class="ilu" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${body}</svg>`;

/* ---------- PERSONAJES ---------- */
const PERSONAS={
  rey:{outfit:"manto",oc:P.red,hair:"corto",hc:"#5b4a3f",beard:true,head:"corona",pose:"cetro"},
  reina:{outfit:"vestido",oc:P.teal,hair:"largo",hc:"#7a4a2a",head:"tiara"},
  principe:{outfit:"chaqueta",oc:P.sky2,shirt:P.paper,hair:"corto",hc:"#c48a3c",head:"coronita",pants:P.navy},
  princesa:{outfit:"vestido",oc:P.sky2,hair:"largo",hc:"#c48a3c",head:"coronita"},
  presidente:{outfit:"traje",oc:P.navy,tie:P.red,hair:"canoso",hc:"#9aa0a6"},
  presidenta:{outfit:"chaqueta",oc:P.teal2,shirt:P.paper,hair:"mono",hc:"#3a2a22",pants:P.navy2},
  regente:{outfit:"chaqueta",oc:P.coral,shirt:P.paper,hair:"largo",hc:"#3a2a22",sash:true,pants:P.navy2},
  tutor:{outfit:"rebeca",oc:P.brown,shirt:P.paper,hair:"canoso",hc:P.grey,glasses:true,pose:"libro",pants:P.navy2},
  mujer:{outfit:"chaqueta",oc:P.mint,shirt:P.paper,hair:"largo",hc:"#6b3f22",pants:P.navy2},
  hombre:{outfit:"chaqueta",oc:P.sky,shirt:P.paper,hair:"corto",hc:P.hair,pants:P.navy2},
  madre:{outfit:"vestido",oc:P.coral,hair:"largo",hc:"#3a2a22"},
  padre:{outfit:"chaqueta",oc:P.teal,shirt:P.paper,hair:"corto",hc:P.hair,beard:true,pants:P.navy2}
};
function coronaPath(x=0,y=0,s=1){
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 40L6 8l14 18L34 0l14 26L62 8l6 32Z" fill="${P.gold}"/><rect x="0" y="34" width="68" height="11" rx="2" fill="${P.gold2}"/><circle cx="34" cy="40" r="4.5" fill="${P.red}"/><circle cx="14" cy="40" r="3.5" fill="${P.sky}"/><circle cx="54" cy="40" r="3.5" fill="${P.sky}"/><circle cx="6" cy="8" r="4" fill="${P.gold}"/><circle cx="34" cy="0" r="4.5" fill="${P.gold}"/><circle cx="62" cy="8" r="4" fill="${P.gold}"/></g>`;
}
function personaG(o={}){
  const c={...(PERSONAS[o.tipo]||PERSONAS.hombre),...o};
  const sk=c.skin||P.sk, hc=c.hc||P.hair, oc=c.oc||P.navy, pose=c.pose||"normal";
  let s="";
  /* pelo largo por detrás */
  if(c.hair==="largo") s+=`<path d="M62 72Q56 28 100 26Q144 28 138 72L148 158Q126 148 122 112H78Q74 148 52 158Z" fill="${hc}"/>`;
  /* piernas */
  if(["traje","chaqueta","rebeca"].includes(c.outfit)) s+=`<rect x="78" y="226" width="20" height="62" rx="6" fill="${c.pants||P.navy2}"/><rect x="102" y="226" width="20" height="62" rx="6" fill="${c.pants||P.navy2}"/><ellipse cx="86" cy="292" rx="15" ry="7" fill="${P.ink}"/><ellipse cx="114" cy="292" rx="15" ry="7" fill="${P.ink}"/>`;
  /* cuello */
  s+=`<rect x="90" y="96" width="20" height="30" fill="${P.sk2}"/>`;
  /* cuerpo */
  if(c.outfit==="manto"){
    s+=`<path d="M58 122Q100 108 142 122L168 296H32Z" fill="${oc}"/><path d="M100 114L142 122L168 296H100Z" fill="#000" opacity=".16"/><path d="M95 140h10l5 156H90Z" fill="${P.gold2}"/><path d="M48 120Q100 160 152 120L156 150Q100 190 44 150Z" fill="${P.paper}"/>`;
    [[60,140],[78,152],[100,158],[122,152],[140,140],[70,130],[130,130],[100,170]].forEach(([x,y])=>s+=`<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4.2" fill="${P.ink}"/>`);
  } else if(c.outfit==="vestido"){
    s+=`<path d="M62 124Q100 112 138 124L162 294H38Z" fill="${oc}"/><path d="M100 118L138 124L162 294H100Z" fill="#000" opacity=".13"/><rect x="66" y="176" width="68" height="10" rx="3" fill="${P.gold}"/>`;
  } else if(c.outfit==="traje"){
    s+=`<path d="M60 124Q100 112 140 124L150 240H50Z" fill="${oc}"/><path d="M100 118L140 124L150 240H100Z" fill="#000" opacity=".17"/><path d="M85 121L100 160L115 121Z" fill="${P.paper}"/><path d="M97 128h6l3 40-6 8-6-8Z" fill="${c.tie||P.red}"/><path d="M84 122L100 172M116 122L100 172" stroke="#000" stroke-opacity=".28" stroke-width="3" fill="none"/>`;
  } else if(c.outfit==="chaqueta"||c.outfit==="rebeca"){
    s+=`<path d="M60 124Q100 112 140 124L148 238H52Z" fill="${oc}"/><path d="M100 118L140 124L148 238H100Z" fill="#000" opacity=".15"/><path d="M86 121L100 152L114 121Z" fill="${c.shirt||P.paper}"/>`;
    if(c.outfit==="rebeca") s+=`<circle cx="100" cy="170" r="3.5" fill="${P.gold}"/><circle cx="100" cy="192" r="3.5" fill="${P.gold}"/><circle cx="100" cy="214" r="3.5" fill="${P.gold}"/><rect x="66" y="196" width="22" height="16" rx="3" fill="#000" opacity=".15"/>`;
  }
  if(c.sash) s+=`<path d="M64 126L80 120L144 232L128 238Z" fill="${P.gold}"/><circle cx="104" cy="182" r="8" fill="${P.red}"/>`;
  /* brazos */
  const arm=(x,rot,cx)=>`<rect x="${x}" y="124" width="22" height="88" rx="11" fill="${oc}" transform="rotate(${rot} ${cx} 128)"/>`;
  const handL=[44,214], up=["jura","copa","saludo"].includes(pose), handR=up?[171,45]:[156,214];
  s+=arm(48,10,59);
  s+=up?arm(130,-160,141):arm(130,-10,141);
  /* objetos en las manos (detrás de la mano) */
  if(pose==="cetro") s+=`<rect x="153" y="96" width="9" height="176" rx="4" fill="${P.gold2}"/><circle cx="157" cy="90" r="12" fill="${P.gold}"/><path d="M157 70v12M151 76h12" stroke="${P.gold}" stroke-width="4"/>`;
  if(pose==="copa") s+=`<g class="clinkr"><path d="M156 8h30q0 24-15 28-15-4-15-28Z" fill="${P.gold}"/><rect x="168" y="34" width="6" height="12" fill="${P.gold2}"/></g>`;
  if(pose==="cartas") s+=[-28,-14,0,14,28].map((r,k)=>`<rect x="150" y="150" width="34" height="50" rx="5" fill="${k%2?P.card:"#fff"}" stroke="${P.ink}" stroke-width="2.5" transform="rotate(${r} 160 212)"/>`).join("");
  s+=`<circle cx="${handL[0]}" cy="${handL[1]}" r="10" fill="${sk}"/><circle cx="${handR[0]}" cy="${handR[1]}" r="${pose==="jura"?13:10}" fill="${sk}"/>`;
  if(pose==="libro"||pose==="jura") s+=`<rect x="26" y="186" width="40" height="48" rx="4" fill="${P.red2}"/><rect x="30" y="190" width="32" height="40" rx="2" fill="${P.red}"/><text x="46" y="216" text-anchor="middle" font-size="13" font-weight="800" fill="${P.gold}" font-family="sans-serif">CE</text>`;
  /* cabeza */
  s+=`<circle cx="66" cy="76" r="8" fill="${P.sk2}"/><circle cx="134" cy="76" r="8" fill="${P.sk2}"/><circle cx="100" cy="72" r="34" fill="${sk}"/>`;
  if(c.beard) s+=`<path d="M68 76Q70 116 100 120Q130 116 132 76Q126 100 100 102Q74 100 68 76Z" fill="${hc}"/>`;
  /* cara */
  const ex=c.expr||"normal";
  if(ex==="mareado"){
    s+=`<path d="M82 66l10 10M92 66l-10 10M108 66l10 10M118 66l-10 10" stroke="${P.ink}" stroke-width="3.5" stroke-linecap="round"/><path d="M88 92q6-6 12 0t12 0" stroke="${P.ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    s+=`<g class="spin"><path d="M100 4a10 10 0 1 1-10 10 6 6 0 1 1 6 6" stroke="${P.gold}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="72" cy="12" r="4" fill="${P.gold}"/><circle cx="128" cy="14" r="4" fill="${P.gold}"/></g>`;
    s+=`<rect x="70" y="44" width="60" height="10" rx="5" fill="${P.paper}" transform="rotate(-8 100 49)"/>`;
  } else {
    s+=`<ellipse cx="88" cy="72" rx="3.8" ry="4.8" fill="${P.ink}"/><ellipse cx="112" cy="72" rx="3.8" ry="4.8" fill="${P.ink}"/><circle cx="89.3" cy="70.4" r="1.3" fill="#fff"/><circle cx="113.3" cy="70.4" r="1.3" fill="#fff"/>`;
    s+=`<path d="M81 61q7-5 14 0M105 61q7-5 14 0" stroke="${c.beard||c.hair==="canoso"?hc:P.ink}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
    s+=ex==="serio"?`<path d="M91 92h18" stroke="${P.ink}" stroke-width="3.5" stroke-linecap="round"/>`
      :ex==="feliz"?`<path d="M88 88q12 14 24 0Z" fill="${P.ink}"/><path d="M93 92q7 4 14 0" stroke="${P.pink}" stroke-width="3" fill="none"/>`
      :`<path d="M90 89q10 9 20 0" stroke="${P.ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    s+=`<circle cx="79" cy="84" r="6" fill="${P.pink}" opacity=".45"/><circle cx="121" cy="84" r="6" fill="${P.pink}" opacity=".45"/>`;
    if(c.beard) s+=`<path d="M88 86q12-6 24 0q-12 4-24 0Z" fill="${hc}"/>`;
  }
  if(c.glasses) s+=`<circle cx="88" cy="72" r="10" fill="none" stroke="${P.ink}" stroke-width="3"/><circle cx="112" cy="72" r="10" fill="none" stroke="${P.ink}" stroke-width="3"/><path d="M98 72h4" stroke="${P.ink}" stroke-width="3"/>`;
  /* pelo por delante */
  if(c.hair==="corto") s+=`<path d="M64 74Q60 36 100 34Q140 36 136 74Q132 56 116 52Q100 60 80 54Q68 60 64 74Z" fill="${hc}"/>`;
  else if(c.hair==="largo") s+=`<path d="M66 68Q68 36 100 36Q132 36 134 68Q120 50 100 52Q82 50 66 68Z" fill="${hc}"/>`;
  else if(c.hair==="canoso") s+=`<path d="M64 78Q60 52 72 44Q70 62 68 78Z M136 78Q140 52 128 44Q130 62 132 78Z M84 40Q100 34 116 40Q100 44 84 40Z" fill="${hc}"/>`;
  else if(c.hair==="mono") s+=`<path d="M64 72Q62 36 100 36Q138 36 136 72Q130 52 100 52Q72 52 64 72Z" fill="${hc}"/><circle cx="100" cy="30" r="14" fill="${hc}"/>`;
  /* tocados */
  if(c.head==="corona") s+=coronaPath(66,6,1);
  if(c.head==="coronita") s+=coronaPath(77,22,.68);
  if(c.head==="tiara") s+=`<path d="M72 44Q100 20 128 44Q100 34 72 44Z" fill="${P.gold}"/><circle cx="100" cy="32" r="4" fill="${P.sky}"/>`;
  if(pose==="saludo") s+=`<path d="M184 30l10-6M186 46h12M182 60l10 6" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/>`;
  return `<g class="${c.anim||"bob"}">${s}</g>`;
}
function persona(o={}){return svgW("0 0 200 300",personaG(o));}

/* Rey bebé en un trono enorme, con la corona que le baila */
function bebeRey(){
  let s=`<path d="M30 72Q110 0 190 72V252H30Z" fill="${P.red}"/><path d="M30 72Q110 0 190 72V252H30Z" fill="none" stroke="${P.gold2}" stroke-width="9"/><circle cx="110" cy="26" r="11" fill="${P.gold}"/>`;
  s+=`<rect x="8" y="168" width="34" height="44" rx="8" fill="${P.gold}"/><rect x="178" y="168" width="34" height="44" rx="8" fill="${P.gold}"/><rect x="16" y="204" width="188" height="36" rx="9" fill="${P.gold2}"/><rect x="28" y="238" width="18" height="56" fill="${P.gold2}"/><rect x="174" y="238" width="18" height="56" fill="${P.gold2}"/>`;
  s+=`<g class="bob"><ellipse cx="92" cy="240" rx="15" ry="10" fill="${P.sky2}"/><ellipse cx="128" cy="240" rx="15" ry="10" fill="${P.sky2}"/><ellipse cx="110" cy="204" rx="40" ry="42" fill="${P.sky}"/><circle cx="72" cy="198" r="11" fill="${P.sk}"/><circle cx="148" cy="198" r="11" fill="${P.sk}"/>`;
  s+=`<circle cx="110" cy="142" r="40" fill="${P.sk}"/><ellipse cx="96" cy="142" rx="5.5" ry="7.5" fill="${P.ink}"/><ellipse cx="124" cy="142" rx="5.5" ry="7.5" fill="${P.ink}"/><circle cx="98" cy="139" r="2" fill="#fff"/><circle cx="126" cy="139" r="2" fill="#fff"/><circle cx="84" cy="156" r="7" fill="${P.pink}" opacity=".5"/><circle cx="136" cy="156" r="7" fill="${P.pink}" opacity=".5"/><circle cx="110" cy="164" r="9" fill="${P.coral}"/><circle cx="110" cy="164" r="4" fill="${P.paper}"/><path d="M106 104q10-10 12 4" stroke="${P.hair}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s+=`<g class="wig">${coronaPath(62,60,1.42)}</g></g>`;
  return svgW("0 0 220 300",s);
}

/* ---------- BARAJA ESPAÑOLA ---------- */
function paloG(name){
  if(name==="oros") return `<circle cx="50" cy="50" r="44" fill="${P.gold}"/><circle cx="50" cy="50" r="31" fill="${P.gold2}"/><circle cx="50" cy="50" r="20" fill="${P.gold}"/><circle cx="50" cy="50" r="8" fill="${P.red}"/>`+[0,45,90,135,180,225,270,315].map(a=>`<circle cx="${50+37.5*Math.cos(a*Math.PI/180)}" cy="${50+37.5*Math.sin(a*Math.PI/180)}" r="3" fill="${P.red2}"/>`).join("");
  if(name==="copas") return `<ellipse cx="50" cy="18" rx="30" ry="7" fill="${P.gold}"/><path d="M20 18h60q0 38-30 42-30-4-30-42Z" fill="${P.red}"/><path d="M50 18h30q0 38-30 42Z" fill="#000" opacity=".15"/><rect x="45" y="58" width="10" height="24" fill="${P.gold2}"/><ellipse cx="50" cy="86" rx="24" ry="8" fill="${P.gold2}"/><circle cx="50" cy="36" r="6" fill="${P.gold}"/>`;
  if(name==="espadas") return `<g transform="rotate(-30 50 50)"><path d="M46 2h8v66l-4 8-4-8Z" fill="${P.sky}"/><path d="M50 2h4v66l-4 8Z" fill="#000" opacity=".15"/><rect x="30" y="64" width="40" height="8" rx="3" fill="${P.gold2}"/><rect x="46" y="72" width="8" height="18" fill="${P.brown}"/><circle cx="50" cy="94" r="6" fill="${P.gold}"/></g>`;
  return `<g transform="rotate(-24 50 50)"><path d="M42 8Q58 0 62 16L58 92Q50 100 42 92L38 22Q36 12 42 8Z" fill="${P.brown}"/><path d="M50 4Q58 4 62 16L58 92Q54 96 50 96Z" fill="#000" opacity=".15"/><circle cx="44" cy="34" r="5" fill="${P.brown2}"/><circle cx="56" cy="56" r="5" fill="${P.brown2}"/><circle cx="46" cy="76" r="4" fill="${P.brown2}"/><path d="M60 20q14-8 18 4-12 2-18-4Z" fill="${P.green}"/></g>`;
}
function palo(name,cls="float"){return svgW("0 0 100 100",`<g class="${cls}">${paloG(name)}</g>`);}
const PALO_COL={oros:P.gold2,copas:P.red,espadas:P.sky2,bastos:P.brown};
function carta(paloName="oros",figura={tipo:"rey"}){
  const col=PALO_COL[paloName];
  let s=`<rect x="4" y="4" width="212" height="332" rx="18" fill="${P.card}" stroke="${P.ink}" stroke-width="4"/><rect x="16" y="16" width="188" height="308" rx="10" fill="none" stroke="${col}" stroke-width="4"/>`;
  s+=`<text x="30" y="56" font-size="34" font-weight="800" fill="${P.ink}" font-family="Bricolage Grotesque,sans-serif">12</text><text x="190" y="304" font-size="34" font-weight="800" fill="${P.ink}" font-family="Bricolage Grotesque,sans-serif" text-anchor="end">12</text>`;
  s+=`<g transform="translate(150 26) scale(.42)">${paloG(paloName)}</g><g transform="translate(28 268) scale(.42)">${paloG(paloName)}</g>`;
  s+=`<g transform="translate(26 44) scale(.84)">${personaG({...figura,anim:"none"})}</g>`;
  return svgW("0 0 220 340",s);
}
function dorso(){
  let s=`<rect x="4" y="4" width="212" height="332" rx="18" fill="${P.navy}" stroke="${P.ink}" stroke-width="4"/><rect x="16" y="16" width="188" height="308" rx="10" fill="none" stroke="${P.gold}" stroke-width="3"/>`;
  for(let r=0;r<9;r++)for(let c=0;c<6;c++){const x=30+c*32+(r%2?16:0),y=32+r*34;if(x<200)s+=`<path d="M${x} ${y-9}l9 9-9 9-9-9Z" fill="${P.navy2}"/>`;}
  s+=`<circle cx="110" cy="170" r="46" fill="${P.red}" stroke="${P.gold}" stroke-width="5"/>${coronaPath(76,140,1)}`;
  return svgW("0 0 220 340",s);
}
function abanico(){
  return svgW("0 0 300 260",[-30,-15,0,15,30].map((r,k)=>`<g transform="rotate(${r} 150 250)"><rect x="100" y="40" width="100" height="160" rx="12" fill="${k===2?P.card:P.navy}" stroke="${P.ink}" stroke-width="4"/>${k===2?`<g transform="translate(113 60) scale(.37)">${personaG({tipo:"rey",anim:"none"})}</g>`:`<rect x="110" y="50" width="80" height="140" rx="8" fill="none" stroke="${P.gold}" stroke-width="3"/>`}</g>`).join(""));
}
function coronaObj(){return svgW("0 0 80 60",`<g class="bob">${coronaPath(6,6,1)}</g>`);}

/* ---------- INSTITUCIONES Y OBJETOS ---------- */
function hemiciclo(){
  const cols=[P.coral,P.sky,P.mint,P.gold,P.paper];let s="",n=0;
  [[70,7],[100,10],[130,13],[160,16]].forEach(([r,k])=>{for(let j=0;j<k;j++){const a=Math.PI*(j/(k-1));s+=`<circle cx="${180-r*Math.cos(a)}" cy="${186-r*Math.sin(a)}" r="9" fill="${cols[(n++)%5]}"/>`;}});
  s+=`<rect x="156" y="160" width="48" height="30" rx="4" fill="${P.gold2}"/><rect x="164" y="150" width="32" height="14" rx="3" fill="${P.gold}"/>`;
  return svgW("0 0 360 200",s);
}
function dado(n){
  const pos={1:[[50,50]],2:[[30,30],[70,70]],3:[[28,28],[50,50],[72,72]],4:[[30,30],[70,30],[30,70],[70,70]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[30,26],[70,26],[30,50],[70,50],[30,74],[70,74]]}[n];
  return svgW("0 0 100 100",`<g class="roll"><rect x="6" y="6" width="88" height="88" rx="18" fill="${P.paper}"/><rect x="6" y="80" width="88" height="14" rx="7" fill="#000" opacity=".1"/>${pos.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${P.red}"/>`).join("")}</g>`);
}
function cupula(){
  return svgW("0 0 220 280",`<path d="M14 260V120Q14 14 110 14Q206 14 206 120V260" fill="rgba(140,200,255,.16)" stroke="rgba(214,236,255,.85)" stroke-width="5"/><path class="shine" d="M44 120Q46 50 102 38" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/><path class="shine" d="M40 150v40" stroke="#fff" stroke-width="10" stroke-linecap="round"/><rect x="0" y="256" width="220" height="22" rx="8" fill="${P.gold2}"/>`);
}
function mochila(){
  return svgW("0 0 140 160",`<g class="bob"><path d="M44 30q0-24 26-24t26 24" stroke="${P.red2}" stroke-width="9" fill="none"/><rect x="18" y="28" width="104" height="124" rx="26" fill="${P.coral}"/><path d="M18 60q52 26 104 0V54q0-26-26-26H44q-26 0-26 26Z" fill="${P.red}"/><rect x="40" y="96" width="60" height="40" rx="10" fill="${P.red}"/><rect x="62" y="70" width="16" height="12" rx="3" fill="${P.gold}"/><text x="70" y="124" text-anchor="middle" font-size="22" font-weight="800" fill="${P.paper}" font-family="Bricolage Grotesque,sans-serif">!</text></g>`);
}
function pergamino(txt=""){
  return svgW("0 0 220 260",`<g class="float"><rect x="30" y="30" width="160" height="200" fill="${P.card}"/><rect x="18" y="14" width="184" height="30" rx="15" fill="${P.paper}"/><rect x="18" y="216" width="184" height="30" rx="15" fill="${P.paper}"/><rect x="18" y="14" width="184" height="30" rx="15" fill="#000" opacity=".08"/><text x="110" y="86" text-anchor="middle" font-size="${txt.length>10?20:txt.length>6?26:40}" font-weight="800" fill="${P.ink}" font-family="Bricolage Grotesque,sans-serif">${txt}</text>${[110,130,150,170].map(y=>`<rect x="52" y="${y}" width="${y===170?80:116}" height="6" rx="3" fill="${P.grey}"/>`).join("")}<circle cx="168" cy="196" r="20" fill="${P.red}"/><path d="M158 212l-6 26 16-10 16 10-6-26" fill="${P.red2}"/></g>`);
}
function documento(o={}){
  let s=`<path d="M20 10h120l40 40v200H20Z" fill="${P.card}"/><path d="M140 10v40h40Z" fill="${P.grey}"/>${[70,92,114,136].map(y=>`<rect x="40" y="${y}" width="${y===136?80:120}" height="7" rx="3.5" fill="${P.grey}"/>`).join("")}`;
  if(o.firma!==false) s+=`<path class="draw" d="M40 206q14-34 24-6t18-4 14-14 12 18 22-8 16 4" stroke="${P.navy}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="36" y="222" width="130" height="3" fill="${P.ink}" opacity=".4"/>`;
  if(o.tachado) s+=`<path class="draw" d="M30 30L170 240M170 30L30 240" stroke="${P.red}" stroke-width="16" stroke-linecap="round"/>`;
  return svgW("0 0 200 270",s);
}
function bolsa(){
  return svgW("0 0 140 160",`<g class="sway"><path d="M54 30h32l-8 16H62Z" fill="${P.gold2}"/><path d="M60 44h20c30 14 48 40 48 66 0 30-26 44-58 44S12 140 12 110c0-26 18-52 48-66Z" fill="${P.gold}"/><path d="M70 44h10c30 14 48 40 48 66 0 30-26 44-58 44Z" fill="#000" opacity=".1"/><path d="M56 40q14 8 28 0" stroke="${P.brown}" stroke-width="6" fill="none"/><text x="70" y="128" text-anchor="middle" font-size="58" font-weight="800" fill="${P.brown2}" font-family="Bricolage Grotesque,sans-serif">€</text></g>`);
}
function palacio(){
  let s=`<rect x="20" y="90" width="280" height="110" fill="${P.paper}"/><rect x="110" y="60" width="100" height="140" fill="${P.card}"/><path d="M100 64L160 24 220 64Z" fill="${P.gold}"/><rect x="20" y="84" width="280" height="10" fill="${P.gold2}"/>`;
  [40,70,240,270].forEach(x=>{[110,150].forEach(y=>s+=`<rect x="${x}" y="${y}" width="16" height="24" rx="8" fill="${P.sky2}"/>`);});
  [124,148,172,196].forEach(x=>s+=`<rect x="${x-4}" y="80" width="10" height="120" fill="${P.grey}"/>`);
  s+=`<path d="M146 200v-40a14 14 0 0 1 28 0v40Z" fill="${P.brown}"/><rect x="0" y="198" width="320" height="10" rx="4" fill="${P.gold2}"/><rect x="158" y="0" width="4" height="30" fill="${P.ink}"/><g class="sway"><rect x="162" y="2" width="36" height="7" fill="${P.red}"/><rect x="162" y="9" width="36" height="10" fill="${P.gold}"/><rect x="162" y="19" width="36" height="7" fill="${P.red}"/></g>`;
  return svgW("0 0 320 210",s);
}
function arco(n,col=P.gold){
  return svgW("0 0 200 260",`<rect x="18" y="110" width="36" height="146" rx="6" fill="${col}"/><rect x="146" y="110" width="36" height="146" rx="6" fill="${col}"/><path d="M14 124Q100 0 186 124H150Q100 56 50 124Z" fill="${col}"/><rect x="18" y="110" width="36" height="146" rx="6" fill="#000" opacity=".12"/><circle cx="100" cy="44" r="28" fill="${P.paper}"/><text x="100" y="56" text-anchor="middle" font-size="34" font-weight="800" fill="${P.ink}" font-family="Bricolage Grotesque,sans-serif">${n}</text>`);
}
function anillosRotos(){
  return svgW("0 0 200 140",`<circle cx="78" cy="74" r="40" fill="none" stroke="${P.gold}" stroke-width="12"/><circle cx="124" cy="74" r="40" fill="none" stroke="${P.gold2}" stroke-width="12" stroke-dasharray="70 18"/><path d="M100 20l-8 22 12 6-10 24" stroke="${P.coral}" stroke-width="6" fill="none" stroke-linecap="round"/><g class="pulse"><circle cx="100" cy="74" r="62" fill="none" stroke="${P.coral}" stroke-width="10"/><path d="M56 30l88 88" stroke="${P.coral}" stroke-width="10"/></g>`);
}
function silbato(){
  return svgW("0 0 120 80",`<g class="wig"><path d="M10 26h56a22 22 0 1 1-18 30H10Z" fill="${P.grey}"/><rect x="8" y="16" width="24" height="14" rx="3" fill="${P.grey}"/><circle cx="66" cy="44" r="7" fill="${P.ink}"/><path d="M90 30q20-16 26 10" stroke="${P.red}" stroke-width="4" fill="none"/><path d="M14 10l-6-6M24 8v-8" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/></g>`);
}
function globo(){
  return svgW("0 0 200 240",`<g class="bob"><rect x="78" y="196" width="10" height="34" rx="4" fill="${P.ink}"/><rect x="112" y="196" width="10" height="34" rx="4" fill="${P.ink}"/><circle cx="100" cy="110" r="88" fill="${P.sky2}"/><path d="M40 70q20-20 40-6t10 30-26 10-24-34ZM120 120q26-6 40 10t-14 34-30-10 4-34ZM110 40q20 0 26 12-18 6-26-12Z" fill="${P.mint}"/><ellipse cx="78" cy="108" rx="7" ry="9" fill="${P.ink}"/><ellipse cx="122" cy="108" rx="7" ry="9" fill="${P.ink}"/><path d="M84 136q16 14 32 0" stroke="${P.ink}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="170" y="70" width="12" height="70" rx="6" fill="${P.sky2}" transform="rotate(-40 176 140)"/><g class="clink"><path d="M150 14h30q0 24-15 28-15-4-15-28Z" fill="${P.gold}"/><rect x="162" y="40" width="6" height="12" fill="${P.gold2}"/></g></g>`);
}
function venn(a,b,mid){
  return svgW("0 0 580 400",`<circle cx="210" cy="200" r="168" fill="${P.coral}" opacity=".35"/><circle cx="370" cy="200" r="168" fill="${P.sky}" opacity=".35"/><circle cx="210" cy="200" r="168" fill="none" stroke="${P.coral}" stroke-width="5"/><circle cx="370" cy="200" r="168" fill="none" stroke="${P.sky}" stroke-width="5"/><text x="120" y="110" text-anchor="middle" font-size="34" font-weight="800" fill="${P.paper}" font-family="Bricolage Grotesque,sans-serif">${a}</text><text x="460" y="110" text-anchor="middle" font-size="34" font-weight="800" fill="${P.paper}" font-family="Bricolage Grotesque,sans-serif">${b}</text>${mid.split("·").map((t,k,arr)=>`<text x="290" y="${200-(arr.length-1)*16+k*34}" text-anchor="middle" font-size="25" font-weight="800" fill="${P.gold}" font-family="Figtree,sans-serif">${t.trim()}</text>`).join("")}`);
}
/* Familia: bebé con dos progenitores (ejemplo para temas como el permiso por nacimiento) */
function familia(){
  return svgW("0 0 420 300",`<g transform="translate(0 0)">${personaG({tipo:"madre"})}</g><g transform="translate(220 0)">${personaG({tipo:"padre"})}</g><g transform="translate(122 112) scale(.74)"><g class="bob"><ellipse cx="120" cy="206" rx="78" ry="50" fill="${P.paper}"/><ellipse cx="120" cy="214" rx="78" ry="42" fill="${P.sky}" opacity=".6"/><circle cx="120" cy="140" r="48" fill="${P.sk}"/><ellipse cx="104" cy="140" rx="6" ry="8" fill="${P.ink}"/><ellipse cx="136" cy="140" rx="6" ry="8" fill="${P.ink}"/><path d="M106 162q14 10 28 0" stroke="${P.ink}" stroke-width="5" fill="none"/><circle cx="90" cy="156" r="8" fill="${P.pink}" opacity=".5"/><circle cx="150" cy="156" r="8" fill="${P.pink}" opacity=".5"/><path d="M110 96q10-12 14 4" stroke="${P.hair}" stroke-width="5" fill="none" stroke-linecap="round"/></g></g><path class="pulse" d="M210 60c-10-14-30-6-24 8l24 22 24-22c6-14-14-22-24-8Z" fill="${P.coral}"/>`);
}

const ILU={persona,personaG,bebeRey,carta,dorso,abanico,palo,coronaObj,hemiciclo,dado,cupula,mochila,pergamino,documento,bolsa,palacio,arco,anillosRotos,silbato,globo,venn,familia,P};
