import { createClient } from "@supabase/supabase-js";

export async function getDisasterSOS() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("disaster_sos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching disaster SOS:", error);
    return [];
  }

  return data;
}
