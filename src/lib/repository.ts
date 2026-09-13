'use client';

import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { supabase } from './supabase';

export type CollectionName = 'contents' | 'schedules' | 'applications' | 'gpts' | 'apps' | 'replays' | 'partner_applications' | 'replay_accesses';
export type StoredRecord = { id: string; createdAt: string };

const eventName = (name: CollectionName) => `miracle-data:${name}`;
let subscriptionCounter = 0;
// 데이터 구조가 바뀔 때 버전만 올리면 기존 데모 데이터와 충돌하지 않고 새 예시를 확인할 수 있습니다.
const DATA_VERSION = 'v4';
const storageKey = (name: CollectionName) => `miracle-ai:${DATA_VERSION}:${name}`;

const fieldToDatabase: Record<string, string> = {
  imageUrl: 'image_url',
  publishedAt: 'published_at',
  createdAt: 'created_at',
  scheduleId: 'schedule_id',
  scheduleTitle: 'schedule_title',
  noticePlacement: 'notice_placement', startsAt: 'starts_at', endsAt: 'ends_at', ctaLabel: 'cta_label', ctaUrl: 'cta_url',
  accessUrl: 'access_url', priceLabel: 'price_label', thumbnailUrl: 'thumbnail_url', videoUrl: 'video_url',
  partnerType: 'partner_type', replayId: 'replay_id', replayTitle: 'replay_title',
};

const fieldFromDatabase = Object.fromEntries(
  Object.entries(fieldToDatabase).map(([app, database]) => [database, app]),
) as Record<string, string>;

function mapKeys(record: Record<string, unknown>, fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [fields[key] ?? key, value]),
  );
}

function toDatabase(record: Record<string, unknown>) {
  return mapKeys(record, fieldToDatabase);
}

function fromDatabase<T>(record: Record<string, unknown>) {
  return mapKeys(record, fieldFromDatabase) as T;
}

function localRead<T>(name: CollectionName, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  const saved = window.localStorage.getItem(storageKey(name));
  if (!saved) {
    window.localStorage.setItem(storageKey(name), JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(saved) as T[];
  } catch {
    return seed;
  }
}

function localWrite<T>(name: CollectionName, records: T[]) {
  window.localStorage.setItem(storageKey(name), JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(eventName(name)));
}

function isLocalDemo() {
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && sessionStorage.getItem('miracle-admin-demo') === 'true';
}

export function subscribeRecords<T extends StoredRecord>(
  name: CollectionName,
  seed: T[],
  listener: (records: T[]) => void,
  publishedOnly = false,
) {
  const supabaseClient = supabase;
  if (supabaseClient && !isLocalDemo()) {
    let active = true;
    const fetchRecords = async () => {
      let source = supabaseClient.from(name).select('*');
      if (publishedOnly && ['contents', 'gpts', 'apps', 'replays'].includes(name)) source = source.eq('status', 'published');
      const { data, error } = await source.order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        listener(localRead(name, seed));
        return;
      }
      const records = (data ?? []).map((record) => fromDatabase<T>(record));
      listener(records.length ? records : seed);
    };

    void fetchRecords();
    const channel = supabaseClient
      .channel(`website-${name}-${++subscriptionCounter}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: name }, () => void fetchRecords())
      .subscribe();
    const refresh = () => void fetchRecords();
    window.addEventListener(eventName(name), refresh);

    return () => {
      active = false;
      window.removeEventListener(eventName(name), refresh);
      void supabaseClient.removeChannel(channel);
    };
  }

  if (db) {
    const source = publishedOnly && name === 'contents'
      ? query(collection(db, name), where('status', '==', 'published'))
      : collection(db, name);
    return onSnapshot(
      source,
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[];
        listener(records.length ? records : seed);
      },
      () => listener(localRead(name, seed)),
    );
  }

  const emit = () => listener(localRead(name, seed));
  const storageListener = (event: StorageEvent) => {
    if (event.key === storageKey(name)) emit();
  };
  emit();
  window.addEventListener(eventName(name), emit);
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(eventName(name), emit);
    window.removeEventListener('storage', storageListener);
  };
}

export async function createRecord<T extends StoredRecord>(name: CollectionName, record: T) {
  if (supabase && !isLocalDemo()) {
    const { error } = await supabase.from(name).insert(toDatabase(record));
    if (error) {
      if (process.env.NODE_ENV === 'development') { const records = localRead<T>(name, []); localWrite(name, [record, ...records]); return; }
      throw error;
    }
    window.dispatchEvent(new CustomEvent(eventName(name)));
    return;
  }
  if (db) {
    await setDoc(doc(db, name, record.id), record);
    return;
  }
  const records = localRead<T>(name, []);
  localWrite(name, [record, ...records]);
}

export async function updateRecord<T extends StoredRecord>(name: CollectionName, id: string, changes: Partial<T>) {
  if (supabase && !isLocalDemo()) {
    const { error } = await supabase.from(name).update(toDatabase(changes)).eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new CustomEvent(eventName(name)));
    return;
  }
  if (db) {
    await setDoc(doc(db, name, id), changes, { merge: true });
    return;
  }
  const records = localRead<T>(name, []);
  localWrite(name, records.map((record) => (record.id === id ? { ...record, ...changes } : record)));
}

export async function deleteRecord<T extends StoredRecord>(name: CollectionName, id: string) {
  if (supabase && !isLocalDemo()) {
    const { error } = await supabase.from(name).delete().eq('id', id);
    if (error) throw error;
    window.dispatchEvent(new CustomEvent(eventName(name)));
    return;
  }
  if (db) {
    await deleteDoc(doc(db, name, id));
    return;
  }
  localWrite(name, localRead<T>(name, []).filter((record) => record.id !== id));
}

export function createId(prefix: string) {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}
