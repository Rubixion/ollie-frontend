// Saved outfits (table: supabase/saved_outfits.sql). The browser talks to Supabase directly with the signed-in
// user's session; row-level security keeps every row to its owner.
import { supabase } from "@/lib/supabase"
import { ITEMS, type Slot } from "./catalog"
import { BUILDS, LOOKS, colorOf, type Build, type Gender, type LookId, type Outfit, type Tints } from "./model"

export type SavedLook = { gender: Gender; build: Build; lookId: LookId; outfit: Outfit; tints?: Tints; face?: Record<string, string> }
export type SavedOutfit = { id: string; name: string; look: SavedLook; created_at: string }

/** Rows come back from the database: keep only known ids, so a stale or hand-edited row can't break the editor. */
export function clean(look: unknown): SavedLook | null {
  const l = look as Partial<SavedLook> | null
  if (!l || (l.gender !== "male" && l.gender !== "female")) return null
  const outfit: Outfit = {}
  for (const [slot, id] of Object.entries(l.outfit ?? {})) if (ITEMS.some((i) => i.id === id && i.slot === slot)) outfit[slot as Slot] = id
  const tints: Tints = {}
  for (const [slot, name] of Object.entries(l.tints ?? {})) { const id = outfit[slot as Slot]; if (id && colorOf(id, name)?.name === name) tints[slot as Slot] = name }
  const face = Object.fromEntries(Object.entries(l.face ?? {}).filter(([k, v]) => typeof k === "string" && typeof v === "string" && v.length < 40))
  return {
    gender: l.gender,
    build: BUILDS.some((b) => b.id === l.build) ? l.build! : "average",
    lookId: LOOKS.some((x) => x.id === l.lookId) ? l.lookId! : "white",
    outfit, tints, face,
  }
}

// ─── share links: /ai-stylist?look=<code>, the look itself in the URL (no database row, works signed out) ───
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
const unb64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)))

export const encodeLook = (look: SavedLook, name: string) => b64(JSON.stringify({ ...look, name: title(name) }))
/** A link's code back to a look, through clean(): anything unknown or malformed is dropped (null if nothing usable). */
export function decodeLook(code: string): { look: SavedLook; name: string } | null {
  try {
    const raw = JSON.parse(unb64(code))
    const look = clean(raw)
    return look && { look, name: typeof raw.name === "string" ? title(raw.name) : "My outfit" }
  } catch {
    return null
  }
}

export async function listOutfits(): Promise<SavedOutfit[]> {
  const { data, error } = await supabase.from("saved_outfits").select("id, name, look, created_at").order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).flatMap((r) => { const look = clean(r.look); return look ? [{ ...r, look }] : [] })
}

const title = (name: string) => name.trim().slice(0, 60) || "My outfit"

/** Returns the new row's id, or the error to show. */
export async function saveOutfit(name: string, look: SavedLook): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase.from("saved_outfits").insert({ name: title(name), look }).select("id").single()
  if (!error) return { id: data.id }
  return { error: /limit reached/.test(error.message) ? "You've saved 100 outfits, the most there's room for. Delete one to save another." : "Couldn't save the outfit. Please try again." }
}

/** Rename and/or overwrite the clothes of an outfit already saved. Returns the error to show, or null. */
export async function updateOutfit(id: string, patch: { name?: string; look?: SavedLook }): Promise<string | null> {
  const row = { ...patch, ...(patch.name !== undefined && { name: title(patch.name) }) }
  const { error } = await supabase.from("saved_outfits").update(row).eq("id", id)
  return error ? "Couldn't update the outfit. Please try again." : null
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
