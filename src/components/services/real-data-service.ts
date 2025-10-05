// src/components/services/real-data-service.ts
// Minimal, compile-safe Supabase service. Keeps UI contracts.

import { supabase } from '../../utils/supabase/client';

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  picture?: string | null;
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  images: string[];
  price?: number;
  priceType?: string;
  currency?: string;
  category?: string;
  subcategory?: string;
  userId?: string;
  username?: string;
  userEmail?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chat {
  id: string;
  adId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: Date;
}

class RealDataService {
  private static _instance: RealDataService;
  static getInstance() {
    if (!this._instance) this._instance = new RealDataService();
    return this._instance;
  }

  private currentUser: User | null = null;

  constructor() {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user;
      if (u) {
        this.currentUser = {
          id: u.id,
          email: u.email ?? null,
          name: u.user_metadata?.full_name ?? null,
          picture: u.user_metadata?.avatar_url ?? null,
        };
      }
    });

    supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user;
      this.currentUser = u
        ? {
            id: u.id,
            email: u.email ?? null,
            name: u.user_metadata?.full_name ?? null,
            picture: u.user_metadata?.avatar_url ?? null,
          }
        : null;
    });
  }

  // ---------- Auth ----------
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const u = data.user!;
    this.currentUser = {
      id: u.id,
      email: u.email ?? null,
      name: u.user_metadata?.full_name ?? null,
      picture: u.user_metadata?.avatar_url ?? null,
    };
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async refreshAuth(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    const u = data?.user;
    this.currentUser = u
      ? {
          id: u.id,
          email: u.email ?? null,
          name: u.user_metadata?.full_name ?? null,
          picture: u.user_metadata?.avatar_url ?? null,
        }
      : null;
    return this.currentUser;
  }

  // ---------- Ads (table: ads) ----------
  async getAds(opts: { category?: string } = {}): Promise<{ ads: Ad[]; total: number }> {
    let q = supabase.from('ads').select('*').order('created_at', { ascending: false });
    if (opts.category) q = q.eq('category', opts.category);
    const { data, error } = await q;
    if (error) throw error;

    const ads: Ad[] = (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      images: Array.isArray(row.images) ? row.images : [],
      price: row.price ?? undefined,
      priceType: row.price_type ?? row.priceType,
      currency: row.currency ?? 'USD',
      category: row.category ?? undefined,
      subcategory: row.subcategory ?? undefined,
      userId: row.user_id ?? row.owner_id ?? undefined,
      username: row.username ?? undefined,
      userEmail: row.user_email ?? undefined,
      status: row.status ?? 'active',
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    }));

    return { ads, total: ads.length };
  }

  async getAdById(adId: string): Promise<Ad | null> {
    const { data, error } = await supabase.from('ads').select('*').eq('id', adId).single();
    if (error) {
      // no row found code from PostgREST; ignore as null
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }
    const row: any = data;
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      images: Array.isArray(row.images) ? row.images : [],
      price: row.price ?? undefined,
      priceType: row.price_type ?? row.priceType,
      currency: row.currency ?? 'USD',
      category: row.category ?? undefined,
      subcategory: row.subcategory ?? undefined,
      userId: row.user_id ?? row.owner_id ?? undefined,
      username: row.username ?? undefined,
      userEmail: row.user_email ?? undefined,
      status: row.status ?? 'active',
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  // ---------- File upload (temporary stub) ----------
  async uploadFile(file: File, _type: 'ad-image' | 'profile-image' = 'ad-image'): Promise<string> {
    // Replace with Supabase Storage upload later if needed.
    return URL.createObjectURL(file);
  }

  // ---------- Chat (temporary in-memory fallback) ----------
  private localChats = new Map<string, { chat: Chat; messages: Message[] }>();

  async getChats(): Promise<Chat[]> {
    return Array.from(this.localChats.values()).map((c) => c.chat);
  }

  async createOrGetChat(adId: string, sellerId: string, _sellerUsername: string): Promise<Chat> {
    const me = this.currentUser?.id ?? 'guest';
    const id = `local-${adId}-${me}-${sellerId}`;
    if (!this.localChats.has(id)) {
      this.localChats.set(id, {
        chat: { id, adId, buyerId: me, sellerId, lastMessageAt: new Date() },
        messages: [],
      });
    }
    return this.localChats.get(id)!.chat;
  }

  async getChat(chatId: string): Promise<{ chat: Chat; messages: Message[] } | null> {
    return this.localChats.get(chatId) ?? null;
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const me = this.currentUser?.id ?? 'guest';
    const entry = this.localChats.get(chatId);
    if (!entry) throw new Error('Chat not found');
    const msg: Message = { id: `${Date.now()}`, roomId: chatId, senderId: me, body: content, createdAt: new Date() };
    entry.messages.push(msg);
    entry.chat.lastMessageAt = new Date();
    return msg;
  }

  async markMessagesAsRead(_chatId: string): Promise<void> {
    // no-op for local fallback
  }
}

export const realDataService = RealDataService.getInstance();
export default realDataService;
// --- lightweight event bus for compatibility ---
type EventHandler = (payload?: any) => void;
const __listeners = new Map<string, Set<EventHandler>>();

function __on(event: string, handler: EventHandler) {
  if (!__listeners.has(event)) __listeners.set(event, new Set());
  __listeners.get(event)!.add(handler);
  return () => __off(event, handler);
}
function __off(event: string, handler?: EventHandler) {
  const set = __listeners.get(event);
  if (!set) return;
  if (handler) set.delete(handler);
  else set.clear();
}
function __emit(event: string, payload?: any) {
  const set = __listeners.get(event);
  if (!set) return;
  for (const fn of Array.from(set)) {
    try { fn(payload); } catch {}
  }
}

// attach to exported instance (compat with older code expecting .on/.off/.emit)
(realDataService as any).on = __on;
(realDataService as any).off = __off;
(realDataService as any).emit = __emit;

// notify "ready" so subscribers can continue
setTimeout(() => {
  try { (realDataService as any).emit?.('ready'); } catch {}
}, 0);
