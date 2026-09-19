'use client';

import { supabase } from './supabase';

const IMAGE_BUCKET = 'content-images';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_EDGE = 2400;
export type ImageFolder = 'column' | 'notice' | 'gpt' | 'app' | 'replay' | 'schedule';

function isLocalDemo() {
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && sessionStorage.getItem('miracle-admin-demo') === 'true';
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

async function optimizeImage(file: File) {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (!blob || blob.size >= file.size) return file;
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: file.lastModified });
}

export async function uploadContentImage(file: File, kind: 'column' | 'notice') {
  return uploadManagedImage(file, kind);
}

export async function uploadManagedImage(file: File, folder: ImageFolder) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('이미지는 5MB 이하만 올릴 수 있습니다.');
  if (isLocalDemo()) return readAsDataUrl(file);
  if (!supabase) throw new Error('Supabase 저장소가 연결되지 않았습니다.');

  const uploadFile = await optimizeImage(file);

  const extension = uploadFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const yearMonth = new Date().toISOString().slice(0, 7);
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${folder}/${yearMonth}/${id}.${extension}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, uploadFile, {
    cacheControl: '3600',
    contentType: uploadFile.type,
    upsert: false,
  });

  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteManagedImage(url?: string | null) {
  if (!url || url.startsWith('data:') || !supabase || isLocalDemo()) return;
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return;
  const path = decodeURIComponent(url.slice(markerIndex + marker.length));
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}
