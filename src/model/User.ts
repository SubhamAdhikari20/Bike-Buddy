import prisma from "@/lib/prisma";
import { User, Role } from '@prisma/client';

export async function createUser(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    contact: string;
    profilePictureUrl?: string;
    verifyCode?: string;
    verifyCodeExpiryDate?: Date;
    verifyEmailResetPassword?: string;
    verifyEmailResetPasswordExpiryDate?: Date;
    isVerified?: boolean;
    role?: Role;
}): Promise<User> {
    return await prisma.user.create({
        data: {
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            password: data.password,
            contact: data.contact,
            profilePictureUrl: data.profilePictureUrl ?? null,
            verifyCode: data.verifyCode,
            verifyCodeExpiryDate: data.verifyCodeExpiryDate,
            verifyEmailResetPassword: data.verifyEmailResetPassword,
            verifyEmailResetPasswordExpiryDate: data.verifyEmailResetPasswordExpiryDate,
            isVerified: data.isVerified ?? false,
            role: data.role || 'customer',
        },
    });
}

export async function getUserById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { email },
    });
}

export async function getUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { username },
    });
}

export async function getUserByEmailOrUsername(identifier: string): Promise<User | null> {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });
}


export async function updateUser(
    id: number,
    data: Partial<{
        fullName: string;
        username: string;
        email: string;
        password: string;
        contact: string;
        profilePictureUrl?: string;
        verifyCode?: string | null;
        verifyCodeExpiryDate?: Date | null;
        isVerified?: boolean;
        verifyEmailResetPassword?: string | null;
        verifyEmailResetPasswordExpiryDate?: Date | null;
        role?: Role;
    }>
): Promise<User> {
    return await prisma.user.update({
        where: { id },
        data,
    });
}

export async function deleteUser(id: number): Promise<User> {
    return await prisma.user.delete({
        where: { id },
    });
}

export async function getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
}

export async function getAllOwners(): Promise<User[]> {
    return await prisma.user.findMany({
        where: { role: Role.owner },
    });
}

export async function resetPassword(
    id: number,
    data: Partial<{
        email: string;
        password: string;
    }>
): Promise<User> {
    return await prisma.user.update({
        where: { id },
        data,
    });
}
