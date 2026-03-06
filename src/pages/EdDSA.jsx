import { useState } from "react";
import { ed25519 } from "@noble/curves/ed25519.js";

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
function fromHex(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.slice(i,i+2),16);
  return arr;
}
function trunc(hex, n=24) { return hex.slice(0,n) + "..." + hex.slice(-8); }

export default function EdDSA() {
  const [message, setMessage]           = useState("");
  const [privKey, setPrivKey]           = useState("");
  const [pubKey, setPubKey]             = useState("");
  const [signature, setSignature]       = useState("");
  const [verifyMsg, setVerifyMsg]       = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [tampered, setTampered]         = useState(false);
  const [step, setStep]                 = useState(0);

  function generateKeys() {
    const priv = ed25519.utils.randomSecretKey();
    const pub  = ed25519.getPublicKey(priv);
    setPrivKey(toHex(priv)); setPubKey(toHex(pub));
    setSignature(""); setVerifyResult(null); setTampered(false); setStep(1);
  }
  function signMessage() {
    if (!privKey || !message) return;
    try {
      const sig = ed25519.sign(new TextEncoder().encode(message), fromHex(privKey));
      setSignature(toHex(sig));
      setVerifyMsg(message); setVerifyResult(null); setTampered(false); setStep(2);
    } catch(e) { alert("Error: " + e.message); }
  }
  function verify(useMsg) {
    if (!pubKey || !signature) return;
    try {
      const valid = ed25519.verify(fromHex(signature), new TextEncoder().encode(useMsg), fromHex(pubKey));
      setVerifyResult(valid); setStep(3);
    } catch(e) { setVerifyResult(false); setStep(3); }
  }
  function tamperAndVerify() {
    const t = verifyMsg + " [TAMPERED]";
    setVerifyMsg(t); setTampered(true); verify(t);
  }

  return (
    <div>
      <div className="card" style={{padding:20, marginBottom:20}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
          <span style={{color:"#a78bfa", fontFamily:"'Share Tech Mono',monospace", fontSize:12, letterSpacing:2}}>ALGORITHM</span>
          <span style={{color:"#4a5568", fontSize:12}}>—</span>
          <span style={{color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12}}>EdDSA / Ed25519</span>
        </div>
        <p style={{color:"#8b949e", fontSize:13, lineHeight:1.6, margin:0}}>
          The signature algorithm used by <span style={{color:"#9945ff"}}>Solana</span>, SSH, and TLS 1.3.
          Uses the Ed25519 (Twisted Edwards) curve. <strong style={{color:"#a78bfa"}}>Deterministic</strong> — no random nonce needed.
          Same message + key always produces the same signature. Safer than ECDSA.
        </p>
      </div>

      {/* Step 1 */}
      <div className={`card ${step>=1?"active":""}`} style={{padding:20, marginBottom:16, borderColor: step>=1?"#a78bfa":"#1e2d3d"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: step>=1?16:0}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <span className={`step-num ${step>=1?"active":""}`} style={step>=1?{borderColor:"#a78bfa",color:"#a78bfa",boxShadow:"0 0 10px rgba(167,139,250,0.3)"}:{}}>1</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color:step>=1?"#fff":"#8b949e", letterSpacing:1}}>GENERATE KEY PAIR</span>
          </div>
          <button className="btn-primary" onClick={generateKeys} style={step>=1?{borderColor:"#a78bfa",color:"#a78bfa"}:{}}>[ GENERATE ]</button>
        </div>
        {privKey && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:10}}>
            <div>
              <div className="label-tag" style={{color:"#ff6b35"}}>PRIVATE KEY — 32 bytes</div>
              <div className="key-display" style={{color:"#ff6b35"}}>{trunc(privKey,40)}</div>
            </div>
            <div>
              <div className="label-tag" style={{color:"#a78bfa"}}>PUBLIC KEY — 32 bytes (smaller than ECDSA!)</div>
              <div className="key-display" style={{color:"#a78bfa"}}>{trunc(pubKey,40)}</div>
            </div>
            <div style={{background:"rgba(153,69,255,0.08)", border:"1px solid rgba(153,69,255,0.2)", borderRadius:4, padding:10, fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#9945ff"}}>
              ★ Solana uses Ed25519 natively — this is exactly how Phantom wallet signs transactions
            </div>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className={`card ${step>=2?"active":""}`} style={{padding:20, marginBottom:16, borderColor:step>=2?"#a78bfa":"#1e2d3d"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <span className={`step-num ${step>=2?"active":""}`} style={step>=2?{borderColor:"#a78bfa",color:"#a78bfa"}:{}}>2</span>
          <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color:step>=2?"#fff":"#8b949e", letterSpacing:1}}>SIGN MESSAGE</span>
        </div>
        <textarea className="crypto-input" rows={3}
          placeholder="Enter message to sign..."
          value={message} onChange={e => setMessage(e.target.value)}
          style={{marginBottom:8}}
        />
        <div style={{background:"#0a0f14", border:"1px solid #1e2d3d", borderRadius:4, padding:8, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#4a5568", marginBottom:12}}>
          // EdDSA signs raw bytes directly — SHA-512 is built into the algorithm
        </div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <button className="btn-primary" onClick={signMessage} disabled={!privKey||!message}
            style={step>=2?{borderColor:"#a78bfa",color:"#a78bfa"}:{}}>
            [ SIGN WITH PRIVATE KEY ]
          </button>
          {signature && <span style={{color:"#a78bfa", fontFamily:"'Share Tech Mono',monospace", fontSize:11}}>✓ SIGNED (DETERMINISTIC)</span>}
        </div>
        {signature && (
          <div className="fade-in" style={{marginTop:14}}>
            <div className="label-tag" style={{color:"#a78bfa"}}>SIGNATURE — 64 bytes</div>
            <div className="key-display" style={{color:"#a78bfa"}}>{trunc(signature,48)}</div>
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className={`card ${step>=3?"active":""}`} style={{padding:20, marginBottom:20, borderColor:step>=3?"#a78bfa":"#1e2d3d"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <span className={`step-num ${step>=3?"active":""}`} style={step>=3?{borderColor:"#a78bfa",color:"#a78bfa"}:{}}>3</span>
          <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color:step>=3?"#fff":"#8b949e", letterSpacing:1}}>VERIFY SIGNATURE</span>
        </div>
        {signature ? (
          <div>
            <div style={{background:"#0a0f14", border:"1px solid #1e2d3d", borderRadius:4, padding:10, marginBottom:14, fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#8b949e"}}>
              &gt; verifying: <span style={{color:"#fff"}}>"{verifyMsg}"</span>
            </div>
            <div style={{display:"flex", gap:10, marginBottom:14}}>
              <button className="btn-success" onClick={() => verify(verifyMsg)}>[ ✓ VERIFY ORIGINAL ]</button>
              <button className="btn-danger" onClick={tamperAndVerify}>[ ✗ TAMPER + VERIFY ]</button>
            </div>
            {verifyResult !== null && (
              <div className={`fade-in ${verifyResult?"result-valid":"result-invalid"}`}>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:18, fontWeight:"bold", color:verifyResult?"#00ff88":"#ff6b35", marginBottom:6}}>
                  {verifyResult ? "✓ SIGNATURE VALID" : "✗ SIGNATURE INVALID"}
                </div>
                <div style={{fontSize:12, color:verifyResult?"#4ade80":"#fca372"}}>
                  {verifyResult ? "Message is authentic. Ed25519 point equation verified."
                    : tampered ? "Tampering detected. Modified message fails Ed25519 verification."
                    : "Verification failed."}
                </div>
              </div>
            )}
          </div>
        ) : <p style={{color:"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:12}}>// complete steps 1 and 2 first</p>}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12}}>
        {[
          {label:"KEY_GEN", desc:"privKey = random 32B\npubKey = privKey × B\n(Edwards base point)", color:"#a78bfa"},
          {label:"SIGN",    desc:"nonce = SHA512(priv||msg)\nDETERMINISTIC\nno random needed", color:"#00ff88"},
          {label:"VERIFY",  desc:"S×B == R +\nH(R,pub,msg)×pubKey\n(point equality)", color:"#ff6b35"},
        ].map(s => (
          <div key={s.label} className="card" style={{padding:14}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:s.color, letterSpacing:2, marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#8b949e", whiteSpace:"pre-line", lineHeight:1.7}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
