import { io, Socket } from "socket.io-client";

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hdnByZWV0LnNpbmdoQGp1bmdsZXdvcmtzLmNvbSIsImV4cCI6MTgxOTM4MDg3N30.LdKWD-aTb9zh5uoxPdHyGeCc_4ONr7wph7aAMFJEftI";

const socket: Socket = io("http://localhost:5000", {
  transports: ["polling"],
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  query: {
    // token: `${token}` || "",
    bot_type: "Tookan",
  },
});

export default socket;
