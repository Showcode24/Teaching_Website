"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Button,
  Chip,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  styled,
  alpha,
  useTheme,
  AppBar,
  Toolbar,
  type SelectChangeEvent,
} from "@mui/material"
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera,
  School,
  Work,
  LocationOn,
  Phone,
  Email,
  AccountBalance,
  Person,
  Book,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star,
  Visibility,
  VisibilityOff,
  Check as CheckIcon,
  Close as CloseIcon,
  Interests,
  Badge,
  Language,
  Calculate,
  Science,
  Code,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import { Cloudinary } from "@cloudinary/url-gen"
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize"
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"

// First, add Bootstrap CSS import at the top of the file
import "bootstrap/dist/css/bootstrap.min.css"
import theme from "./theme"

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
  },
})

// Styled Components with improved aesthetics
// Update the ProfileHeader styled component to be more responsive
const ProfileHeader = styled(Box)(({ theme: _theme }) => ({
  position: "relative",
  height: 280,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  borderRadius: "0 0 30px 30px",
  marginBottom: 10,
  paddingTop: 60,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070') center/cover",
    opacity: 0.1,
  },
  [theme.breakpoints.down("sm")]: {
    height: 220,
    marginBottom: 100,
    paddingTop: 40,
  },
}))

// Update the ProfileAvatar styled component for better mobile positioning
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  border: `6px solid ${theme.palette.background.paper}`,
  position: "absolute",
  bottom: -20,
  left: 50,
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
  [theme.breakpoints.down("sm")]: {
    width: 140,
    height: 140,
    bottom: -70,
    left: "calc(50% - 70px)", // Center on mobile
  },
}))

const ProfileAvatarWrapper = styled(Box)(() => ({
  position: "relative",
  "&:hover .upload-icon": {
    opacity: 1,
    transform: "scale(1)",
  },
}))

const UploadIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: -10,
  right: -10,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1),
  opacity: 0,
  transform: "scale(0.8)",
  transition: "opacity 0.3s ease, transform 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.1)",
  },
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
}))

const StyledCard = styled(Card)(({ }) => ({
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "100%",
  borderRadius: 16,
  border: "1px solid rgba(0, 0, 0, 0.05)",
  overflow: "visible",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
  },
}))

// Update the StyledAppBar to ensure it's visible on all screen sizes
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(10px)",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  position: "relative", // Change from sticky to relative
  zIndex: 1100,
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "& svg": {
    color: theme.palette.primary.main,
  },
}))

const StyledTab = styled(Tab)(({ theme: _theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  minWidth: 100,
  fontSize: "0.95rem",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}))

// const EditableTypography = styled(Typography)(({ theme }) => ({
//   cursor: "pointer",
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.primary.main, 0.1),
//   },
//   padding: theme.spacing(1),
//   borderRadius: theme.shape.borderRadius,
// }))

const ColoredChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  margin: theme.spacing(0.5),
  borderRadius: 8,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}))

const StyledButton = styled(Button)(({ }) => ({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
}))

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}))

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
  "& svg": {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
    marginTop: 2,
  },
}))

// Update the TutorData interface to make achievements optional or provide a default value
interface TutorData {
  bankInfo?: {
    accountName: string
    accountNumber: string
    bankName: string
    hourly_rate: string
  }
  bioInfo?: {
    achievements?: string[] // Make achievements optional
    bio?: string
    interests?: string
    profilePicture?: string
  }
  contactInfo?: {
    address?: string
    email?: string
    phoneNumber?: string
  }
  educationInfo?: {
    graduationYear?: string
    institution?: string
    qualification?: string
  }
  experienceInfo?: {
    previousSchools?: string[]
    specializations?: string[]
    yearsOfExperience?: string
  }
  locationInfo?: {
    selectedLGA?: string
    state?: string
  }
  personalInfo?: {
    fullName?: string
    gender?: string
  }
  subjectSelection?: {
    languages?: string[]
    mathematics?: string[]
    sciences?: string[]
    technical?: string[]
  }
  lastActive?: any
}

export default function ProfileEdit() {
  const theme = useTheme()
  // const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [tutorData, setTutorData] = useState<TutorData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
  const [openDialog, setOpenDialog] = useState<{
    open: boolean
    type: string
    field: string
    section?: keyof TutorData
    index?: number
  }>({
    open: false,
    type: "",
    field: "",
    section: undefined,
    index: undefined,
  })
  const [dialogValue, setDialogValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch tutor data
  useEffect(() => {
    const fetchTutorData = async () => {
      setLoading(true)
      try {
        if (auth.currentUser) {
          const tutorDoc = await getDoc(doc(db, "tutors", auth.currentUser.uid))
          if (tutorDoc.exists()) {
            const data = tutorDoc.data() as TutorData
            setTutorData(data)
          }
        }
      } catch (err) {
        console.error("Error fetching tutor data:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchTutorData()
  }, [])

  // Function to handle profile picture click
  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return

    setUploadingImage(true)
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "profile-pictures")

      // Upload to Cloudinary
      const cloudName = cld.getConfig().cloud?.cloudName || "drsdycckb"
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.public_id) {
        const updatedData = {
          ...tutorData,
          bioInfo: {
            ...tutorData.bioInfo,
            profilePicture: data.public_id,
            achievements: tutorData.bioInfo?.achievements || [], // Initialize with empty array if undefined
          },
        }
        setTutorData(updatedData)
        await updateTutorData(updatedData)
        setSuccess("Profile picture updated successfully")
      }
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to upload profile picture")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof TutorData,
    field: string,
  ) => {
    const updatedData = {
      ...tutorData,
      [section]: {
        ...tutorData[section],
        [field]: e.target.value,
      },
    }
    setTutorData(updatedData)
    await updateTutorData(updatedData)
  }

  const handleSelectChange = async (e: SelectChangeEvent<string>, section: keyof TutorData, field: string) => {
    const updatedData = {
      ...tutorData,
      [section]: {
        ...tutorData[section],
        [field]: e.target.value,
      },
    }
    setTutorData(updatedData)
    await updateTutorData(updatedData)
  }

  const handleArrayItemChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof TutorData,
    field: string,
    index: number,
  ) => {
    const newArray = [...((tutorData[section]?.[field] as string[]) || [])]
    newArray[index] = e.target.value
    const updatedData = {
      ...tutorData,
      [section]: {
        ...tutorData[section],
        [field]: newArray,
      },
    }
    setTutorData(updatedData)
    await updateTutorData(updatedData)
  }

  const handleAddArrayItem = (section: keyof TutorData, field: string) => {
    setOpenDialog({
      open: true,
      type: "add",
      field,
      section,
    })
    setDialogValue("")
  }

  const handleRemoveArrayItem = async (section: keyof TutorData, field: string, index: number) => {
    const newArray = [...((tutorData[section]?.[field] as string[]) || [])]
    newArray.splice(index, 1)
    const updatedData = {
      ...tutorData,
      [section]: {
        ...tutorData[section],
        [field]: newArray,
      },
    }
    setTutorData(updatedData)
    await updateTutorData(updatedData)
  }

  const handleDialogClose = () => {
    setOpenDialog({
      open: false,
      type: "",
      field: "",
      section: undefined,
    })
    setDialogValue("")
  }

  const handleDialogSave = async () => {
    if (dialogValue.trim() === "") return

    const { type, field, section } = openDialog

    if (type === "add" && section) {
      const currentArray = [...((tutorData[section]?.[field] as string[]) || [])]
      const updatedData = {
        ...tutorData,
        [section]: {
          ...tutorData[section],
          [field]: [...currentArray, dialogValue],
        },
      }
      setTutorData(updatedData)
      await updateTutorData(updatedData)
    }

    handleDialogClose()
  }

  const updateTutorData = async (data: TutorData) => {
    if (!auth.currentUser) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "tutors", auth.currentUser.uid), data as any)
      setSuccess("Profile updated successfully")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile")

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    } finally {
      setSaving(false)
    }
  }

  const toggleEditMode = (section: string) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSaveEdit = async (section: string) => {
    await updateTutorData(tutorData)
    setEditMode((prev) => ({ ...prev, [section]: false }))
  }

  const handleCancelEdit = (section: string) => {
    // Revert changes -  This needs to be implemented to actually revert changes.  Currently it does nothing.
    setTutorData((prev) => ({ ...prev }))
    setEditMode((prev) => ({ ...prev, [section]: false }))
  }

  // Create a Cloudinary image object if profilePicture exists
  const profileImage = tutorData.bioInfo?.profilePicture
    ? cld
      .image(
        tutorData.bioInfo.profilePicture.includes("/")
          ? tutorData.bioInfo.profilePicture.split("/").pop()?.split(".")[0] || ""
          : tutorData.bioInfo.profilePicture,
      )
      .format("auto")
      .quality("auto")
      .resize(fill().gravity(autoGravity()).width(200).height(200))
    : null

  // Determine which subjects the tutor teaches
  const taughtSubjects = []
  if (tutorData.subjectSelection?.languages?.length) taughtSubjects.push("Languages")
  if (tutorData.subjectSelection?.mathematics?.length) taughtSubjects.push("Mathematics")
  if (tutorData.subjectSelection?.sciences?.length) taughtSubjects.push("Sciences")
  if (tutorData.subjectSelection?.technical?.length) taughtSubjects.push("Technical")

  // Get tab icon based on index
  // const getTabIcon = (index: number) => {
  //   switch (index) {
  //     case 0:
  //       return <Person />
  //     case 1:
  //       return <School />
  //     case 2:
  //       return <Work />
  //     case 3:
  //       return <Book />
  //     case 4:
  //       return <Phone />
  //     case 5:
  //       return <AccountBalance />
  //     default:
  //       return <Person />
  //   }
  // }

  // Update the main return component to use Bootstrap's responsive grid system
  // Replace the return statement with this improved version
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }} className="container-fluid p-0">
      <StyledAppBar position="static" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters className="row">
            <div className="col-auto">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </div>
            <div className="col">
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  letterSpacing: "-0.5px",
                }}
              >
                Edit Profile
              </Typography>
            </div>
            {saving && (
              <div className="col-auto">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Saving...
                  </Typography>
                </Box>
              </div>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 8 }} className="px-3 px-md-4">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress color="primary" />
            <Typography variant="body1" color="text.secondary">
              Loading profile data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Success and Error Messages */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckIcon fontSize="small" />
                    <Typography fontWeight={500}>{success}</Typography>
                  </Paper>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CloseIcon fontSize="small" />
                    <Typography fontWeight={500}>{error}</Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Header */}
            <ProfileHeader className="row">
              <ProfileAvatarWrapper className="col-12">
                <ProfileAvatar onClick={handleProfilePictureClick}>
                  {uploadingImage ? (
                    <CircularProgress />
                  ) : profileImage ? (
                    <AdvancedImage
                      cldImg={profileImage}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Person sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, opacity: 0.7 }} />
                  )}
                </ProfileAvatar>
                <Tooltip title="Upload profile picture">
                  <UploadIconButton className="upload-icon" onClick={handleProfilePictureClick}>
                    <PhotoCamera />
                  </UploadIconButton>
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </ProfileAvatarWrapper>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  right: 30,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  [theme.breakpoints.down("sm")]: {
                    position: "relative",
                    bottom: -80,
                    right: 0,
                    alignItems: "center",
                    width: "100%",
                    textAlign: "center",
                    mt: 2,
                  },
                }}
                className="col-12 col-md-auto"
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    letterSpacing: "-0.5px",
                    fontSize: { xs: "1.75rem", md: "2.125rem" },
                  }}
                >
                  {tutorData.personalInfo?.fullName || "Your Name"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    opacity: 0.9,
                    fontWeight: 500,
                    mb: 1,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                  }}
                >
                  {taughtSubjects.join(" • ")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", md: "flex-end" },
                  }}
                >
                  <Chip
                    icon={<LocationOn sx={{ color: "white" }} />}
                    label={
                      tutorData.locationInfo?.state && tutorData.locationInfo?.selectedLGA
                        ? `${tutorData.locationInfo.selectedLGA}, ${tutorData.locationInfo.state}`
                        : "Location"
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: "white",
                      backdropFilter: "blur(10px)",
                      fontWeight: 500,
                      borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.1)",
                      mb: { xs: 1, md: 0 },
                    }}
                  />
                  <Chip
                    icon={<Work sx={{ color: "white" }} />}
                    label={`${tutorData.experienceInfo?.yearsOfExperience || "0"} years experience`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: "white",
                      backdropFilter: "blur(10px)",
                      fontWeight: 500,
                      borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </Box>
              </Box>
            </ProfileHeader>

            {/* Tabs */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                mb: 4,
                mt: { xs: 12, sm: 10, md: 8 },
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
              }}
              className="container-fluid p-0"
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="profile tabs"
                sx={{
                  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                  "& .MuiTab-root": {
                    minWidth: { xs: "auto", sm: 100 },
                    padding: { xs: "12px 8px", sm: "12px 16px" },
                  },
                }}
              >
                <StyledTab label="Bio & Interests" icon={<Person />} iconPosition="start" />
                <StyledTab label="Education" icon={<School />} iconPosition="start" />
                <StyledTab label="Experience" icon={<Work />} iconPosition="start" />
                <StyledTab label="Subjects" icon={<Book />} iconPosition="start" />
                <StyledTab label="Contact" icon={<Phone />} iconPosition="start" />
                <StyledTab label="Banking" icon={<AccountBalance />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <TabPanel sx={{ mt: 2 }} className="container-fluid p-0">
              {/* Bio & Interests Tab */}
              {activeTab === 0 && (
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Person sx={{ mr: 1 }} /> About Me
                          </Box>
                          {editMode.bio ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("bio")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("bio")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("bio")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.bio ? (
                          <TextField
                            multiline
                            rows={6}
                            fullWidth
                            value={tutorData.bioInfo?.bio || ""}
                            onChange={(e) => handleInputChange(e, "bioInfo", "bio")}
                            margin="normal"
                            placeholder="Tell us about yourself, your teaching philosophy, and what makes you unique as a tutor."
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              lineHeight: 1.7,
                              color: tutorData.bioInfo?.bio ? "text.primary" : "text.secondary",
                              fontStyle: tutorData.bioInfo?.bio ? "normal" : "italic",
                              p: 1,
                              borderRadius: 2,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            {tutorData.bioInfo?.bio || "Click to add your bio"}
                          </Typography>
                        )}

                        <Divider sx={{ my: 4 }} />

                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Interests sx={{ mr: 1 }} /> Interests
                          </Box>
                          {editMode.interests ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("interests")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("interests")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("interests")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.interests ? (
                          <TextField
                            multiline
                            rows={3}
                            fullWidth
                            value={tutorData.bioInfo?.interests || ""}
                            onChange={(e) => handleInputChange(e, "bioInfo", "interests")}
                            margin="normal"
                            placeholder="Share your interests, hobbies, and passions outside of teaching."
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              lineHeight: 1.7,
                              color: tutorData.bioInfo?.interests ? "text.primary" : "text.secondary",
                              fontStyle: tutorData.bioInfo?.interests ? "normal" : "italic",
                              p: 1,
                              borderRadius: 2,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            {tutorData.bioInfo?.interests || "Click to add your interests"}
                          </Typography>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>

                  <div className="col-12 col-md-4">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Badge sx={{ mr: 1 }} /> Achievements
                          </Box>
                          {editMode.achievements ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("achievements")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("achievements")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("achievements")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.achievements ? (
                          <>
                            {(tutorData.bioInfo?.achievements || []).map((achievement, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={achievement}
                                  onChange={(e) => handleArrayItemChange(e, "bioInfo", "achievements", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("bioInfo", "achievements", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("bioInfo", "achievements")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Achievement
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.bioInfo?.achievements?.length ? (
                              tutorData.bioInfo.achievements.map((achievement, index) => (
                                <ColoredChip key={index} label={achievement} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No achievements listed
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 1 && (
                <StyledCard>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <SectionTitle variant="h6">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <School sx={{ mr: 1 }} /> Education
                      </Box>
                      {editMode.education ? (
                        <Box>
                          <IconButton
                            onClick={() => handleSaveEdit("education")}
                            size="small"
                            color="primary"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              mr: 1,
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleCancelEdit("education")}
                            size="small"
                            color="error"
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          onClick={() => toggleEditMode("education")}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </SectionTitle>
                    {editMode.education ? (
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Institution"
                            fullWidth
                            value={tutorData.educationInfo?.institution || ""}
                            onChange={(e) => handleInputChange(e, "educationInfo", "institution")}
                            margin="normal"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Qualification"
                            fullWidth
                            value={tutorData.educationInfo?.qualification || ""}
                            onChange={(e) => handleInputChange(e, "educationInfo", "qualification")}
                            margin="normal"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Graduation Year"
                            fullWidth
                            value={tutorData.educationInfo?.graduationYear || ""}
                            onChange={(e) => handleInputChange(e, "educationInfo", "graduationYear")}
                            margin="normal"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, md: 3 },
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                      >
                        <div className="row">
                          <div className="col-12 col-md-6">
                            <InfoItem>
                              <School fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Institution
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.educationInfo?.institution || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </div>
                          <div className="col-12 col-md-6">
                            <InfoItem>
                              <Badge fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Qualification
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.educationInfo?.qualification || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </div>
                          <div className="col-12 col-md-6">
                            <InfoItem sx={{ mb: { xs: 2, md: 0 } }}>
                              <CalendarToday fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Graduation Year
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.educationInfo?.graduationYear || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </div>
                        </div>
                      </Paper>
                    )}
                  </CardContent>
                </StyledCard>
              )}

              {/* Experience Tab */}
              {activeTab === 2 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Work sx={{ mr: 1 }} /> Experience
                          </Box>
                          {editMode.experience ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("experience")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("experience")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("experience")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.experience ? (
                          <TextField
                            label="Years of Experience"
                            fullWidth
                            value={tutorData.experienceInfo?.yearsOfExperience || ""}
                            onChange={(e) => handleInputChange(e, "experienceInfo", "yearsOfExperience")}
                            margin="normal"
                            type="number"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        ) : (
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2, md: 3 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Work sx={{ color: theme.palette.primary.main, mr: 2 }} />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Years of Experience
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color="primary">
                                  {tutorData.experienceInfo?.yearsOfExperience || "0"}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        )}

                        <SectionTitle variant="h6" sx={{ mt: 4 }}>
                          <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
                            <SchoolIcon style={{ marginRight: 8 }} /> Previous Schools
                          </Box>
                          {editMode.previousSchools ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("previousSchools")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("previousSchools")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("previousSchools")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.previousSchools ? (
                          <>
                            {(tutorData.experienceInfo?.previousSchools || []).map((school, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={school}
                                  onChange={(e) => handleArrayItemChange(e, "experienceInfo", "previousSchools", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("experienceInfo", "previousSchools", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("experienceInfo", "previousSchools")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add School
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.experienceInfo?.previousSchools?.length ? (
                              tutorData.experienceInfo.previousSchools.map((school, index) => (
                                <ColoredChip key={index} label={school} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No previous schools listed
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>

                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Star sx={{ mr: 1 }} /> Specializations
                          </Box>
                          {editMode.specializations ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("specializations")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("specializations")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("specializations")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.specializations ? (
                          <>
                            {(tutorData.experienceInfo?.specializations || []).map((specialization, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={specialization}
                                  onChange={(e) => handleArrayItemChange(e, "experienceInfo", "specializations", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("experienceInfo", "specializations", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("experienceInfo", "specializations")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Specialization
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.experienceInfo?.specializations?.length ? (
                              tutorData.experienceInfo.specializations.map((specialization, index) => (
                                <ColoredChip key={index} label={specialization} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No specializations listed
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 3 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Language sx={{ mr: 1 }} /> Languages
                          </Box>
                          {editMode.languages ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("languages")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("languages")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("languages")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.languages ? (
                          <>
                            {(tutorData.subjectSelection?.languages || []).map((language, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={language}
                                  onChange={(e) => handleArrayItemChange(e, "subjectSelection", "languages", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("subjectSelection", "languages", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("subjectSelection", "languages")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Language
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.subjectSelection?.languages?.length ? (
                              tutorData.subjectSelection.languages.map((language, index) => (
                                <ColoredChip key={index} label={language} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No languages listed
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Divider sx={{ my: 4 }} />

                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Calculate sx={{ mr: 1 }} /> Mathematics
                          </Box>
                          {editMode.mathematics ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("mathematics")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("mathematics")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("mathematics")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.mathematics ? (
                          <>
                            {(tutorData.subjectSelection?.mathematics || []).map((subject, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={subject}
                                  onChange={(e) => handleArrayItemChange(e, "subjectSelection", "mathematics", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("subjectSelection", "mathematics", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("subjectSelection", "mathematics")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Mathematics Subject
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.subjectSelection?.mathematics?.length ? (
                              tutorData.subjectSelection.mathematics.map((subject, index) => (
                                <ColoredChip key={index} label={subject} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No mathematics subjects listed
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>

                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Science sx={{ mr: 1 }} /> Sciences
                          </Box>
                          {editMode.sciences ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("sciences")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("sciences")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("sciences")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.sciences ? (
                          <>
                            {(tutorData.subjectSelection?.sciences || []).map((subject, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={subject}
                                  onChange={(e) => handleArrayItemChange(e, "subjectSelection", "sciences", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("subjectSelection", "sciences", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("subjectSelection", "sciences")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Science Subject
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.subjectSelection?.sciences?.length ? (
                              tutorData.subjectSelection.sciences.map((subject, index) => (
                                <ColoredChip key={index} label={subject} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No science subjects listed
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Divider sx={{ my: 4 }} />

                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Code sx={{ mr: 1 }} /> Technical
                          </Box>
                          {editMode.technical ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("technical")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("technical")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("technical")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.technical ? (
                          <>
                            {(tutorData.subjectSelection?.technical || []).map((subject, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={subject}
                                  onChange={(e) => handleArrayItemChange(e, "subjectSelection", "technical", index)}
                                  size="small"
                                  margin="dense"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveArrayItem("subjectSelection", "technical", index)}
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                            <StyledButton
                              startIcon={<AddIcon />}
                              onClick={() => handleAddArrayItem("subjectSelection", "technical")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Technical Subject
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {tutorData.subjectSelection?.technical?.length ? (
                              tutorData.subjectSelection.technical.map((subject, index) => (
                                <ColoredChip key={index} label={subject} />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontStyle: "italic",
                                  p: 1,
                                  borderRadius: 2,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                No technical subjects listed
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 4 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Phone sx={{ mr: 1 }} /> Contact Information
                          </Box>
                          {editMode.contact ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("contact")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("contact")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("contact")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.contact ? (
                          <>
                            <TextField
                              label="Email"
                              fullWidth
                              value={tutorData.contactInfo?.email || ""}
                              onChange={(e) => handleInputChange(e, "contactInfo", "email")}
                              margin="normal"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Email fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                            <TextField
                              label="Phone Number"
                              fullWidth
                              value={tutorData.contactInfo?.phoneNumber || ""}
                              onChange={(e) => handleInputChange(e, "contactInfo", "phoneNumber")}
                              margin="normal"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Phone fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </>
                        ) : (
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2, md: 3 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}
                          >
                            <InfoItem>
                              <Email fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Email
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.contactInfo?.email || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                            <InfoItem sx={{ mb: 0 }}>
                              <Phone fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Phone
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.contactInfo?.phoneNumber || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </Paper>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>

                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LocationOn sx={{ mr: 1 }} /> Location
                          </Box>
                          {editMode.location ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("location")}
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  mr: 1,
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleCancelEdit("location")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("location")}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </SectionTitle>
                        {editMode.location ? (
                          <>
                            <TextField
                              label="Address"
                              fullWidth
                              multiline
                              rows={2}
                              value={tutorData.contactInfo?.address || ""}
                              onChange={(e) => handleInputChange(e, "contactInfo", "address")}
                              margin="normal"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                            <div className="row g-2 mt-1">
                              <div className="col-12 col-sm-6">
                                <FormControl fullWidth>
                                  <InputLabel>State</InputLabel>
                                  <Select
                                    value={tutorData.locationInfo?.state || ""}
                                    label="State"
                                    onChange={(e) => handleSelectChange(e, "locationInfo", "state")}
                                    sx={{
                                      borderRadius: 2,
                                    }}
                                  >
                                    <MenuItem value="Lagos">Lagos</MenuItem>
                                    <MenuItem value="Abuja">Abuja</MenuItem>
                                    <MenuItem value="Rivers">Rivers</MenuItem>
                                    <MenuItem value="Kano">Kano</MenuItem>
                                    <MenuItem value="Oyo">Oyo</MenuItem>
                                  </Select>
                                </FormControl>
                              </div>
                              <div className="col-12 col-sm-6">
                                <TextField
                                  label="LGA"
                                  fullWidth
                                  value={tutorData.locationInfo?.selectedLGA || ""}
                                  onChange={(e) => handleInputChange(e, "locationInfo", "selectedLGA")}
                                  margin="normal"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <Paper
                            elevation={0}
                            sx={{
                              p: { xs: 2, md: 3 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}
                          >
                            <InfoItem>
                              <LocationOn fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Address
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.contactInfo?.address || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                            <InfoItem>
                              <LocationOn fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  State
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.locationInfo?.state || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                            <InfoItem sx={{ mb: 0 }}>
                              <LocationOn fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  LGA
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.locationInfo?.selectedLGA || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </Paper>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === 5 && (
                <StyledCard>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <SectionTitle variant="h6">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccountBalance sx={{ mr: 1 }} /> Banking Information
                      </Box>
                      {editMode.banking ? (
                        <Box>
                          <IconButton
                            onClick={() => handleSaveEdit("banking")}
                            size="small"
                            color="primary"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              mr: 1,
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleCancelEdit("banking")}
                            size="small"
                            color="error"
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          onClick={() => toggleEditMode("banking")}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </SectionTitle>
                    {editMode.banking ? (
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Bank Name"
                            fullWidth
                            value={tutorData.bankInfo?.bankName || ""}
                            onChange={(e) => handleInputChange(e, "bankInfo", "bankName")}
                            margin="normal"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Account Name"
                            fullWidth
                            value={tutorData.bankInfo?.accountName || ""}
                            onChange={(e) => handleInputChange(e, "bankInfo", "accountName")}
                            margin="normal"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Account Number"
                            fullWidth
                            type={showAccountNumber ? "text" : "password"}
                            value={tutorData.bankInfo?.accountNumber || ""}
                            onChange={(e) => handleInputChange(e, "bankInfo", "accountNumber")}
                            margin="normal"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    edge="end"
                                    sx={{
                                      color: theme.palette.primary.main,
                                    }}
                                  >
                                    {showAccountNumber ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <TextField
                            label="Hourly Rate (₦)"
                            fullWidth
                            value={tutorData.bankInfo?.hourly_rate || ""}
                            onChange={(e) => handleInputChange(e, "bankInfo", "hourly_rate")}
                            margin="normal"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, md: 3 },
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                      >
                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <InfoItem>
                              <AccountBalance fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Bank Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.bankInfo?.bankName || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>

                            <InfoItem>
                              <Person fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Account Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {tutorData.bankInfo?.accountName || "Not specified"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </div>

                          <div className="col-12 col-md-6">
                            <InfoItem>
                              <Badge fontSize="small" />
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Account Number
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {showAccountNumber
                                      ? tutorData.bankInfo?.accountNumber || "Not specified"
                                      : "••••••••••"}
                                  </Typography>
                                </Box>
                                <IconButton
                                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                  }}
                                >
                                  {showAccountNumber ? (
                                    <VisibilityOff fontSize="small" />
                                  ) : (
                                    <Visibility fontSize="small" />
                                  )}
                                </IconButton>
                              </Box>
                            </InfoItem>

                            <InfoItem>
                              <Star fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Hourly Rate
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="primary">
                                  ₦{tutorData.bankInfo?.hourly_rate || "0"}
                                </Typography>
                              </Box>
                            </InfoItem>
                          </div>
                        </div>
                      </Paper>
                    )}
                  </CardContent>
                </StyledCard>
              )}
            </TabPanel>
          </>
        )}
      </Container>

      {/* Dialog for adding array items */}
      <Dialog
        open={openDialog.open}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add {openDialog.field?.charAt(0).toUpperCase() + openDialog.field?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={openDialog.field?.charAt(0).toUpperCase() + openDialog.field?.slice(1)}
            fullWidth
            value={dialogValue}
            onChange={(e) => setDialogValue(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleDialogClose}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <StyledButton
            onClick={handleDialogSave}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Helper component for calendar icon
function CalendarToday(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}

// Helper component for school icon
function SchoolIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L2 7.5L12 12L22 7.5L12 3Z" />
      <path d="M2 16.5L12 21L22 16.5" />
      <path d="M2 12L12 16.5L22 12" />
    </svg>
  )
}

