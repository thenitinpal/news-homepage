import { supabase } from "./supabaseClient";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

function mapRowToMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert(input);
  if (error) throw error;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ContactMessageRow[]).map(mapRowToMessage);
}

export async function markMessageRead(id: string, read: boolean): Promise<void> {
  const { error } = await supabase.from("contact_messages").update({ read }).eq("id", id);
  if (error) throw error;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}
