// src/app/(app)/dashboard/admin/layout.tsx
import SideBar from "@/components/owner/SideBar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="flex gap-3 flex-col md:flex-row">
                <SideBar />
                <main className="min-h-screen p-2 md:p-2 w-full">{children}</main>
            </div>
        </>
    );
}
