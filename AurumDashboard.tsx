"use client";

import { useMemo, useRef, useState } from "react";

type Direction = "BUY" | "SELL" | "HOLD";
type RiskMode = "Protect" | "Balanced" | "Aggressive";
type TradePlan = {
  direction: Direction;
  objective: number;
  entry: number | null;
  stop: number | null;
  target: number | null;
  maxRisk: number;
  confidence: number;
  explanation: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const defaultPlan: TradePlan = {
  direction: "HOLD",
  objective: 1000,
  entry: null,
  stop: null,
  target: null,
  maxRisk: 250,
  confidence: 0,
  explanation: "No validated market-data feed is connected yet. AURUM will not invent a live trade."
};

function money(value: number | null) {
  return value === null ? "Waiting" : new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2
  }).format(value);
}

export default function AurumDashboard() {
  const [riskMode, setRiskMode] = useState<RiskMode>("Balanced");
  const [plan, setPlan] = useState<TradePlan>(defaultPlan);
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState("AURUM is ready. Voice commands prepare paper-trade objectives only.");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const canExecute = useMemo(() =>
    plan.direction !== "HOLD" && plan.entry !== null && plan.stop !== null &&
    plan.target !== null && plan.confidence >= 85, [plan]);

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function processCommand(raw: string) {
    const command = raw.toLowerCase().trim();
    setHeard(raw);
    const amountMatch = command.match(/\$?\s?(\d{2,6})/);
    const objective = amountMatch ? Number(amountMatch[1]) : plan.objective;

    let nextMode = riskMode;
    if (command.includes("protect")) nextMode = "Protect";
    if (command.includes("aggressive")) nextMode = "Aggressive";
    if (command.includes("balanced")) nextMode = "Balanced";
    setRiskMode(nextMode);

    if (command.includes("trade for me") || command.includes("make") || command.includes("prepare")) {
      const maxRisk = nextMode === "Protect" ? 150 : nextMode === "Aggressive" ? 400 : 250;
      const response = `Objective set to $${objective.toLocaleString()}. I cannot prepare a legitimate live trade until verified gold-market data and a tested Wave Engine are connected. I am holding instead of fabricating an entry.`;
      setPlan({ ...defaultPlan, objective, maxRisk });
      setMessage(response);
      speak(response);
      return;
    }

    if (command.includes("what") || command.includes("status")) {
      const response = "Current status: interface and voice controls are active. Live data, Wave Engine validation, and broker execution are not connected.";
      setMessage(response);
      speak(response);
      return;
    }

    const response = 'Try saying: "AURUM, prepare a one-thousand-dollar objective," or "protect my account today."';
    setMessage(response);
    speak(response);
  }

  function beginListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage("Speech recognition is not supported by this browser. Chrome desktop is recommended for this starter.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => processCommand(event.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => { setListening(false); setMessage("I could not hear the command. Check microphone permission and try again."); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div><p className="eyebrow">PRIVATE GOLD TRADING WORKSPACE</p><h1>AURUM AI</h1></div>
        <span className="status"><i /> Foundation Mode</span>
      </section>

      <section className="hero card">
        <div className="signal">
          <span>Current Decision</span>
          <strong className={plan.direction.toLowerCase()}>{plan.direction}</strong>
          <p>{plan.explanation}</p>
        </div>
        <div className="confidence">
          <span>Validated confidence</span><b>{plan.confidence}%</b>
          <small>Disabled until calculated from real data</small>
        </div>
      </section>

      <section className="metrics">
        <article className="card"><span>Profit objective</span><strong>${plan.objective.toLocaleString()}</strong></article>
        <article className="card"><span>Maximum risk</span><strong>${plan.maxRisk.toLocaleString()}</strong></article>
        <article className="card"><span>Entry</span><strong>{money(plan.entry)}</strong></article>
        <article className="card"><span>Stop loss</span><strong>{money(plan.stop)}</strong></article>
        <article className="card"><span>Take profit</span><strong>{money(plan.target)}</strong></article>
      </section>

      <section className="workspace">
        <article className="card voicePanel">
          <div><span className="label">AI voice command</span><h2>Tell AURUM the objective.</h2>
          <p className="message">{message}</p>{heard && <p className="heard">You said: “{heard}”</p>}</div>
          <button className={`voiceButton ${listening ? "listening" : ""}`} onClick={beginListening} type="button">
            {listening ? "Listening…" : "🎙 Speak to AURUM"}
          </button>
          <div className="quickCommands">
            <button type="button" onClick={() => processCommand("Prepare a $1000 objective")}>Prepare $1,000 objective</button>
            <button type="button" onClick={() => processCommand("Protect my account today")}>Protect account</button>
            <button type="button" onClick={() => processCommand("What is the current status")}>System status</button>
          </div>
        </article>

        <article className="card controls">
          <span className="label">Preset risk mode</span>
          <div className="riskModes">
            {(["Protect", "Balanced", "Aggressive"] as RiskMode[]).map(mode =>
              <button type="button" key={mode} className={riskMode === mode ? "active" : ""} onClick={() => setRiskMode(mode)}>{mode}</button>)}
          </div>
          <button type="button" className="execute" disabled={!canExecute}>EXECUTE PAPER TRADE</button>
          <p className="safety">Live execution is intentionally unavailable. It will remain locked until a broker sandbox, tested strategy, position limits, and a confirmation screen are implemented.</p>
        </article>
      </section>

      <footer>AURUM AI V2 · Functional foundation · No live market data or broker connection</footer>
    </main>
  );
}
