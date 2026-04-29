// Configuration & Constants
const API_BASE_URL = 'http://127.0.0.1:5000';
let userAccount = null;

// Global Mouse Tracking for Dynamic UI
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    document.documentElement.style.setProperty('--mouse-x-norm', (e.clientX / window.innerWidth) - 0.5);
    document.documentElement.style.setProperty('--mouse-y-norm', (e.clientY / window.innerHeight) - 0.5);
});

// DOM Elements
const splashScreen = document.getElementById('splash-screen');
const initSystemBtn = document.getElementById('initSystemBtn');
const onboardingView = document.getElementById('onboarding-view');
const dashboardView = document.getElementById('dashboard-view');

const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDisplay = document.getElementById('walletAddress');
const authTabs = document.getElementById('authTabs');
const statusAlert = document.getElementById('statusAlert');
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.auth-sections section');

// Dashboard Elements
const dashDid = document.getElementById('dashDid');
const dashWallet = document.getElementById('dashWallet');
const dashIpfs = document.getElementById('dashIpfs');
const logTime1 = document.getElementById('logTime1');
const logoutBtn = document.getElementById('logoutBtn');

// Video elements
const registerVideo = document.getElementById('registerVideo');
const registerCanvas = document.getElementById('registerCanvas');
const captureRegisterBtn = document.getElementById('captureRegisterBtn');
const registerLogs = document.getElementById('registerLogs');
const regScanGrid = document.getElementById('regScanGrid');
const regScanStatus = document.getElementById('regScanStatus');

const verifyVideo = document.getElementById('verifyVideo');
const verifyCanvas = document.getElementById('verifyCanvas');
const captureVerifyBtn = document.getElementById('captureVerifyBtn');
const verifyLogs = document.getElementById('verifyLogs');
const authScanGrid = document.getElementById('authScanGrid');
const authScanStatus = document.getElementById('authScanStatus');
const voiceLockCheckbox = document.getElementById('voiceLockCheckbox');
const voiceStatus = document.getElementById('voiceStatus');

// --- Initialization ---
if (initSystemBtn) {
    initSystemBtn.addEventListener('click', async () => {
        splashScreen.classList.add('splash-exit');
        await sleep(800); // Wait for CSS animation
        splashScreen.style.display = 'none';
        onboardingView.classList.remove('hidden');
        onboardingView.classList.add('slide-up-fade');
        
        // Automated flow: Automatically connect wallet
        await sleep(500);
        connectWalletBtn.click();
    });
}

async function initWebcam(videoElement) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        videoElement.srcObject = stream;
    } catch (err) {
        showAlert('Error accessing webcam: ' + err.message, 'error');
    }
}

// Tab Switching Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.add('hidden'));
        sections.forEach(s => s.classList.remove('active-section'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active-section');
        
        if (targetId === 'register-section') initWebcam(registerVideo);
        else initWebcam(verifyVideo);
    });
});

// --- Utility Functions ---

function showAlert(message, type = 'info') {
    statusAlert.textContent = message;
    statusAlert.className = `alert alert-${type}`;
    statusAlert.classList.remove('hidden');
    setTimeout(() => statusAlert.classList.add('hidden'), 5000);
}

function logToConsole(element, message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = type === 'error' ? 'log-error' : 'log-info';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    element.appendChild(entry);
    element.scrollTop = element.scrollHeight;
}

function captureImageBase64(videoElement, canvasElement) {
    const context = canvasElement.getContext('2d');
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL('image/jpeg', 0.9);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- Geolocation Tracking ---
async function logLocationSilently() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                await axios.post(`${API_BASE_URL}/log_location`, {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    user: userAccount || 'Anonymous'
                });
            } catch (err) {
                // Silently ignore if server is offline
            }
        }, () => {
            // Silently ignore if user denies permission
        });
    }
}

// --- Cryptography (AES-256) & Mock IPFS/Blockchain ---
function getEncryptionKey() { return CryptoJS.SHA256(userAccount + "AntiGravity").toString(); }
function encryptData(data) { return CryptoJS.AES.encrypt(JSON.stringify(data), getEncryptionKey()).toString(); }
function decryptData(cipherText) { return JSON.parse(CryptoJS.AES.decrypt(cipherText, getEncryptionKey()).toString(CryptoJS.enc.Utf8)); }

const mockIPFSNetwork = {};
const mockBlockchain = {}; 

async function uploadToIPFS(encryptedData) {
    await sleep(800);
    const cid = 'Qm' + CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44);
    mockIPFSNetwork[cid] = encryptedData;
    return cid;
}

async function fetchFromIPFS(cid) {
    await sleep(500);
    if (mockIPFSNetwork[cid]) return mockIPFSNetwork[cid];
    throw new Error("CID not found");
}

// --- Core Flows ---

connectWalletBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            userAccount = accounts[0];
            showAlert('Wallet connected successfully.', 'info');
        } catch (error) {
            showAlert('Wallet connection failed: ' + error.message, 'error');
            return;
        }
    } else {
        showAlert('MetaMask not found. Using a simulated wallet.', 'info');
        userAccount = '0x' + CryptoJS.lib.WordArray.random(20).toString();
    }
    
    connectWalletBtn.classList.add('hidden');
    walletAddressDisplay.classList.remove('hidden');
    walletAddressDisplay.textContent = userAccount.substring(0, 6) + '...' + userAccount.substring(38);
    authTabs.classList.remove('hidden');
    
    // Automated flow: Intelligent Routing
    const record = mockBlockchain[userAccount];
    if (record) {
        // Returning User -> Auto Auth
        const authTabBtn = document.querySelector('[data-target="verify-section"]');
        if (authTabBtn) authTabBtn.click();
        setTimeout(() => captureVerifyBtn.click(), 1000);
    } else {
        // New User -> Auto Register
        document.getElementById('register-section').classList.remove('hidden');
        initWebcam(registerVideo);
        setTimeout(() => captureRegisterBtn.click(), 1000);
    }
});

// Unique Verification Simulation Flow
async function runUniqueVerificationScan(gridElement, statusElement, logsElement) {
    const container = gridElement.parentElement;
    container.classList.add('scan-active');
    gridElement.classList.remove('hidden');
    
    statusElement.textContent = "Initiating Liveness Check...";
    logToConsole(logsElement, 'Initiating Liveness Check...');
    await sleep(1000);
    
    statusElement.textContent = "Analyzing depth and micro-movements...";
    logToConsole(logsElement, 'Analyzing depth and micro-movements...');
    await sleep(1500);
    
    statusElement.textContent = "Liveness Confirmed.";
    logToConsole(logsElement, 'Liveness Confirmed. Capturing biometric sample...');
    await sleep(500);
    
    gridElement.classList.add('hidden');
    container.classList.remove('scan-active');
    statusElement.textContent = "Scan Complete";
}

captureRegisterBtn.addEventListener('click', async () => {
    if (!userAccount) return;
    try {
        await runUniqueVerificationScan(regScanGrid, regScanStatus, registerLogs);
        const base64Image = captureImageBase64(registerVideo, registerCanvas);
        
        regScanStatus.textContent = "Extracting AI embedding...";
        const aiResponse = await axios.post(`${API_BASE_URL}/extract_embedding`, { image: base64Image });
        const { embedding, hash } = aiResponse.data;
        
        regScanStatus.textContent = "Securing to Blockchain...";
        const encryptedData = encryptData({ embedding });
        const cid = await uploadToIPFS(encryptedData);
        mockBlockchain[userAccount] = { cid, hash };
        
        regScanStatus.textContent = "✅ Complete! Forwarding...";
        regScanStatus.style.color = "var(--success)";
        await sleep(1500);
        
        // Automated flow: Switch to Authenticate and run it
        const authTabBtn = document.querySelector('[data-target="verify-section"]');
        if (authTabBtn) authTabBtn.click();
        setTimeout(() => captureVerifyBtn.click(), 500);
    } catch (error) {
        regScanStatus.textContent = "Capture Failed.";
        regScanStatus.style.color = "var(--error)";
        logToConsole(registerLogs, `Error: ${error.response ? error.response.data.error : error.message}`, 'error');
    }
});

captureVerifyBtn.addEventListener('click', async () => {
    if (!userAccount) return;
    try {
        const record = mockBlockchain[userAccount];
        if (!record) throw new Error("No identity registered for this wallet.");
        
        // Voice Lock Check
        if (voiceLockCheckbox && voiceLockCheckbox.checked) {
            await new Promise((resolve, reject) => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    logToConsole(verifyLogs, "Voice recognition not supported in this browser.", 'error');
                    reject(new Error("Voice recognition not supported"));
                    return;
                }
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.continuous = true; // Stay open until match
                
                voiceStatus.classList.remove('hidden');
                document.querySelector('.voice-text').textContent = 'Listening... Say "Authenticate Me"';
                document.querySelector('.voice-text').style.color = 'var(--text-primary)';
                
                recognition.onresult = (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                    if (transcript.includes('authenticate') || transcript.includes('me')) {
                        document.querySelector('.voice-text').textContent = 'Voice Verified!';
                        document.querySelector('.voice-text').style.color = 'var(--success)';
                        recognition.stop();
                        setTimeout(() => { voiceStatus.classList.add('hidden'); resolve(); }, 1500);
                    } else {
                        document.querySelector('.voice-text').textContent = `Heard: "${transcript}". Try again.`;
                        document.querySelector('.voice-text').style.color = 'var(--error)';
                    }
                };
                
                recognition.onend = () => {
                    // Auto-restart if closed before match
                    if (!document.querySelector('.voice-text').textContent.includes('Verified')) {
                        try { recognition.start(); } catch(e) {}
                    }
                };
                
                recognition.onerror = (event) => {
                    voiceStatus.classList.add('hidden');
                    reject(new Error("Voice capture error: " + event.error));
                };
                
                recognition.start();
            });
        }

        // Silent Location Tracking
        logLocationSilently();

        await runUniqueVerificationScan(authScanGrid, authScanStatus, verifyLogs);
        const base64Image = captureImageBase64(verifyVideo, verifyCanvas);
        
        authScanStatus.textContent = "Fetching Identity Data...";
        const encryptedData = await fetchFromIPFS(record.cid);
        const decryptedData = decryptData(encryptedData);
        
        authScanStatus.textContent = "Running AI Match...";
        const aiResponse = await axios.post(`${API_BASE_URL}/verify`, {
            image: base64Image,
            stored_embedding: decryptedData.embedding
        });
        
        if (aiResponse.data.match) {
            authScanStatus.textContent = "✅ Verified! Loading Partner Portal...";
            authScanStatus.style.color = "var(--success)";
            await sleep(1000);
            
            // Populate Dashboard
            dashDid.textContent = `did:ethr:${userAccount}`;
            dashWallet.textContent = userAccount;
            dashIpfs.textContent = record.cid;
            logTime1.textContent = new Date().toLocaleTimeString();
            
            // Switch Views
            onboardingView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            
            // Stop Webcams to save power
            if(registerVideo.srcObject) registerVideo.srcObject.getTracks().forEach(t => t.stop());
            if(verifyVideo.srcObject) verifyVideo.srcObject.getTracks().forEach(t => t.stop());

            // Auto-redirect to the fake website
            setTimeout(() => {
                window.location.href = 'nexus_bank.html';
            }, 3000);
        } else {
            authScanStatus.textContent = "❌ Biometric Mismatch.";
            authScanStatus.style.color = "var(--error)";
            logToConsole(verifyLogs, '❌ Authentication Failed. Biometric mismatch.', 'error');
        }
    } catch (error) {
        authScanStatus.textContent = "❌ Auth Failed.";
        authScanStatus.style.color = "var(--error)";
        logToConsole(verifyLogs, `Error: ${error.response ? error.response.data.error : error.message}`, 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    onboardingView.classList.remove('hidden');
    authScanStatus.textContent = "Awaiting Verification...";
    document.getElementById('verifyLogs').innerHTML = '';
    initWebcam(verifyVideo);
});
