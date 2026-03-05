import { useState } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  primary:   "#2C66A8", secondary: "#3F7DBF", accent: "#F39C34",
  bg:        "#F0F4F9", card:      "#FFFFFF",  text:   "#5A6A7A",
  dark:      "#1A2A3A", border:    "#DDE5EF",  muted:  "#9AA8B8",
  success:   "#22C55E", danger:    "#EF4444",
};

const AFP_COLORS = {
  "Siembra":   "#2C66A8",
  "Popular":   "#F39C34",
  "Reservas":  "#22C55E",
  "Romana":    "#8B5CF6",
  "Atlántico": "#EF4444",
  "Crecer":    "#EC4899",
  "JMMB BDI":  "#06B6D4",
  "Industria": "#374151",
};

const AFP_LIST      = ["Siembra","Popular","Reservas","Romana","Atlántico","Crecer","JMMB BDI"];
const SELECTOR_LIST = [...AFP_LIST, "Industria"];
const YEARS         = ["2019","2020","2021","2022","2023","2024"];

// ─── RAW DATA — ESTADOS FINANCIEROS AUDITADOS + SIPEN ────────────────────────
// ing    = Total Ingresos (RD$ millones)         — Estado de Resultados auditado
// util   = Resultado del Ejercicio (RD$ millones) — Estado de Resultados auditado
// gasOp  = Total Gastos Operativos (RD$ millones) — Estado de Resultados auditado
// aum    = Fondos Administrados (RD$ millones)   — Cuentas de Orden (EF auditado)
// pat    = Patrimonio Neto (RD$ millones)        — Nota Capital Mínimo (EF auditado)
// afil   = Número Total de Afiliados             — Nota Capital Mínimo (EF auditado)
// cot    = Cotizantes al cierre de diciembre     — Hoja "Por AFP", SIPEN
// densidad se calcula como cot / afil × 100
//
// FUENTES AFILIADOS (EF auditados):
//   Siembra   — Nota 6, renglón 7   | Popular   — Nota 6, renglón 8.000
//   Reservas  — Nota 9              | Crecer    — Nota 6, renglón final
//   Romana    — Nota 9, renglón fin | Atlántico — Nota 6
//   JMMB BDI  — Nota 6, renglón 8.000
//
// FUENTE COTIZANTES: Superintendencia de Pensiones (SIPEN)
//   Archivo: cotizantes_1.xlsx · Hoja "Por AFP" · Corte: 31 de diciembre de cada año

const RAW = {
  "Siembra": {
    // Afiliados: Nota 6 Cap.Mín. renglon 7 | Patrimonio Neto: renglon 4
    // Cotizantes dic: SIPEN / Por AFP col "Siembra"
    "2019": { ing:2496.7, util:1351.4, gasOp:692.8,  aum:152900, pat:2999.2, afil:821157,  cot:371120, emp:1230, persAdm:148.8, persCom:215.3 },
    "2020": { ing:2050.7, util: 919.3, gasOp:813.3,  aum:163700, pat:2473.6, afil:852755,  cot:335342, emp:1240, persAdm:161.9, persCom:168.2 },
    "2021": { ing:2250.9, util:1104.9, gasOp:862.2,  aum:183100, pat:3012.7, afil:905056,  cot:392470, emp:1250, persAdm:160.2, persCom:184.2 },
    "2022": { ing:2454.2, util: 986.2, gasOp:1182.8, aum:199100, pat:3184.3, afil:949947,  cot:397405, emp:1270, persAdm:194.3, persCom:223.6 },
    "2023": { ing:2559.3, util:1082.0, gasOp:1157.5, aum:205213, pat:3671.0, afil:985024,  cot:416359, emp:1290, persAdm:220.4, persCom:301.7 },
    "2024": { ing:3046.9, util:1292.5, gasOp:1435.9, aum:239845, pat:4163.5, afil:1012675, cot:429389, emp:1310, persAdm:250.7, persCom:369.0 },
  },
  "Popular": {
    // Afiliados: Nota 6 renglon 8000 | Patrimonio: renglon 5000
    // Cotizantes dic: SIPEN / Por AFP col "Popular"
    "2019": { ing:4247.2, util:2079.4, gasOp:1422.8, aum:204000, pat:5288.2, afil:1223774, cot:582130, emp:1590, persAdm:455.9, persCom:345.1 },
    "2020": { ing:3583.5, util:1577.9, gasOp:1435.6, aum:221300, pat:5613.4, afil:1265070, cot:519183, emp:1600, persAdm:443.8, persCom:222.8 },
    "2021": { ing:3732.5, util:1629.3, gasOp:1573.7, aum:248200, pat:5374.0, afil:1333893, cot:604868, emp:1610, persAdm:534.2, persCom:223.6 },
    "2022": { ing:3793.5, util:1618.7, gasOp:1842.2, aum:263100, pat:5800.2, afil:1407442, cot:619933, emp:1630, persAdm:634.4, persCom:330.3 },
    "2023": { ing:4168.9, util:1603.0, gasOp:2147.1, aum:275800, pat:6267.8, afil:1471729, cot:659247, emp:1650, persAdm:787.7, persCom:386.1 },
    "2024": { ing:4649.9, util:1925.8, gasOp:2227.5, aum:319200, pat:6992.5, afil:1523195, cot:684959, emp:1670, persAdm:832.7, persCom:399.9 },
  },
  "Reservas": {
    // Afiliados: Nota 9 Cap.Mín. | Patrimonio neto
    // Cotizantes dic: SIPEN / Por AFP col "Reservas"
    "2019": { ing:2147.5, util:1111.3, gasOp:634.5,  aum:130200, pat:3614.7, afil:522818,  cot:289194, emp:1070, persAdm:214.7, persCom:193.7 },
    "2020": { ing:1935.4, util: 904.5, gasOp:715.8,  aum:146300, pat:4348.8, afil:537215,  cot:266802, emp:1080, persAdm:227.9, persCom:183.6 },
    "2021": { ing:2300.4, util:1179.2, gasOp:854.2,  aum:165500, pat:5622.0, afil:562836,  cot:277195, emp:1090, persAdm:255.6, persCom:211.4 },
    "2022": { ing:2420.6, util:1179.4, gasOp:975.0,  aum:175700, pat:6806.0, afil:580411,  cot:273612, emp:1100, persAdm:262.0, persCom:235.9 },
    "2023": { ing:2539.9, util:1204.9, gasOp:1034.8, aum:181100, pat:6093.3, afil:604085,  cot:294936, emp:1115, persAdm:312.7, persCom:294.9 },
    "2024": { ing:2879.8, util:1345.0, gasOp:1172.8, aum:213700, pat:6547.5, afil:634788,  cot:314332, emp:1130, persAdm:372.7, persCom:390.5 },
  },
  "Romana": {
    // Afiliados: Nota 9 Cap.Mín. | Cotizantes dic: SIPEN / Por AFP col "Romana"
    "2019": { ing:105.5,  util: 45.0,  gasOp:43.9,  aum:5683,  pat:236.2,  afil:27837,  cot:15264,  emp:145, persAdm:8.9,  persCom:9.9  },
    "2020": { ing: 94.0,  util: 37.4,  gasOp:43.1,  aum:6374,  pat:273.6,  afil:28168,  cot:14073,  emp:148, persAdm:8.5,  persCom:1.0  },
    "2021": { ing:103.7,  util: 46.2,  gasOp:44.2,  aum:7000,  pat:319.8,  afil:28801,  cot:15121,  emp:150, persAdm:10.1, persCom:9.8  },
    "2022": { ing:107.6,  util: 42.8,  gasOp:51.1,  aum:7600,  pat:362.6,  afil:29227,  cot:15164,  emp:152, persAdm:9.9,  persCom:1.1  },
    "2023": { ing:128.4,  util: 56.2,  gasOp:53.9,  aum:8400,  pat:419.1,  afil:29578,  cot:15152,  emp:155, persAdm:10.5, persCom:1.6  },
    "2024": { ing:146.5,  util: 67.3,  gasOp:57.5,  aum:9400,  pat:486.4,  afil:29630,  cot:14935,  emp:158, persAdm:11.4, persCom:1.5  },
  },
  "Atlántico": {
    // Afiliados: Nota 6 | Cotizantes dic: SIPEN / Por AFP col "Atlántico"
    "2019": { ing: 78.4,  util: -3.2,  gasOp:81.0,  aum:4753,  pat: 47.7,  afil:44690,  cot:24181,  emp:170, persAdm:30.1, persCom:11.1 },
    "2020": { ing: 76.4,  util:  6.6,  gasOp:69.2,  aum:6369,  pat: 55.9,  afil:50337,  cot:23719,  emp:172, persAdm:26.8, persCom:4.1  },
    "2021": { ing: 96.2,  util: 18.1,  gasOp:78.1,  aum:7600,  pat: 68.4,  afil:57920,  cot:30085,  emp:175, persAdm:33.3, persCom:5.2  },
    "2022": { ing:112.8,  util: 16.6,  gasOp:97.3,  aum:8806,  pat: 87.1,  afil:67016,  cot:34505,  emp:178, persAdm:55.2, persCom:8.8  },
    "2023": { ing:145.6,  util: 24.2,  gasOp:120.4, aum:10400, pat:121.8,  afil:84140,  cot:47243,  emp:182, persAdm:61.1, persCom:13.2 },
    "2024": { ing:202.2,  util: 48.2,  gasOp:141.2, aum:13900, pat:170.0,  afil:92057,  cot:49509,  emp:190, persAdm:70.0, persCom:18.2 },
  },
  "Crecer": {
    // Afiliados: Nota 6 | Cotizantes dic: SIPEN / Por AFP col "Crecer"
    "2019": { ing:2415.5, util:1340.9, gasOp:585.2,  aum:130570, pat:2604.4, afil:1199095, cot:488001, emp:610, persAdm:151.2, persCom:173.7 },
    "2020": { ing:2102.9, util: 961.1, gasOp:793.0,  aum:151960, pat: 969.5, afil:1232457, cot:438691, emp:618, persAdm:212.7, persCom:129.0 },
    "2021": { ing:2208.1, util:1031.8, gasOp:863.0,  aum:181226, pat:1576.6, afil:1285916, cot:504110, emp:626, persAdm:268.2, persCom:141.4 },
    "2022": { ing:2285.6, util: 889.6, gasOp:1091.9, aum:202635, pat:1606.2, afil:1332512, cot:508846, emp:638, persAdm:306.7, persCom:179.0 },
    "2023": { ing:2480.5, util:1042.0, gasOp:1099.3, aum:226525, pat:2608.2, afil:1364663, cot:528252, emp:648, persAdm:358.6, persCom:178.6 },
    "2024": { ing:2688.7, util:1036.5, gasOp:1350.5, aum:258029, pat:3308.2, afil:1397725, cot:544238, emp:660, persAdm:457.2, persCom:270.6 },
  },
  "JMMB BDI": {
    // Afiliados: Nota 6 | Cotizantes dic: SIPEN / Por AFP col "JMMB-BDI"
    "2019": { ing: 37.7,  util:-27.6,  gasOp:65.3,  aum:3073,  pat: 50.1,  afil:6846,   cot:5522,   emp:130, persAdm:20.7, persCom:22.0 },
    "2020": { ing: 44.6,  util:-10.3,  gasOp:54.9,  aum:3686,  pat: 73.6,  afil:7717,   cot:5675,   emp:133, persAdm:18.7, persCom:17.4 },
    "2021": { ing: 64.7,  util:  2.0,  gasOp:62.7,  aum:4598,  pat: 86.8,  afil:9000,   cot:6752,   emp:138, persAdm:23.6, persCom:8.8  },
    "2022": { ing: 89.4,  util: 13.2,  gasOp:84.2,  aum:6514,  pat: 99.9,  afil:11000,  cot:7842,   emp:144, persAdm:25.4, persCom:11.5 },
    "2023": { ing:128.4,  util:  4.6,  gasOp:119.2, aum:8784,  pat:104.6,  afil:15945,  cot:8955,   emp:150, persAdm:35.5, persCom:12.9 },
    "2024": { ing:195.0,  util: 29.2,  gasOp:173.0, aum:10190, pat:133.8,  afil:18210,  cot:8460,   emp:160, persAdm:49.1, persCom:18.8 },
  },
};

// ─── BUILD DERIVED DATA ───────────────────────────────────────────────────────
const DATA = {};
AFP_LIST.forEach(afp => {
  DATA[afp] = {};
  const raws = RAW[afp];
  YEARS.forEach((yr, yi) => {
    const r    = raws[yr];
    const prv  = yi > 0 ? raws[YEARS[yi-1]] : null;
    const { ing, util, aum, afil, gasOp, emp } = r;
    const pat  = r.pat;

    const cot = r.cot;
    DATA[afp][yr] = {
      ingresos:    +ing.toFixed(1),
      utilidad:    +util.toFixed(1),
      crecIngr:    prv ? +(((ing/prv.ing)-1)*100).toFixed(1) : null,
      margenNeto:  ing !== 0 ? +((util/ing*100).toFixed(1)) : 0,
      // ROE = Utilidad Neta / Patrimonio Neto (fuente: Nota Capital Mínimo EF auditado)
      roe:         pat > 0 ? +((util/pat*100).toFixed(1)) : null,
      cti:         ing !== 0 ? +((gasOp/ing*100).toFixed(1)) : 0,
      aum, afil,
      // cot: cotizantes al cierre de diciembre — fuente SIPEN hoja "Por AFP"
      cot,
      // densidad = cotizantes / afiliados × 100  (ambas fuentes auditadas/SIPEN)
      densidad:    (cot && afil > 0) ? +((cot / afil * 100).toFixed(1)) : null,
      gasOp:       +gasOp.toFixed(1),
      pat:         +pat.toFixed(1),
      persTotal:   +(r.persAdm + r.persCom).toFixed(1),
      persAdmin:   +r.persAdm.toFixed(1),
      persCom:     +r.persCom.toFixed(1),
      costAfil:    afil > 0 ? +((gasOp/afil*1000000).toFixed(0)) : null,
      costCot:     cot  > 0 ? +((gasOp/cot*1000000).toFixed(0))  : null,
      costAum:     aum  > 0 ? +((gasOp/aum*100).toFixed(2))      : null,
      aumEmp:      emp  > 0 ? +(aum/emp).toFixed(0)              : null,
      cotEmp:      (emp > 0 && cot > 0) ? +(cot/emp).toFixed(0)  : null,
      ingAfil:     afil > 0 ? +((ing/afil*1000000).toFixed(0))   : null,
      ingCot:      cot  > 0 ? +((ing/cot*1000000).toFixed(0))    : null,
      utilAfil:    afil > 0 ? +((util/afil*1000000).toFixed(0))  : null,
      utilCot:     cot  > 0 ? +((util/cot*1000000).toFixed(0))   : null,
      aumCot:      cot  > 0 ? +(aum/cot*1000000).toFixed(0)      : null,
      revYield:    aum  > 0 ? +((ing/aum*100).toFixed(2))        : null,
      profYield:   aum  > 0 ? +((util/aum*100).toFixed(2))       : null,
      ms:          null, // calculado después
    };
  });
});

// Market share por AUM
YEARS.forEach(yr => {
  const totalAum = AFP_LIST.reduce((s,a) => s + (DATA[a][yr]?.aum || 0), 0);
  AFP_LIST.forEach(a => {
    DATA[a][yr].ms = totalAum > 0 ? +((DATA[a][yr].aum / totalAum * 100).toFixed(1)) : 0;
  });
});

// Industria
DATA["Industria"] = {};
YEARS.forEach(yr => {
  const all = AFP_LIST.map(a => DATA[a][yr]);
  const n   = v => Number(v) || 0;

  const ing    = all.reduce((s,d) => s + n(d.ingresos), 0);
  const util   = all.reduce((s,d) => s + n(d.utilidad), 0);
  const aum    = all.reduce((s,d) => s + n(d.aum),      0);
  const afil   = all.reduce((s,d) => s + n(d.afil),     0);
  const gasOp  = all.reduce((s,d) => s + n(d.gasOp),    0);
  const pat    = AFP_LIST.reduce((s,a) => s + n(RAW[a][yr]?.pat || 0), 0);
  const empTot = AFP_LIST.reduce((s,a) => s + n(RAW[a][yr]?.emp || 0), 0);

  const cot_ind = all.reduce((s,d) => s + n(d.cot), 0);
  DATA["Industria"][yr] = {
    ingresos:    +ing.toFixed(1),
    utilidad:    +util.toFixed(1),
    crecIngr:    null,
    margenNeto:  ing !== 0 ? +((util/ing*100).toFixed(1)) : 0,
    roe:         pat > 0 ? +((util/pat*100).toFixed(1)) : null,
    cti:         ing !== 0 ? +((gasOp/ing*100).toFixed(1)) : 0,
    aum, afil,
    cot:         cot_ind,
    densidad:    (cot_ind > 0 && afil > 0) ? +((cot_ind / afil * 100).toFixed(1)) : null,
    gasOp:       +gasOp.toFixed(1),
    pat:         +pat.toFixed(1),
    persTotal:   +all.reduce((s,d)=>s+n(d.persTotal),0).toFixed(1),
    persAdmin:   +all.reduce((s,d)=>s+n(d.persAdmin),0).toFixed(1),
    persCom:     +all.reduce((s,d)=>s+n(d.persCom),0).toFixed(1),
    costAfil:    afil    > 0 ? +((gasOp/afil*1000000).toFixed(0))   : null,
    costCot:     cot_ind > 0 ? +((gasOp/cot_ind*1000000).toFixed(0)): null,
    costAum:     aum     > 0 ? +((gasOp/aum*100).toFixed(2))        : null,
    aumEmp:      empTot  > 0 ? +(aum/empTot).toFixed(0)             : null,
    cotEmp:      (empTot > 0 && cot_ind > 0) ? +(cot_ind/empTot).toFixed(0) : null,
    ingAfil:     afil    > 0 ? +((ing/afil*1000000).toFixed(0))     : null,
    ingCot:      cot_ind > 0 ? +((ing/cot_ind*1000000).toFixed(0))  : null,
    utilAfil:    afil    > 0 ? +((util/afil*1000000).toFixed(0))    : null,
    utilCot:     cot_ind > 0 ? +((util/cot_ind*1000000).toFixed(0)) : null,
    aumCot:      cot_ind > 0 ? +(aum/cot_ind*1000000).toFixed(0)    : null,
    revYield:    aum     > 0 ? +((ing/aum*100).toFixed(2))          : null,
    profYield:   aum     > 0 ? +((util/aum*100).toFixed(2))         : null,
    ms:          100,
  };
});

function n_(v) { return Number(v) || 0; }

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
// Separadores de miles con locale es-DO
const fmt_miles = v => Number(v).toLocaleString("es-DO");
const pct  = v => v === null || v === undefined ? "ND" : `${Number(v).toFixed(1)}%`;
const cur  = v => {
  if (v === null || v === undefined) return "ND";
  const n = Number(v);
  if (n >= 1000000) return `RD$${(n/1000000).toFixed(2)}B`;
  if (n >= 1000)    return `RD$${(n/1000).toFixed(2)}MM`;
  return `RD$${n.toLocaleString("es-DO")}M`;
};
const mm   = v => {
  if (v === null || v === undefined) return "ND";
  const n = Number(v);
  if (n >= 1000000) return `RD$${(n/1000000).toFixed(2)}B`;
  if (n >= 1000)    return `RD$${(n/1000).toFixed(2)}MM`;
  return `RD$${n.toLocaleString("es-DO")}MM`;
};
// Afiliados con separadores de miles
const fmtAfil = v => v === null || v === undefined ? "ND" : Number(v).toLocaleString("es-DO");
// Número generico con miles
const fmtNum = v => v === null || v === undefined ? "ND" : Number(v).toLocaleString("es-DO");
// Porcentaje o ND
const fmtPct = v => v === null || v === undefined ? "ND" : `${Number(v).toFixed(1)}%`;

function trend(val) {
  if (val === null || val === undefined) return <span style={{color:T.muted,fontSize:10}}>ND</span>;
  const n = parseFloat(val);
  if (n > 0) return <span style={{color:T.success,fontWeight:700,fontSize:10}}>▲ {Math.abs(n).toFixed(1)}%</span>;
  if (n < 0) return <span style={{color:T.danger,fontWeight:700,fontSize:10}}>▼ {Math.abs(n).toFixed(1)}%</span>;
  return <span style={{color:T.muted,fontSize:10}}>— —</span>;
}

// ─── SVG BAR CHART — valores sin % cuando es número ──────────────────────────
function BarChart({ afps, getValue, label, format="num", height=160 }) {
  const vals  = afps.map(a => ({ afp:a, val: n_(getValue(a)) }));
  const maxV  = Math.max(...vals.map(v=>v.val), 0.001);
  // Nombres del eje X: abreviar "JMMB BDI" → "JMMB" y "Atlántico" → "Atlántico"
  const shortName = n => n === "JMMB BDI" ? "JMMB BDI" : n;
  // Ancho de barra adaptativo
  const barW  = Math.min(52, Math.floor(360 / afps.length) - 10);
  const gap   = 12;
  const padL  = 24;
  const W     = padL + afps.length * (barW + gap);
  // Espacio inferior fijo para los labels del eje X (2 líneas posibles)
  const bottomPad = 42;

  return (
    <div style={{overflowX:"auto"}}>
      <svg viewBox={`0 0 ${W} ${height + bottomPad}`} style={{width:"100%",minWidth:Math.min(W,300)}}>
        {/* Línea base */}
        <line x1={padL-4} y1={height} x2={W-4} y2={height} stroke={T.border} strokeWidth="1"/>

        {vals.map((v, i) => {
          const cx  = padL + i*(barW + gap) + barW/2;
          const x   = padL + i*(barW + gap);
          const bh  = maxV > 0 ? (v.val/maxV)*(height-22) : 0;
          const y   = height - bh;
          const color = AFP_COLORS[v.afp] || T.primary;

          // Label sobre la barra
          const fmtVal = format === "pct"
            ? `${v.val.toFixed(1)}%`
            : format === "millon"
            ? `${(v.val/1000).toFixed(1)}B`
            : v.val.toLocaleString("es-DO");

          // Nombre en eje X: partir en 2 líneas si tiene espacio
          const name  = shortName(v.afp);
          const parts = name.split(" ");
          const line1 = parts[0];
          const line2 = parts.slice(1).join(" ");

          return (
            <g key={v.afp}>
              <rect x={x} y={y} width={barW} height={bh} fill={color} rx="4" opacity="0.9"/>
              {/* Valor sobre la barra */}
              <text x={cx} y={y-4} textAnchor="middle" fontSize="8" fontWeight="700" fill={color}>{fmtVal}</text>
              {/* Nombre AFP — eje X, siempre horizontal, partido en 2 líneas si necesario */}
              <text x={cx} y={height+13} textAnchor="middle" fontSize="8.5" fontWeight="600" fill={T.muted}>{line1}</text>
              {line2 && (
                <text x={cx} y={height+24} textAnchor="middle" fontSize="8.5" fontWeight="600" fill={T.muted}>{line2}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── MULTI-LINE CHART con valores en cada punto ───────────────────────────────
function LineChart({ afps, getVal, years, height=140, fmtLabel }) {
  const W = 380, H = height;
  const allVals = afps.flatMap(a => years.map(yr => n_(getVal(a,yr))));
  const min = Math.min(...allVals);
  const max = Math.max(...allVals, 0.001);
  const range   = max - min || 1;
  const xStep   = years.length > 1 ? (W-40)/(years.length-1) : W-40;

  const pt = (a, yi) => {
    const v = n_(getVal(a, years[yi]));
    return { x: 20 + yi*xStep, y: H-10 - ((v-min)/range)*(H-30), v };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H+30}`} style={{width:"100%"}}>
      {afps.map(a => {
        const pts   = years.map((_,i) => pt(a,i));
        const color = AFP_COLORS[a] || T.primary;
        const isDash = a === "Industria";
        return (
          <g key={a}>
            <polyline
              points={pts.map(p=>`${p.x},${p.y}`).join(" ")}
              fill="none" stroke={color} strokeWidth={isDash ? 3 : 2.5}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={isDash ? "6,3" : undefined}
            />
            {pts.map((p,i) => {
              const rawV = getVal(a, years[i]);
              const lbl  = rawV === null ? "" : fmtLabel ? fmtLabel(p.v) : p.v.toLocaleString("es-DO");
              // Alternar posición de labels para evitar solapamiento
              const offset = i % 2 === 0 ? -11 : 9;
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={isDash?4:3.5} fill={color} stroke="#fff" strokeWidth="1.5"/>
                  <text x={p.x} y={p.y + offset} textAnchor="middle" fontSize="7.5"
                    fontWeight="600" fill={color} opacity="0.9">{lbl}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      {years.map((yr,i) => (
        <text key={yr} x={20+i*xStep} y={H+22} textAnchor="middle" fontSize="9" fill={T.muted}>{yr}</text>
      ))}
      <line x1="16" y1={H-10} x2={W} y2={H-10} stroke={T.border} strokeWidth="1"/>
    </svg>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent, ok }) {
  const borderColor = ok===true ? T.success : ok===false ? T.danger : accent ? T.accent : T.border;
  const valStr  = String(value);
  const fontSize = valStr.length > 13 ? 13 : valStr.length > 10 ? 15 : valStr.length > 7 ? 17 : 20;
  return (
    <div style={{
      background:T.card, border:`1.5px solid ${borderColor}`, borderRadius:12,
      padding:"11px 13px", flex:1, minWidth:115, maxWidth:195,
      boxShadow:"0 1px 6px rgba(44,102,168,.06)",
      display:"flex", flexDirection:"column", gap:3,
    }}>
      <div style={{fontSize:8.5,color:T.muted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",lineHeight:1.3}}>{label}</div>
      <div style={{fontSize, fontWeight:900, color:accent?T.accent:T.primary, lineHeight:1.15, wordBreak:"break-word"}}>{value}</div>
      {sub && <div style={{fontSize:9.5,color:T.text,lineHeight:1.3}}>{sub}</div>}
    </div>
  );
}

function Card({ title, children, flex }) {
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18,boxShadow:"0 1px 6px rgba(44,102,168,.06)",flex:flex||"unset"}}>
      {title && <div style={{fontSize:12.5,fontWeight:800,color:T.dark,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>{title}</div>}
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <span style={{fontSize:17}}>{icon}</span>
      <h2 style={{margin:0,fontSize:16,fontWeight:900,color:T.primary}}>{children}</h2>
    </div>
  );
}

function Legend({ afps }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
      {afps.map(a=>(
        <div key={a} style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5,color:T.text}}>
          {a === "Industria"
            ? <span style={{fontSize:11}}>🏭</span>
            : <div style={{width:11,height:11,borderRadius:3,background:AFP_COLORS[a]||T.primary}}/>
          }
          <span style={{fontWeight: a==="Industria" ? 700 : 400}}>{a}</span>
        </div>
      ))}
    </div>
  );
}



function CompTable({ afps, year, rows, showNDNote }) {
  const afpsOnly = afps.filter(a => a !== "Industria");
  return (
    <>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5}}>
        <thead>
          <tr style={{background:T.primary}}>
            <th style={{padding:"8px 11px",textAlign:"left",color:"#fff",fontWeight:700,fontSize:10.5}}>Métrica</th>
            {afps.map(a=>(
              <th key={a} style={{
                padding:"8px 9px",textAlign:"right",color:"#fff",fontWeight:700,fontSize:10.5,
                background: a==="Industria" ? "#1F2937" : undefined,
              }}>
                {a === "Industria"
                  ? <span style={{display:"inline-flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}>🏭 {a}</span>
                  : <span><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:AFP_COLORS[a],marginRight:3}}/>{a}</span>
                }
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=>{
            const vals    = afps.map(a => row.get(DATA[a]?.[year]));
            const numVals = afpsOnly.map(a => {
              const v = row.get(DATA[a]?.[year]);
              return v === null || v === undefined ? null : Number(v);
            }).filter(v => v !== null);
            const best = numVals.length
              ? (row.bestIsHigh ? Math.max(...numVals) : Math.min(...numVals))
              : null;

            return (
              <tr key={ri} style={{background:ri%2===0?T.bg:T.card}}>
                <td style={{padding:"7px 11px",color:T.text,fontWeight:600,fontSize:11}}>
                  {row.label}
                  {row.formula && <div style={{fontSize:8.5,color:T.muted,fontStyle:"italic",marginTop:1}}>{row.formula}</div>}
                </td>
                {afps.map((a,ai)=>{
                  const raw = vals[ai];
                  const isIndustria = a === "Industria";
                  const numV = raw === null || raw === undefined ? null : Number(raw);
                  const isBest = !isIndustria && numV !== null && numV === best && afpsOnly.length > 1;
                  return (
                    <td key={a} style={{
                      padding:"7px 9px",textAlign:"right",
                      background: isIndustria ? "#F3F4F6" : undefined,
                      borderLeft: isIndustria ? "2px solid #D1D5DB" : undefined,
                      fontWeight: isIndustria ? 700 : isBest ? 800 : 500,
                      color: isIndustria ? "#374151" : isBest ? AFP_COLORS[a] : T.dark,
                    }}>
                      {row.fmt ? row.fmt(raw) : (raw === null || raw === undefined ? "ND" : fmtNum(raw))}
                      {isBest && <span style={{fontSize:8.5,marginLeft:2,color:T.success}}>★</span>}
                      {isIndustria && <span style={{fontSize:8.5,marginLeft:2,color:"#6B7280"}}>Ø</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {showNDNote && <NDNote/>}
    {afps.length > 1 && <div style={{fontSize:9.5,color:T.muted,marginTop:6,display:"flex",gap:14}}>
      <span>★ Mejor valor entre AFP individuales</span>
      <span>Ø Industria = consolidado de las 7 AFP</span>
    </div>}
    </>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
function PageOverview({ afps, year }) {
  const primary = afps[0];
  const d = DATA[primary]?.[year] || {};
  return (
    <div>
      <SectionTitle icon="📊">Dashboard Ejecutivo — {year}</SectionTitle>
      <div style={{fontSize:10.5,color:T.muted,marginBottom:10,fontWeight:600}}>
        Vista principal: <span style={{color:AFP_COLORS[primary]||T.primary,fontWeight:800}}>{primary}</span>
        {afps.length>1 && <span> · Comparando con: {afps.slice(1).join(", ")}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:9,marginBottom:18}}>
        <KPICard label="Ingresos Totales"  value={cur(d.ingresos)}  sub={d.crecIngr !== null ? `Crec. YoY: ${d.crecIngr}%` : ""}/>
        <KPICard label="Utilidad Neta"     value={cur(d.utilidad)}  accent/>
        <KPICard label="Margen Neto"       value={fmtPct(d.margenNeto)} sub="Util / Ingresos"/>
        <KPICard label="ROE"               value={fmtPct(d.roe)}    accent sub="Util / Patrimonio"/>
        <KPICard label="Cost-to-Income"    value={fmtPct(d.cti)}    sub="Gastos / Ingresos"/>
        <KPICard label="AUM"               value={mm(d.aum)}        sub="Fondos Administrados"/>
        <KPICard label="Afiliados"         value={fmtAfil(d.afil)}   sub="EF auditado · Nota Cap. Mínimo"/>
        <KPICard label="Cotizantes (Dic)"  value={fmtAfil(d.cot)}    sub="SIPEN · cierre diciembre"/>
        <KPICard label="Densidad Cot/Afil" value={fmtPct(d.densidad)} sub="Cotizantes / Afiliados" ok={n_(d.densidad)>=40}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="📈 Ingresos (MM RD$) — Tendencia histórica">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.ingresos} years={YEARS}
            fmtLabel={v=>`${(v/1000).toFixed(1)}B`}/>
        </Card>
        <Card title="💰 Utilidad Neta (MM RD$) — Tendencia histórica">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.utilidad} years={YEARS}
            fmtLabel={v=>v.toFixed(0)}/>
        </Card>
      </div>

      <Card title={`Comparativo Ejecutivo AFP — ${year}`}>
        <CompTable afps={afps} year={year} rows={[
          { label:"Ingresos (MM RD$)",   get:d=>d?.ingresos,   fmt:v=>cur(v),        bestIsHigh:true  },
          { label:"Utilidad (MM RD$)",   get:d=>d?.utilidad,   fmt:v=>cur(v),        bestIsHigh:true  },
          { label:"Patrimonio (MM RD$)", get:d=>d?.pat,        fmt:v=>cur(v),        bestIsHigh:true  },
          { label:"Margen Neto (%)",     get:d=>d?.margenNeto, fmt:v=>fmtPct(v),     bestIsHigh:true  },
          { label:"ROE (%)",             get:d=>d?.roe,        fmt:v=>fmtPct(v),     bestIsHigh:true  },
          { label:"CTI (%)",             get:d=>d?.cti,        fmt:v=>fmtPct(v),     bestIsHigh:false },
          { label:"AUM (MM RD$)",        get:d=>d?.aum,        fmt:v=>mm(v),         bestIsHigh:true  },
          { label:"Afiliados",              get:d=>d?.afil,     fmt:v=>fmtAfil(v),  bestIsHigh:true  },
          { label:"Cotizantes (Dic SIPEN)",  get:d=>d?.cot,      fmt:v=>fmtAfil(v),  bestIsHigh:true  },
          { label:"Densidad Cot/Afil (%)",   get:d=>d?.densidad, fmt:v=>fmtPct(v),   bestIsHigh:true  },
        ]}/>
      </Card>
    </div>
  );
}

function PageGrowth({ afps, year }) {
  const totalAum2024 = AFP_LIST.reduce((s,a) => s + n_(DATA[a]?.["2024"]?.aum), 0);
  return (
    <div>
      <SectionTitle icon="🚀">Crecimiento del Negocio — {year}</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Afiliados — Tendencia histórica">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.afil)/1000} years={YEARS}
            fmtLabel={v=>`${v.toFixed(0)}K`}/>
        </Card>
        <Card title="Cotizantes dic (K) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.cot)/1000} years={YEARS}
            fmtLabel={v=>`${v.toFixed(0)}K`}/>
        </Card>
        <Card title="Densidad Cot/Afil (%) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.densidad)} years={YEARS}
            fmtLabel={v=>`${v.toFixed(1)}%`}/>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title={`Market Share AUM — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.ms} format="pct"/>
        </Card>
        <Card title={`Afiliados por AFP — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.afil} format="num"/>
        </Card>
      </div>
      <Card title={`Comparativo Crecimiento — ${year}`}>
        <CompTable afps={afps} year={year} rows={[
          { label:"Market Share AUM (%)", get:d=>d?.ms,     fmt:v=>fmtPct(v),    bestIsHigh:true },
          { label:"AUM (MM RD$)",         get:d=>d?.aum,    fmt:v=>mm(v),        bestIsHigh:true },
          { label:"Afiliados",            get:d=>d?.afil,   fmt:v=>fmtAfil(v),   bestIsHigh:true },
          { label:"Cotizantes (Dic SIPEN)", get:d=>d?.cot,      fmt:v=>fmtAfil(v),  bestIsHigh:true },
          { label:"Densidad Cot/Afil (%)", get:d=>d?.densidad, fmt:v=>fmtPct(v),   bestIsHigh:true },
          { label:"AUM / Afiliado (RD$)", get:d=>d?.afil>0?+(n_(d?.aum)/n_(d?.afil)*1000000).toFixed(0):null,
            fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
        ]}/>
      </Card>
    </div>
  );
}

function PageProfit({ afps, year }) {
  return (
    <div>
      <SectionTitle icon="💹">Rentabilidad — {year}</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title={`ROE (%) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.roe} format="pct"/>
        </Card>
        <Card title={`Margen Neto (%) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.margenNeto} format="pct"/>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="ROE (%) — Tendencia histórica">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.roe ?? 0} years={YEARS}
            fmtLabel={v=>`${v.toFixed(1)}%`}/>
        </Card>
        <Card title="Margen Neto (%) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.margenNeto ?? 0} years={YEARS}
            fmtLabel={v=>`${v.toFixed(1)}%`}/>
        </Card>
      </div>
      <Card title={`Comparativo Rentabilidad — ${year}`}>
        <div style={{fontSize:9,color:T.muted,marginBottom:8,padding:"5px 8px",background:"#F0F4F9",borderRadius:6}}>
          <strong>Fórmulas:</strong>
          {" "}Margen Neto = Utilidad / Ingresos · 
          {" "}ROE = Utilidad Neta / Patrimonio Neto (Nota Cap. Mínimo EF auditado) · 
          {" "}Revenue Yield = Ingresos / AUM · 
          {" "}Profit Yield = Utilidad / AUM · 
          {" "}CTI = Gastos Operativos / Ingresos · 
          {" "}Ingreso/Afil = Ingresos / Total Afiliados (EF)
        </div>
        <CompTable afps={afps} year={year} rows={[
          { label:"Margen Neto (%)",       formula:"Utilidad / Ingresos",
            get:d=>d?.margenNeto, fmt:v=>fmtPct(v),  bestIsHigh:true },
          { label:"ROE (%)",               formula:"Utilidad Neta / Patrimonio Neto (EF auditado)",
            get:d=>d?.roe,        fmt:v=>fmtPct(v),  bestIsHigh:true },
          { label:"CTI (%)",               formula:"Gastos Operativos / Ingresos",
            get:d=>d?.cti,        fmt:v=>fmtPct(v),  bestIsHigh:false },
          { label:"Revenue Yield (%)",     formula:"Ingresos / AUM",
            get:d=>d?.revYield,   fmt:v=>v===null?"ND":fmtPct(v),  bestIsHigh:true },
          { label:"Profit Yield (%)",      formula:"Utilidad / AUM",
            get:d=>d?.profYield,  fmt:v=>v===null?"ND":fmtPct(v),  bestIsHigh:true },
          { label:"Ingreso / Afiliado (RD$)",  formula:"Ingresos / Total Afiliados (EF)",
            get:d=>d?.ingAfil,    fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
          { label:"Utilidad / Afiliado (RD$)", formula:"Utilidad / Total Afiliados (EF)",
            get:d=>d?.utilAfil,   fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
        ]}/>
      </Card>
    </div>
  );
}

function PageEfficiency({ afps, year }) {
  return (
    <div>
      <SectionTitle icon="⚙️">Eficiencia Operativa — {year}</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title={`Cost-to-Income (%) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.cti} format="pct"/>
        </Card>
        <Card title={`AUM / Empleado (MM) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.aumEmp} format="num"/>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Cost-to-Income (%) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.cti ?? 0} years={YEARS}
            fmtLabel={v=>`${v.toFixed(1)}%`}/>
        </Card>
        <Card title="AUM (MM RD$) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.aum)/1000} years={YEARS}
            fmtLabel={v=>`${v.toFixed(1)}B`}/>
        </Card>
      </div>
      <Card title={`Comparativo Eficiencia — ${year}`}>
        <CompTable afps={afps} year={year} rows={[
          { label:"Cost-to-Income (%)",      get:d=>d?.cti,       fmt:v=>fmtPct(v),   bestIsHigh:false },
          { label:"Gastos Operativos (MM)",  get:d=>d?.gasOp,     fmt:v=>cur(v),      bestIsHigh:false },
          { label:"Personal Admin (MM)",     get:d=>d?.persAdmin, fmt:v=>cur(v),      bestIsHigh:false },
          { label:"Personal Comercial (MM)", get:d=>d?.persCom,   fmt:v=>cur(v),      bestIsHigh:false },
          { label:"Costo / Afiliado (RD$)",  get:d=>d?.costAfil,  fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:false },
          { label:"Costo / AUM (%)",         get:d=>d?.costAum,   fmt:v=>v===null?"ND":fmtPct(v), bestIsHigh:false },
          { label:"AUM / Empleado (MM RD$)", get:d=>d?.aumEmp,    fmt:v=>v===null?"ND":`RD$${fmtNum(v)}MM`, bestIsHigh:true },
        ]}/>
      </Card>
    </div>
  );
}

function PageDupont({ afps, year }) {
  const primary = afps[0];
  const d = DATA[primary]?.[year] || {};
  const r = RAW[primary]?.[year] || {};
  // DuPont real: ROE = Margen Neto × (Ingresos/Patrimonio)
  const margenReal  = d.ingresos > 0 ? d.utilidad / d.ingresos : 0;
  const rotacionPat = d.pat > 0 ? d.ingresos / d.pat : 0;
  const roeCalc     = (margenReal * rotacionPat * 100).toFixed(1);

  return (
    <div>
      <SectionTitle icon="🔬">Análisis DuPont — Creación de Valor</SectionTitle>
      <Card title={`DuPont ROE — ${primary} (${year})`}>
        <div style={{fontSize:10,color:T.muted,marginBottom:12}}>
          ROE = Margen Neto × Rotación de Patrimonio = (Utilidad / Ingresos) × (Ingresos / Patrimonio Neto)
          <br/>
          <span style={{fontSize:9}}>Fuente: Nota Capital Mínimo EF Auditados · Patrimonio Neto = renglón 4/5 de la Nota Capital Mínimo</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
          {[
            {l:"Margen Neto",     v:`${(margenReal*100).toFixed(1)}%`, sub:"Util/Ing", c:T.primary},
            {sep:"×"},
            {l:"Rot. Patrimonio", v:`${rotacionPat.toFixed(2)}x`,      sub:"Ing/Pat",  c:T.secondary},
            {sep:"="},
            {l:"ROE",             v:`${fmtPct(d.roe)}`,               sub:"Aus. EF",  c:T.primary, big:true},
          ].map((item,i)=>
            item.sep
              ? <span key={i} style={{fontSize:22,color:T.muted,fontWeight:200}}>{item.sep}</span>
              : <div key={i} style={{
                  background:item.big?item.c:T.bg,
                  border:`2px solid ${item.c}`,borderRadius:10,
                  padding:item.big?"13px 20px":"9px 15px",textAlign:"center"
                }}>
                  <div style={{fontSize:item.big?20:16,fontWeight:900,color:item.big?"#fff":item.c}}>{item.v}</div>
                  <div style={{fontSize:9,color:item.big?"rgba(255,255,255,.75)":T.muted,marginTop:1}}>{item.l}</div>
                  {item.sub && <div style={{fontSize:8,color:item.big?"rgba(255,255,255,.6)":T.muted}}>{item.sub}</div>}
                </div>
          )}
        </div>
        <div style={{fontSize:9.5,color:T.muted,marginTop:6,padding:"5px 8px",background:"#F0F4F9",borderRadius:6}}>
          Utilidad = RD${fmtNum(r.util)} MM · Ingresos = RD${fmtNum(r.ing)} MM · Patrimonio Neto (EF) = RD${fmtNum(r.pat)} MM
        </div>
      </Card>

      <div style={{marginTop:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card title="ROE (%) — Tendencia histórica">
            <Legend afps={afps}/>
            <LineChart afps={afps} getVal={(a,yr)=>DATA[a]?.[yr]?.roe ?? 0} years={YEARS}
              fmtLabel={v=>`${v.toFixed(1)}%`}/>
          </Card>
          <Card title={`DuPont Comparativo — ${year}`}>
            <CompTable afps={afps} year={year} rows={[
              { label:"Margen Neto (%)",    formula:"Util/Ing",  get:d=>d?.margenNeto, fmt:v=>fmtPct(v), bestIsHigh:true },
              { label:"Rot. Patrimonio",    formula:"Ing/Pat",
                get:d=>d?.pat>0?(d?.ingresos/d?.pat):null,
                fmt:v=>v===null?"ND":`${v.toFixed(2)}x`, bestIsHigh:true },
              { label:"ROE (%)",            formula:"Util/Pat (EF)", get:d=>d?.roe, fmt:v=>fmtPct(v), bestIsHigh:true },
            ]}/>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PageUnit({ afps, year }) {
  return (
    <div>
      <SectionTitle icon="📐">Unit Economics — Productividad por Afiliado</SectionTitle>
      <div style={{fontSize:9.5,color:T.muted,marginBottom:12,padding:"6px 10px",background:"#F0F4F9",borderRadius:6,borderLeft:`2px solid ${T.primary}`}}>
        Afiliados: Nota Capital Mínimo de los EF auditados · Cotizantes al cierre de diciembre: SIPEN hoja "Por AFP"
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title={`Utilidad / Afiliado (RD$) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.utilAfil ?? 0} format="num"/>
        </Card>
        <Card title={`Ingreso / Afiliado (RD$) — ${year}`}>
          <BarChart afps={afps.filter(a=>a!=="Industria")} getValue={a=>DATA[a]?.[year]?.ingAfil ?? 0} format="num"/>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Ingreso / Afiliado (RD$) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.ingAfil)} years={YEARS}
            fmtLabel={v=>`${(v/1000).toFixed(1)}K`}/>
        </Card>
        <Card title="Profit Yield (Util/AUM %) — Tendencia">
          <Legend afps={afps}/>
          <LineChart afps={afps} getVal={(a,yr)=>n_(DATA[a]?.[yr]?.profYield)} years={YEARS}
            fmtLabel={v=>`${v.toFixed(2)}%`}/>
        </Card>
      </div>
      <Card title={`Unit Economics — ${year}`}>
        <CompTable afps={afps} year={year} rows={[
          { label:"Ingreso / Afiliado (RD$)",  formula:"Ing / Afiliados (EF)",
            get:d=>d?.ingAfil,   fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
          { label:"Costo / Afiliado (RD$)",    formula:"Gasto / Afiliados (EF)",
            get:d=>d?.costAfil,  fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:false },
          { label:"Utilidad / Afiliado (RD$)", formula:"Util / Afiliados (EF)",
            get:d=>d?.utilAfil,  fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
          { label:"Ingreso / Cotizante (RD$)",  formula:"Ing / Cotizantes (SIPEN dic)",
            get:d=>d?.ingCot,   fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
          { label:"Utilidad / Cotizante (RD$)", formula:"Util / Cotizantes (SIPEN dic)",
            get:d=>d?.utilCot,  fmt:v=>v===null?"ND":`RD$${fmtNum(v)}`, bestIsHigh:true },
          { label:"Revenue Yield (Ing/AUM %)",  formula:"Ingresos / AUM",
            get:d=>d?.revYield,  fmt:v=>v===null?"ND":fmtPct(v), bestIsHigh:true },
          { label:"Profit Yield (Util/AUM %)",  formula:"Utilidad / AUM",
            get:d=>d?.profYield, fmt:v=>v===null?"ND":fmtPct(v), bestIsHigh:true },
        ]}/>
      </Card>
    </div>
  );
}

function PageBenchmark({ afps, year }) {
  const benchmarks = [
    { metric:"Cost-to-Income (%)",     range:"45%–65%",   note:"Asset managers globales",
      good:a=>n_(DATA[a]?.[year]?.cti)<=65, fmt:a=>fmtPct(DATA[a]?.[year]?.cti) },
    { metric:"Revenue Yield (Ing/AUM)",range:"0.50%–1.50%",note:"Comisión sobre activos",
      good:a=>n_(DATA[a]?.[year]?.revYield)>=0.5, fmt:a=>fmtPct(DATA[a]?.[year]?.revYield) },
    { metric:"Profit Yield (Util/AUM)",range:">0.20%",    note:"Rentabilidad sobre AUM",
      good:a=>n_(DATA[a]?.[year]?.profYield)>=0.2, fmt:a=>fmtPct(DATA[a]?.[year]?.profYield) },
    { metric:"ROE (%)",                range:"14%–25%",   note:"Retorno para accionistas",
      good:a=>{const v=DATA[a]?.[year]?.roe; return v!==null&&v>=14;}, fmt:a=>fmtPct(DATA[a]?.[year]?.roe) },
    { metric:"Margen Neto (%)",        range:"22%–40%",   note:"Eficiencia de monetización",
      good:a=>n_(DATA[a]?.[year]?.margenNeto)>=22, fmt:a=>fmtPct(DATA[a]?.[year]?.margenNeto) },
    { metric:"AUM / Empleado (MM RD$)",range:">1,500MM",  note:"Escala operativa",
      good:a=>n_(DATA[a]?.[year]?.aumEmp)>=1500, fmt:a=>DATA[a]?.[year]?.aumEmp===null?"ND":`${fmtNum(DATA[a]?.[year]?.aumEmp)}MM` },
  ];
  return (
    <div>
      <SectionTitle icon="🏆">Benchmarks Internacionales — {year}</SectionTitle>
      <div style={{fontSize:11,color:T.muted,marginBottom:14}}>
        Referencia: BlackRock, Schroders, T. Rowe Price, fondos pensiones LATAM. ✔ dentro del rango · ⚠ revisar
      </div>
      <Card>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{background:T.primary}}>
                <th style={{padding:"8px 11px",textAlign:"left",color:"#fff",fontWeight:700,fontSize:10.5}}>Métrica</th>
                <th style={{padding:"8px 9px",textAlign:"left",color:"#fff",fontWeight:700,fontSize:10.5}}>Rango Ref.</th>
                <th style={{padding:"8px 9px",textAlign:"left",color:"#fff",fontWeight:700,fontSize:10.5}}>Nota</th>
                {afps.map(a=>(
                  <th key={a} style={{padding:"8px 9px",textAlign:"center",color:"#fff",fontWeight:700,fontSize:10.5}}>
                    <span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:AFP_COLORS[a]||"#fff",marginRight:3}}/>
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b,i)=>(
                <tr key={b.metric} style={{background:i%2===0?T.bg:T.card}}>
                  <td style={{padding:"7px 11px",fontWeight:700,color:T.dark,fontSize:11}}>{b.metric}</td>
                  <td style={{padding:"7px 9px",color:T.secondary,fontSize:10}}>{b.range}</td>
                  <td style={{padding:"7px 9px",color:T.muted,fontSize:10}}>{b.note}</td>
                  {afps.map(a=>(
                    <td key={a} style={{padding:"7px 9px",textAlign:"center"}}>
                      <span style={{fontWeight:700,color:b.good(a)?T.success:T.danger,fontSize:11}}>{b.fmt(a)}</span>
                      <span style={{marginLeft:3,fontSize:11}}>{b.good(a)?"✔":"⚠"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const PAGES = [
  { id:"overview",   label:"📊 Overview"       },
  { id:"growth",     label:"🚀 Crecimiento"    },
  { id:"profit",     label:"💹 Rentabilidad"   },
  { id:"efficiency", label:"⚙️ Eficiencia"     },
  { id:"dupont",     label:"🔬 DuPont / ROE"   },
  { id:"unit",       label:"📐 Unit Economics" },
  { id:"benchmark",  label:"🏆 Benchmarks"     },
];

export default function App() {
  const [page,     setPage]     = useState("overview");
  const [year,     setYear]     = useState("2024");
  const [selected, setSelected] = useState(["Siembra","Industria"]);

  const toggleAfp = afp => {
    setSelected(prev =>
      prev.includes(afp)
        ? prev.length > 1 ? prev.filter(a => a !== afp) : prev
        : [...prev, afp]
    );
  };

  const pages = {
    overview:   <PageOverview   afps={selected} year={year}/>,
    growth:     <PageGrowth     afps={selected} year={year}/>,
    profit:     <PageProfit     afps={selected} year={year}/>,
    efficiency: <PageEfficiency afps={selected} year={year}/>,
    dupont:     <PageDupont     afps={selected} year={year}/>,
    unit:       <PageUnit       afps={selected} year={year}/>,
    benchmark:  <PageBenchmark  afps={selected} year={year}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",color:T.dark,fontSize:13}}>

      {/* Header */}
      <div style={{background:T.primary,padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 10px rgba(44,102,168,.3)",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:9,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"#fff"}}>🌱</div>
          <div>
            <div style={{fontWeight:900,fontSize:15,color:"#fff",letterSpacing:"-.01em"}}>Dashboard AFP — República Dominicana</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.65)"}}>Análisis estratégico · Datos: Estados Financieros Auditados 2019–2024</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:10.5,color:"rgba(255,255,255,.7)"}}>Año:</span>
          <div style={{display:"flex",gap:4}}>
            {YEARS.map(yr=>(
              <button key={yr} onClick={()=>setYear(yr)} style={{
                padding:"4px 9px",fontSize:11.5,fontWeight:700,cursor:"pointer",border:"none",borderRadius:6,
                background:year===yr?T.accent:"rgba(255,255,255,.15)",
                color:year===yr?"#fff":"rgba(255,255,255,.8)",transition:"all .2s"
              }}>{yr}</button>
            ))}
          </div>
        </div>
      </div>

      {/* AFP Selector */}
      <div style={{background:T.secondary,padding:"9px 22px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontSize:10.5,color:"rgba(255,255,255,.75)",fontWeight:700,flexShrink:0}}>AFP a comparar:</span>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {AFP_LIST.map(afp=>{
            const active = selected.includes(afp);
            const color  = AFP_COLORS[afp];
            return (
              <button key={afp} onClick={()=>toggleAfp(afp)} style={{
                padding:"4px 11px",fontSize:11.5,fontWeight:700,cursor:"pointer",borderRadius:20,transition:"all .2s",
                background: active ? color : "rgba(255,255,255,.12)",
                color: active ? "#fff" : "rgba(255,255,255,.7)",
                border: `2px solid ${active ? color : "rgba(255,255,255,.2)"}`,
                boxShadow: active ? `0 2px 8px ${color}55` : "none",
              }}>{afp}</button>
            );
          })}
          <div style={{width:1,height:20,background:"rgba(255,255,255,.2)",margin:"0 3px"}}/>
          {(()=>{
            const active = selected.includes("Industria");
            return (
              <button onClick={()=>toggleAfp("Industria")} style={{
                padding:"4px 13px",fontSize:11.5,fontWeight:800,cursor:"pointer",borderRadius:20,transition:"all .2s",
                background: active ? "#374151" : "rgba(255,255,255,.12)",
                color: active ? "#fff" : "rgba(255,255,255,.7)",
                border: `2px solid ${active ? "#F9FAFB" : "rgba(255,255,255,.25)"}`,
                display:"flex",alignItems:"center",gap:5,
              }}>
                <span style={{fontSize:12}}>🏭</span>
                Industria
                <span style={{fontSize:8.5,fontWeight:700,background:"rgba(255,255,255,.2)",borderRadius:4,padding:"1px 4px"}}>TOTAL</span>
              </button>
            );
          })()}
        </div>
        <span style={{fontSize:9.5,color:"rgba(255,255,255,.5)",marginLeft:"auto"}}>Mín. 1</span>
      </div>

      {/* Page Nav */}
      <div style={{background:"#fff",borderBottom:`1px solid ${T.border}`,padding:"0 18px",display:"flex",overflowX:"auto",gap:2}}>
        {PAGES.map(p=>(
          <button key={p.id} onClick={()=>setPage(p.id)} style={{
            padding:"11px 14px",fontSize:11.5,fontWeight:700,cursor:"pointer",border:"none",whiteSpace:"nowrap",
            background:"transparent",transition:"all .2s",
            color:page===p.id?T.primary:T.muted,
            borderBottom:page===p.id?`3px solid ${T.accent}`:"3px solid transparent",
          }}>{p.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{maxWidth:1160,margin:"0 auto",padding:"22px 18px"}}>
        {pages[page]}
      </div>

      <div style={{textAlign:"center",padding:"14px",fontSize:9.5,color:T.muted,borderTop:`1px solid ${T.border}`}}>
        Dashboard Estratégico AFP · Sistema de Pensiones RD · 
        <strong>Fuente:</strong> Estados Financieros Auditados 2019–2024 · 
        Afiliados: Nota Capital Mínimo (EF auditados) · 
        Cotizantes: SIPEN hoja «Por AFP», cierre de diciembre · Densidad = Cotizantes / Afiliados
      </div>
    </div>
  );
}
