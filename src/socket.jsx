import { io } from "socket.io-client";
const BASE_URL = import.meta.env.VITE_API_URL;
console.log("Connecting to socket at:", BASE_URL);
export const socket = io(BASE_URL);
