// src/app/api/tracking/complete/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function POST(req: Request) {
    const { rentalId } = await req.json();

    // 1) fetch full path from Firebase
    const snap = await get(ref(db, `tracking/${rentalId}`));
    const pathData = snap.val(); // assume { lat, lng... } or array

    // 2) save summary into MySQL
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });
    await pool.query(
        `INSERT INTO tracking_paths (rental_id, path_json) VALUES (?, ?)`,
        [rentalId, JSON.stringify(pathData)]
    );

    // 3) clean up RTDB node
    await import('firebase/database').then(({ remove }) =>
        remove(ref(db, `tracking/${rentalId}`))
    );

    return NextResponse.json({ success: true });
}