"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Direction = "BUY" | "SELL" | "HOLD";
type RiskMode = "Protect" | "Balanced" | "Aggressive";

type DecisionResponse = {
  success: boolean;
  engine?: string;
  decision?: Direction;
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
  };
  votes?: {
    bullish?: number;
    bearish?: number;
  };
  reasons?: string[];
  warning?: string;
  error?: string;
};

type GoldQuote = {
  success: boolean;
  price?: number | null;
  bid?: number | null;
  ask?: number | null;
  spread?: number | null;
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

function money(value: number | null | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value)
    : "Waiting";
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
  const [objective, setObjective] = useState(1000);
  const [maxRisk, setMaxRisk] = useState(250);

  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [quote, setQuote] = useState<GoldQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState(
    "AURUM is connected to live gold data and the EMA decision engine."
  );
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const canExecute = useMemo(
    () =>
      decision?.success === true &&
      decision.decision !== "HOLD" &&
      typeof decision.entry === "number" &&
      typeof decision.stop === "number" &&
      typeof decision.target === "number" &&
      (decision.confidence ?? 0) >= 85,
    [decision]
  );

  async function loadData() {
    try {
      setLoading(true);
      setErrorText("");

      const [decisionRes, quoteRes] = await Promise.all([
        fetch("/api/decision", { cache: "no-store" }),
        fetch("/api/gold", { cache: "no-store" }),
      ]);

      const decisionData: DecisionResponse = await decisionRes.json();
      const quoteData: GoldQuote = await quoteRes.json();

      if (!decisionRes.ok || !decisionData.success) {
        throw new Error(decisionData.error || "Decision engine unavailable");
      }

      if (!quoteRes.ok || !quoteData.success) {
        throw new Error(quoteData.error || "Live quote unavailable");
      }

      setDecision(decisionData);
      setQuote(quoteData);
      setMessage(
        `${decisionData.engine ?? "Decision engine"} is active. Current signal: ${
          decisionData.decision ?? "HOLD"
        } at ${decisionData.confidence ?? 0}% confidence.`
      );
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Unable to load AURUM data";
      setErrorText(text);
      setDecision({
        success: false,
        decision: "HOLD",
        confidence: 0,
        error: text,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = window.setInterval(loadData, 15000);
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
    if (amountMatch) setObjective(Number(amountMatch[1]));

    if (command.includes("protect")) {
      setRiskMode("Protect");
      setMaxRisk(150);
    } else if (command.includes("aggressive")) {
      setRiskMode("Aggressive");
      setMaxRisk(400);
    } else if (command.includes("balanced")) {
      setRiskMode("Balanced");
      setMaxRisk(250);
    }

    if (
      command.includes("trade") ||
      command.includes("buy") ||
      command.includes("sell") ||
      command.includes("decision") ||
      command.includes("status")
    ) {
      const text = decision?.success
        ? `${decision.decision}. Confidence ${
            decision.confidence ?? 0
          } percent. Entry ${price(decision.entry)}. Stop ${price(
            decision.stop
          )}. Target ${price(decision.target)}.`
        : "The decision engine is unavailable, so AURUM is holding.";

      setMessage(text);
      speak(text);
      return;
    }

    if (command.includes("gold") || command.includes("price")) {
      const text =
        typeof quote?.price === "number"
          ? `The current gold midpoint is ${price(quote.price)} dollars.`
          : "The current gold price is unavailable.";

      setMessage(text);
      speak(text);
      return;
    }

    const text =
      'Try saying: "AURUM, what is the decision?" or "What is the gold price?"';
    setMessage(text);
    speak(text);
  }

  function beginListening() {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setMessage("Speech recognition is not supported in this browser.");
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

  const currentDecision = decision?.decision ?? "HOLD";
  const reasons = decision?.reasons ?? [];

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">PRIVATE GOLD TRADING WORKSPACE</p>
          <h1>AURUM AI</h1>
        </div>
        <span className="status">
          <i /> Decision Engine Live
        </span>
      </section>

      <section className="hero card">
        <div className="signal">
          <span>Current Decision</span>
          <strong className={currentDecision.toLowerCase()}>
            {loading ? "LOADING" : currentDecision}
          </strong>
          <p>
            {errorText ||
              reasons.join(" · ") ||
              "Waiting for validated decision data."}
          </p>
        </div>

        <div className="confidence">
          <span>Validated confidence</span>
          <b>{decision?.confidence ?? 0}%</b>
          <small>{decision?.engine ?? "Decision engine loading"}</small>
        </div>
      </section>

      <section className="metrics">
        <article className="card">
          <span>Live XAU/USD</span>
          <strong>{money(quote?.price)}</strong>
        </article>
        <article className="card">
          <span>Bid / Ask</span>
          <strong>
            {price(quote?.bid)} / {price(quote?.ask)}
          </strong>
        </article>
        <article className="card">
          <span>Spread</span>
          <strong>{price(quote?.spread)}</strong>
        </article>
        <article className="card">
          <span>Trend</span>
          <strong>{decision?.trend ?? "Waiting"}</strong>
        </article>
        <article className="card">
          <span>Entry</span>
          <strong>{money(decision?.entry)}</strong>
        </article>
        <article className="card">
          <span>Stop loss</span>
          <strong>{money(decision?.stop)}</strong>
        </article>
        <article className="card">
          <span>Take profit</span>
          <strong>{money(decision?.target)}</strong>
        </article>
        <article className="card">
          <span>Risk / Reward</span>
          <strong>
            {typeof decision?.riskReward === "number"
              ? `1 : ${decision.riskReward}`
              : "Waiting"}
          </strong>
        </article>
        <article className="card">
          <span>EMA 20</span>
          <strong>{price(decision?.indicators?.ema20)}</strong>
        </article>
        <article className="card">
          <span>EMA 50</span>
          <strong>{price(decision?.indicators?.ema50)}</strong>
        </article>
        <article className="card">
          <span>EMA 200</span>
          <strong>{price(decision?.indicators?.ema200)}</strong>
        </article>
        <article className="card">
          <span>Support / Resistance</span>
          <strong>
            {price(decision?.support)} / {price(decision?.resistance)}
          </strong>
        </article>
      </section>

      <section className="workspace">
        <article className="card voicePanel">
          <div>
            <span className="label">AI voice command</span>
            <h2>Ask AURUM about the trade.</h2>
            <p className="message">{message}</p>
            {heard && <p className="heard">You said: “{heard}”</p>}
          </div>

          <button
            className="voiceButton"
            disabled={listening}
            onClick={beginListening}
            type="button"
          >
            {listening ? "Listening..." : "🎙 Speak to AURUM"}
          </button>

          <div className="quickCommands">
            <button
              type="button"
              onClick={() => processCommand("What is the decision?")}
            >
              Current decision
            </button>
            <button
              type="button"
              onClick={() => processCommand("What is the gold price?")}
            >
              Gold price
            </button>
            <button type="button" onClick={loadData}>
              Refresh analysis
            </button>
          </div>
        </article>

        <article className="card controls">
          <span className="label">Preset risk mode</span>

          <div className="riskModes">
            {(["Protect", "Balanced", "Aggressive"] as RiskMode[]).map(
              (mode) => (
                <button
                  type="button"
                  key={mode}
                  className={riskMode === mode ? "active" : ""}
                  onClick={() => {
                    setRiskMode(mode);
                    setMaxRisk(
                      mode === "Protect" ? 150 : mode === "Aggressive" ? 400 : 250
                    );
                  }}
                >
                  {mode}
                </button>
              )
            )}
          </div>

          <div className="message">
            Objective: ${objective.toLocaleString()} · Max risk: $
            {maxRisk.toLocaleString()}
          </div>

          <button
            type="button"
            className="execute"
            disabled={!canExecute}
          >
            EXECUTE PAPER TRADE
          </button>

          <p className="safety">
            Paper execution unlocks only when a complete trade plan reaches at
            least 85% confidence. Live broker execution remains disabled.
          </p>
        </article>
      </section>

      <footer>
        AURUM AI V2 · Live XAU/USD · EMA Trend Engine v2 · Analytical output only
      </footer>
    </main>
  );
}
