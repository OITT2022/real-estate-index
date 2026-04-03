import { getStorage } from "@/lib/storage";

export async function uploadFile(file: File): Promise<string> {
  return getStorage().upload(file);
}

export async function uploadImage(file: File): Promise<string> {
  return getStorage().upload(file);
}

export async function deleteImage(url: string): Promise<void> {
  return getStorage().delete(url);
}
