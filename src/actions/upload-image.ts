
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: "kopa-360-website.appspot.com",
  })
}

export async function uploadProfilePicture(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const fileName = `profile-pictures/${Date.now()}-${file.name}`

    // Get a reference to the storage bucket
    const bucket = getStorage().bucket()
    const fileRef = bucket.file(fileName)

    // Upload the file
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Make the file publicly accessible
    await fileRef.makePublic()

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

