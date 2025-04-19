// src/app/api/admin/owners/route.ts
import { getAllOwners } from "@/model/User";

export async function GET() {
    try {
        const owners = await getAllOwners();
        return Response.json(owners, { status: 200 });
    }
    catch (error) {
        return Response.json(
            { success: false, message: "Failed to fetch owners" },
            { status: 500 }
        );
    }
}

// export async function POST(req: Request) {
//     try {
//         const data = await req.json();

//         const newOwner = await prisma.user.create({
//             data: {
//                 ...data,
//                 role: Role.owner,
//             },
//         });

//         return NextResponse.json(newOwner, { status: 201 });
//     } catch (error) {
//         return NextResponse.json(
//             { error: "Failed to create owner" },
//             { status: 500 }
//         );
//     }
// }