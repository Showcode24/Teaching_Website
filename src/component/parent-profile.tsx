"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
  LocationOn,
  Phone,
  Email,
  Person,
  Check as CheckIcon,
  Close as CloseIcon,
  Interests,
  School,
  ChildCare,
  Home,
  Cake,
  Work,
  Add as AddIcon,
  Delete as DeleteIcon,
  Book,
  CalendarToday,
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

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
  },
})

// Styled Components with improved aesthetics
const ProfileHeader = styled(Box)(({ theme }) => ({
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
    background: "url('https://images.unsplash.com/photo-1543248939-ff40856f65d4?q=80&w=2070') center/cover",
    opacity: 0.1,
  },
  [theme.breakpoints.down("sm")]: {
    height: 220,
    marginBottom: 100,
    paddingTop: 40,
  },
}))

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

const StyledCard = styled(Card)(({ theme }) => ({
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

const StyledTab = styled(Tab)(({ theme }) => ({
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

const EditableTypography = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}))

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

const StyledButton = styled(Button)(({ theme }) => ({
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

// Define the ParentData interface
interface ParentData {
  personalInfo?: {
    fullName?: string
    gender?: string
    profilePicture?: string
    dateOfBirth?: string
    occupation?: string
  }
  contactInfo?: {
    address?: string
    email?: string
    phoneNumber?: string
  }
  locationInfo?: {
    selectedLGA?: string
    state?: string
  }
  childrenInfo?: {
    children?: {
      name: string
      age: string
      school: string
      grade: string
    }[]
  }
  preferenceInfo?: {
    subjectPreferences?: string[]
    tutorPreferences?: string[]
    schedulePreferences?: string[]
  }
  bioInfo?: {
    bio?: string
    interests?: string
  }
  lastActive?: any
}

export default function ParentProfileEdit() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [parentData, setParentData] = useState<ParentData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
  const [openDialog, setOpenDialog] = useState<{
    open: boolean
    type: string
    field: string
    section?: keyof ParentData
    index?: number
    childIndex?: number
    childField?: string
  }>({
    open: false,
    type: "",
    field: "",
    section: undefined,
    index: undefined,
    childIndex: undefined,
    childField: undefined,
  })
  const [dialogValue, setDialogValue] = useState("")
  const [childDialogValues, setChildDialogValues] = useState({
    name: "",
    age: "",
    school: "",
    grade: "",
  })

  // Function to handle profile picture click
  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Fetch parent data
  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true)
      try {
        if (auth.currentUser) {
          console.log("Fetching data for user:", auth.currentUser.uid)
          const parentDoc = await getDoc(doc(db, "parents", auth.currentUser.uid))

          if (parentDoc.exists()) {
            console.log("Parent document found:", parentDoc.data())
            const data = parentDoc.data() as ParentData
            setParentData(data)
          } else {
            console.log("No parent document found for this user")
            setError("No profile data found. Please complete your profile.")
          }
        } else {
          console.log("No authenticated user found")
          setError("Please log in to view your profile")
        }
      } catch (err) {
        console.error("Error fetching parent data:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchParentData()
  }, [auth.currentUser])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof ParentData,
    field: string,
  ) => {
    const updatedData = {
      ...parentData,
      [section]: {
        ...parentData[section],
        [field]: e.target.value,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleSelectChange = async (e: SelectChangeEvent<string>, section: keyof ParentData, field: string) => {
    const updatedData = {
      ...parentData,
      [section]: {
        ...parentData[section],
        [field]: e.target.value,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleArrayItemChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof ParentData,
    field: string,
    index: number,
  ) => {
    const newArray = [...((parentData[section]?.[field] as string[]) || [])]
    newArray[index] = e.target.value
    const updatedData = {
      ...parentData,
      [section]: {
        ...parentData[section],
        [field]: newArray,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleChildItemChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    childIndex: number,
    field: string,
  ) => {
    const newChildren = [...(parentData.childrenInfo?.children || [])]
    newChildren[childIndex] = {
      ...newChildren[childIndex],
      [field]: e.target.value,
    }
    const updatedData = {
      ...parentData,
      childrenInfo: {
        ...parentData.childrenInfo,
        children: newChildren,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleAddArrayItem = (section: keyof ParentData, field: string) => {
    setOpenDialog({
      open: true,
      type: "add",
      field,
      section,
    })
    setDialogValue("")
  }

  const handleAddChild = () => {
    setOpenDialog({
      open: true,
      type: "addChild",
      field: "children",
      section: "childrenInfo",
    })
    setChildDialogValues({
      name: "",
      age: "",
      school: "",
      grade: "",
    })
  }

  const handleEditChild = (index: number) => {
    const child = parentData.childrenInfo?.children?.[index]
    if (child) {
      setOpenDialog({
        open: true,
        type: "editChild",
        field: "children",
        section: "childrenInfo",
        index,
      })
      setChildDialogValues({
        name: child.name || "",
        age: child.age || "",
        school: child.school || "",
        grade: child.grade || "",
      })
    }
  }

  const handleRemoveArrayItem = async (section: keyof ParentData, field: string, index: number) => {
    const newArray = [...((parentData[section]?.[field] as string[]) || [])]
    newArray.splice(index, 1)
    const updatedData = {
      ...parentData,
      [section]: {
        ...parentData[section],
        [field]: newArray,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleRemoveChild = async (index: number) => {
    const newChildren = [...(parentData.childrenInfo?.children || [])]
    newChildren.splice(index, 1)
    const updatedData = {
      ...parentData,
      childrenInfo: {
        ...parentData.childrenInfo,
        children: newChildren,
      },
    }
    setParentData(updatedData)
    await updateParentData(updatedData)
  }

  const handleDialogClose = () => {
    setOpenDialog({
      open: false,
      type: "",
      field: "",
      section: undefined,
    })
    setDialogValue("")
    setChildDialogValues({
      name: "",
      age: "",
      school: "",
      grade: "",
    })
  }

  const handleDialogSave = async () => {
    const { type, field, section, index } = openDialog

    if (type === "add" && section && dialogValue.trim() !== "") {
      const currentArray = [...((parentData[section]?.[field] as string[]) || [])]
      const updatedData = {
        ...parentData,
        [section]: {
          ...parentData[section],
          [field]: [...currentArray, dialogValue],
        },
      }
      setParentData(updatedData)
      await updateParentData(updatedData)
    } else if (type === "addChild") {
      const newChild = {
        name: childDialogValues.name,
        age: childDialogValues.age,
        school: childDialogValues.school,
        grade: childDialogValues.grade,
      }
      const currentChildren = [...(parentData.childrenInfo?.children || [])]
      const updatedData = {
        ...parentData,
        childrenInfo: {
          ...parentData.childrenInfo,
          children: [...currentChildren, newChild],
        },
      }
      setParentData(updatedData)
      await updateParentData(updatedData)
    } else if (type === "editChild" && typeof index === "number") {
      const newChildren = [...(parentData.childrenInfo?.children || [])]
      newChildren[index] = {
        name: childDialogValues.name,
        age: childDialogValues.age,
        school: childDialogValues.school,
        grade: childDialogValues.grade,
      }
      const updatedData = {
        ...parentData,
        childrenInfo: {
          ...parentData.childrenInfo,
          children: newChildren,
        },
      }
      setParentData(updatedData)
      await updateParentData(updatedData)
    }

    handleDialogClose()
  }

  const updateParentData = async (data: ParentData) => {
    if (!auth.currentUser) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "parents", auth.currentUser.uid), data)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !auth.currentUser) return

    setUploadingImage(true)
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "profile-pictures") // Use the same upload preset as BioInfo

      // Upload to Cloudinary
      const cloudName = cld.getConfig().cloud?.cloudName || "drsdycckb"
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.public_id) {
        const updatedData = {
          ...parentData,
          personalInfo: {
            ...parentData.personalInfo,
            profilePicture: data.public_id, // Store the public_id instead of the URL
          },
        }
        setParentData(updatedData)
        await updateParentData(updatedData)
        setSuccess("Profile picture updated successfully")
      }
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to upload profile picture")
    } finally {
      setUploadingImage(false)
    }
  }

  const toggleEditMode = (section: string) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSaveEdit = async (section: string) => {
    await updateParentData(parentData)
    setEditMode((prev) => ({ ...prev, [section]: false }))
  }

  const handleCancelEdit = (section: string) => {
    // Revert changes - This needs to be implemented to actually revert changes
    setParentData((prev) => ({ ...prev }))
    setEditMode((prev) => ({ ...prev, [section]: false }))
  }

  // Create a Cloudinary image object if profilePicture exists
  const profileImage = parentData.personalInfo?.profilePicture
    ? cld
      .image(
        parentData.personalInfo.profilePicture.includes("/")
          ? parentData.personalInfo.profilePicture.split("/").pop()?.split(".")[0] || ""
          : parentData.personalInfo.profilePicture,
      )
      .format("auto")
      .quality("auto")
      .resize(fill().gravity(autoGravity()).width(200).height(200))
    : null

  // Get tab icon based on index
  const getTabIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Person />
      case 1:
        return <ChildCare />
      case 2:
        return <Interests />
      case 3:
        return <Phone />
      default:
        return <Person />
    }
  }

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
                Edit Parent Profile
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
                  {parentData.personalInfo?.fullName || "Your Name"}
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
                  {parentData.personalInfo?.occupation || "Parent"}
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
                      parentData.locationInfo?.state && parentData.locationInfo?.selectedLGA
                        ? `${parentData.locationInfo.selectedLGA}, ${parentData.locationInfo.state}`
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
                    icon={<ChildCare sx={{ color: "white" }} />}
                    label={`${parentData.childrenInfo?.children?.length || 0} children`}
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
                <StyledTab label="Personal Info" icon={<Person />} iconPosition="start" />
                <StyledTab label="Children" icon={<ChildCare />} iconPosition="start" />
                <StyledTab label="Preferences" icon={<Interests />} iconPosition="start" />
                <StyledTab label="Contact" icon={<Phone />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <TabPanel sx={{ mt: 2 }} className="container-fluid p-0">
              {/* Personal Info Tab */}
              {activeTab === 0 && (
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Person sx={{ mr: 1 }} /> Personal Information
                          </Box>
                          {editMode.personal ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("personal")}
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
                                onClick={() => handleCancelEdit("personal")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("personal")}
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
                        {editMode.personal ? (
                          <div className="row g-3">
                            <div className="col-12">
                              <TextField
                                label="Full Name"
                                fullWidth
                                value={parentData.personalInfo?.fullName || ""}
                                onChange={(e) => handleInputChange(e, "personalInfo", "fullName")}
                                margin="normal"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <FormControl fullWidth margin="normal">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                  value={parentData.personalInfo?.gender || ""}
                                  label="Gender"
                                  onChange={(e) => handleSelectChange(e, "personalInfo", "gender")}
                                  sx={{
                                    borderRadius: 2,
                                  }}
                                >
                                  <MenuItem value="Male">Male</MenuItem>
                                  <MenuItem value="Female">Female</MenuItem>
                                  <MenuItem value="Other">Other</MenuItem>
                                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                            <div className="col-12 col-md-6">
                              <TextField
                                label="Date of Birth"
                                type="date"
                                fullWidth
                                value={parentData.personalInfo?.dateOfBirth || ""}
                                onChange={(e) => handleInputChange(e, "personalInfo", "dateOfBirth")}
                                margin="normal"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </div>
                            <div className="col-12">
                              <TextField
                                label="Occupation"
                                fullWidth
                                value={parentData.personalInfo?.occupation || ""}
                                onChange={(e) => handleInputChange(e, "personalInfo", "occupation")}
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
                                  <Person fontSize="small" />
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Full Name
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {parentData.personalInfo?.fullName || "Not specified"}
                                    </Typography>
                                  </Box>
                                </InfoItem>
                              </div>
                              <div className="col-12 col-md-6">
                                <InfoItem>
                                  <Person fontSize="small" />
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Gender
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {parentData.personalInfo?.gender || "Not specified"}
                                    </Typography>
                                  </Box>
                                </InfoItem>
                              </div>
                              <div className="col-12 col-md-6">
                                <InfoItem>
                                  <Cake fontSize="small" />
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Date of Birth
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {parentData.personalInfo?.dateOfBirth || "Not specified"}
                                    </Typography>
                                  </Box>
                                </InfoItem>
                              </div>
                              <div className="col-12 col-md-6">
                                <InfoItem>
                                  <Work fontSize="small" />
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Occupation
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      {parentData.personalInfo?.occupation || "Not specified"}
                                    </Typography>
                                  </Box>
                                </InfoItem>
                              </div>
                            </div>
                          </Paper>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>

                  <div className="col-12 col-md-4">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Interests sx={{ mr: 1 }} /> Bio & Interests
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
                          <>
                            <TextField
                              multiline
                              rows={4}
                              fullWidth
                              label="Bio"
                              value={parentData.bioInfo?.bio || ""}
                              onChange={(e) => handleInputChange(e, "bioInfo", "bio")}
                              margin="normal"
                              placeholder="Tell us about yourself and your family"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                            <TextField
                              multiline
                              rows={3}
                              fullWidth
                              label="Interests"
                              value={parentData.bioInfo?.interests || ""}
                              onChange={(e) => handleInputChange(e, "bioInfo", "interests")}
                              margin="normal"
                              placeholder="Share your interests and hobbies"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                              Bio
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                lineHeight: 1.7,
                                color: parentData.bioInfo?.bio ? "text.primary" : "text.secondary",
                                fontStyle: parentData.bioInfo?.bio ? "normal" : "italic",
                                p: 1,
                                borderRadius: 2,
                                mb: 3,
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              {parentData.bioInfo?.bio || "Click to add your bio"}
                            </Typography>

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                              Interests
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                lineHeight: 1.7,
                                color: parentData.bioInfo?.interests ? "text.primary" : "text.secondary",
                                fontStyle: parentData.bioInfo?.interests ? "normal" : "italic",
                                p: 1,
                                borderRadius: 2,
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              {parentData.bioInfo?.interests || "Click to add your interests"}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                    </StyledCard>
                  </div>
                </div>
              )}

              {/* Children Tab */}
              {activeTab === 1 && (
                <StyledCard>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <SectionTitle variant="h6">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ChildCare sx={{ mr: 1 }} /> Children Information
                      </Box>
                      <StyledButton
                        startIcon={<AddIcon />}
                        onClick={handleAddChild}
                        variant="outlined"
                        color="primary"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Add Child
                      </StyledButton>
                    </SectionTitle>

                    {parentData.childrenInfo?.children?.length ? (
                      <div className="row g-3">
                        {parentData.childrenInfo.children.map((child, index) => (
                          <div className="col-12 col-md-6" key={index}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: { xs: 2, md: 3 },
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                position: "relative",
                              }}
                            >
                              <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditChild(index)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveChild(index)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>

                              <InfoItem>
                                <ChildCare fontSize="small" />
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Name
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {child.name}
                                  </Typography>
                                </Box>
                              </InfoItem>

                              <InfoItem>
                                <Cake fontSize="small" />
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Age
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {child.age}
                                  </Typography>
                                </Box>
                              </InfoItem>

                              <InfoItem>
                                <School fontSize="small" />
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    School
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {child.school}
                                  </Typography>
                                </Box>
                              </InfoItem>

                              <InfoItem sx={{ mb: 0 }}>
                                <School fontSize="small" />
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Grade/Class
                                  </Typography>
                                  <Typography variant="body1" fontWeight={500}>
                                    {child.grade}
                                  </Typography>
                                </Box>
                              </InfoItem>
                            </Paper>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <ChildCare sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No Children Added Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Add information about your children to help tutors understand their educational needs
                        </Typography>
                        <StyledButton
                          startIcon={<AddIcon />}
                          onClick={handleAddChild}
                          variant="outlined"
                          color="primary"
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Add Child
                        </StyledButton>
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
              )}

              {/* Preferences Tab */}
              {activeTab === 2 && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <StyledCard>
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Book sx={{ mr: 1 }} /> Subject Preferences
                          </Box>
                          {editMode.subjectPreferences ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("subjectPreferences")}
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
                                onClick={() => handleCancelEdit("subjectPreferences")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("subjectPreferences")}
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
                        {editMode.subjectPreferences ? (
                          <>
                            {(parentData.preferenceInfo?.subjectPreferences || []).map((subject, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={subject}
                                  onChange={(e) =>
                                    handleArrayItemChange(e, "preferenceInfo", "subjectPreferences", index)
                                  }
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
                                  onClick={() => handleRemoveArrayItem("preferenceInfo", "subjectPreferences", index)}
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
                              onClick={() => handleAddArrayItem("preferenceInfo", "subjectPreferences")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Subject
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {parentData.preferenceInfo?.subjectPreferences?.length ? (
                              parentData.preferenceInfo.subjectPreferences.map((subject, index) => (
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
                                No subject preferences listed
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
                            <Person sx={{ mr: 1 }} /> Tutor Preferences
                          </Box>
                          {editMode.tutorPreferences ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("tutorPreferences")}
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
                                onClick={() => handleCancelEdit("tutorPreferences")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("tutorPreferences")}
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
                        {editMode.tutorPreferences ? (
                          <>
                            {(parentData.preferenceInfo?.tutorPreferences || []).map((preference, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={preference}
                                  onChange={(e) =>
                                    handleArrayItemChange(e, "preferenceInfo", "tutorPreferences", index)
                                  }
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
                                  onClick={() => handleRemoveArrayItem("preferenceInfo", "tutorPreferences", index)}
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
                              onClick={() => handleAddArrayItem("preferenceInfo", "tutorPreferences")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Preference
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {parentData.preferenceInfo?.tutorPreferences?.length ? (
                              parentData.preferenceInfo.tutorPreferences.map((preference, index) => (
                                <ColoredChip key={index} label={preference} />
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
                                No tutor preferences listed
                              </Typography>
                            )}
                          </Box>
                        )}

                        <Divider sx={{ my: 4 }} />

                        <SectionTitle variant="h6">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CalendarToday sx={{ mr: 1 }} /> Schedule Preferences
                          </Box>
                          {editMode.schedulePreferences ? (
                            <Box>
                              <IconButton
                                onClick={() => handleSaveEdit("schedulePreferences")}
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
                                onClick={() => handleCancelEdit("schedulePreferences")}
                                size="small"
                                color="error"
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              onClick={() => toggleEditMode("schedulePreferences")}
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
                        {editMode.schedulePreferences ? (
                          <>
                            {(parentData.preferenceInfo?.schedulePreferences || []).map((schedule, index) => (
                              <Box key={index} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                                <TextField
                                  fullWidth
                                  value={schedule}
                                  onChange={(e) =>
                                    handleArrayItemChange(e, "preferenceInfo", "schedulePreferences", index)
                                  }
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
                                  onClick={() => handleRemoveArrayItem("preferenceInfo", "schedulePreferences", index)}
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
                              onClick={() => handleAddArrayItem("preferenceInfo", "schedulePreferences")}
                              variant="outlined"
                              color="primary"
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                              }}
                            >
                              Add Schedule
                            </StyledButton>
                          </>
                        ) : (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {parentData.preferenceInfo?.schedulePreferences?.length ? (
                              parentData.preferenceInfo.schedulePreferences.map((schedule, index) => (
                                <ColoredChip key={index} label={schedule} />
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
                                No schedule preferences listed
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
              {activeTab === 3 && (
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
                              value={parentData.contactInfo?.email || ""}
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
                              value={parentData.contactInfo?.phoneNumber || ""}
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
                                  {parentData.contactInfo?.email || "Not specified"}
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
                                  {parentData.contactInfo?.phoneNumber || "Not specified"}
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
                              value={parentData.contactInfo?.address || ""}
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
                                    value={parentData.locationInfo?.state || ""}
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
                                  value={parentData.locationInfo?.selectedLGA || ""}
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
                              <Home fontSize="small" />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Address
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {parentData.contactInfo?.address || "Not specified"}
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
                                  {parentData.locationInfo?.state || "Not specified"}
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
                                  {parentData.locationInfo?.selectedLGA || "Not specified"}
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
        {openDialog.type === "addChild" || openDialog.type === "editChild" ? (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {openDialog.type === "addChild" ? "Add Child" : "Edit Child"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Name"
                  fullWidth
                  value={childDialogValues.name}
                  onChange={(e) => setChildDialogValues({ ...childDialogValues, name: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Age"
                  fullWidth
                  value={childDialogValues.age}
                  onChange={(e) => setChildDialogValues({ ...childDialogValues, age: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="School"
                  fullWidth
                  value={childDialogValues.school}
                  onChange={(e) => setChildDialogValues({ ...childDialogValues, school: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Grade/Class"
                  fullWidth
                  value={childDialogValues.grade}
                  onChange={(e) => setChildDialogValues({ ...childDialogValues, grade: e.target.value })}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </DialogContent>
          </>
        ) : (
          <>
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
          </>
        )}
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
            startIcon={openDialog.type === "editChild" ? <CheckIcon /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {openDialog.type === "editChild" ? "Update" : "Add"}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

