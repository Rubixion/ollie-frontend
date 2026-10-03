// Saved outfits (table: supabase/saved_outfits.sql). The browser talks to Supabase directly with the signed-in
// user's session; row-level security keeps every row to its owner.
import { supabase } from "@/lib/supabase"
import { ITEMS, type Slot } from "./catalog"
import { BUILDS, LOOKS, type Build, type Gender, type LookId, type Outfit } from "./model"

export type SavedLook = { gender: Gender; build: Build; lookId: LookId; outfit: Outfit; face?: Record<string, string> }
export type SavedOutfit = { id: string; name: string; look: SavedLook; created_at: string }

/** Rows come back from the database: keep only known ids, so a stale or hand-edited row can't break the editor. */
export function clean(look: unknown): SavedLook | null {
  const l = look as Partial<SavedLook> | null
  if (!l || (l.gender !== "male" && l.gender !== "female")) return null
  const outfit: Outfit = {}
  for (const [slot, id] of Object.entries(l.outfit ?? {})) if (ITEMS.some((i) => i.id === id && i.slot === slot)) outfit[slot as Slot] = id
  const face = Object.fromEntries(Object.entries(l.face ?? {}).filter(([k, v]) => typeof k === "string" && typeof v === "string" && v.length < 40))
  return {
    gender: l.gender,
    build: BUILDS.some((b) => b.id === l.build) ? l.build! : "average",
    lookId: LOOKS.some((x) => x.id === l.lookId) ? l.lookId! : "white",
    outfit, face,
  }
}

export async function listOutfits(): Promise<SavedOutfit[]> {
  const { data, error } = await supabase.from("saved_outfits").select("id, name, look, created_at").order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).flatMap((r) => { const look = clean(r.look); return look ? [{ ...r, look }] : [] })
}

export async function saveOutfit(name: string, look: SavedLook): Promise<string | null> {
  const { error } = await supabase.from("saved_outfits").insert({ name: name.slice(0, 60) || "My outfit", look })
  if (!error) return null
  return /limit reached/.test(error.message) ? "You've saved 100 outfits, the most there's room for. Delete one to save another." : "Couldn't save the outfit. Please try again."
}

export async function deleteOutfit(id: string) {
  const { error } = await supabase.from("saved_outfits").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function getOutfit(id: string): Promise<SavedOutfit | null> {
  const { data } = await supabase.from("saved_outfits").select("id, name, look, created_at").eq("id", id).maybeSingle()
  const look = data && clean(data.look)
  return look ? { ...data, look } : null
}
