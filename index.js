
// ==================== KING MAKER YUVI COOKIES SERVER ====================
const fs = require('fs');
const express = require('express');
const wiegine = require('fca-mafiya');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const activeSessions = new Map();
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
res.send(`<!DOCTYPE html>
<html>
<head>
<title>KING MAKER YUVI COOKIES SERVER</title>
<style>
body{
margin:0;
font-family:Arial;
background:url('https://i.postimg.cc/mrJF1Q23/7255f6737f770de13ed988e59a5a375b.jpg') no-repeat center center fixed;
background-size:cover;
}

.container{
max-width:1100px;
margin:40px auto;
background:rgba(0,0,0,0.65);
border-radius:15px;
padding:25px;
color:white;
box-shadow:0 0 25px #00ff99;
}

h1{
text-align:center;
color:#00ff99;
text-shadow:0 0 15px #00ff99;
}

input,textarea{
width:100%;
padding:12px;
margin:10px 0;
border-radius:8px;
border:none;
background:rgba(255,255,255,0.1);
color:white;
}

.btn{
width:100%;
padding:14px;
margin-top:10px;
border:none;
border-radius:10px;
font-size:16px;
font-weight:bold;
cursor:pointer;
color:black;
background:#00ff99;
box-shadow:0 0 15px #00ff99;
transition:0.3s;
}

.btn:hover{
box-shadow:0 0 30px #00ff99;
transform:scale(1.03);
}

.logs{
margin-top:20px;
background:black;
padding:15px;
height:300px;
overflow:auto;
border-radius:10px;
font-family:monospace;
color:#00ff99;
}
</style>
</head>

<body>
<div class="container">
<h1>🔥 KING MAKER YUVI COOKIES SERVER 🔥</h1>

<textarea placeholder="Paste Facebook Cookies"></textarea>
<input placeholder="Group UID">
<input placeholder="Delay (seconds)">
<button class="btn">START SENDING</button>
<button class="btn">STOP ALL</button>

<div class="logs">
Server Ready...
</div>

</div>
</body>
</html>`);
});

server.listen(PORT,()=>{
console.log("KING MAKER YUVI SERVER RUNNING");
});
