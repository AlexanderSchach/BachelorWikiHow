import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

/**
   Uploads an image file to Firebase Storage and returns its public URL.
  
   @param file - The image file
   @returns The public download URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Create a unique file path using timestamp and original filename
  const path = `uploads/guides/${Date.now()}-${file.name}`;
  const imageRef = ref(storage, path);

  // Upload the file to Firebase Storage
  await uploadBytes(imageRef, file);

  // Get and return the download URL
  return getDownloadURL(imageRef);
}
