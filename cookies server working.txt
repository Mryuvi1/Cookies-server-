const fs = require('fs');
const express = require('express');
const wiegine = require('fca-mafiya');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store active sessions
const activeSessions = new Map();

// WebSocket Server
const wss = new WebSocket.Server({ server });

// ==================== FIXED LOGIN FUNCTIONS ====================
// Yeh functions purane working script se liye gaye hain

function saveMainSession(sessionId, api) {
    try {
        if (!api) return false;
        
        const sessionPath = path.join(__dirname, `session_${sessionId}.json`);
        const appState = api.getAppState();
        fs.writeFileSync(sessionPath, JSON.stringify(appState, null, 2));
        console.log(`💾 Session saved for ${sessionId}`);
        return true;
    } catch (error) {
        console.log(`❌ Failed to save session:`, error.message);
        return false;
    }
}

function loadSessionIfExists(sessionId) {
    try {
        const sessionPath = path.join(__dirname, `session_${sessionId}.json`);
        if (fs.existsSync(sessionPath)) {
            const fileStats = fs.statSync(sessionPath);
            if (fileStats.size > 100) {
                const appState = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
                console.log(`📂 Loaded session for ${sessionId}`);
                return appState;
            }
        }
    } catch (error) {
        console.log(`❌ Failed to load session:`, error.message);
    }
    return null;
}

// ==================== PERFECT LOGIN SYSTEM ====================
function loginWithCookie(cookieString, callback) {
    console.log(`🔐 Attempting login with cookie...`);
    
    // Try multiple login methods (same as working script)
    const loginMethods = [
        (cb) => {
            // Method 1: Try as JSON appState
            try {
                const appState = JSON.parse(cookieString);
                wiegine.login({ appState }, (err, api) => {
                    if (err || !api) cb(null);
                    else cb(api);
                });
            } catch (e) {
                cb(null);
            }
        },
        (cb) => {
            // Method 2: Try as string appState
            wiegine.login({ appState: cookieString }, (err, api) => {
                if (err || !api) cb(null);
                else cb(api);
            });
        },
        (cb) => {
            // Method 3: Try as raw cookie
            wiegine.login(cookieString, {}, (err, api) => {
                if (err || !api) cb(null);
                else cb(api);
            });
        },
        (cb) => {
            // Method 4: Try with parsed cookies object
            try {
                const cookiesArray = cookieString.split(';').map(c => c.trim()).filter(c => c);
                const appState = cookiesArray.map(cookie => {
                    const [key, ...valueParts] = cookie.split('=');
                    const value = valueParts.join('=');
                    return {
                        key: key.trim(),
                        value: value.trim(),
                        domain: '.facebook.com',
                        path: '/',
                        hostOnly: false,
                        creation: new Date().toISOString(),
                        lastAccessed: new Date().toISOString()
                    };
                }).filter(c => c.key && c.value);
                
                if (appState.length > 0) {
                    wiegine.login({ appState }, (err, api) => {
                        if (err || !api) cb(null);
                        else cb(api);
                    });
                } else {
                    cb(null);
                }
            } catch (e) {
                cb(null);
            }
        }
    ];

    let currentMethod = 0;
    
    function tryNextMethod() {
        if (currentMethod >= loginMethods.length) {
            console.log(`❌ All login methods failed`);
            callback(null, 'All login methods failed');
            return;
        }
        
        console.log(`🔄 Trying login method ${currentMethod + 1}`);
        loginMethods[currentMethod]((api) => {
            if (api) {
                console.log(`✅ Login successful with method ${currentMethod + 1}`);
                callback(api, null);
            } else {
                currentMethod++;
                setTimeout(tryNextMethod, 3000);
            }
        });
    }
    
    tryNextMethod();
}

// ==================== SESSION KEEP-ALIVE ====================
function startSessionKeepAlive(sessionId, api) {
    console.log(`💾 Starting keep-alive for ${sessionId}`);
    
    const keepAliveInterval = setInterval(() => {
        if (api) {
            api.getCurrentUserID((err, id) => {
                if (err) {
                    console.log(`⚠️ Session check failed for ${sessionId}: ${err.message}`);
                } else {
                    console.log(`💚 Session alive - ${sessionId}: User ID: ${id}`);
                    saveMainSession(sessionId, api);
                }
            });
        }
    }, 300000); // 5 minutes
    
    return keepAliveInterval;
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('🔗 New WebSocket Client Connected');
    ws.send(JSON.stringify({ 
        type: 'status', 
        message: 'WebSocket Connected Successfully', 
        status: 'connected' 
    }));
    
    // Send current sessions to new client
    broadcastSessionsUpdate();
});

// Broadcast to all WebSocket clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Serve HTML Page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SERVER MAKER LEGEND YUVI HERE</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Arial', sans-serif;
            }
            
            body {
    background: url('https://i.postimg.cc/mrJF1Q23/7255f6737f770de13ed988e59a5a375b.jpg')
        no-repeat center center fixed;
    background-size: cover;
    min-height: 100vh;
    padding: 20px;
}
            
            .container {
    max-width: 1200px;
    width: 95%;
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0,255,153,0.6);
    overflow: hidden;
    border: 2px solid rgba(0,255,153,0.7);
    backdrop-filter: blur(8px);
}
            
            .header {
                background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
                color: white;
                padding: 25px;
                text-align: center;
                border-bottom: 3px solid #ff1493;
            }
            
            .header h1 {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .header .developer {
                font-size: 1.2em;
                opacity: 0.9;
                font-weight: bold;
            }
            
            .content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                padding: 25px;
            }
            
            @media (max-width: 768px) {
                .content {
                    grid-template-columns: 1fr;
                }
            }
            
            .form-section, .logs-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 12px;
                border: 2px solid #ffb6c1;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
                color: #d63384;
                font-size: 1.1em;
            }
            
            input, textarea, select {
                width: 100%;
                padding: 12px;
                border: 2px solid #ff69b4;
                border-radius: 8px;
                font-size: 1em;
                background: white;
                transition: all 0.3s ease;
            }
            
            input:focus, textarea:focus, select:focus {
                outline: none;
                border-color: #ff1493;
                box-shadow: 0 0 10px rgba(255, 20, 147, 0.3);
            }
            
            textarea {
                height: 120px;
                resize: vertical;
                font-family: monospace;
            }
            
            .btn {
    background: #00ff99;
    color: #000;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    margin: 5px 0;
    box-shadow: 0 0 15px #00ff99;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 0 30px #00ff99, 0 0 60px rgba(0,255,153,0.6);
}
            
            .btn-stop { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
.btn-clear { background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); }
            
            .logs-container {
                background: #1a1a1a;
                color: #00ff00;
                padding: 15px;
                border-radius: 8px;
                height: 500px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
                border: 2px solid #333;
            }
            
            .log-entry {
                margin-bottom: 8px;
                padding: 5px;
                border-left: 3px solid #ff69b4;
                padding-left: 10px;
            }
            
            .log-success { color: #00ff00; }
            .log-error { color: #ff4444; }
            .log-warning { color: #ffaa00; }
            .log-info { color: #44aaff; }
            
            .session-list {
                margin-top: 20px;
            }
            
            .session-item {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 5px solid #ff69b4;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .status-connected {
                color: #00ff00;
                font-weight: bold;
            }
            
            .status-disconnected {
                color: #ff4444;
                font-weight: bold;
            }
            
            .websocket-status {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: bold;
                background: #28a745;
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .websocket-status.disconnected {
                background: #dc3545;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 YUVI COOKIES SERVER 🌟</h1>
                <div class="developer">DEVELOPER: YUVI LEGEND</div>
                <div class="developer">✅ PERMANENT SESSION LOGIN ✅</div>
            </div>
            
            <div class="content">
                <div class="form-section">
                    <h2>⚙️ Message Sending Configuration</h2>
                    <form id="botConfig">
                        <div class="form-group">
                            <label>🔐 Facebook Cookies / AppState:</label>
                            <textarea id="cookies" placeholder="fr=0rhS117jZtNqb2drl.AWfob3XWOnYUH3kcgjblL2RUkiTOzv74KnqvOXsC7p1ASZWd8q8.BpIHYg..AAA.0.0.BpIHaI.AWd1Chpo4ISAo_F_kQYjaGV7MBg; locale=hi_IN; xs=47%3Ad32xc14WOJp82A%3A2%3A1763735100%3A-1%3A-1; pas=61583935177448%3ARM2BRkdHqY; c_user=61583935177448; ps_n=1; sb=IHYgaRy2otPWD_1ErU87NmJ_; wd=800x1280; ps_l=1; m_pixel_ratio=1.5; datr=IHYgaXp_jCdzcMNFrJ37EI6C;" required></textarea>
                            <small>✅ One-time login - Session saved permanently</small>
                        </div>
                        
                        <div class="form-group">
                            <label>👥 Group UID:</label>
                            <input type="text" id="groupUID" placeholder="Enter Facebook Group UID" required>
                        </div>
                        
                        <div class="form-group">
                            <label>📝 Message Prefix:</label>
                            <input type="text" id="prefix" placeholder="Prefix before each message" value="💬 ">
                        </div>
                        
                        <div class="form-group">
                            <label>⏰ Time Delay (seconds):</label>
                            <input type="number" id="delay" placeholder="Delay between messages" value="10" min="5" required>
                        </div>
                        
                        <div class="form-group">
                            <label>📄 Message File:</label>
                            <input type="file" id="messageFile" accept=".txt" required>
                            <small>Select a .txt file with one message per line</small>
                        </div>
                        
                        <button type="button" class="btn" onclick="startBot()">🚀 START MESSAGE SENDING</button>
                        <button type="button" class="btn btn-stop" onclick="stopAllSessions()">🛑 STOP ALL SESSIONS</button>
                        <button type="button" class="btn btn-clear" onclick="clearLogs()">🧹 CLEAR LOGS</button>
                    </form>
                    
                    <div class="session-list" id="sessionList">
                        <h3>📋 Active Sessions</h3>
                        <div id="sessionsContainer"></div>
                    </div>
                </div>
                
                <div class="logs-section">
                    <h2>📊 Live Logs</h2>
                    <div class="websocket-status" id="wsStatus">🔗 WebSocket Connected</div>
                    <div class="logs-container" id="logsContainer">
                        <div class="log-entry log-info">🌟 RAJ COOKIES SERVER Started</div>
                        <div class="log-entry log-info">✅ PERMANENT SESSION LOGIN - One-time login only</div>
                        <div class="log-entry log-info">💡 Ready to configure and start message sending</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let ws;
            let sessions = {};
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;
            
            function connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = protocol + '//' + window.location.host;
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function() {
                    reconnectAttempts = 0;
                    document.getElementById('wsStatus').textContent = '🔗 WebSocket Connected';
                    document.getElementById('wsStatus').className = 'websocket-status';
                    addLog('WebSocket connection established', 'success');
                };
                
                ws.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        handleWebSocketMessage(data);
                    } catch (e) {
                        console.error('WebSocket message error:', e);
                    }
                };
                
                ws.onclose = function() {
                    document.getElementById('wsStatus').textContent = '🔌 WebSocket Disconnected';
                    document.getElementById('wsStatus').className = 'websocket-status disconnected';
                    addLog('WebSocket disconnected', 'error');
                    
                    if (reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        setTimeout(connectWebSocket, 3000);
                    }
                };
                
                ws.onerror = function(error) {
                    addLog('WebSocket error', 'error');
                };
            }
            
            function handleWebSocketMessage(data) {
                switch(data.type) {
                    case 'status':
                        addLog(data.message, data.status);
                        break;
                    case 'log':
                        addLog(data.message, data.level);
                        break;
                    case 'session_update':
                        updateSessions(data.sessions);
                        break;
                    case 'message_sent':
                        addLog(\`✅ Message sent to \${data.groupUID}: \${data.message}\`, 'success');
                        break;
                    case 'error':
                        addLog(\`❌ Error: \${data.message}\`, 'error');
                        break;
                }
            }
            
            function addLog(message, level = 'info') {
                const logsContainer = document.getElementById('logsContainer');
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry log-' + level;
                logEntry.innerHTML = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
                logsContainer.appendChild(logEntry);
                logsContainer.scrollTop = logsContainer.scrollHeight;
            }
            
            function startBot() {
                const cookies = document.getElementById('cookies').value.trim();
                const groupUID = document.getElementById('groupUID').value.trim();
                const prefix = document.getElementById('prefix').value.trim();
                const delay = parseInt(document.getElementById('delay').value);
                const fileInput = document.getElementById('messageFile');
                
                if (!cookies || !groupUID || !fileInput.files.length) {
                    addLog('❌ Please fill all required fields', 'error');
                    return;
                }
                
                if (delay < 5) {
                    addLog('❌ Delay should be at least 5 seconds', 'error');
                    return;
                }
                
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const messages = e.target.result.split('\\n')
                        .map(msg => msg.trim())
                        .filter(msg => msg.length > 0);
                    
                    if (messages.length === 0) {
                        addLog('❌ No valid messages found in file', 'error');
                        return;
                    }
                    
                    const config = {
                        cookies,
                        groupUID,
                        prefix,
                        delay,
                        messages
                    };
                    
                    fetch('/start', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(config)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            addLog(\`✅ Message sending started successfully! Session ID: \${data.sessionId}\`, 'success');
                            addLog(\`👤 Logged in as: \${data.userID}\`, 'success');
                            addLog(\`💾 Session saved permanently - No need to login again\`, 'info');
                        } else {
                            addLog(\`❌ Failed to start: \${data.error}\`, 'error');
                        }
                    })
                    .catch(error => {
                        addLog(\`❌ Error starting: \${error.message}\`, 'error');
                    });
                };
                
                reader.onerror = function() {
                    addLog('❌ Error reading file', 'error');
                };
                
                reader.readAsText(file);
            }
            
            function stopSession(sessionId) {
                fetch('/stop', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        addLog(\`✅ Session \${sessionId} stopped\`, 'success');
                        delete sessions[sessionId];
                        updateSessionsDisplay();
                    } else {
                        addLog(\`❌ Failed to stop session: \${data.error}\`, 'error');
                    }
                })
                .catch(error => {
                    addLog(\`❌ Error stopping session: \${error.message}\`, 'error');
                });
            }
            
            function stopAllSessions() {
                fetch('/stop-all', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        addLog('✅ All message sending sessions stopped', 'success');
                        sessions = {};
                        updateSessionsDisplay();
                    }
                })
                .catch(error => {
                    addLog(\`❌ Error stopping sessions: \${error.message}\`, 'error');
                });
            }
            
            function updateSessions(sessionsData) {
                sessions = sessionsData;
                updateSessionsDisplay();
            }
            
            function updateSessionsDisplay() {
                const container = document.getElementById('sessionsContainer');
                container.innerHTML = '';
                
                if (Object.keys(sessions).length === 0) {
                    container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No active sessions</div>';
                    return;
                }
                
                for (const [sessionId, session] of Object.entries(sessions)) {
                    const sessionDiv = document.createElement('div');
                    sessionDiv.className = 'session-item';
                    sessionDiv.innerHTML = \`
                        <strong>Session ID:</strong> \${sessionId}<br>
                        <strong>Group UID:</strong> \${session.groupUID}<br>
                        <strong>Status:</strong> <span class="\${session.status === 'connected' ? 'status-connected' : 'status-disconnected'}">\${session.status}</span><br>
                        <strong>Messages Sent:</strong> \${session.messagesSent}<br>
                        <strong>User ID:</strong> \${session.userID}<br>
                        <strong>Delay:</strong> \${session.delay} seconds<br>
                        <button class="btn btn-stop" onclick="stopSession('\${sessionId}')" style="margin-top: 10px; padding: 8px 15px; font-size: 0.9em;">Stop Message Sending</button>
                    \`;
                    container.appendChild(sessionDiv);
                }
            }
            
            function clearLogs() {
                document.getElementById('logsContainer').innerHTML = '';
                addLog('Logs cleared', 'info');
            }
            
            // Initialize WebSocket connection when page loads
            window.onload = function() {
                connectWebSocket();
                
                // Load initial sessions
                fetch('/sessions')
                    .then(response => response.json())
                    .then(data => {
                        updateSessions(data.sessions);
                    })
                    .catch(error => {
                        addLog('Error loading sessions: ' + error.message, 'error');
                    });
            };
        </script>
    </body>
    </html>
    `);
});

// ==================== API ROUTES WITH PERMANENT SESSION ====================
app.post('/start', async (req, res) => {
    try {
        const { cookies, groupUID, prefix, delay, messages } = req.body;
        
        if (!cookies || !groupUID || !messages) {
            return res.json({ success: false, error: 'Missing required fields' });
        }
        
        const sessionId = 'session_' + Date.now();
        
        broadcast({
            type: 'log',
            message: '🔄 Starting Facebook login with permanent session...',
            level: 'info'
        });

        // Check if session file already exists and load it
        const savedSession = loadSessionIfExists(sessionId);
        let api = null;
        let error = null;

        if (savedSession) {
            // Use existing session file
            wiegine.login({ appState: savedSession }, (err, fbApi) => {
                if (err || !fbApi) {
                    // If saved session is invalid, try fresh login
                    broadcast({
                        type: 'log',
                        message: '⚠️ Saved session expired, trying fresh login...',
                        level: 'warning'
                    });
                    loginWithCookie(cookies, (fbApi, errMsg) => {
                        if (fbApi) {
                            processLoginSuccess(fbApi);
                        } else {
                            processLoginError(errMsg);
                        }
                    });
                } else {
                    processLoginSuccess(fbApi);
                }
            });
        } else {
            // Fresh login with provided cookies
            loginWithCookie(cookies, (fbApi, errMsg) => {
                if (fbApi) {
                    processLoginSuccess(fbApi);
                } else {
                    processLoginError(errMsg);
                }
            });
        }

        function processLoginSuccess(fbApi) {
            api = fbApi;
            const userID = api.getCurrentUserID();
            
            broadcast({ 
                type: 'log', 
                message: `✅ Logged in successfully as ${userID}`,
                level: 'success'
            });
            
            broadcast({
                type: 'log',
                message: '💾 Saving session permanently...',
                level: 'info'
            });
            
            const session = {
                api,
                groupUID,
                prefix: prefix || '',
                delay: (delay || 10) * 1000,
                messages: messages || [],
                currentIndex: 0,
                messagesSent: 0,
                status: 'connected',
                intervalId: null,
                keepAliveId: null,
                userID: userID
            };
            
            // Start message sending loop
            session.intervalId = setInterval(() => {
                if (!session.messages || session.messages.length === 0) {
                    broadcast({
                        type: 'error',
                        message: 'No messages available to send'
                    });
                    return;
                }
                
                if (session.currentIndex >= session.messages.length) {
                    session.currentIndex = 0; // Restart from beginning
                }
                
                const messageText = session.prefix + session.messages[session.currentIndex];
                
                // Send message using fca-mafiya API
                api.sendMessage(messageText, session.groupUID, (err, messageInfo) => {
                    if (err) {
                        broadcast({
                            type: 'error',
                            message: `Failed to send message: ${err.error || err.message}`
                        });
                    } else {
                        session.messagesSent++;
                        broadcast({
                            type: 'message_sent',
                            message: messageText,
                            groupUID: session.groupUID,
                            count: session.messagesSent
                        });
                        
                        // Update session in storage
                        activeSessions.set(sessionId, session);
                        broadcastSessionsUpdate();
                    }
                });
                
                session.currentIndex++;
                
            }, session.delay);
            
            // Start keep-alive system to maintain session
            session.keepAliveId = startSessionKeepAlive(sessionId, api);
            
            activeSessions.set(sessionId, session);
            broadcastSessionsUpdate();
            
            // Save session permanently for future use
            saveMainSession(sessionId, api);
            
            broadcast({
                type: 'log',
                message: `🚀 Message sending started for group ${groupUID}. Messages will be sent every ${delay} seconds`,
                level: 'success'
            });
            
            broadcast({
                type: 'log',
                message: '✅ Session saved permanently. Next time, no login required!',
                level: 'success'
            });
            
            res.json({ 
                success: true, 
                sessionId,
                userID: userID
            });
        }
        
        function processLoginError(errMsg) {
            broadcast({
                type: 'error',
                message: `❌ Login failed: ${errMsg}`
            });
            res.json({ success: false, error: errMsg });
        }
        
    } catch (error) {
        console.error('Error starting message sending:', error);
        broadcast({
            type: 'error',
            message: `Server error: ${error.message}`
        });
        res.json({ success: false, error: error.message });
    }
});

// Existing routes (unchanged)
app.post('/stop', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.json({ success: false, error: 'Session ID required' });
        }
        
        if (activeSessions.has(sessionId)) {
            const session = activeSessions.get(sessionId);
            if (session.intervalId) {
                clearInterval(session.intervalId);
            }
            if (session.keepAliveId) {
                clearInterval(session.keepAliveId);
            }
            
            // Logout from Facebook API
            if (session.api && typeof session.api.logout === 'function') {
                session.api.logout();
            }
            
            activeSessions.delete(sessionId);
            
            broadcast({
                type: 'log',
                message: `🛑 Message sending stopped for session ${sessionId}`,
                level: 'warning'
            });
            
            broadcastSessionsUpdate();
            res.json({ success: true });
        } else {
            res.json({ success: false, error: 'Session not found' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/stop-all', (req, res) => {
    try {
        for (const [sessionId, session] of activeSessions) {
            if (session.intervalId) {
                clearInterval(session.intervalId);
            }
            if (session.keepAliveId) {
                clearInterval(session.keepAliveId);
            }
            
            // Logout from Facebook API
            if (session.api && typeof session.api.logout === 'function') {
                session.api.logout();
            }
        }
        activeSessions.clear();
        
        broadcast({
            type: 'log',
            message: '🛑 All message sending sessions stopped',
            level: 'warning'
        });
        
        broadcastSessionsUpdate();
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/sessions', (req, res) => {
    try {
        const sessions = {};
        for (const [sessionId, session] of activeSessions) {
            sessions[sessionId] = {
                groupUID: session.groupUID,
                status: session.status,
                messagesSent: session.messagesSent,
                delay: session.delay / 1000,
                userID: session.userID
            };
        }
        res.json({ success: true, sessions });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        sessions: activeSessions.size,
        websocketClients: wss.clients.size
    });
});

// Broadcast sessions update to all clients
function broadcastSessionsUpdate() {
    const sessions = {};
    for (const [sessionId, session] of activeSessions) {
        sessions[sessionId] = {
            groupUID: session.groupUID,
            status: session.status,
            messagesSent: session.messagesSent,
            delay: session.delay / 1000,
            userID: session.userID
        };
    }
    broadcast({ type: 'session_update', sessions });
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
🌈 YUVI COOKIES SERVER 🌈
👨‍💻 DEVELOPER: Mr yuvi legend
📍 Server running on http://0.0.0.0:${PORT}
🔗 WebSocket server ready
✅ PERMANENT SESSION LOGIN - One-time login only
✅ Session saving and loading
✅ Keep-alive system
✅ Message sending system
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down UNSTOPPABLE YUVI HERE...');
    for (const [sessionId, session] of activeSessions) {
        if (session.intervalId) {
            clearInterval(session.intervalId);
        }
        if (session.keepAliveId) {
            clearInterval(session.keepAliveId);
        }
        
        // Logout from Facebook API
        if (session.api && typeof session.api.logout === 'function') {
            session.api.logout();
        }
    }
    wss.close();
    server.close();
    process.exit(0);

});
