// src/lib/fetcher.ts
import axios from "axios";

export async function fetcher<T>(url: string): Promise<T> {
    const res = await axios.get(url);
    if (!res.data.success) throw new Error(res.data.message || "Fetch failed");
    return res.data.user;
}
