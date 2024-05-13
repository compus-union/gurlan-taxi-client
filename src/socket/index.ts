import { ref } from "vue";
import { io } from "socket.io-client";
import config from "@/config";
import { Preferences } from "@capacitor/preferences";

export const state = ref({
  connected: false,
  socketId: "",
});

export const socket = io(config.SERVER_PUBLIC_URL, {
  reconnectionAttempts: Infinity,
});

export async function initConnection(socketId: string) {
  const { value } = await Preferences.get({ key: "clientOneId" });

  const user = { socketId: socketId, oneId: value, type: "client" };

  socket.emit("connection:init", user);
}

socket.on("connect", async () => {
  await initConnection(socket.id as string);
  
  state.value.socketId = socket.id as string;

  state.value.connected = true;
});
