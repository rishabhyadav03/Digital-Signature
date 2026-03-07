# Digital Signature Demo

A live, interactive demonstration of **ECDSA** and **EdDSA** digital signature algorithms running entirely in the browser — no backend, no server.

🔗 **Live Demo:** [digital-signature-demo.eight.vercel.app](https://digital-signature-demo.eight.vercel.app)

## What It Does

- **ECDSA (secp256k1)** — Generate key pairs, sign messages, verify signatures, and demonstrate tamper detection using the same curve as Bitcoin and Ethereum
- **EdDSA (Ed25519)** — Same flow using Solana's native signature algorithm — deterministic, faster, and safer than ECDSA
- **Live Benchmark** — Run both algorithms on the same message and compare key sizes, signature sizes, sign/verify timing, and security properties side by side

## Key Features

- Real cryptography in the browser using `@noble/curves` v2
- Private keys never leave your device
- Tamper detection — modifying even one character invalidates the signature
- Side-by-side comparison of ECDSA vs EdDSA
- Terminal-style dark UI

## Tech Stack

| Tool | Purpose |
|------|---------|
| React + Vite | Frontend framework |
| Tailwind CSS | Styling |
| @noble/curves v2 | ECDSA (secp256k1) + EdDSA (Ed25519) |
| @noble/hashes v2 | SHA256 hashing |
| Web Crypto API | Browser-native SHA256 |

## How to Run Locally
```bash
git clone https://github.com/rishabhyadav03/Digital-Signature.git
cd Digital-Signature
npm install
npm run dev
```
