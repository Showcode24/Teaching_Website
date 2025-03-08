"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { TextField, Typography, Box, Button, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Cloudinary } from "@cloudinary/url-gen"
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize"
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"

interface BioInfoProps {
  onDataChange?: (data: {
    bio: string
    achievements: string[]
    interests: string[]
    profilePicture: string
  }) => void
  initialData?: {
    bio: string
    achievements: string[]
    interests: string[]
    profilePicture?: string
  }
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
  },
})

export default function BioInfo({ onDataChange, initialData }: BioInfoProps) {
  const [bioInfo, setBioInfo] = useState({
    bio: initialData?.bio || "",
    achievements: initialData?.achievements || [],
    interests: initialData?.interests || [],
    profilePicture: initialData?.profilePicture || "",
  })

  // Track raw input values for achievements and interests
  const [rawInputs, setRawInputs] = useState({
    achievements: bioInfo.achievements.join(", "),
    interests: bioInfo.interests.join(", "),
  })

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true) // Prevents useEffect from triggering on mount

  // Create a Cloudinary image object if profilePicture exists
  const profileImage = bioInfo.profilePicture
    ? cld
      .image(
        bioInfo.profilePicture.includes("/")
          ? bioInfo.profilePicture.split("/").pop()?.split(".")[0] || ""
          : bioInfo.profilePicture,
      )
      .format("auto")
      .quality("auto")
      .resize(fill().gravity(autoGravity()).width(120).height(120))
    : null

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    onDataChange?.(bioInfo)
  }, [bioInfo, onDataChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "achievements" || name === "interests") {
      setRawInputs((prev) => ({ ...prev, [name]: value }))
      const processedArray = value
        ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : []
      setBioInfo((prev) => ({ ...prev, [name]: processedArray }))
    } else {
      setBioInfo((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    try {
      setUploading(true)

      // Create a FormData object to send the file to Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb"

      // Use the upload preset you created
      formData.append("upload_preset", "profile-pictures")

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(`Failed to upload: ${data.error.message || JSON.stringify(data.error)}`)
      }

      // Store the public_id instead of the full URL
      setBioInfo((prev) => ({
        ...prev,
        profilePicture: data.public_id,
      }))
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset file input to allow re-upload
      }
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bio Information
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Tell us more about yourself
      </Typography>

      {/* Profile Picture Upload Section */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 3 }}>
        <Box sx={{ width: 120, height: 120, borderRadius: "50%", overflow: "hidden", mb: 2 }}>
          {profileImage ? (
            <AdvancedImage cldImg={profileImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "grey.300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">No Image</Typography>
            </Box>
          )}
        </Box>

        <Button
          component="label"
          variant="contained"
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {uploading ? "Uploading..." : "Upload Profile Picture"}
          <VisuallyHiddenInput type="file" accept="image/*" onChange={handleProfilePictureUpload} ref={fileInputRef} />
        </Button>
      </Box>

      <TextField
        label="Your Bio"
        multiline
        fullWidth
        rows={5}
        name="bio"
        value={bioInfo.bio}
        onChange={handleChange}
        placeholder="Write a brief description about yourself, your teaching philosophy, and what makes you unique as an educator"
        margin="normal"
      />

      <TextField
        label="Key Achievements"
        fullWidth
        name="achievements"
        value={rawInputs.achievements}
        onChange={handleChange}
        placeholder="List your key achievements, separated by commas"
        margin="normal"
      />

      <TextField
        label="Interests and Hobbies"
        fullWidth
        name="interests"
        value={rawInputs.interests}
        onChange={handleChange}
        placeholder="List your interests and hobbies, separated by commas"
        margin="normal"
      />
    </Box>
  )
}





// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { TextField, Typography, Box, Button, Avatar, CircularProgress } from "@mui/material"
// import { styled } from "@mui/material/styles"
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// interface BioInfoProps {
//   onDataChange?: (data: {
//     bio: string
//     achievements: string[]
//     interests: string[]
//     profilePicture: string
//   }) => void
//   initialData?: {
//     bio: string
//     achievements: string[]
//     interests: string[]
//     profilePicture?: string
//   }
// }

// const VisuallyHiddenInput = styled("input")({
//   clip: "rect(0 0 0 0)",
//   clipPath: "inset(50%)",
//   height: 1,
//   overflow: "hidden",
//   position: "absolute",
//   bottom: 0,
//   left: 0,
//   whiteSpace: "nowrap",
//   width: 1,
// })

// export default function BioInfo({ onDataChange, initialData }: BioInfoProps) {
//   const [bioInfo, setBioInfo] = useState({
//     bio: initialData?.bio || "",
//     achievements: initialData?.achievements || [],
//     interests: initialData?.interests || [],
//     profilePicture: initialData?.profilePicture || "",
//   })

//   // Track raw input values for achievements and interests
//   const [rawInputs, setRawInputs] = useState({
//     achievements: bioInfo.achievements.join(", "),
//     interests: bioInfo.interests.join(", "),
//   })

//   const [uploading, setUploading] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     if (onDataChange) {
//       onDataChange(bioInfo)
//     }
//   }, [bioInfo, onDataChange])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target

//     if (name === "achievements" || name === "interests") {
//       // Update the raw input first
//       setRawInputs((prev) => ({ ...prev, [name]: value }))

//       // Then update the processed array
//       const processedArray = value
//         ? value
//           .split(",")
//           .map((item) => item.trim())
//           .filter(Boolean)
//         : []
//       setBioInfo((prev) => ({ ...prev, [name]: processedArray }))
//     } else {
//       setBioInfo((prev) => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files
//     if (!files || files.length === 0) return

//     const file = files[0]

//     try {
//       setUploading(true)

//       // Get a reference to Firebase Storage
//       const storage = getStorage()

//       // Create a unique filename using timestamp and original filename
//       const fileName = `profile-pictures/${Date.now()}-${file.name}`
//       const storageRef = ref(storage, fileName)

//       // Upload the file
//       await uploadBytes(storageRef, file)

//       // Get the download URL
//       const downloadURL = await getDownloadURL(storageRef)

//       // Update state with the new profile picture URL
//       setBioInfo((prev) => ({
//         ...prev,
//         profilePicture: downloadURL,
//       }))
//     } catch (error) {
//       console.error("Error uploading profile picture:", error)
//       alert("Failed to upload profile picture. Please try again.")
//     } finally {
//       setUploading(false)
//       // Reset the file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ""
//       }
//     }
//   }

//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>
//         Bio Information
//       </Typography>
//       <Typography variant="body2" color="textSecondary" gutterBottom>
//         Tell us more about yourself
//       </Typography>

//       {/* Profile Picture Upload Section */}
//       <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 3 }}>
//         <Avatar src={bioInfo.profilePicture} alt="Profile Picture" sx={{ width: 120, height: 120, mb: 2 }} />

//         <Button
//           component="label"
//           variant="contained"
//           disabled={uploading}
//           startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
//         >
//           {uploading ? "Uploading..." : "Upload Profile Picture"}
//           <VisuallyHiddenInput type="file" accept="image/*" onChange={handleProfilePictureUpload} ref={fileInputRef} />
//         </Button>
//       </Box>

//       <TextField
//         label="Your Bio"
//         multiline
//         fullWidth
//         rows={5}
//         name="bio"
//         value={bioInfo.bio}
//         onChange={handleChange}
//         placeholder="Write a brief description about yourself, your teaching philosophy, and what makes you unique as an educator"
//         margin="normal"
//       />

//       <TextField
//         label="Key Achievements"
//         fullWidth
//         name="achievements"
//         value={rawInputs.achievements}
//         onChange={handleChange}
//         placeholder="List your key achievements, separated by commas"
//         margin="normal"
//       />

//       <TextField
//         label="Interests and Hobbies"
//         fullWidth
//         name="interests"
//         value={rawInputs.interests}
//         onChange={handleChange}
//         placeholder="List your interests and hobbies, separated by commas"
//         margin="normal"
//       />
//     </Box>
//   )
// }





// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { TextField, Typography, Box, Button, Avatar, CircularProgress } from "@mui/material"
// import { styled } from "@mui/material/styles"
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// import { storage } from "../../../firebase/firebase"


// interface BioInfoProps {
//   onDataChange?: (data: {
//     bio: string
//     achievements: string[]
//     interests: string[]
//     profilePicture: string
//   }) => void
//   initialData?: {
//     bio: string
//     achievements: string[]
//     interests: string[]
//     profilePicture?: string
//   }
// }

// const VisuallyHiddenInput = styled("input")({
//   clip: "rect(0 0 0 0)",
//   clipPath: "inset(50%)",
//   height: 1,
//   overflow: "hidden",
//   position: "absolute",
//   bottom: 0,
//   left: 0,
//   whiteSpace: "nowrap",
//   width: 1,
// })

// export default function BioInfo({ onDataChange, initialData }: BioInfoProps) {
//   const [bioInfo, setBioInfo] = useState({
//     bio: initialData?.bio || "",
//     achievements: initialData?.achievements || [],
//     interests: initialData?.interests || [],
//     profilePicture: initialData?.profilePicture || "",
//   })

//   // Track raw input values for achievements and interests
//   const [rawInputs, setRawInputs] = useState({
//     achievements: bioInfo.achievements.join(", "),
//     interests: bioInfo.interests.join(", "),
//   })

//   const [uploading, setUploading] = useState(false)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   // Use a ref to track if we should call onDataChange
//   const isInitialMount = useRef(true)

//   useEffect(() => {
//     // Skip the first render to prevent unnecessary calls
//     if (isInitialMount.current) {
//       isInitialMount.current = false
//       return
//     }

//     // Only call onDataChange if it exists
//     if (onDataChange) {
//       onDataChange(bioInfo)
//     }
//   }, [bioInfo, onDataChange])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target

//     if (name === "achievements" || name === "interests") {
//       // Update the raw input first
//       setRawInputs((prev) => ({ ...prev, [name]: value }))

//       // Then update the processed array
//       const processedArray = value
//         ? value
//           .split(",")
//           .map((item) => item.trim())
//           .filter(Boolean)
//         : []
//       setBioInfo((prev) => ({ ...prev, [name]: processedArray }))
//     } else {
//       setBioInfo((prev) => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files
//     if (!files || files.length === 0) return

//     const file = files[0]

// try {
//   setUploading(true)

//   const fileName = `profile-pictures/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
//   const storageRef = ref(storage, fileName)

//   // Upload file
//   const snapshot = await uploadBytes(storageRef, file)

//   // Fetch download URL
//   const downloadURL = await getDownloadURL(snapshot.ref)

//   setBioInfo((prev) => ({
//     ...prev,
//     profilePicture: downloadURL,
//   }))
// } catch (error: any) {
//   console.error("Error uploading profile picture:", error)
//   alert(`Upload failed: ${error.message}`)
// } finally {
//   setUploading(false)
//   e.target.value = "" // Reset input field
// }

//   }

//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>
//         Bio Information
//       </Typography>
//       <Typography variant="body2" color="textSecondary" gutterBottom>
//         Tell us more about yourself
//       </Typography>

//       {/* Profile Picture Upload Section */}
//       <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 3 }}>
//         <Avatar src={bioInfo.profilePicture} alt="Profile Picture" sx={{ width: 120, height: 120, mb: 2 }} />

//         <Button
//           component="label"
//           variant="contained"
//           disabled={uploading}
//           startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
//         >
//           {uploading ? "Uploading..." : "Upload Profile Picture"}
//           <VisuallyHiddenInput type="file" accept="image/*" onChange={handleProfilePictureUpload} ref={fileInputRef} />
//         </Button>
//       </Box>

//       <TextField
//         label="Your Bio"
//         multiline
//         fullWidth
//         rows={5}
//         name="bio"
//         value={bioInfo.bio}
//         onChange={handleChange}
//         placeholder="Write a brief description about yourself, your teaching philosophy, and what makes you unique as an educator"
//         margin="normal"
//       />

//       <TextField
//         label="Key Achievements"
//         fullWidth
//         name="achievements"
//         value={rawInputs.achievements}
//         onChange={handleChange}
//         placeholder="List your key achievements, separated by commas"
//         margin="normal"
//       />

//       <TextField
//         label="Interests and Hobbies"
//         fullWidth
//         name="interests"
//         value={rawInputs.interests}
//         onChange={handleChange}
//         placeholder="List your interests and hobbies, separated by commas"
//         margin="normal"
//       />
//     </Box>
//   )
// }

