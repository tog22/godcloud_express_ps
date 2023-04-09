import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
import * as http from 'http';
import * as WebSocket from 'ws';


// Connect to the database
const pool = new pg.Pool(); // uses the DATABASE_URL environment variable injected by Railway)

// Initialize express, which the http server uses
const app = express();
const port = process.env.PORT || 3333;

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });


/**********************
 *  Websocket API
 */

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    // console.log(`Server started on port ${server.address().port} :)`);
	console.log(`Server started on ${server.address()} :)`);
});

/**********************
 * HTTP API
 */

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/", async (req, res) => {
	const { rows } = await pool.query("SELECT NOW()");
	res.send(`Update: 158________ The time from the DB is ${rows[0].now}`);
});

app.get("/users", async (req, res) => {
	const { rows } = await pool.query("SELECT * FROM users");
	res.json(rows)
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
