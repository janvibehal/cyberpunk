import { useState, useEffect, useRef, useCallback } from "react";

const STYLES = 
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&display=swap');

  :root {
    --abyss:     #020b12;
    --cyan:      #00ffe7;
    --cyan-dim:  rgba(0,255,231,0.25);
    --cyan-glow: rgba(0,255,231,0.08);
    --magenta:   #ff2d78;
    --blue:      #3d9eff;
    --gold:      #ffd166;
    --tp:        #c8eef0;
    --td:        #4a8a90;
    --scan:      rgba(0,255,231,0.024);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--abyss);
    color: var(--tp);
    font-family: 'Rajdhani', sans-serif;
    overflow-x: hidden;
    cursor: none;
    min-width: 900px;
  }

  .pc  { position:fixed; top:0; left:0; width:22px; height:22px; border:1.5px solid var(--cyan); border-radius:50%; pointer-events:none; z-index:9900; transform:translate(-50%,-50%); mix-blend-mode:screen; will-change:left,top; }
  .pcd { position:fixed; top:0; left:0; width:4px; height:4px; background:var(--cyan); border-radius:50%; pointer-events:none; z-index:9901; transform:translate(-50%,-50%); box-shadow:0 0 6px var(--cyan); will-change:left,top; }
  .scl { position:fixed; inset:0; pointer-events:none; z-index:800; background:repeating-linear-gradient(0deg,transparent 0px,transparent 3px,var(--scan) 3px,var(--scan) 4px); }

  .orb  { font-family:'Orbitron',monospace; }
  .mono { font-family:'Share Tech Mono',monospace; }

  /* ── Page transition ── */
  @keyframes crackIn {
    0%   { opacity:0; transform:scale(1.04) skewX(0deg); filter:brightness(3) hue-rotate(180deg); }
    15%  { opacity:1; transform:scale(1.02) skewX(-1.5deg); filter:brightness(2) hue-rotate(90deg); }
    30%  { transform:scale(0.99) skewX(1deg); filter:brightness(1.5) hue-rotate(40deg); }
    50%  { transform:scale(1.005) skewX(-0.5deg); filter:brightness(1.2); }
    70%  { transform:scale(1) skewX(0deg); filter:brightness(1.05); }
    100% { transform:scale(1) skewX(0deg); filter:brightness(1); opacity:1; }
  }
  @keyframes flashOverlay {
    0%   { opacity:1; }
    25%  { opacity:0.7; }
    50%  { opacity:0.3; }
    75%  { opacity:0.15; }
    100% { opacity:0; }
  }
  @keyframes glitchSlice1 {
    0%  { clip-path:inset(8% 0 85% 0); transform:translateX(-12px); opacity:1; }
    20% { clip-path:inset(40% 0 40% 0); transform:translateX(8px); }
    40% { clip-path:inset(70% 0 10% 0); transform:translateX(-6px); }
    60% { clip-path:inset(20% 0 65% 0); transform:translateX(10px); }
    80% { clip-path:inset(55% 0 30% 0); transform:translateX(-4px); }
    100%{ clip-path:inset(0% 0 100% 0); transform:translateX(0); opacity:0; }
  }
  @keyframes glitchSlice2 {
    0%  { clip-path:inset(50% 0 30% 0); transform:translateX(10px); opacity:1; }
    25% { clip-path:inset(15% 0 70% 0); transform:translateX(-14px); }
    50% { clip-path:inset(80% 0 5% 0);  transform:translateX(6px); }
    75% { clip-path:inset(35% 0 50% 0); transform:translateX(-8px); }
    100%{ clip-path:inset(0% 0 100% 0); transform:translateX(0); opacity:0; }
  }
  @keyframes glitchSlice3 {
    0%  { clip-path:inset(25% 0 55% 0); transform:translateX(-8px) scaleX(1.02); opacity:1; }
    33% { clip-path:inset(60% 0 20% 0); transform:translateX(12px) scaleX(0.98); }
    66% { clip-path:inset(5% 0 80% 0);  transform:translateX(-10px) scaleX(1.01); }
    100%{ clip-path:inset(0% 0 100% 0); transform:translateX(0); opacity:0; }
  }
  @keyframes crackLineGrow {
    0%   { stroke-dashoffset: 1000; opacity:0.9; }
    60%  { stroke-dashoffset: 0; opacity:0.7; }
    100% { stroke-dashoffset: 0; opacity:0; }
  }
  @keyframes scanFlash {
    0%,100% { opacity:0; }
    10%,30%,50% { opacity:1; }
    20%,40% { opacity:0.3; }
  }
  @keyframes rgbSplit {
    0%   { text-shadow: -8px 0 #ff2d78, 8px 0 #00ffe7; }
    25%  { text-shadow: 6px 0 #ff2d78, -6px 0 #00ffe7; }
    50%  { text-shadow: -4px 0 #ff2d78, 4px 0 #00ffe7; }
    75%  { text-shadow: 8px 0 #ff2d78, -8px 0 #00ffe7; }
    100% { text-shadow: 0 0 transparent; }
  }

  /* ── Existing animations ── */
  @keyframes bioPulse { 0%,100%{ opacity:.45; transform:scale(1); } 50%{ opacity:1; transform:scale(1.07); } }
  @keyframes floatY   { 0%,100%{ transform:translateY(0px); } 50%{ transform:translateY(-12px); } }
  @keyframes hueR     { 0%,100%{ filter:hue-rotate(0deg); }  50%{ filter:hue-rotate(35deg); } }
  @keyframes blob     { 0%,100%{ border-radius:60% 40% 55% 45%/50% 60% 40% 50%; } 33%{ border-radius:45% 55% 40% 60%/60% 40% 55% 45%; } 66%{ border-radius:55% 45% 60% 40%/45% 55% 50% 50%; } }
  @keyframes g1 { 0%,100%{ clip-path:inset(0 0 95% 0); transform:translateX(-2px); } 20%{ clip-path:inset(30% 0 50% 0); transform:translateX(2px); } 40%{ clip-path:inset(60% 0 20% 0); transform:translateX(-1px); } 60%{ clip-path:inset(80% 0 5% 0); transform:translateX(3px); } 80%{ clip-path:inset(10% 0 70% 0); transform:translateX(-2px); } }
  @keyframes g2 { 0%,100%{ clip-path:inset(50% 0 30% 0); transform:translateX(2px); color:var(--magenta); } 25%{ clip-path:inset(20% 0 60% 0); transform:translateX(-3px); } 50%{ clip-path:inset(70% 0 10% 0); transform:translateX(1px); } 75%{ clip-path:inset(5% 0 85% 0); transform:translateX(-2px); color:var(--cyan); } }
  @keyframes ticker  { from{ transform:translateX(100vw); } to{ transform:translateX(-100%); } }
  @keyframes rOut    { 0%{ transform:scale(0.2); opacity:.9; } 100%{ transform:scale(3); opacity:0; } }
  @keyframes dScan   { 0%{ top:0; } 100%{ top:100%; } }
  @keyframes fadeUp  { from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes bPulse  { 0%,100%{ box-shadow:0 0 6px var(--cyan-dim),inset 0 0 6px var(--cyan-glow); } 50%{ box-shadow:0 0 22px var(--cyan-dim),inset 0 0 14px var(--cyan-glow); } }
  @keyframes pDrift  { 0%{ opacity:.7; transform:translate(0,0) scale(1); } 100%{ opacity:0; transform:translate(var(--pdx),var(--pdy)) scale(0); } }

  .glitch { position:relative; display:block; }
  .glitch::before,.glitch::after { content:attr(data-text); position:absolute; top:0; left:0; width:100%; height:100%; font:inherit; color:inherit; pointer-events:none; }
  .glitch::before { animation:g1 4s infinite; color:var(--cyan); }
  .glitch::after  { animation:g2 4s infinite 0.2s; color:var(--magenta); }

  .holo { position:relative; overflow:hidden; background:linear-gradient(155deg,rgba(0,30,65,.55) 0%,rgba(2,11,18,.92) 60%,rgba(0,50,140,.06) 100%); border:1px solid rgba(0,255,231,.18); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); box-shadow:inset 0 1px 0 rgba(0,255,231,.14),inset 0 0 28px rgba(0,18,55,.35),0 4px 24px rgba(0,0,0,.5); transition:border-color .28s,box-shadow .28s; }
  .holo::before { content:''; position:absolute; top:0; left:-110%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,255,231,.06),rgba(61,158,255,.04),transparent); transition:left .55s ease; pointer-events:none; }
  .holo:hover { border-color:rgba(0,255,231,.55); box-shadow:0 0 28px var(--cyan-dim),inset 0 0 18px var(--cyan-glow); }
  .holo:hover::before { left:160%; }

  .ds { position:relative; }
  .ds::after { content:''; position:absolute; left:0; width:100%; height:2px; background:linear-gradient(90deg,transparent,var(--cyan),transparent); animation:dScan 3.5s linear infinite; opacity:.38; pointer-events:none; }

  .glass { position:relative; overflow:hidden; backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); }
  .glass::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,transparent 36%); pointer-events:none; z-index:0; }
  .glass > * { position:relative; z-index:1; }

  .nv { position:relative; }
  .nv::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1px; background:var(--cyan); transition:width .28s; }
  .nv:hover::after,.nv.on::after { width:100%; }

  .tick { animation:ticker 30s linear infinite; white-space:nowrap; display:inline-block; }
  .btl { position:absolute; top:0;    left:0;  width:11px; height:11px; border-top:1px solid var(--cyan); border-left:1px solid var(--cyan); }
  .btr { position:absolute; top:0;    right:0; width:11px; height:11px; border-top:1px solid var(--cyan); border-right:1px solid var(--cyan); }
  .bbl { position:absolute; bottom:0; left:0;  width:11px; height:11px; border-bottom:1px solid var(--cyan); border-left:1px solid var(--cyan); }
  .bbr { position:absolute; bottom:0; right:0; width:11px; height:11px; border-bottom:1px solid var(--cyan); border-right:1px solid var(--cyan); }

  /* page reveal */
  .page-in { animation: crackIn 0.55s ease-out both; }
;

/* ── Crack lines SVG paths ── */
const CRACK_PATHS = [
  "M 50 0 L 45 15 L 52 28 L 38 55 L 48 80 L 35 100",
  "M 50 0 L 58 20 L 70 35 L 62 60 L 75 85 L 68 100",
  "M 50 0 L 30 25 L 42 45 L 25 70 L 40 100",
  "M 50 0 L 65 18 L 80 40 L 72 65 L 85 100",
  "M 50 0 L 20 30 L 35 50 L 15 80 L 28 100",
  "M 50 0 L 75 22 L 88 48 L 78 72 L 92 100",
];

/* ── Screen crack + glitch overlay ── */
function CrackTransition({ active, label }) {
  if (!active) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9500,
      pointerEvents:"none", overflow:"hidden",
    }}>
      {/* White flash */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(135deg,rgba(0,255,231,0.15),rgba(255,45,120,0.12),rgba(0,100,255,0.1))",
        animation:"flashOverlay 0.5s ease-out forwards",
      }}/>

      {/* RGB scan line flash */}
      <div style={{
        position:"absolute", inset:0,
        background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,231,0.08) 2px,rgba(0,255,231,0.08) 4px)",
        animation:"scanFlash 0.4s ease-out forwards",
      }}/>

      {/* Glitch slice 1 */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(90deg,rgba(255,45,120,0.06),rgba(0,255,231,0.04))",
        animation:"glitchSlice1 0.45s ease-out forwards",
      }}/>

      {/* Glitch slice 2 */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(90deg,rgba(0,255,231,0.05),rgba(61,158,255,0.04))",
        animation:"glitchSlice2 0.45s ease-out forwards 0.05s",
      }}/>

      {/* Glitch slice 3 */}
      <div style={{
        position:"absolute", inset:0,
        background:"rgba(0,100,255,0.04)",
        animation:"glitchSlice3 0.4s ease-out forwards 0.08s",
      }}/>

      {/* SVG crack lines radiating from center */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        {CRACK_PATHS.map((d, i) => (
          <path key={i} d={d}
            fill="none"
            stroke={i % 2 === 0 ? "#00ffe7" : "#ff2d78"}
            strokeWidth={i < 2 ? "0.5" : "0.3"}
            strokeOpacity="0.8"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{
              animation:`crackLineGrow 0.5s ease-out forwards`,
              animationDelay:`${i * 0.03}s`,
            }}
          />
        ))}
        {/* Center impact point */}
        <circle cx="50" cy="0" r="1.5" fill="#00ffe7" opacity="0.9"
          style={{ animation:"flashOverlay 0.5s ease-out forwards" }}/>
      </svg>

      {/* Page label flash center */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        fontFamily:"'Orbitron',monospace", fontWeight:900,
        fontSize:28, letterSpacing:"0.4em",
        color:"var(--cyan)",
        animation:"flashOverlay 0.5s ease-out forwards, rgbSplit 0.4s ease-out forwards",
        whiteSpace:"nowrap",
      }}>{label}</div>

      {/* Corner sparks */}
      {[[0,0],[100,0],[0,100],[100,100]].map(([x,y],i) => (
        <div key={i} style={{
          position:"absolute",
          left: x === 0 ? 0 : "auto", right: x === 100 ? 0 : "auto",
          top:  y === 0 ? 0 : "auto", bottom: y === 100 ? 0 : "auto",
          width:60, height:60,
          background:`radial-gradient(circle at ${x===0?"0%":"100%"} ${y===0?"0%":"100%"}, rgba(0,255,231,0.4) 0%, transparent 70%)`,
          animation:"flashOverlay 0.45s ease-out forwards",
          animationDelay:`${i*0.04}s`,
        }}/>
      ))}
    </div>
  );
}

/* ── Particles ── */
const PARTICLES = Array.from({ length: 52 }, (_, i) => ({
  id: i, x: Math.random()*100, y: Math.random()*100,
  s: Math.random()*2.4+0.7, dur: Math.random()*9+5, del: Math.random()*7,
  pdx:`${(Math.random()-0.5)*150}px`, pdy:`${-(Math.random()*175+40)}px`,
  col:["#00ffe7","#3d9eff","#005eff","#00b8ff"][Math.floor(Math.random()*4)],
}));

function Particles() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.s, height:p.s, borderRadius:"50%",
          background:p.col, boxShadow:`0 0 ${p.s*3}px ${p.col}`,
          "--pdx":p.pdx, "--pdy":p.pdy,
          animation:`pDrift ${p.dur}s ${p.del}s ease-in infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ── BioOrb ── */
function BioOrb({ size=180, col="#00ffe7", acc="#3d9eff", delay="0s" }) {
  const uid = `o${col.replace("#","").slice(0,4)}${size}${delay.replace(/\D/g,"")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 180 180"
      style={{ display:"block", flexShrink:0, animation:`floatY 6s ${delay} ease-in-out infinite, hueR 9s ease-in-out infinite` }}>
      <defs>
        <radialGradient id={uid} cx="40%" cy="35%">
          <stop offset="0%"   stopColor={acc} stopOpacity=".9"/>
          <stop offset="55%"  stopColor={col} stopOpacity=".5"/>
          <stop offset="100%" stopColor="#020b12" stopOpacity=".96"/>
        </radialGradient>
      </defs>
      <ellipse cx="90" cy="92" rx="56" ry="62" fill={`url(#${uid})`} stroke={col} strokeWidth="1" style={{ animation:"blob 7s ease-in-out infinite" }}/>
      {[0,1,2,3].map(i=><ellipse key={i} cx="90" cy={76+i*14} rx={28-i*2} ry="3.5" fill="none" stroke={col} strokeWidth=".5" strokeOpacity=".45"/>)}
      <circle cx="76"  cy="79" r="6.5" fill="#020b12" stroke={col} strokeWidth="1"/>
      <circle cx="104" cy="79" r="6.5" fill="#020b12" stroke={col} strokeWidth="1"/>
      <circle cx="76"  cy="79" r="2.8" fill={col} style={{ animation:"bioPulse 2.2s ease-in-out infinite" }}/>
      <circle cx="104" cy="79" r="2.8" fill={col} style={{ animation:"bioPulse 2.2s .5s ease-in-out infinite" }}/>
      <path d="M34,82 Q12,67 20,102 Q27,90 34,82Z"     fill={col} fillOpacity=".28" stroke={col} strokeWidth=".8"/>
      <path d="M146,82 Q168,67 160,102 Q153,90 146,82Z" fill={col} fillOpacity=".28" stroke={col} strokeWidth=".8"/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${71+i*9},146 Q${66+i*11},163 ${69+i*7},177`} fill="none" stroke={col} strokeWidth="1.4" strokeOpacity=".55" style={{ animation:`floatY ${3.2+i*.35}s ${i*.25}s ease-in-out infinite` }}/>)}
      <path d="M90,62 L90,47 M83,62 L76,50 M97,62 L104,50" stroke={acc} strokeWidth=".9" strokeOpacity=".85" fill="none"/>
      <circle cx="90" cy="46" r="2.8" fill={acc} style={{ animation:"bioPulse 1.6s ease-in-out infinite" }}/>
    </svg>
  );
}

/* ── HP (Holo Panel) ── */
function HP({ children, style={}, className="" }) {
  return (
    <div className={`holo ds ${className}`} style={style}>
      <div className="btl"/><div className="btr"/>
      <div className="bbl"/><div className="bbr"/>
      {children}
    </div>
  );
}

/* ── SB (Stat Bar) ── */
function SB({ label, value, col="var(--cyan)" }) {
  return (
    <div style={{ marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:10 }}>
        <span className="mono" style={{ color:"var(--td)" }}>{label}</span>
        <span className="mono" style={{ color:col }}>{value}%</span>
      </div>
      <div style={{ width:"100%", height:3, background:"rgba(0,255,231,.08)", borderRadius:2 }}>
        <div style={{ height:3, width:`${value}%`, borderRadius:2, background:`linear-gradient(90deg,${col}70,${col})`, boxShadow:`0 0 7px ${col}` }}/>
      </div>
    </div>
  );
}

/* ── Sea data ── */
const SEAS = [
  { id:"S01", name:"RED SEA",        x:487, y:160, color:"#ff2d78", status:"CONTESTED",  depth:"2,211M",  temp:"-2°C", entities:34, region:"Middle East"   },
  { id:"S02", name:"DEAD SEA",       x:481, y:144, color:"#00ffe7", status:"ACCESSIBLE", depth:"306M",    temp:"4°C",  entities:8,  region:"Levant"        },
  { id:"S03", name:"CASPIAN SEA",    x:512, y:104, color:"#ffd166", status:"NEUTRAL",    depth:"1,025M",  temp:"2°C",  entities:19, region:"Central Asia"  },
  { id:"S04", name:"MEDITERRANEAN",  x:432, y:112, color:"#3d9eff", status:"NEUTRAL",    depth:"5,267M",  temp:"1°C",  entities:27, region:"Southern EU"   },
  { id:"S05", name:"NORTH ATLANTIC", x:295, y:133, color:"#00ffe7", status:"ACCESSIBLE", depth:"8,376M",  temp:"-3°C", entities:42, region:"North Atlantic"},
  { id:"S06", name:"MARIANA TRENCH", x:728, y:158, color:"#ff2d78", status:"RESTRICTED", depth:"10,994M", temp:"-4°C", entities:61, region:"Pacific"       },
  { id:"S07", name:"PACIFIC ABYSS",  x:750, y:198, color:"#ff2d78", status:"RESTRICTED", depth:"10,935M", temp:"-4°C", entities:55, region:"Pacific"       },
  { id:"S08", name:"CORAL SEA",      x:716, y:264, color:"#00ffe7", status:"ACCESSIBLE", depth:"2,394M",  temp:"8°C",  entities:29, region:"South Pacific" },
  { id:"S09", name:"INDIAN OCEAN",   x:560, y:248, color:"#ffd166", status:"CONTESTED",  depth:"7,906M",  temp:"-1°C", entities:37, region:"Indian Ocean"  },
  { id:"S10", name:"ARCTIC BREACH",  x:450, y:22,  color:"#3d9eff", status:"RESTRICTED", depth:"5,450M",  temp:"-8°C", entities:14, region:"Arctic"        },
];

/* ══════════════════════════════════════════════
   PAGE COMPONENTS
══════════════════════════════════════════════ */

function HomePage() {
  return (
    <div className="page-in" style={{
      display:"grid", gridTemplateColumns:"1fr 240px 195px",
      columnGap:20, padding:"44px 32px 36px", alignItems:"start",
    }}>
      <div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 13px", marginBottom:20, border:"1px solid rgba(255,45,120,.36)", background:"rgba(255,45,120,.05)" }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:"var(--magenta)",animation:"bioPulse 1.1s ease-in-out infinite",display:"block",flexShrink:0 }}/>
          <span className="mono" style={{ fontSize:9, color:"var(--magenta)", letterSpacing:"0.17em" }}>CLASSIFIED · DEPTH-SECTOR-Ω / PISCES PROTOCOL</span>
        </div>
        <div className="orb" style={{ fontWeight:900, lineHeight:1.0, marginBottom:18 }}>
          <span className="glitch" data-text="SUBMERGED" style={{ fontSize:58, color:"var(--cyan)", display:"block" }}>SUBMERGED</span>
          <span style={{ fontSize:58, color:"var(--tp)", display:"block" }}>CITADEL</span>
          <span className="mono" style={{ fontSize:12, color:"var(--blue)", letterSpacing:"0.38em", fontWeight:400, marginTop:8, display:"block" }}>▸ AQUA · CYBER · NEXUS</span>
        </div>
        <p style={{ color:"var(--td)", fontSize:15, lineHeight:1.72, maxWidth:450, marginBottom:28, fontFamily:"Rajdhani", fontWeight:300 }}>
          In the year 2187, ocean floors became the last frontier. Beneath 3,400 metres of crushing dark water lie the ruins of drowned megacities — now reborn as bio-mechanical fortresses pulsing with stolen current and alien intelligence.
        </p>
        <div style={{ display:"flex", gap:12, marginBottom:34, flexWrap:"wrap" }}>
          <button style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:11, letterSpacing:"0.2em", padding:"12px 28px", background:"linear-gradient(135deg,rgba(0,255,231,.13),rgba(0,255,231,.04))", border:"1px solid var(--cyan)", color:"var(--cyan)", clipPath:"polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)", boxShadow:"0 0 26px rgba(0,255,231,.16)", cursor:"none" }}>◈ ENTER ABYSS</button>
          <button style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, letterSpacing:"0.18em", padding:"12px 22px", background:"none", border:"1px solid rgba(255,209,102,.3)", color:"var(--gold)", cursor:"none" }}>▷ WATCH TRAILER</button>
        </div>
        <div style={{ display:"flex", gap:22 }}>
          {[{label:"DEPTH",value:"3,400M",sub:"ABYSS ZONE"},{label:"SPECIES",value:"147+",sub:"BIO-CYBER"},{label:"CITIES",value:"23",sub:"SUBMERGED"},{label:"PLAYERS",value:"2.1M",sub:"ONLINE NOW"}].map(s=>(
            <div key={s.label} style={{ textAlign:"center" }}>
              <div className="orb" style={{ fontSize:19, color:"var(--cyan)", fontWeight:900 }}>{s.value}</div>
              <div className="mono" style={{ fontSize:9, color:"var(--td)", letterSpacing:"0.12em" }}>{s.label}</div>
              <div className="mono" style={{ fontSize:8, color:"var(--magenta)", letterSpacing:"0.08em" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <HP style={{ padding:18 }}>
        <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em", marginBottom:10, textAlign:"center" }}>ENTITY_SCAN · TYPE-Ω3</div>
        <div style={{ display:"flex", justifyContent:"center" }}><BioOrb size={185} col="#00ffe7" acc="#3d9eff" delay="0s"/></div>
        <div style={{ marginTop:10, textAlign:"center" }}>
          <div className="orb" style={{ fontSize:12, color:"var(--tp)", fontWeight:700 }}>LEVIATHAN MK-VII</div>
          <div className="mono" style={{ fontSize:9, color:"var(--td)", marginBottom:12 }}>Bio-Mechanical Apex Predator</div>
          <SB label="NEURAL SYNC" value={87} col="var(--cyan)"/>
          <SB label="CYBER-CORE"  value={95} col="var(--magenta)"/>
          <SB label="HYDRO-LINK"  value={73} col="var(--blue)"/>
        </div>
      </HP>

      <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
        <HP style={{ padding:13 }}>
          <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em", marginBottom:9 }}>◈ DEPTH MAP</div>
          {[{zone:"SUNLIGHT",depth:"0–200M",color:"#ffd166"},{zone:"TWILIGHT",depth:"200–1,000M",color:"var(--cyan)"},{zone:"MIDNIGHT",depth:"1–4,000M",color:"var(--blue)"},{zone:"ABYSSAL",depth:"4,000M+",color:"var(--magenta)",active:true}].map(z=>(
            <div key={z.zone} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
              <div style={{ width:3,height:20,borderRadius:2,background:z.color,flexShrink:0,boxShadow:z.active?`0 0 8px ${z.color}`:"none" }}/>
              <div style={{ flex:1 }}>
                <div className="mono" style={{ fontSize:9, color:z.active?z.color:"var(--td)" }}>{z.zone}</div>
                <div style={{ fontSize:8, color:"var(--td)", fontFamily:"Share Tech Mono" }}>{z.depth}</div>
              </div>
              {z.active && <span className="mono" style={{ fontSize:8, color:z.color }}>YOU</span>}
            </div>
          ))}
        </HP>
        <HP style={{ padding:13 }}>
          <div className="mono" style={{ fontSize:9, color:"var(--blue)", letterSpacing:"0.15em", marginBottom:8 }}>◈ NEARBY ENTITY</div>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <BioOrb size={72} col="#3d9eff" acc="#00ffe7" delay="1.8s"/>
            <div style={{ flex:1 }}>
              <div className="orb" style={{ fontSize:10, color:"var(--blue)", fontWeight:700 }}>ABYSSAL WRAITH</div>
              <div className="mono" style={{ fontSize:8, color:"var(--td)", marginBottom:6 }}>AI-DRIVEN</div>
              <SB label="THREAT" value={62} col="var(--blue)"/>
            </div>
          </div>
        </HP>
        <HP style={{ padding:13 }}>
          <div className="mono" style={{ fontSize:9, color:"var(--magenta)", letterSpacing:"0.15em", marginBottom:8 }}>◈ BIO-SIGNAL FEED</div>
          {["HYDROKINETIC ANOMALY DETECTED","NEURAL NET BREACH: SECTOR 7","BIOLUMINESCENT SURGE +340%","ENTITY MIGRATION: HEADING DEEP"].map((msg,i)=>(
            <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
              <span style={{ color:"var(--magenta)", fontSize:7, marginTop:2, flexShrink:0 }}>▸</span>
              <span className="mono" style={{ fontSize:8, color:i===1?"var(--magenta)":"var(--td)", lineHeight:1.4 }}>{msg}</span>
            </div>
          ))}
        </HP>
      </div>
    </div>
  );
}

function EntitiesPage() {
  const ENTITIES = [
    { name:"LEVIATHAN MK-VII", type:"Apex Predator",    threat:95, col:"#00ffe7", acc:"#3d9eff", tag:"HOSTILE", depth:"3,400M", origin:"Pacific Abyss",  neural:87, cyber:95 },
    { name:"CHORUS WRAITH",    type:"Hive Mind Node",    threat:72, col:"#3d9eff", acc:"#00ffe7", tag:"NEUTRAL", depth:"2,100M", origin:"Indian Ocean",   neural:64, cyber:71 },
    { name:"IRON NAUTILUS",    type:"Armored Scavenger", threat:58, col:"#ffd166", acc:"#3d9eff", tag:"PASSIVE", depth:"1,200M", origin:"Mediterranean",  neural:45, cyber:82 },
    { name:"VOID ANGLER",      type:"Deep Web Hunter",   threat:88, col:"#ff2d78", acc:"#00ffe7", tag:"HOSTILE", depth:"5,800M", origin:"Mariana Trench", neural:92, cyber:90 },
    { name:"TIDE SPECTER",     type:"Phase Scout",       threat:66, col:"#3d9eff", acc:"#00ffe7", tag:"NEUTRAL", depth:"900M",   origin:"Arctic Breach",  neural:70, cyber:65 },
    { name:"CORAL SENTINEL",   type:"Zone Guardian",     threat:44, col:"#00ffe7", acc:"#3d9eff", tag:"PASSIVE", depth:"450M",   origin:"Coral Sea",      neural:38, cyber:40 },
    { name:"ABYSS KRAKEN",     type:"Territorial Apex",  threat:99, col:"#ff2d78", acc:"#3d9eff", tag:"HOSTILE", depth:"9,200M", origin:"Pacific Abyss",  neural:95, cyber:97 },
    { name:"NEON JELLYFORM",   type:"Bio-Signal Node",   threat:28, col:"#ffd166", acc:"#00ffe7", tag:"PASSIVE", depth:"300M",   origin:"Red Sea",        neural:22, cyber:18 },
  ];
  return (
    <div className="page-in" style={{ padding:"36px 32px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
        <div className="orb" style={{ fontSize:24, fontWeight:900, color:"var(--tp)", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>BIO<span style={{ color:"var(--cyan)" }}>-MECH</span> ENTITIES</div>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,var(--cyan),transparent)" }}/>
        <div className="mono" style={{ fontSize:9, color:"var(--td)", whiteSpace:"nowrap" }}>147 CATALOGUED · 23 HOSTILE</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {ENTITIES.map((e,i)=>(
          <HP key={e.name} style={{ padding:16, animation:`fadeUp .5s ${i*.07}s ease-out both` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span className="mono" style={{ fontSize:8, padding:"3px 7px", background:`${e.col}18`, border:`1px solid ${e.col}55`, color:e.col }}>{e.tag}</span>
              <span className="mono" style={{ fontSize:8, color:"var(--td)" }}>ID_{String(i+1).padStart(3,"0")}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><BioOrb size={100} col={e.col} acc={e.acc} delay={`${i*.7}s`}/></div>
            <div className="orb" style={{ fontSize:11, color:e.col, fontWeight:700, letterSpacing:"0.07em", marginBottom:2 }}>{e.name}</div>
            <div className="mono" style={{ fontSize:9, color:"var(--td)", marginBottom:8 }}>{e.type}</div>
            <div style={{ display:"flex", gap:12, marginBottom:8 }}>
              {[["DEPTH",e.depth],["ORIGIN",e.origin]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:7, color:"var(--td)", fontFamily:"Share Tech Mono" }}>{k}</div><div style={{ fontSize:9, color:"var(--tp)", fontFamily:"Share Tech Mono" }}>{v}</div></div>
              ))}
            </div>
            <SB label="THREAT"     value={e.threat} col={e.col}/>
            <SB label="NEURAL"     value={e.neural} col="var(--cyan)"/>
            <SB label="CYBER-CORE" value={e.cyber}  col="var(--magenta)"/>
          </HP>
        ))}
      </div>
      <div className="glass" style={{ padding:"16px 22px", border:"1px solid rgba(0,255,231,.14)", background:"linear-gradient(90deg,rgba(0,26,52,.8),rgba(2,11,18,.95))", display:"flex", alignItems:"center", gap:32 }}>
        <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em" }}>◈ THREAT MATRIX OVERVIEW</div>
        {[{label:"HOSTILE",count:3,col:"#ff2d78"},{label:"NEUTRAL",count:2,col:"#3d9eff"},{label:"PASSIVE",count:3,col:"#ffd166"},{label:"AVG THREAT",count:"65%",col:"var(--cyan)"}].map(x=>(
          <div key={x.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:x.col,boxShadow:`0 0 6px ${x.col}` }}/>
            <div><div style={{ fontSize:7, color:"var(--td)", fontFamily:"Share Tech Mono" }}>{x.label}</div><div className="orb" style={{ fontSize:13, color:x.col, fontWeight:700 }}>{x.count}</div></div>
          </div>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <div style={{ fontSize:7, color:"var(--td)", fontFamily:"Share Tech Mono", marginBottom:3 }}>SCAN COVERAGE</div>
          <div style={{ width:180, height:4, background:"rgba(0,255,231,.08)", borderRadius:2 }}>
            <div style={{ width:"78%", height:4, borderRadius:2, background:"linear-gradient(90deg,var(--blue),var(--cyan))", boxShadow:"0 0 8px var(--cyan)" }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function DualityPage() {
  const OT = [{label:"BIOLUMINESCENCE",value:98,desc:"Self-generated light via chemical reaction"},{label:"NEURAL PLASTICITY",value:87,desc:"Adaptive intelligence formed by deep-sea pressure"},{label:"CELL REGENERATION",value:92,desc:"Rapid tissue repair at extreme depths"},{label:"SONAR SENSITIVITY",value:76,desc:"Echolocation range up to 40km"}];
  const CT = [{label:"PROCESSING POWER",value:99,desc:"Distributed AI cores harvesting tidal current"},{label:"NETWORK SYNC",value:94,desc:"Real-time mesh with all submerged nodes"},{label:"ARMOR DENSITY",value:88,desc:"Titanium-coral composite exoskeleton"},{label:"SIGNAL RANGE",value:82,desc:"Encrypted comms across full ocean basin"}];
  return (
    <div className="page-in" style={{ padding:"36px 32px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
        <div className="orb" style={{ fontSize:24, fontWeight:900, color:"var(--tp)", letterSpacing:"0.1em" }}>ORGANIC <span style={{ color:"var(--cyan)" }}>VS CYBER</span></div>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,var(--cyan),transparent)" }}/>
        <div className="mono" style={{ fontSize:9, color:"var(--td)" }}>DUALITY INDEX · SECTOR Ω</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 1fr", gap:20, marginBottom:24 }}>
        <div style={{ padding:"20px 22px", background:"linear-gradient(155deg,rgba(0,40,90,.5),rgba(2,11,18,.9))", border:"1px solid rgba(0,255,231,.2)", backdropFilter:"blur(18px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <BioOrb size={80} col="#00ffe7" acc="#3d9eff" delay="0s"/>
            <div><div className="orb" style={{ fontSize:26, fontWeight:900, color:"var(--blue)", letterSpacing:"0.08em" }}>ORGANIC</div><div className="mono" style={{ fontSize:10, color:"var(--td)", marginTop:4 }}>ANCIENT · FLUID · ALIVE</div></div>
          </div>
          <p className="mono" style={{ fontSize:11, color:"var(--td)", lineHeight:1.75, marginBottom:16 }}>Ancient creatures evolved over millennia, carrying the memory of a world before the flood.</p>
          {OT.map(t=>(
            <div key={t.label} style={{ marginBottom:10 }}><SB label={t.label} value={t.value} col="var(--cyan)"/><div className="mono" style={{ fontSize:8, color:"var(--td)", marginTop:-4 }}>{t.desc}</div></div>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            {["#00ffe7","#3d9eff","#005eff"].map(c=><div key={c} style={{ width:30,height:30,borderRadius:"50%",background:c,opacity:.7,animation:"bioPulse 3s ease-in-out infinite",boxShadow:`0 0 14px ${c}` }}/>)}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:1, flex:1, background:"linear-gradient(to bottom,var(--blue),var(--magenta))" }}/>
          <div className="orb" style={{ fontSize:18, fontWeight:900, color:"var(--tp)", padding:"12px 0", textShadow:"0 0 18px rgba(255,255,255,.25)" }}>VS</div>
          <div style={{ width:1, flex:1, background:"linear-gradient(to bottom,var(--magenta),var(--blue))" }}/>
        </div>
        <div style={{ padding:"20px 22px", background:"linear-gradient(155deg,rgba(60,0,40,.5),rgba(2,11,18,.9))", border:"1px solid rgba(255,45,120,.2)", backdropFilter:"blur(18px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <BioOrb size={80} col="#ff2d78" acc="#3d9eff" delay="1s"/>
            <div><div className="orb" style={{ fontSize:26, fontWeight:900, color:"var(--magenta)", letterSpacing:"0.08em" }}>CYBER</div><div className="mono" style={{ fontSize:10, color:"var(--td)", marginTop:4 }}>COLD · PRECISE · NETWORKED</div></div>
          </div>
          <p className="mono" style={{ fontSize:11, color:"var(--td)", lineHeight:1.75, marginBottom:16 }}>Engineered constructs born from the wreckage of drowned cities. Networked, harvesting neural current.</p>
          {CT.map(t=>(
            <div key={t.label} style={{ marginBottom:10 }}><SB label={t.label} value={t.value} col="var(--magenta)"/><div className="mono" style={{ fontSize:8, color:"var(--td)", marginTop:-4 }}>{t.desc}</div></div>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"flex-end" }}>
            {["#ff2d78","#ff6eb0","#ff0055"].map(c=><div key={c} style={{ width:30,height:30,borderRadius:4,background:c,opacity:.7,animation:"bioPulse 2.6s ease-in-out infinite",boxShadow:`0 0 14px ${c}`,transform:"rotate(45deg)" }}/>)}
          </div>
        </div>
      </div>
      <HP style={{ padding:"16px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div><div className="orb" style={{ fontSize:12, fontWeight:900, letterSpacing:"0.2em", background:"linear-gradient(90deg,var(--blue),var(--magenta))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CONVERGENCE THRESHOLD</div><div className="mono" style={{ fontSize:10, color:"var(--td)", marginTop:4 }}>Where organic tissue fuses with cyber-lattice — 47 hybrid entities detected</div></div>
          <div style={{ flex:1, height:6, borderRadius:3, background:"linear-gradient(90deg,var(--blue),var(--cyan),var(--magenta))", boxShadow:"0 0 20px rgba(0,255,231,.3)", animation:"bPulse 3s ease-in-out infinite" }}/>
        </div>
      </HP>
    </div>
  );
}

function SectorsPage() {
  const [selSea, setSelSea] = useState(null);
  return (
    <div className="page-in" style={{ padding:"36px 32px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24 }}>
        <div className="orb" style={{ fontSize:24, fontWeight:900, color:"var(--tp)", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>OCEAN <span style={{ color:"var(--cyan)" }}>SECTORS</span></div>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,var(--cyan),transparent)" }}/>
        <div className="mono" style={{ fontSize:9, color:"var(--td)", whiteSpace:"nowrap" }}>10 SECTORS · LIVE SYNC</div>
      </div>
      <div className="glass" style={{ border:"1px solid rgba(0,255,231,.15)", background:"linear-gradient(180deg,rgba(0,26,52,.84) 0%,rgba(2,11,18,.96) 100%)", boxShadow:"0 8px 48px rgba(0,70,180,.13),inset 0 1px 0 rgba(0,255,231,.12)", marginBottom:14 }}>
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,rgba(0,255,231,.48),rgba(61,158,255,.32),transparent)", animation:"bPulse 3s ease-in-out infinite" }}/>
        <div style={{ padding:"14px 22px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
            <span className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em" }}>◈ GLOBAL SECTOR MAP</span>
            <span style={{ width:5,height:5,borderRadius:"50%",background:"var(--cyan)",display:"inline-block",animation:"bioPulse 1.6s ease-in-out infinite" }}/>
            <span className="mono" style={{ fontSize:9, color:"var(--td)" }}>DEPTH-ADJUSTED · LIVE</span>
          </div>
        </div>
        <div style={{ padding:"0 22px" }}>
          <svg viewBox="0 0 900 360" style={{ width:"100%", height:"auto", display:"block" }}>
            <defs><radialGradient id="obg3" cx="50%" cy="50%"><stop offset="0%" stopColor="#041828"/><stop offset="100%" stopColor="#020b12"/></radialGradient></defs>
            <rect width="900" height="360" fill="url(#obg3)"/>
            {[1,2,3,4,5].map(i=><line key={`h${i}`} x1="0" y1={i*60} x2="900" y2={i*60} stroke="rgba(0,255,231,.045)" strokeWidth="1"/>)}
            {[1,2,3,4,5,6,7,8,9].map(i=><line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="360" stroke="rgba(0,255,231,.045)" strokeWidth="1"/>)}
            <path d="M115,56 L185,50 L215,76 L222,130 L200,160 L168,174 L140,164 L125,140 L112,110 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M170,186 L212,180 L228,212 L222,270 L196,300 L168,280 L158,240 L160,198 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M385,51 L432,46 L452,66 L442,94 L408,98 L388,83 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M398,112 L446,106 L462,142 L456,210 L430,250 L403,240 L387,200 L383,154 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M452,46 L582,41 L622,71 L612,120 L568,134 L508,130 L468,110 L448,76 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M528,130 L558,125 L563,170 L542,185 L518,165 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M598,150 L638,145 L658,160 L648,175 L618,170 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M638,226 L702,216 L722,254 L712,294 L668,304 L638,278 L628,254 Z" fill="rgba(0,32,60,.86)" stroke="rgba(0,255,231,.2)" strokeWidth="1"/>
            <path d="M238,16 L282,14 L292,42 L264,52 L238,38 Z" fill="rgba(0,32,60,.7)" stroke="rgba(0,255,231,.15)" strokeWidth="1"/>
            <path d="M195,346 L705,348 L720,360 L180,360 Z" fill="rgba(0,32,60,.5)" stroke="rgba(0,255,231,.1)" strokeWidth="1"/>
            <circle cx="450" cy="188" r="105" fill="none" stroke="rgba(0,255,231,.04)" strokeWidth="1" style={{animation:"rOut 5s linear infinite"}}/>
            <circle cx="450" cy="188" r="65"  fill="none" stroke="rgba(0,255,231,.03)" strokeWidth="1" style={{animation:"rOut 5s 1.2s linear infinite"}}/>
            {SEAS.map(m=>{
              const flip=m.x>740; const sel=selSea?.id===m.id;
              return (
                <g key={m.id} onClick={e=>{e.stopPropagation();setSelSea(s=>s?.id===m.id?null:m);}} style={{cursor:"none"}}>
                  <circle cx={m.x} cy={m.y} r="22" fill="transparent"/>
                  <circle cx={m.x} cy={m.y} r="17" fill="none" stroke={m.color} strokeWidth={sel?"1.5":".5"} strokeOpacity=".25" style={{animation:"rOut 3s ease-out infinite"}}/>
                  <circle cx={m.x} cy={m.y} r="10" fill="none" stroke={m.color} strokeWidth=".8" strokeOpacity=".44" style={{animation:"rOut 3s .85s ease-out infinite"}}/>
                  <circle cx={m.x} cy={m.y} r={sel?6:4} fill={m.color} stroke={sel?"white":"none"} strokeWidth=".5" style={{animation:"bioPulse 2.2s ease-in-out infinite"}}/>
                  <text x={flip?m.x-8:m.x+8} y={m.y-8} fontSize="7" fill={m.color} fontFamily="Share Tech Mono" letterSpacing="0.04em" textAnchor={flip?"end":"start"}>{m.id} · {m.name}</text>
                  <text x={flip?m.x-8:m.x+8} y={m.y+2} fontSize="6" fill="rgba(180,220,240,.38)" fontFamily="Share Tech Mono" textAnchor={flip?"end":"start"}>{m.depth}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ padding:"11px 22px 14px", borderTop:"1px solid rgba(0,255,231,.07)", display:"flex", alignItems:"center", gap:22, flexWrap:"wrap" }}>
          {[{l:"ACCESSIBLE",c:"#00ffe7"},{l:"CONTESTED",c:"#ffd166"},{l:"RESTRICTED",c:"#ff2d78"},{l:"NEUTRAL",c:"#3d9eff"}].map(x=>(
            <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:x.c,boxShadow:`0 0 6px ${x.c}` }}/>
              <span className="mono" style={{ fontSize:8, color:"var(--td)", letterSpacing:"0.12em" }}>{x.l}</span>
            </div>
          ))}
          {selSea ? (
            <div style={{ marginLeft:"auto", display:"flex", gap:16, alignItems:"center" }}>
              <div className="orb" style={{ fontSize:11, color:selSea.color, fontWeight:700 }}>{selSea.name}</div>
              {[["DEPTH",selSea.depth],["TEMP",selSea.temp],["ENTITIES",selSea.entities],["REGION",selSea.region]].map(([k,v])=>(
                <div key={k}><div className="mono" style={{ fontSize:7, color:"var(--td)" }}>{k}</div><div className="mono" style={{ fontSize:9, color:"var(--tp)" }}>{v}</div></div>
              ))}
              <button onClick={e=>{e.stopPropagation();setSelSea(null);}} className="mono" style={{ fontSize:10, color:"var(--td)", background:"none", border:"none", cursor:"none" }}>✕</button>
            </div>
          ) : <span className="mono" style={{ marginLeft:"auto", fontSize:8, color:"var(--td)" }}>CLICK MARKER TO INSPECT</span>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:11 }}>
        {SEAS.map((s,i)=>(
          <div key={s.id} className="glass" style={{ background:`linear-gradient(155deg,rgba(0,16,46,.7) 0%,rgba(2,11,18,.96) 100%)`, border:`1px solid ${s.color}2e`, boxShadow:`0 4px 26px ${s.color}0e,inset 0 1px 0 ${s.color}16`, animation:`fadeUp .52s ${i*.06}s ease-out both`, padding:13 }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${s.color}65,transparent)`, zIndex:2 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
              <span className="mono" style={{ fontSize:8, color:s.color, letterSpacing:"0.15em" }}>{s.id}</span>
              <span className="mono" style={{ fontSize:7, padding:"2px 5px", background:`${s.color}12`, border:`1px solid ${s.color}34`, color:s.color }}>{s.status}</span>
            </div>
            <div className="orb" style={{ fontSize:11, color:s.color, fontWeight:700, letterSpacing:"0.06em", marginBottom:2 }}>{s.name}</div>
            <div className="mono" style={{ fontSize:8, color:"var(--td)", marginBottom:9 }}>{s.region}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 7px", marginBottom:9 }}>
              {[["DEPTH",s.depth],["TEMP",s.temp],["ENTITIES",s.entities],["STATUS","ONLINE"]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:7, color:"var(--td)", fontFamily:"Share Tech Mono", letterSpacing:"0.1em" }}>{k}</div><div style={{ fontSize:9, color:k==="STATUS"?"var(--cyan)":"var(--tp)", fontFamily:"Share Tech Mono" }}>{v}</div></div>
              ))}
            </div>
            <div style={{ borderTop:`1px solid ${s.color}18`, paddingTop:7 }}>
              <button className="mono" style={{ fontSize:8, color:s.color, background:"none", border:"none", cursor:"none", letterSpacing:"0.1em", width:"100%", textAlign:"center" }}>▸ INITIATE DIVE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DivePage() {
  const [selected, setSelected] = useState(null);
  const [diving, setDiving] = useState(false);
  const ZONES = [
    { id:"DZ-01", name:"CORAL NEXUS",   depth:"200–800M",    risk:"LOW",    temp:"12°C", oxy:94, entities:8,  col:"#00ffe7" },
    { id:"DZ-02", name:"IRON TRENCH",   depth:"1,200–2,400M",risk:"MED",    temp:"3°C",  oxy:76, entities:19, col:"#ffd166" },
    { id:"DZ-03", name:"RED SEA GATE",  depth:"800–2,200M",  risk:"MED",    temp:"4°C",  oxy:80, entities:14, col:"#ff2d78" },
    { id:"DZ-04", name:"ABYSS OMEGA",   depth:"3,400M+",     risk:"EXTREME",temp:"-4°C", oxy:12, entities:61, col:"#ff2d78" },
    { id:"DZ-05", name:"ARCTIC RIFT",   depth:"1,800–5,400M",risk:"HIGH",   temp:"-8°C", oxy:44, entities:14, col:"#3d9eff" },
    { id:"DZ-06", name:"PACIFIC ABYSS", depth:"8,000M+",     risk:"EXTREME",temp:"-4°C", oxy:8,  entities:55, col:"#ff2d78" },
  ];
  return (
    <div className="page-in" style={{ padding:"36px 32px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
        <div className="orb" style={{ fontSize:24, fontWeight:900, color:"var(--tp)", letterSpacing:"0.1em" }}>DIVE <span style={{ color:"var(--cyan)" }}>TERMINAL</span></div>
        <div style={{ flex:1, height:1, background:"linear-gradient(90deg,var(--cyan),transparent)" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#00ff88",display:"inline-block",animation:"bioPulse 1s ease-in-out infinite" }}/>
          <span className="mono" style={{ fontSize:9, color:"var(--td)" }}>DIVE SYSTEMS ONLINE</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:20 }}>
        <div>
          <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em", marginBottom:14 }}>◈ SELECT DIVE ZONE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            {ZONES.map((z,i)=>(
              <div key={z.id} onClick={()=>setSelected(z)} style={{ padding:14, cursor:"none", background:selected?.id===z.id?`linear-gradient(155deg,${z.col}22,rgba(2,11,18,.9))`:"linear-gradient(155deg,rgba(0,20,50,.6),rgba(2,11,18,.95))", border:`1px solid ${selected?.id===z.id?z.col:z.col+"30"}`, backdropFilter:"blur(16px)", boxShadow:selected?.id===z.id?`0 0 20px ${z.col}30`:"none", transition:"all .25s", animation:`fadeUp .5s ${i*.08}s ease-out both`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${z.col}60,transparent)` }}/>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span className="mono" style={{ fontSize:8, color:z.col, letterSpacing:"0.12em" }}>{z.id}</span>
                  <span className="mono" style={{ fontSize:7, padding:"2px 5px", background:`${z.col}15`, border:`1px solid ${z.col}40`, color:z.col }}>{z.risk}</span>
                </div>
                <div className="orb" style={{ fontSize:12, color:z.col, fontWeight:700, marginBottom:4 }}>{z.name}</div>
                <div className="mono" style={{ fontSize:8, color:"var(--td)", marginBottom:8 }}>{z.depth}</div>
                <div style={{ display:"flex", gap:12 }}>
                  {[["TEMP",z.temp],["OXY",z.oxy+"%"],["ENTITIES",z.entities]].map(([k,v])=>(
                    <div key={k}><div style={{ fontSize:7, color:"var(--td)", fontFamily:"Share Tech Mono" }}>{k}</div><div style={{ fontSize:9, color:"var(--tp)", fontFamily:"Share Tech Mono" }}>{v}</div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <HP style={{ padding:18, textAlign:"center" }}>
            <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em", marginBottom:12 }}>◈ DIVE POD STATUS</div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><BioOrb size={110} col={selected?.col||"#00ffe7"} acc="#3d9eff" delay="0s"/></div>
            <div className="orb" style={{ fontSize:13, color:selected?.col||"var(--cyan)", fontWeight:700, marginBottom:4 }}>{selected?selected.name:"NO ZONE SELECTED"}</div>
            <div className="mono" style={{ fontSize:9, color:"var(--td)", marginBottom:16 }}>{selected?`DEPTH TARGET: ${selected.depth}`:"SELECT A ZONE TO BEGIN"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px", marginBottom:16 }}>
              {[["HULL","100%","var(--cyan)"],["POWER","98%","var(--blue)"],["COMMS",selected?"LOCKED":"STANDBY",selected?"#00ff88":"var(--td)"],["BEACON",selected?"ARMED":"OFFLINE",selected?"var(--magenta)":"var(--td)"]].map(([k,v,c])=>(
                <div key={k} style={{ textAlign:"left" }}><div className="mono" style={{ fontSize:7, color:"var(--td)" }}>{k}</div><div className="mono" style={{ fontSize:10, color:c, fontFamily:"Share Tech Mono" }}>{v}</div></div>
              ))}
            </div>
            <SB label="OXYGEN" value={selected?selected.oxy:100} col="var(--cyan)"/>
            <button onClick={()=>{if(!selected)return;setDiving(true);setTimeout(()=>setDiving(false),2200);}} style={{ width:"100%", padding:"12px 0", fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:11, letterSpacing:"0.22em", cursor:"none", background:selected?`linear-gradient(135deg,${selected.col}22,${selected.col}08)`:"rgba(0,255,231,.04)", border:`1px solid ${selected?selected.col:"rgba(0,255,231,.2)"}`, color:selected?selected.col:"var(--td)", marginTop:4, animation:selected?"bPulse 2s ease-in-out infinite":"none", transition:"all .3s" }}>
              {diving?"▼ DESCENDING...":selected?"▼ INITIATE DIVE":"SELECT ZONE"}
            </button>
          </HP>
          <HP style={{ padding:14 }}>
            <div className="mono" style={{ fontSize:9, color:"var(--cyan)", letterSpacing:"0.2em", marginBottom:10 }}>◈ DEPTH GAUGE</div>
            <div style={{ position:"relative", height:160, display:"flex", gap:10 }}>
              <div style={{ width:18, height:"100%", borderRadius:3, overflow:"hidden", background:"linear-gradient(to bottom,#ffd166,#00ffe7,#3d9eff,#ff2d78)", border:"1px solid rgba(0,255,231,.2)" }}/>
              <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                {["0M","1,000M","2,000M","4,000M","8,000M+"].map(d=><div key={d} className="mono" style={{ fontSize:8, color:"var(--td)" }}>{d}</div>)}
              </div>
              {selected&&<div style={{ position:"absolute", left:0, top:"60%", width:26, height:2, background:selected.col, boxShadow:`0 0 8px ${selected.col}`, animation:"bPulse 1.5s ease-in-out infinite" }}/>}
            </div>
          </HP>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
const PAGES = {
  HOME:    { label:"HOME",    component: HomePage    },
  EXPLORE: { label:"EXPLORE", component: EntitiesPage },
  NEXUS:   { label:"NEXUS",   component: DualityPage  },
  SECTORS: { label:"SECTORS", component: SectorsPage  },
  DIVE:    { label:"DIVE",    component: DivePage     },
};

export default function App() {
  const [cur, setCur]         = useState({ x:-100, y:-100 });
  const [page, setPage]       = useState("HOME");
  const [ripples, setRip]     = useState([]);
  const [cracking, setCrack]  = useState(false);
  const [nextPage, setNext]   = useState(null);
  const [pageKey, setPageKey] = useState(0);
  const ridRef = useRef(0);

  useEffect(() => {
    const mv = e => setCur({ x:e.clientX, y:e.clientY });
    window.addEventListener("mousemove", mv, { passive:true });
    return () => window.removeEventListener("mousemove", mv);
  }, []);

  const navigate = useCallback((key) => {
    if (key === page || cracking) return;
    setNext(key);
    setCrack(true);
    window.scrollTo({ top:0, behavior:"instant" });
    // After crack animation (500ms) → switch page, remove overlay
    setTimeout(() => {
      setPage(key);
      setPageKey(k => k + 1);
      setCrack(false);
      setNext(null);
    }, 480);
  }, [page, cracking]);

  const addRipple = e => {
    const id = ridRef.current++;
    setRip(r => [...r, { id, x:e.clientX, y:e.clientY }]);
    setTimeout(() => setRip(r => r.filter(x => x.id !== id)), 750);
  };

  const ActivePage = PAGES[page].component;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>

      {/* Cursor */}
      <div className="pc"  style={{ left:cur.x, top:cur.y }}/>
      <div className="pcd" style={{ left:cur.x, top:cur.y }}/>

      {/* Scanlines */}
      <div className="scl"/>

      {/* Crack transition overlay */}
      <CrackTransition active={cracking} label={nextPage || page}/>

      {/* Click ripples */}
      {ripples.map(r => (
        <div key={r.id} style={{
          position:"fixed", left:r.x, top:r.y, zIndex:8900,
          width:48, height:48, marginLeft:-24, marginTop:-24,
          borderRadius:"50%", border:"1px solid var(--cyan)",
          pointerEvents:"none", animation:"rOut .7s ease-out forwards",
        }}/>
      ))}

      {/* PAGE ROOT */}
      <div onClick={addRipple} style={{ position:"relative", zIndex:2, minHeight:"100vh" }}>
        <Particles/>

        {/* BG */}
        <div style={{
          position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
          background:`radial-gradient(ellipse 90% 55% at 50% 0%,#041e3a 0%,transparent 65%),radial-gradient(ellipse 55% 40% at 10% 100%,#020d22 0%,transparent 55%),radial-gradient(ellipse 45% 38% at 88% 58%,rgba(0,40,100,.1) 0%,transparent 55%)`,
        }}/>

        {/* NAV */}
        <nav style={{
          position:"sticky", top:0, zIndex:600,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 32px",
          borderBottom:"1px solid rgba(0,255,231,.1)",
          background:"rgba(2,11,18,.9)",
          backdropFilter:"blur(20px)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:30, height:30, flexShrink:0, background:"linear-gradient(135deg,var(--cyan),var(--blue))", clipPath:"polygon(50% 0%,100% 50%,50% 100%,0% 50%)", animation:"bioPulse 3s ease-in-out infinite" }}/>
            <div>
              <div className="orb" style={{ fontSize:12, color:"var(--cyan)", letterSpacing:"0.3em", fontWeight:900 }}>PISCES</div>
              <div className="mono" style={{ fontSize:8, color:"var(--td)", letterSpacing:"0.15em" }}>DEEP_PROTOCOL_v2.8</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:26 }}>
            {Object.entries(PAGES).map(([key,{label}]) => (
              <button key={key} onClick={() => navigate(key)}
                className={`nv mono${page===key?" on":""}`}
                style={{ fontSize:10, letterSpacing:"0.18em", color:page===key?"var(--cyan)":"var(--td)", background:"none", border:"none", cursor:"none", padding:"2px 0" }}>
                {page===key && <span style={{ color:"var(--cyan)", marginRight:3 }}>//</span>}
                {label}
              </button>
            ))}
          </div>

          <button onClick={() => navigate("DIVE")} style={{
            fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:10,
            letterSpacing:"0.22em", padding:"9px 22px",
            background:"transparent", color:"var(--cyan)",
            border:"1px solid var(--cyan)",
            clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
            animation:"bPulse 2.8s ease-in-out infinite", cursor:"none",
          }}>▶ DIVE NOW</button>
        </nav>

        {/* TICKER */}
        <div style={{ overflow:"hidden", padding:"7px 0", borderBottom:"1px solid rgba(0,255,231,.07)", background:"rgba(0,255,231,.022)", position:"relative", zIndex:10 }}>
          <div className="tick mono" style={{ fontSize:10, color:"var(--td)" }}>
            ◈ DEPTH: 3,400M &nbsp;◈ PRESSURE: 340 ATM &nbsp;◈ BIO-INDEX: 98.7% &nbsp;◈ NEURAL-SEA SYNC: ACTIVE &nbsp;◈ ENTITIES: 147 &nbsp;◈ ZONE: PISCES ABYSS Ω &nbsp;◈ ORGANIC-CYBER THRESHOLD EXCEEDED &nbsp;◈ INTEGRITY: 94.2% &nbsp;◈ TIDE ENCRYPTION: LOCKED &nbsp;◈ ∞ &nbsp;&nbsp;&nbsp;◈ DEPTH: 3,400M &nbsp;◈ BIO-INDEX: 98.7% &nbsp;◈ ENTITIES: 147 &nbsp;
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main key={pageKey} style={{ position:"relative", zIndex:10 }}>
          <ActivePage/>
        </main>

        {/* FOOTER */}
        <footer style={{ position:"relative", zIndex:10, padding:"18px 32px", borderTop:"1px solid rgba(0,255,231,.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div className="orb" style={{ fontSize:11, color:"var(--cyan)", letterSpacing:"0.3em", fontWeight:900 }}>PISCES // DEEP PROTOCOL</div>
            <div className="mono" style={{ fontSize:9, color:"var(--td)", marginTop:4 }}>© 2187 ABYSSAL SYSTEMS CORP · ALL DEPTHS RESERVED</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className="mono" style={{ fontSize:8, color:"var(--td)" }}>CURRENT NODE</span>
            <span style={{ width:4,height:4,borderRadius:"50%",background:"var(--cyan)",animation:"bioPulse 1.5s ease-in-out infinite",display:"inline-block" }}/>
            <span className="orb" style={{ fontSize:10, color:"var(--cyan)", fontWeight:700 }}>{page}</span>
          </div>
          <div style={{ display:"flex", gap:18 }}>
            {["DISCORD","X","YOUTUBE","TWITCH"].map(s=>(
              <button key={s} className="mono" style={{ fontSize:9, color:"var(--td)", background:"none", border:"none", cursor:"none", letterSpacing:"0.12em" }}>{s}</button>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}