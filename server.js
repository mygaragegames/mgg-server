require('dotenv').config();

console.clear();
console.log("---> mygarage.games <---");

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cors = require('cors');
const express = require('express');
const forceSecure = require('express-force-https');
const chalk = require('chalk');

let isDev = process.env.NODE_ENV !== 'prod';

const app = express();

// HTTP to HTTPS redirect
if(!isDev) {
    console.log(`[mgg-comingsoon] Using HTTPS redirect.`);

    app.use(function(req, res, next) {
        if (req.secure) {
            next();
        } else {
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
}

app.use(cors());
app.use(express.json());

// Public assets
app.use(express.static('public'));

// Routes
app.use('/v1', require('./routes/v1/index'));

// Servers
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT_HTTP, () => {
    console.log(chalk.green(`[mgg-server] (Server) HTTP server running on port ${process.env.PORT_HTTP}.`));
});

if(!isDev) {
    const sslPK = fs.readFileSync(`${process.env.SSL_DIR}/privkey.pem`, 'utf8');
    const sslCert = fs.readFileSync(`${process.env.SSL_DIR}/cert.pem`, 'utf8');
    const sslCA = fs.readFileSync(`${process.env.SSL_DIR}/chain.pem`, 'utf8');
    const credentials = {
        key: sslPK,
        cert: sslCert,
        ca: sslCA
    };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(process.env.PORT_HTTPS, () => {
        console.log(chalk.green(`[mgg-server] (Server) HTTPS server running on port ${process.env.PORT_HTTPS}.`));
    });
} else {
    console.log(chalk.grey(`[mgg-server] (Server) HTTPS server disabled on development instances.`));
}