const fs = require('fs');
const express = require('express');
const wiegine = require('fca-mafiya');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// ================= SERVER =================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= SESSION STORE =================
const activeSessions = new Map();

// ================= WEBSOCKET =================
function broadcast(data) {
    wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', ws => {
    ws.send(JSON.stringify({
        type: 'status',
        message: 'WebSocket Connected',
        status: 'success'
    }));

    ws.send(JSON.stringify({
        type: 'session_update',
        sessions: Object.fromEntries(activeSessions)
    }));
});

// ================= LOGIN FUNCTION =================
function loginWithCookie(cookieString, cb) {
    try {
        wiegine.login({ appState: cookieString }, (err, api) => {
            if (err || !api) return cb(null);
            cb(api);
        });
    } catch (e) {
        cb(null);
    }
}

// ================= ROUTES =================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
<title>RAJ COOKIES SERVER</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial;background:#ffe6f2;padding:20px}
.container{background:#fff;border-radius:10px;padding:20px}
textarea,input,button{width:100%;margin:10px 0;padding:10px}
button{background:#ff1493;color:#fff;border:none;font-weight:bold}
.logs{background:#000;color:#0f0;height:250px;overflow:auto;padding:10px}
</style>
</head>
<body>
<div class="container">
<h2>🌟 RAJ COOKIES SERVER 🌟</h2>

<textarea id="cookies" placeholder="PASTE COOKIES HERE"></textarea>
<input id="groupUID" placeholder="GROUP UID">
<input id="delay" type="number" value="10">

<input type="file" id="file">

<button onclick="start()">START</button>
<button onclick="stop()">STOP</button>

<div class="logs" id="logs"></div>
</div>

<script>
let ws=new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host);

ws.onmessage=e=>{
 let d=JSON.parse(e.data);
 log(JSON.stringify(d));
};

function log(t){
 let l=document.getElementById('logs');
 l.innerHTML+=t+'<br>';
 l.scrollTop=l.scrollHeight;
}

function start(){
 let f=document.getElementById('file').files[0];
 if(!f)return alert('file missing');
 let r=new FileReader();
 r.onload=e=>{
   fetch('/start',{
     method:'POST',
     headers:{'Content-Type':'application/json'},
     body:JSON.stringify({
       cookies:document.getElementById('cookies').value,
       groupUID:document.getElementById('groupUID').value,
       delay:document.getElementById('delay').value,
       messages:e.target.result.split('\\n')
     })
   });
 };
 r.readAsText(f);
}

function stop(){
 fetch('/stop',{method:'POST'});
}
</script>
</body>
</html>`);
});

// ================= START BOT =================
app.post('/start', (req, res) => {
    const { cookies, groupUID, messages } = req.body;
    const sessionId = Date.now().toString();

    loginWithCookie(cookies, api => {
        if (!api) {
            broadcast({ type: 'error', message: 'Login failed' });
            return;
        }

        activeSessions.set(sessionId, { groupUID });

        broadcast({
            type: 'session_update',
            sessions: Object.fromEntries(activeSessions)
        });

        broadcast({
            type: 'log',
            level: 'success',
            message: 'Login successful, session started'
        });
    });

    res.json({ success: true });
});

// ================= STOP =================
app.post('/stop', (req, res) => {
    activeSessions.clear();
    broadcast({
        type: 'log',
        level: 'warning',
        message: 'All sessions stopped'
    });
    res.json({ success: true });
});

// ================= START SERVER =================
server.listen(PORT, () => {
    console.log('🔥 Server running on port ' + PORT);
});
