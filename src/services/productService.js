import { supabase } from '../services/supabase';

export async function getProducts() {
    const { data, error } = await supabase
        .from("products")
        .select(`
            *,
            categories (
                id,
                name
            )
        `)
        .order("name");

    if (error) throw error;

    return data;
}

export async function addProduct(product) {
    return await supabase
        .from("products")
        .insert([product]);
}

export async function updateProduct(id, product) {
    return await supabase
        .from("products")
        .update(product)
        .eq("id", id);
}

export async function deleteProduct(id) {
    return await supabase
        .from("products")
        .delete()
        .eq("id", id);
}