import { z } from 'zod';

export const fullNameValidation = z     // Full Name validation
    .string()
    .min(3, { message: "Name must be atleast 3 characters long" })
    .max(20, { message: "Name must not exceed 20 characters" })
    .regex(/^[a-zA-Z ]+$/, { message: "Name must contain only alphabets and spaces" });


export const usernameValidation = z     // Username validation
    .string()
    .min(3, { message: "Username must be atleast 3 characters long" })
    .max(20, { message: "Username must not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Username must not contain special characters" });


export const emailValidation = z    // Email validation
    .string()
    .email({ message: "Inavild email address" })
    .min(5, { message: "Email must be atleast 5 characters long" })
    .max(50, { message: "Email must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address" });


export const passwordValidation = z     // Password validation
    .string()
    .min(8, { message: "Password must be atleast 8 characters long" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, { message: "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit and 1 special character" });


export const contactValidation = z      // Contact validation
    .string()
    .min(10, { message: "Contact must be 10 digits long" })
    .max(10, { message: "Contact must be 10 digits long" })
    .regex(/^[0-9]+$/, { message: "Contact must contain only digits" });


export const signUpSchema = z.object({    // Sign Up Schema
    fullName: fullNameValidation,
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation,
    contact: contactValidation
});