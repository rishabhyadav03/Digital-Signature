import { useState } from "react";
import ECDSA from "./pages/ECDSA";
import EdDSA from "./pages/EdDSA";
import Compare from "./pages/Compare";

const tabs = [
  { id: "ecdsa",   label: "ECDSA",   sub: "secp256k1" },
  { id: "eddsa",   label: "EdDSA",   sub: "Ed25519"   },
  { id: "compare", label: "Compare", sub: "Benchmark" },
];

export default function App() {
  const [active, setActive] = useState("ecdsa");

  return (
    <div style={{ minHeight: "100vh", padding: "0" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e2d3d",
        background: "rgba(13,17,23,0.95)",
        backdropFilter: "blur(10px)",
        padding: "20px 40px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#00d4ff",
                  boxShadow: "0 0 10px #00d4ff",
                }} />
                <h1 className="mono" style={{ fontSize: 20, color: "#fff", letterSpacing: 2, margin: 0 }}>
                  DIGITAL_SIGNATURE_DEMO
                </h1>
              </div>
              <p style={{ color: "#4a5568", fontSize: 12, margin: 0, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1 }}>
                ECDSA · EdDSA · Elliptic Curve Cryptography · Live in Browser
              </p>
            </div>
            <div style={{
              border: "1px solid #1e2d3d",
              borderRadius: 4,
              padding: "4px 10px",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "#00ff88",
              letterSpacing: 1,
            }}>
              @noble/curves v2
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id}
                className={`tab-btn ${active === t.id ? "active" : ""}`}
                onClick={() => setActive(t.id)}
              >
                {t.label} <span style={{ opacity: 0.5, fontSize: 10 }}>{t.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>
        {active === "ecdsa"   && <ECDSA />}
        {active === "eddsa"   && <EdDSA />}
        {active === "compare" && <Compare />}
      </main>
    </div>
  );
}
