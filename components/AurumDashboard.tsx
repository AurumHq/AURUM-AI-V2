"use client";

import React from "react";

export type DecisionResponse = {
  success: boolean;
  engine?: string;
  decision?: "BUY" | "SELL" | "HOLD";
  trend?: string;
  confidence?: number;
  price?: number;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  support?: number;
  resistance?: number;
  riskReward?: number | null;
  indicators?: {
    ema20?: number;
    ema50?: number;
    ema200?: number;
    rsi14?: number;
    rsiCondition?: string;
  };
  scores?: {
    bullish?: number;
    bearish?: number;
    difference?: number;
  };
  structure?: string;
  reasons?: string[];
  warning?: string;
};

const money = (v?: number | null) =>
  v == null ? "—" : `$${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function AurumDashboard() {
  const [data,setData] = React.useState<DecisionResponse|null>(null);

  React.useEffect(()=>{
    const load=()=>fetch("/api/decision",{cache:"no-store"})
      .then(r=>r.json()).then(setData).catch(console.error);
    load();
    const id=setInterval(load,10000);
    return ()=>clearInterval(id);
  },[]);

  if(!data){
    return <main style={{padding:40,color:"#fff",background:"#0b0b0b",minHeight:"100vh"}}>Loading AURUM…</main>;
  }

  return (
    <main style={{background:"#0b0b0b",color:"#f4f1e8",minHeight:"100vh",padding:32,fontFamily:"Inter,sans-serif"}}>
      <h1 style={{fontSize:56,marginBottom:8}}>AURUM AI</h1>
      <p>{data.engine}</p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(180px,1fr))",gap:16}}>
        {[
          ["Decision",data.decision],
          ["Trend",data.trend],
          ["Confidence",`${data.confidence??0}%`],
          ["Price",money(data.price)],
          ["Entry",money(data.entry)],
          ["Stop",money(data.stop)],
          ["Target",money(data.target)],
          ["Risk/Reward",data.riskReward?`1:${data.riskReward}`:"—"],
          ["EMA 20",money(data.indicators?.ema20)],
          ["EMA 50",money(data.indicators?.ema50)],
          ["EMA 200",money(data.indicators?.ema200)],
          ["RSI 14",String(data.indicators?.rsi14 ?? "—")],
          ["RSI State",data.indicators?.rsiCondition],
          ["Bullish Score",String(data.scores?.bullish ?? "—")],
          ["Bearish Score",String(data.scores?.bearish ?? "—")],
          ["Difference",String(data.scores?.difference ?? "—")],
          ["Structure",data.structure],
          ["Support",money(data.support)],
          ["Resistance",money(data.resistance)]
        ].map(([k,v])=>(
          <div key={k} style={{border:"1px solid #444",borderRadius:12,padding:16}}>
            <div style={{opacity:.7,fontSize:13}}>{k}</div>
            <div style={{fontSize:26,fontWeight:700}}>{v ?? "—"}</div>
          </div>
        ))}
      </div>

      <h3>Reasons</h3>
      <ul>
        {(data.reasons??[]).map(r=><li key={r}>{r}</li>)}
      </ul>

      {data.warning && <p style={{color:"#ffb84d"}}>{data.warning}</p>}
    </main>
  );
}
