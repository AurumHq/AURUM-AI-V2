"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type GoldQuote = {
  success: boolean;
  provider?: string;
  symbol?: string;
  price?: number | null;
  bid?: number | null;
  ask?: number | null;
  spread?: number | null;
  timestamp?: number | null;
  marketOpen?: boolean;
  note?: string;
  error?: string;
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
  explanation:
    "Live XAU/USD data is connected. AURUM is holding until the tested decision engine is added.",
};

function money(value: number | null) {
  return value === null
    ? "Waiting"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);
}

function price(value: number | null | undefined) {
  return typeof value === "number"
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "Waiting";
}

export default function AurumDashboard() {
  const [riskMode, setRiskMode] = useState<RiskMode>("Balanced");
  const [plan, setPlan] = useState<TradePlan>(defaultPlan);
  const [quote, setQuote] = useState<GoldQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState("");
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState(
    "AURUM is ready. Live gold data is connected. Voice commands prepare paper-trade objectives only."
  );
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const canExecute = useMemo(
    () =>
      plan.direction !== "HOLD" &&
      plan.entry !== null &&
      plan.stop !== null &&
      plan.target !== null &&
      plan.confidence >= 85,
    [plan]
  );

  async function loadGoldQuote() {
    try {
      setLoadingQuote(true);
      setQuoteError("");
      const response = await fetch("/api/gold", { cache: "no-store" });
      const data: GoldQuote = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gold quote unavailable");
      }

      setQuote(data);
      setPlan((current) => ({
        ...current,
        explanation:
          "Live XAU/USD data is connected. AURUM is holding until the tested decision engine is added.",
      }));
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Unable to load gold data";
      setQuoteError(text);
      setPlan((current) => ({
        ...current,
        direction: "HOLD",
        confidence: 0,
        entry: null,
        stop: null,
        target: null,
        explanation:
          "AURUM cannot validate the live market feed, so it will not create a trade.",
      }));
    } finally {
      setLoadingQuote(false);
    }
  }

  useEffect(() => {
    loadGoldQuote();
    const timer = window.setInterval(loadGoldQuote, 15000);
    return () => window.clearInterval(timer);
  }, []);

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

    if (
      command.includes("trade for me") ||
      command.includes("make") ||
      command.includes("prepare")
    ) {
      const maxRisk =
        nextMode === "Protect" ? 150 : nextMode === "Aggressive" ? 400 : 250;
      const response =
        `Objective set to ${objective.toLocaleString()} dollars. ` +
        "Live gold data is connected, but AURUM will remain on HOLD until the tested decision engine is installed.";

      setPlan((current) => ({
        ...current,
        objective,
        maxRisk,
        direction: "HOLD",
        confidence: 0,
        entry: null,
        stop: null,
        target: null,
      }));
      setMessage(response);
      speak(response);
      return;
    }

    if (command.includes("price") || command.includes("gold")) {
      const response =
        quote?.price != null
          ? `The latest gold midpoint is ${price(quote.price)} dollars.`
          : "The current gold price is unavailable.";
      setMessage(response);
      speak(response);
      return;
    }

    if (command.includes("what") || command.includes("status")) {
      const response = quoteError
        ? `Market data error: ${quoteError}`
        : `Live gold data is connected. Current price is ${price(
            quote?.price
          )}. The trade engine remains locked on HOLD.`;
      setMessage(response);
      speak(response);
      return;
    }

    const response =
      'Try saying: "AURUM, what is the gold price?" or "Prepare a one-thousand-dollar objective."';
    setMessage(response);
    speak(response);
  }

  function beginListening() {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setMessage(
        "Speech recognition is not supported by this browser. Chrome desktop is recommended."
      );
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) =>
      processCommand(event.results?.[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => {
      setListening(false);
      setMessage("I could not hear the command. Check microphone permission.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">PRIVATE GOLD TRADING WORKSPACE</p>
          <h1>AURUM AI</h1>
        </div>
        <span className="status"><i /> Live Data Mode</span>
      </section>

      <section className="hero card">
        <div className="signal">
          <span>Current Decision</span>
          <strong className={plan.direction.toLowerCase()}>{plan.direction}</strong>
          <p>{plan.explanation}</p>
        </div>
        <div className="confidence">
          <span>Validated confidence</span>
          <b>{plan.confidence}%</b>
          <small>Locked until calculated by the tested decision engine</small>
        </div>
      </section>

      <section className="metrics">
        <article className="card"><span>Live XAU/USD</span><strong>{loadingQuote ? "Loading..." : `$${price(quote?.price)}`}</strong></article>
        <article className="card"><span>Bid / Ask</span><strong>{price(quote?.bid)} / {price(quote?.ask)}</strong></article>
        <article className="card"><span>Spread</span><strong>{price(quote?.spread)}</strong></article>
        <article className="card"><span>Profit objective</span><strong>${plan.objective.toLocaleString()}</strong></article>
        <article className="card"><span>Maximum risk</span><strong>${plan.maxRisk.toLocaleString()}</strong></article>
        <article className="card"><span>Entry</span><strong>{money(plan.entry)}</strong></article>
        <article className="card"><span>Stop loss</span><strong>{money(plan.stop)}</strong></article>
        <article className="card"><span>Take profit</span><strong>{money(plan.target)}</strong></article>
      </section>

      <section className="workspace">
        <article className="card voicePanel">
          <div>
            <span className="label">AI voice command</span>
            <h2>Tell AURUM the objective.</h2>
            <p className="message">{quoteError || message}</p>
            {heard && <p className="heard">You said: “{heard}”</p>}
          </div>

          <button className="voiceButton" disabled={listening} onClick={beginListening} type="button">
            {listening ? "Listening..." : "🎙 Speak to AURUM"}
          </button>

          <div className="quickCommands">
            <button type="button" onClick={() => processCommand("Prepare a $1000 objective")}>Prepare $1,000 objective</button>
            <button type="button" onClick={() => processCommand("What is the gold price?")}>Gold price</button>
            <button type="button" onClick={loadGoldQuote}>Refresh live data</button>
          </div>
        </article>

        <article className="card controls">
          <span className="label">Preset risk mode</span>
          <div className="riskModes">
            {(["Protect", "Balanced", "Aggressive"] as RiskMode[]).map((mode) => (
              <button type="button" key={mode} className={riskMode === mode ? "active" : ""} onClick={() => setRiskMode(mode)}>
                {mode}
              </button>
            ))}
          </div>
          <button type="button" className="execute" disabled={!canExecute}>EXECUTE PAPER TRADE</button>
          <p className="safety">Live execution remains unavailable. Paper execution stays locked until a tested strategy generates a complete trade plan.</p>
        </article>
      </section>

      <footer>AURUM AI V2 · Live XAU/USD connected · Trade engine locked pending validation</footer>
    </main>
  );
}
