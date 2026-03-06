import { useState } from "react";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
function hashMsg(msg) { return sha256(new TextEncoder().encode(msg)); }

export default function Compare() {
  const [message, setMessage] = useState("Hello, IIT Roorkee!");
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  async function runBenchmark() {
    if (!message) return;
    setRunning(true); setResults(null);
    await new Promise(r => setTimeout(r, 50));

    const ecPriv  = secp256k1.utils.randomSecretKey();
    const ecPub   = secp256k1.getPublicKey(ecPriv);
    const msgHash = hashMsg(message);

    const t1 = performance.now();
    const ecSig = secp256k1.sign(msgHash, ecPriv);
    const ecSignTime = (performance.now()-t1).toFixed(2);
    const t2 = performance.now();
    secp256k1.verify(ecSig, msgHash, ecPub);
    const ecVerTime = (performance.now()-t2).toFixed(2);

    const edPriv   = ed25519.utils.randomSecretKey();
    const edPub    = ed25519.getPublicKey(edPriv);
    const msgBytes = new TextEncoder().encode(message);

    const t3 = performance.now();
    const edSig = ed25519.sign(msgBytes, edPriv);
    const edSignTime = (performance.now()-t3).toFixed(2);
    const t4 = performance.now();
    ed25519.verify(edSig, msgBytes, edPub);
    const edVerTime = (performance.now()-t4).toFixed(2);

    setResults({
      ecdsa: { privKeySize:ecPriv.length, pubKeySize:ecPub.length, sigSize:ecSig.length,
               signTime:ecSignTime, verifyTime:ecVerTime,
               privHex:toHex(ecPriv).slice(0,16)+"...", pubHex:toHex(ecPub).slice(0,16)+"...", sigHex:toHex(ecSig).slice(0,16)+"...",
               deterministic:false, curve:"secp256k1", usedBy:"Bitcoin · Ethereum · MetaMask" },
      eddsa: { privKeySize:edPriv.length, pubKeySize:edPub.length, sigSize:edSig.length,
               signTime:edSignTime, verifyTime:edVerTime,
               privHex:toHex(edPriv).slice(0,16)+"...", pubHex:toHex(edPub).slice(0,16)+"...", sigHex:toHex(edSig).slice(0,16)+"...",
               deterministic:true, curve:"Ed25519", usedBy:"Solana · SSH · Signal · TLS 1.3" },
    });
    setRunning(false);
  }

  return (
    <div>
      <div className="card" style={{padding:20, marginBottom:20}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:"#00d4ff", letterSpacing:2, marginBottom:8}}>LIVE BENCHMARK</div>
        <p style={{color:"#8b949e", fontSize:13, margin:0}}>Run both algorithms on the same message. Compare key sizes, signature sizes, and speed in real time.</p>
      </div>

      <div className="card" style={{padding:20, marginBottom:20}}>
        <div className="label-tag" style={{marginBottom:8}}>MESSAGE INPUT</div>
        <div style={{display:"flex", gap:12}}>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)}
            style={{flex:1, background:"#0a0f14", border:"1px solid #1e2d3d", borderRadius:4, padding:"10px 14px",
                    color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12, outline:"none"}}
          />
          <button className="btn-primary" onClick={runBenchmark} disabled={running||!message}
            style={{whiteSpace:"nowrap"}}>
            {running ? "[ RUNNING... ]" : "[ RUN BENCHMARK ]"}
          </button>
        </div>
      </div>

      {results && (
        <div className="fade-in">
          {/* Side by side cards */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20}}>
            {[
              {key:"ecdsa", label:"ECDSA", color:"#f7931a", data:results.ecdsa},
              {key:"eddsa", label:"EdDSA", color:"#9945ff", data:results.eddsa},
            ].map(({key,label,color,data}) => (
              <div key={key} className="card" style={{padding:20, borderColor:color+"44"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:14, color, letterSpacing:2, marginBottom:4}}>{label}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#4a5568", marginBottom:16}}>{data.curve}</div>
                {[
                  {label:"PRIVATE KEY", value:`${data.privKeySize} bytes`, hex:data.privHex, c:"#ff6b35"},
                  {label:"PUBLIC KEY",  value:`${data.pubKeySize} bytes`,  hex:data.pubHex,  c:color},
                  {label:"SIGNATURE",   value:`${data.sigSize} bytes`,     hex:data.sigHex,  c:"#00ff88"},
                ].map(r => (
                  <div key={r.label} style={{marginBottom:10}}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                      <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#4a5568", letterSpacing:1}}>{r.label}</span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:r.c, fontWeight:"bold"}}>{r.value}</span>
                    </div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#2d3748", background:"#0a0f14", padding:"4px 8px", borderRadius:3}}>{r.hex}</div>
                  </div>
                ))}
                <div style={{borderTop:"1px solid #1e2d3d", paddingTop:12, marginTop:4}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#4a5568"}}>SIGN TIME</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#00d4ff"}}>{data.signTime}ms</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#4a5568"}}>VERIFY TIME</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#00d4ff"}}>{data.verifyTime}ms</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#4a5568"}}>DETERMINISTIC</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:data.deterministic?"#00ff88":"#ff6b35"}}>
                      {data.deterministic ? "YES ✓" : "NO ✗"}
                    </span>
                  </div>
                  <div style={{marginTop:10, fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#4a5568"}}>
                    {data.usedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary table */}
          <div className="card" style={{padding:20, marginBottom:20}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#00d4ff", letterSpacing:2, marginBottom:16}}>COMPARISON_TABLE</div>
            <table style={{width:"100%", borderCollapse:"collapse", fontFamily:"'Share Tech Mono',monospace", fontSize:11}}>
              <thead>
                <tr style={{borderBottom:"1px solid #1e2d3d"}}>
                  {["PROPERTY","ECDSA","EdDSA","WINNER"].map(h => (
                    <th key={h} style={{textAlign:"left", padding:"6px 8px", color:"#4a5568", fontSize:9, letterSpacing:1, fontWeight:"normal"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Private key",   `${results.ecdsa.privKeySize}B`, `${results.eddsa.privKeySize}B`, "TIE",   ""],
                  ["Public key",    `${results.ecdsa.pubKeySize}B`,  `${results.eddsa.pubKeySize}B`,  "EdDSA", "#9945ff"],
                  ["Signature",     `${results.ecdsa.sigSize}B`,     `${results.eddsa.sigSize}B`,     "TIE",   ""],
                  ["Sign time",     `${results.ecdsa.signTime}ms`,   `${results.eddsa.signTime}ms`,   "—",     ""],
                  ["Verify time",   `${results.ecdsa.verifyTime}ms`, `${results.eddsa.verifyTime}ms`, "—",     ""],
                  ["Deterministic", "NO",                            "YES",                           "EdDSA", "#9945ff"],
                  ["Nonce risk",    "HIGH",                          "NONE",                          "EdDSA", "#9945ff"],
                ].map(([prop,ec,ed,winner,wc],i) => (
                  <tr key={prop} style={{borderBottom:"1px solid #1e2d3d", background: i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                    <td style={{padding:"8px 8px", color:"#8b949e"}}>{prop}</td>
                    <td style={{padding:"8px 8px", color:"#f7931a"}}>{ec}</td>
                    <td style={{padding:"8px 8px", color:"#9945ff"}}>{ed}</td>
                    <td style={{padding:"8px 8px", color:wc||"#4a5568", fontWeight:"bold"}}>{winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ZK connection */}
          <div className="card" style={{padding:20, borderColor:"#00d4ff44", background:"rgba(0,212,255,0.03)"}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#00d4ff", letterSpacing:2, marginBottom:14}}>CONNECTION_TO_ZK_PROOFS</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
              {[
                {title:"EdDSA → ZK Circuits", body:"Solana's Ed25519 signatures can be verified inside ZK circuits using EdDSA gadgets in circomlib — proving ownership of a signing key without revealing it. Used in ZK identity systems.", color:"#9945ff"},
                {title:"Stern's Protocol", body:"Stern's Protocol is a zero-knowledge identification scheme — prove knowledge of a secret without revealing it. Conceptually identical to the ZK credential system built with Poseidon commitments and Merkle proofs.", color:"#00ff88"},
              ].map(s => (
                <div key={s.title}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:s.color, marginBottom:6, letterSpacing:1}}>{s.title}</div>
                  <div style={{fontSize:12, color:"#8b949e", lineHeight:1.6}}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
