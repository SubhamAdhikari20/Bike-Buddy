// src/model/Invoice.ts
import prisma from "@/lib/prisma";
import { Invoice } from "@prisma/client";

export async function getInvoiceById(id: number): Promise<Invoice | null> {
    return await prisma.invoice.findUnique({ where: { id } });
}

export async function getInvoiceByTransactionId(id: string): Promise<Invoice | null> {
    return await prisma.invoice.findUnique({ where: { transactionId: id } });
}

export async function getAllInvoices(): Promise<Invoice[]> {
    return await prisma.invoice.findMany();
}

export async function deleteInvoiceById(id: number): Promise<Invoice | null> {
    return await prisma.invoice.delete({ where: { id } });
} 