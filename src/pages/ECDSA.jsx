import { useState } from "react";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
function fromHex(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.slice(i,i+2),16);
  return arr;
}
function hashMsg(msg) { return sha256(new TextEncoder().encode(msg)); }
function trunc(hex, n=24) { return hex.slice(0,n) + "..." + hex.slice(-8); }

export default function ECDSA() {
  const [message, setMessage]           = useState("");
  const [privKey, setPrivKey]           = useState("");
  const [pubKey, setPubKey]             = useState("");
  const [signature, setSignature]       = useState("");
  const [verifyMsg, setVerifyMsg]       = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [tampered, setTampered]         = useState(false);
  const [step, setStep]                 = useState(0);

  function generateKeys() {
    const priv = secp256k1.utils.randomSecretKey();
    const pub  = secp256k1.getPublicKey(priv);
    setPrivKey(toHex(priv)); setPubKey(toHex(pub));
    setSignature(""); setVerifyResult(null); setTampered(false); setStep(1);
  }
  function signMessage() {
    if (!privKey || !message) return;
    try {
      const sig = secp256k1.sign(hashMsg(message), fromHex(privKey));
      setSignature(toHex(sig));
      setVerifyMsg(message); setVerifyResult(null); setTampered(false); setStep(2);
    } catch(e) { alert("Error: " + e.message); }
  }
  function verify(useMsg) {
    if (!pubKey || !signature) return;
    try {
      const valid = secp256k1.verify(fromHex(signature), hashMsg(useMsg), fromHex(pubKey));
      setVerifyResult(valid); setStep(3);
    } catch(e) { setVerifyResult(false); setStep(3); }
  }
  function tamperAndVerify() {
    const t = verifyMsg + " [TAMPERED]";
    setVerifyMsg(t); setTampered(true); verify(t);
  }

  return (
    <div>
      {/* Intro */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={{ color:"#00d4ff", fontFamily:"'Share Tech Mono',monospace", fontSize:12, letterSpacing:2 }}>ALGORITHM</span>
          <span style={{ color:"#4a5568", fontSize:12 }}>—</span>
          <span style={{ color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12 }}>ECDSA / secp256k1</span>
        </div>
        <p style={{ color:"#8b949e", fontSize:13, lineHeight:1.6, margin:0 }}>
          The signature algorithm used by <span style={{color:"#f7931a"}}>Bitcoin</span> and <span style={{color:"#627eea"}}>Ethereum</span>.
          Uses the secp256k1 elliptic curve. A private key signs a SHA256 message hash;
          the public key verifies it. Tampering with even one character invalidates the signature.
        </p>
      </div>

      {/* Step 1 */}
      <div className={`card ${step>=1?"active":""}`} style={{padding:20, marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: step>=1 ? 16 : 0}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <span className={`step-num ${step>=1?"active":""}`}>1</span>
            <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color: step>=1?"#fff":"#8b949e", letterSpacing:1}}>GENERATE KEY PAIR</span>
          </div>
          <button className="btn-primary" onClick={generateKeys}>[ GENERATE ]</button>
        </div>
        {privKey && (
          <div className="fade-in" style={{display:"flex", flexDirection:"column", gap:10}}>
            <div>
              <div className="label-tag" style={{color:"#ff6b35"}}>PRIVATE KEY — 32 bytes (keep secret)</div>
              <div className="key-display" style={{color:"#ff6b35"}}>{trunc(privKey,40)}</div>
            </div>
            <div>
              <div className="label-tag" style={{color:"#00d4ff"}}>PUBLIC KEY — 33 bytes compressed</div>
              <div className="key-display" style={{color:"#00d4ff"}}>{trunc(pubKey,40)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className={`card ${step>=2?"active":""}`} style={{padding:20, marginBottom:16}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <span className={`step-num ${step>=2?"active":""}`}>2</span>
          <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color: step>=2?"#fff":"#8b949e", letterSpacing:1}}>SIGN MESSAGE</span>
        </div>
        <textarea className="crypto-input" rows={3}
          placeholder="Enter message to sign..."
          value={message} onChange={e => setMessage(e.target.value)}
          style={{marginBottom:12}}
        />
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <button className="btn-primary" onClick={signMessage} disabled={!privKey||!message}>
            [ SIGN WITH PRIVATE KEY ]
          </button>
          {signature && <span style={{color:"#00ff88", fontFamily:"'Share Tech Mono',monospace", fontSize:11}}>✓ SIGNED</span>}
        </div>
        {signature && (
          <div className="fade-in" style={{marginTop:14}}>
            <div className="label-tag" style={{color:"#00ff88"}}>SIGNATURE — 64 bytes compact</div>
            <div className="key-display" style={{color:"#00ff88"}}>{trunc(signature,48)}</div>
            <div style={{color:"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:10, marginTop:6}}>
              SHA256(message) → secp256k1.sign(hash, privateKey)
            </div>
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className={`card ${step>=3?"active":""}`} style={{padding:20, marginBottom:20}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <span className={`step-num ${step>=3?"active":""}`}>3</span>
          <span style={{fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16, color: step>=3?"#fff":"#8b949e", letterSpacing:1}}>VERIFY SIGNATURE</span>
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
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:18, fontWeight:"bold", color: verifyResult?"#00ff88":"#ff6b35", marginBottom:6}}>
                  {verifyResult ? "✓ SIGNATURE VALID" : "✗ SIGNATURE INVALID"}
                </div>
                <div style={{fontSize:12, color: verifyResult?"#4ade80":"#fca372"}}>
                  {verifyResult ? "Message is authentic. Curve math confirms this was signed with the private key."
                    : tampered ? "Tampered message detected. SHA256 of modified message does not match the signed hash."
                    : "Verification failed."}
                </div>
              </div>
            )}
          </div>
        ) : <p style={{color:"#4a5568", fontFamily:"'Share Tech Mono',monospace", fontSize:12}}>// complete steps 1 and 2 first</p>}
      </div>

      {/* How it works */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12}}>
        {[
          {label:"KEY_GEN", desc:"Random k → privKey\npubKey = k × G\n(generator point)", color:"#00d4ff"},
          {label:"SIGN",    desc:"hash = SHA256(msg)\nrandom nonce r\nsig = (r,s) via curve", color:"#00ff88"},
          {label:"VERIFY",  desc:"recompute using\npubKey + signature\ncheck point equality", color:"#ff6b35"},
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
