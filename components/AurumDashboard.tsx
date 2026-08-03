"use client";

import React from "react";

type Direction = "BUY" | "SELL" | "HOLD";
type RiskMode = "Protect" | "Balanced" | "Aggressive";

type DecisionResponse = {
  success: boolean;
  engine?: string;
  decision?: Direction;
  trend?: string;
  confidence?: number;
  grade?: string;
  structure?: string;
  price?: number;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  support?: number;
  resistance?: number;
  riskReward?: number | null;
  indicators?: {
    ema20?: number; ema50?: number; ema200?: number; rsi14?: number;
    rsiCondition?: string; macd?: number; macdSignal?: string;
    macdMomentum?: string; atr14?: number; atrVolatility?: string;
    atrDirection?: string;
  };
  scores?: { bullish?: number; bearish?: number; difference?: number };
  reasons?: string[];
  warning?: string;
};

type HelpTopic = { title: string; plain: string; why: string; interpretation: string };

const HELP: Record<string, HelpTopic> = {
  decision:{title:"Current Decision",plain:"AURUM's present action: BUY, SELL, or HOLD.",why:"It combines trend, momentum, structure, price location, and volatility.",interpretation:"HOLD means the signals are not aligned strongly enough to justify a trade."},
  trend:{title:"Trend",plain:"The broader direction of the gold market.",why:"Trading with the dominant trend generally reduces conflict between signals.",interpretation:"Bullish favors buyers, Bearish favors sellers, and Mixed means conditions disagree."},
  confidence:{title:"Confidence",plain:"A measure of how strongly AURUM's modules agree.",why:"It shows alignment, not a guaranteed probability of winning.",interpretation:"Higher values mean stronger agreement; lower values mean mixed evidence."},
  grade:{title:"Trade Grade",plain:"A quality label for the current setup.",why:"It separates strong opportunities from marginal ones.",interpretation:"A+ and A are strongest. B and C need caution. SKIP means no trade."},
  price:{title:"Live XAU/USD",plain:"The current quoted price of gold versus the U.S. dollar.",why:"Entries, stops, targets, and indicators are calculated around this price.",interpretation:"The value refreshes automatically from the live market-data feed."},
  entry:{title:"Entry",plain:"The proposed trade-entry price.",why:"It anchors the stop, target, and risk/reward calculation.",interpretation:"A blank entry means AURUM is not approving a trade."},
  stop:{title:"Stop Loss",plain:"The price where the trade thesis is considered invalid.",why:"It limits downside and protects capital.",interpretation:"AURUM uses ATR volatility to avoid unrealistic stops."},
  target:{title:"Take Profit",plain:"The price where AURUM expects the trade to realize profit.",why:"It establishes expected reward before a trade is considered.",interpretation:"The target changes with risk mode and volatility."},
  rr:{title:"Risk / Reward",plain:"The relationship between potential loss and potential gain.",why:"A 1:2 setup risks one unit to pursue two units of reward.",interpretation:"Higher reward is not automatically better if the target is unrealistic."},
  ema20:{title:"EMA 20",plain:"A short-term exponential moving average.",why:"It reacts quickly to recent price changes.",interpretation:"Price above EMA 20 is generally bullish; below is generally bearish."},
  ema50:{title:"EMA 50",plain:"A medium-term exponential moving average.",why:"It filters short-term noise.",interpretation:"EMA 20 above EMA 50 supports bullish momentum; below supports bearish momentum."},
  ema200:{title:"EMA 200",plain:"A long-term trend benchmark.",why:"Professionals often use it to judge major directional bias.",interpretation:"Price above EMA 200 is generally long-term bullish; below is generally bearish."},
  rsi:{title:"RSI 14",plain:"Relative Strength Index measures momentum from 0 to 100.",why:"It helps identify buying pressure, selling pressure, and exhaustion.",interpretation:"Above 70 is often overbought, below 30 oversold, and around 50 neutral."},
  macd:{title:"MACD",plain:"A trend-momentum indicator built from moving averages.",why:"It confirms whether momentum supports the current direction.",interpretation:"MACD above its signal line is bullish; below is bearish."},
  atr:{title:"ATR 14",plain:"Average True Range measures volatility, not direction.",why:"AURUM uses it to calculate realistic stops and targets.",interpretation:"Higher ATR means wider movement; lower ATR means quieter conditions."},
  bullish:{title:"Bullish Score",plain:"The weighted evidence supporting higher gold prices.",why:"It combines independent modules instead of one indicator.",interpretation:"A higher score means stronger bullish alignment."},
  bearish:{title:"Bearish Score",plain:"The weighted evidence supporting lower gold prices.",why:"It provides the opposing side of AURUM's framework.",interpretation:"A higher score means stronger bearish alignment."},
  difference:{title:"Score Difference",plain:"The gap between bullish and bearish scores.",why:"A wider gap means one side has clearer control.",interpretation:"A small difference usually produces HOLD or SKIP."},
  structure:{title:"Market Structure",plain:"The pattern of recent highs and lows.",why:"It reveals whether buyers or sellers control progression.",interpretation:"Higher highs/lows are bullish; lower highs/lows are bearish."},
  support:{title:"Support",plain:"A recent zone where buying pressure appeared.",why:"It may slow declines or define invalidation.",interpretation:"Support is a zone, not a guaranteed floor."},
  resistance:{title:"Resistance",plain:"A recent zone where selling pressure appeared.",why:"It may slow advances or become a profit-taking area.",interpretation:"Resistance is a zone, not a guaranteed ceiling."},
};

const money=(v?:number|null)=>v==null?"—":`$${v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const num=(v?:number|null,d=2)=>v==null?"—":v.toFixed(d);

function Info({topic,onClick}:{topic:string;onClick:(t:string)=>void}){
  return <button type="button" onClick={()=>onClick(topic)} aria-label={`Explain ${HELP[topic]?.title??topic}`} style={{width:22,height:22,borderRadius:"50%",border:"1px solid #6f5a22",background:"transparent",color:"#e8c568",cursor:"pointer",fontSize:13}}>i</button>;
}

function Card({label,value,topic,onHelp}:{label:string;value:React.ReactNode;topic:string;onHelp:(t:string)=>void}){
  return <article style={{border:"1px solid #3a3528",borderRadius:16,padding:18,minHeight:108,background:"linear-gradient(180deg,#12130f,#0c0d0b)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:12}}><span style={{color:"#aaa99f",fontSize:14}}>{label}</span><Info topic={topic} onClick={onHelp}/></div>
    <strong style={{fontSize:27}}>{value}</strong>
  </article>;
}

export default function AurumDashboard(){
  const [data,setData]=React.useState<DecisionResponse|null>(null);
  const [helpTopic,setHelpTopic]=React.useState<string|null>(null);
  const [learningMode,setLearningMode]=React.useState(true);
  const [riskMode,setRiskMode]=React.useState<RiskMode>("Balanced");
  const [lastUpdated,setLastUpdated]=React.useState<Date|null>(null);

  React.useEffect(()=>{let active=true; const load=async()=>{try{const r=await fetch("/api/decision",{cache:"no-store"});const j=await r.json();if(active){setData(j);setLastUpdated(new Date())}}catch{if(active)setData({success:false})}};load();const id=window.setInterval(load,10000);return()=>{active=false;window.clearInterval(id)}},[]);

  if(!data)return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#080907",color:"#f5f1e8",fontFamily:"Inter,Arial,sans-serif"}}>Loading AURUM…</main>;

  const help=helpTopic?HELP[helpTopic]:null;
  const decisionColor=data.decision==="BUY"?"#58d68d":data.decision==="SELL"?"#ff7474":"#e8c568";

  return <main style={{minHeight:"100vh",padding:"28px clamp(18px,4vw,58px) 56px",background:"radial-gradient(circle at top right,rgba(185,141,36,.12),transparent 30%),#080907",color:"#f5f1e8",fontFamily:"Inter,Arial,sans-serif"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap",marginBottom:28}}>
      <div><div style={{color:"#d6ae4b",letterSpacing:3,fontSize:12,fontWeight:700,marginBottom:8}}>PRIVATE GOLD INTELLIGENCE PLATFORM</div><h1 style={{fontSize:"clamp(42px,7vw,78px)",margin:0,lineHeight:.95}}>AURUM AI</h1><p style={{color:"#aaa99f",marginTop:14}}>{data.engine}</p></div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button type="button" onClick={()=>setLearningMode(v=>!v)} style={{border:"1px solid #6f5a22",background:learningMode?"#d6ae4b":"transparent",color:learningMode?"#111":"#e8c568",borderRadius:999,padding:"11px 16px",cursor:"pointer",fontWeight:700}}>🎓 Learning Mode {learningMode?"ON":"OFF"}</button>
        <div style={{border:"1px solid #3a3528",borderRadius:999,padding:"11px 16px",color:"#aaa99f"}}>Live • {lastUpdated?lastUpdated.toLocaleTimeString():"Connecting"}</div>
      </div>
    </header>

    <section style={{border:"1px solid #5d4a1c",borderRadius:24,padding:"28px clamp(20px,4vw,38px)",background:"linear-gradient(135deg,#12150f,#0b0c0a)",marginBottom:22,display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(220px,.5fr)",gap:24}}>
      <div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#aaa99f"}}>Current Decision</span><Info topic="decision" onClick={setHelpTopic}/></div><div style={{fontSize:"clamp(58px,10vw,118px)",fontWeight:800,color:decisionColor,lineHeight:.95,margin:"16px 0"}}>{data.decision??"—"}</div><p style={{color:"#c3c0b5",fontSize:18,maxWidth:820}}>{(data.reasons??[]).slice(0,3).join(" ")}</p></div>
      <div style={{borderLeft:"1px solid #3a3528",paddingLeft:26,display:"grid",alignContent:"center",gap:18}}>
        <div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:"#aaa99f"}}>Confidence</span><Info topic="confidence" onClick={setHelpTopic}/></div><strong style={{fontSize:50,color:"#e8c568"}}>{data.confidence??0}%</strong></div>
        <div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:"#aaa99f"}}>Trade Grade</span><Info topic="grade" onClick={setHelpTopic}/></div><strong style={{fontSize:40}}>{data.grade??"—"}</strong></div>
      </div>
    </section>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:22}}>
      <Card label="Live XAU/USD" value={money(data.price)} topic="price" onHelp={setHelpTopic}/><Card label="Entry" value={money(data.entry)} topic="entry" onHelp={setHelpTopic}/><Card label="Stop Loss" value={money(data.stop)} topic="stop" onHelp={setHelpTopic}/><Card label="Take Profit" value={money(data.target)} topic="target" onHelp={setHelpTopic}/><Card label="Risk / Reward" value={data.riskReward?`1 : ${data.riskReward}`:"—"} topic="rr" onHelp={setHelpTopic}/>
    </section>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:22}}>
      <Card label="EMA 20" value={money(data.indicators?.ema20)} topic="ema20" onHelp={setHelpTopic}/><Card label="EMA 50" value={money(data.indicators?.ema50)} topic="ema50" onHelp={setHelpTopic}/><Card label="EMA 200" value={money(data.indicators?.ema200)} topic="ema200" onHelp={setHelpTopic}/><Card label="RSI 14" value={num(data.indicators?.rsi14)} topic="rsi" onHelp={setHelpTopic}/><Card label="MACD" value={num(data.indicators?.macd,4)} topic="macd" onHelp={setHelpTopic}/><Card label="ATR 14" value={num(data.indicators?.atr14,4)} topic="atr" onHelp={setHelpTopic}/>
    </section>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:22}}>
      <Card label="Bullish Score" value={data.scores?.bullish??"—"} topic="bullish" onHelp={setHelpTopic}/><Card label="Bearish Score" value={data.scores?.bearish??"—"} topic="bearish" onHelp={setHelpTopic}/><Card label="Score Difference" value={data.scores?.difference??"—"} topic="difference" onHelp={setHelpTopic}/><Card label="Market Structure" value={data.structure??"—"} topic="structure" onHelp={setHelpTopic}/><Card label="Support" value={money(data.support)} topic="support" onHelp={setHelpTopic}/><Card label="Resistance" value={money(data.resistance)} topic="resistance" onHelp={setHelpTopic}/>
    </section>

    <section style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(280px,.6fr)",gap:18,marginBottom:22}}>
      <article style={{border:"1px solid #3a3528",borderRadius:18,padding:22,background:"#0d0f0b"}}><div style={{color:"#d6ae4b",fontSize:12,letterSpacing:2,fontWeight:700}}>AURUM AI ANALYSIS</div><h2>Why AURUM reached this decision</h2><p style={{color:"#c3c0b5",lineHeight:1.7,fontSize:17}}>{(data.reasons??[]).join(" ")}</p></article>
      <article style={{border:"1px solid #3a3528",borderRadius:18,padding:22,background:"#0d0f0b"}}><div style={{color:"#d6ae4b",fontSize:12,letterSpacing:2,fontWeight:700}}>RISK MODE</div><h2>Choose your operating style</h2><div style={{display:"grid",gap:10}}>{(["Protect","Balanced","Aggressive"] as RiskMode[]).map(mode=><button key={mode} type="button" onClick={()=>setRiskMode(mode)} style={{padding:"13px 14px",borderRadius:12,border:"1px solid #5d4a1c",background:riskMode===mode?"#d6ae4b":"transparent",color:riskMode===mode?"#111":"#f5f1e8",cursor:"pointer",fontWeight:700}}>{mode}</button>)}</div><p style={{color:"#aaa99f",marginTop:16,lineHeight:1.5}}>{riskMode==="Protect"?"Tighter risk controls and smaller volatility allowance.":riskMode==="Aggressive"?"Wider volatility allowance and larger target expectations.":"Balanced ATR-based risk and target settings."}</p></article>
    </section>

    {data.warning&&<div style={{border:"1px solid #6f5a22",borderRadius:14,padding:16,color:"#e8c568",background:"rgba(214,174,75,.07)"}}>{data.warning}</div>}

    {help&&<div role="dialog" aria-modal="true" onClick={()=>setHelpTopic(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"grid",placeItems:"center",padding:18,zIndex:1000}}><article onClick={e=>e.stopPropagation()} style={{width:"min(620px,100%)",borderRadius:22,border:"1px solid #6f5a22",background:"#11130f",padding:28,boxShadow:"0 30px 90px rgba(0,0,0,.55)"}}><div style={{display:"flex",justifyContent:"space-between",gap:20}}><div><div style={{color:"#d6ae4b",fontSize:12,letterSpacing:2,fontWeight:700}}>AURUM ACADEMY</div><h2 style={{fontSize:34,margin:"8px 0 18px"}}>{help.title}</h2></div><button type="button" onClick={()=>setHelpTopic(null)} style={{width:36,height:36,borderRadius:"50%",border:"1px solid #4a4435",background:"transparent",color:"#fff",cursor:"pointer",fontSize:20}}>×</button></div><h3>What it is</h3><p style={{color:"#c3c0b5",lineHeight:1.6}}>{help.plain}</p><h3>Why it matters</h3><p style={{color:"#c3c0b5",lineHeight:1.6}}>{help.why}</p><h3>How to interpret it</h3><p style={{color:"#c3c0b5",lineHeight:1.6}}>{help.interpretation}</p></article></div>}
  </main>;
}
