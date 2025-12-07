// server.js
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;


const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
