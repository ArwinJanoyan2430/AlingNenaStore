import { supabase } from "./supabase";

export async function getCategories() {
    const response = await supabase
        .from("categories")
        .select("*");

    console.log("FULL RESPONSE:", response);

    return response.data ?? [];
}