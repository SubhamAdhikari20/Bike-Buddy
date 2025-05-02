// // src/server/server.ts
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import prisma from "@/lib/prisma";
// import { NextResponse, NextRequest } from "next/server";
// import { PrismaClient } from "@prisma/client";


// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: process.env.FRONTEND_ORIGIN, methods: ["GET", "POST"] }
// });

// app.use(cors());
// app.use(express.json());

// // 1) Start Journey → create RideJourney in MySQL
// app.post("/api/bookings/:bookingId/start", async (req: express.Request<{ bookingId: string }>) => {
//     const bookingId = Number(req.params.bookingId);
//     const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
//     if (!booking) return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });

//     const journey = await prisma.rideJourney.create({
//         data: {
//             bookingId,
//             customerId: booking.customerId!,
//             bikeId: booking.bikeId!,
//             startTime: new Date(),
//             status: "active"
//         }
//     });

//     // create a room by joining on the server
//     // clients will call socket.emit("join", journey.id)
//     return NextResponse.json({ success: true, journeyId: journey.id });
// });

// // 2) Complete Journey → close in MySQL & tear down room
// app.post("/api/bookings/:bookingId/:journeyId/complete", async (req: express.Request<{ bookingId: string; journeyId: string }>) => {
//     const journeyId = Number(req.params.journeyId);
//     await prisma.rideJourney.update({
//         where: { id: journeyId },
//         data: { status: "completed", endTime: new Date() }
//     });

//     // notify clients
//     io.in(String(journeyId)).emit("end");
//     // disconnect everyone in that room
//     for (const socketId of io.of("/").adapter.rooms.get(String(journeyId)) ?? []) {
//         io.sockets.sockets.get(socketId)?.leave(String(journeyId));
//     }

//     return NextResponse.json({ success: true });
// });

// // 3) WebSocket logic
// io.on("connection", (socket) => {
//     socket.on("join", (journeyId: number) => {
//         socket.join(String(journeyId));
//     });

//     socket.on("location", (data: {
//         journeyId: number;
//         lat: number;
//         lng: number;
//         timestamp: number;
//     }) => {
//         const room = String(data.journeyId);
//         // broadcast to everyone in that room
//         io.to(room).emit("location", {
//             lat: data.lat,
//             lng: data.lng,
//             timestamp: data.timestamp
//         });
//     });

//     socket.on("disconnect", () => {
//         // cleanup if needed
//     });
// });

// // start the server
// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//     console.log(`Live‐tracking server listening on.... ${PORT}`);
// });
