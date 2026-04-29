# AntiGravity ID: Decentralized Intelligent Identity Verification

## Overview
This project was built to directly solve the vulnerabilities of centralized identity systems by creating a secure, decentralized, and intelligent identity verification framework.

## How it Solves the Problem Statement

### 1. Eliminating Centralized Vulnerabilities
Centralized databases are prone to hacking, data leakage, and single points of failure. **AntiGravity ID** eliminates the central backend database entirely. Instead, sensitive data is stored on **IPFS (InterPlanetary File System)**, ensuring a distributed, immutable architecture with no single point of failure.

### 2. Enhancing User Privacy and Control
Traditional systems give users limited control over their personal data. Here, data ownership remains completely with the user (**Self-Sovereign Identity**). Biometric data is encrypted locally in the browser using **AES-256** before it ever leaves the device.

### 3. AI Biometric Authentication (Facial Recognition)
To prevent identity fraud, impersonation, and cyber threats, the system utilizes advanced **Artificial Intelligence (TensorFlow & OpenCV)**. The AI extracts a 128-dimensional mathematical embedding of the user's face during registration. During authentication, it performs a zero-knowledge Cosine Similarity match against a live capture to ensure high accuracy.

### 4. Smart Contract Automation & Tamper-Proof Storage
To ensure transparency and trust, the system uses **Blockchain technology (Ethereum/Solidity)**. The cryptographic SHA-256 hash of the biometric data and the IPFS CID are anchored to a Smart Contract (`IdentityRegistry.sol`). This guarantees that the data is tamper-proof, transparent, and cannot be altered by malicious actors.

### 5. Cross-Sector Scalability
The decentralized architecture is designed to be universally applicable for secure login, banking KYC, healthcare data access, and e-voting.

## System Architecture Flow
1. **Connect:** User connects their Web3 Wallet (MetaMask).
2. **Register:** Live webcam capture -> AI Facial Embedding Extraction -> AES-256 Encryption -> Upload to IPFS -> Store Hash/CID on Blockchain.
3. **Authenticate:** Live webcam capture -> Fetch IPFS encrypted data -> Decrypt locally -> AI Cosine Similarity Matching -> Access Granted/Denied.

## Running the Project
1. Start the AI Server: Run `start_ai_module.bat`
2. Open the UI: Run `open_frontend.bat`
