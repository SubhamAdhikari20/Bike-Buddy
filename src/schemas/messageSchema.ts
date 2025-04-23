// src/schemas/messageSchema.ts
import { z } from "zod";

export const fullNameValidation = z
    .string()
    .min(3, { message: "Name must be atleast 3 characters long" })
    .max(20, { message: "Name must not exceed 20 characters" })
    .regex(/^[a-zA-Z ]+$/, { message: "Name must contain only alphabets and spaces" });

export const emailValidation = z
    .string()
    .email({ message: "Inavild email address" })
    .min(5, { message: "Email must be atleast 5 characters long" })
    .max(50, { message: "Email must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address" });

export const contactValidation = z
    .string()
    .min(10, { message: "Contact must be 10 digits long" })
    .max(10, { message: "Contact must be 10 digits long" })
    .regex(/^[0-9]+$/, { message: "Contact must contain only digits" });

export const messageValidation = z
    .string()
    .min(5, { message: "Message must be atleast 3 characters long" })
    .max(100, { message: "Message must be atleast 100 characters long" })
    .regex(/^[a-zA-Z ]+$/, { message: "Message must contain only alphabets and spaces" });


export const messageSchema = z.object({
    fullName: fullNameValidation,
    email: emailValidation,
    contact: contactValidation,
    message: messageValidation,
});
