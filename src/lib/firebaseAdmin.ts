// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";
import serviceAccount from "./../../firebase-service-account.json" assert { type: "json" };

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
}

export const adminDb = admin.database();


// import * as admin from 'firebase-admin';

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert({
//             projectId: process.env.FIREBASE_PROJECT_ID,
//             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//             privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//         }),
//         databaseURL: process.env.FIREBASE_DATABASE_URL,
//     });
// }
// export const adminDb = admin.database();