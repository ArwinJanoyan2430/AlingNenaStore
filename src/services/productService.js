import { supabase } from "../services/supabase";

// GET PRODUCTS
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

// ADD PRODUCT
export async function addProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select(); // IMPORTANT

  if (error) throw error;

  return data;
}

// UPDATE PRODUCT
export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select(); // IMPORTANT

  if (error) throw error;

  return data;
}

// DELETE PRODUCT
export async function deleteProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select(); // optional but useful for debugging

  if (error) throw error;

  return data;
}