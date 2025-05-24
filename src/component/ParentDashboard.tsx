"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Button,
  Chip,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  useTheme,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Container,
  Select,
  Modal,
  Alert,
  Checkbox,
  Pagination,
  Autocomplete,
} from "@mui/material"
import { Button as MuiButton } from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Bookmark,
  Notifications,
  Settings,
  AccessTime,
  Star,
  PostAdd,
  AccountCircle,
  PhotoCamera,
  Close,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { styled, alpha } from "@mui/material/styles"
import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
import { getAuth, signOut } from "firebase/auth"
import "bootstrap/dist/css/bootstrap.min.css"
import { Cloudinary } from "@cloudinary/url-gen"
import { AdvancedImage } from "@cloudinary/react"
import { fill } from "@cloudinary/url-gen/actions/resize"
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { format, differenceInMinutes } from "date-fns"
import { debounce } from "lodash"
import JobHistory from "../pages/job-history"
// import ExportTeachers from "./tutors-data"


// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
  },
})

interface Tutor {
  fullName: string
  id: string
  location: string
  hourly_rate: string
  yearsOfExperience: string
  bio: string
  specializations: string[]
  previousSchools: string[]
  lastActive?: number // Timestamp in milliseconds
  profilePicture?: string // Add this field for profile pictures
}

interface Job {
  id: string
  jobTitle: string
  location: string
  appliedTutors?: string[]
  accepted_tutor_id?: { id: string }
}

interface ChildInfo {
  name: string
  age: string
  grade: string
}

// Cache for search results
const searchCache = new Map<string, Tutor[]>()

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
  borderRadius: theme.shape.borderRadius * 2,
}))

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
}))

// Styled avatar with upload button overlay
const ProfileAvatarWrapper = styled(Box)(({ }) => ({
  position: "relative",
  "&:hover .upload-icon": {
    opacity: 1,
  },
}))

const UploadIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.5),
  opacity: 0,
  transition: "opacity 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}))

export default function Dashboard() {
  const [firstName, setFirstName] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("Recommended Tutors")
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
  const [myRequests, setMyRequests] = useState<Tutor[]>([])
  const [appointments, setAppointments] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [displayedTutors, setDisplayedTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Tutor[]>([])
  const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
  const [notifications] = useState(3)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const auth = getAuth()
  const db = getFirestore()
  const navigate = useNavigate()

  // Pagination state
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(4)
  const [totalPages, setTotalPages] = useState(1)

  const [openHireConfirm, setOpenHireConfirm] = useState<boolean>(false)
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [openHireForm, setOpenHireForm] = useState<boolean>(false)
  const [jobTitle, setJobTitle] = useState<string>("")
  const [hourlyRate, setHourlyRate] = useState<number>(1500)
  const [studyLevel, setStudyLevel] = useState<string>("Learners category")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [skillsRequired, setSkillsRequired] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [contactInfo, setContactInfo] = useState<string>("")
  const [hireErrorMessage, setHireErrorMessage] = useState<string>("")
  const [hireSuccessMessage, setHireSuccessMessage] = useState<string>("")
  const [hireLoading, setHireLoading] = useState<boolean>(false)
  const [totalBill, setTotalBill] = useState(0)
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<string | null>(null)
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  // New state for child attachments
  const [childAttachments, setChildAttachments] = useState<ChildInfo[]>([{ name: "", age: "", grade: "" }])

  // New state for hire summary view
  const [showHireSummary, setShowHireSummary] = useState<boolean>(false)

  type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

  const [selectedDays, setSelectedDays] = useState<Record<DayKey, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  const [dayTimes, setDayTimes] = useState<Record<DayKey, { start: Date | null; end: Date | null }>>({
    monday: { start: null, end: null },
    tuesday: { start: null, end: null },
    wednesday: { start: null, end: null },
    thursday: { start: null, end: null },
    friday: { start: null, end: null },
    saturday: { start: null, end: null },
    sunday: { start: null, end: null },
  })

  // Stats cards data
  const [statsCards, setStatsCards] = useState([
    // { title: "Total Spent", value: "N/A", icon: <AccessTime />, color: theme.palette.error.main },
    { title: "Active Sessions", value: "N/A", icon: <AccessTime />, color: theme.palette.secondary.main },
    { title: "Tutor Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
    {
      title: "Jobs Posted",
      value: jobs.length.toString() || "N/A",
      icon: <PostAdd />,
      color: theme.palette.success.main,
    },
  ])

  // Updated navigation items - removed Payments and Invoices, changed Reports to History
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, active: activeTab !== "History" },
    // { text: "History", icon: <HistoryIcon />, active: activeTab === "History" },
  ]

  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return "Last active recently"

    const now = new Date().getTime()
    const lastActive = timestamp
    const diffInMs = now - lastActive

    // Convert to minutes, hours, days
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Last active just now"
    if (diffInMinutes < 60) return `Last active ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
    if (diffInHours < 24) return `Last active ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
    return `Last active ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setFirstName(userData.firstName || "")
        }

        // Fetch parent profile data to get the profile picture
        const parentDoc = await getDoc(doc(db, "parents", user.uid))
        if (parentDoc.exists()) {
          const parentData = parentDoc.data()
          if (parentData.personalInfo?.profilePicture) {
            setProfilePicture(parentData.personalInfo.profilePicture)
          }
        }
      }
    }

    fetchUserData()
  }, [auth.currentUser, db])

  useEffect(() => {
    const fetchTutorsAndJobs = async () => {
      setLoading(true)
      try {
        // Fetch all tutors from Firestore
        const tutorsCollection = collection(db, "tutors")
        const tutorsSnapshot = await getDocs(tutorsCollection)
        const tutors = tutorsSnapshot.docs.map((doc) => {
          const tutorData = doc.data()
          return {
            id: doc.id,
            fullName: tutorData.personalInfo?.fullName || "N/A",
            location: `${tutorData.locationInfo?.state || "N/A"} - ${tutorData.locationInfo?.selectedLGA || "N/A"}`,
            hourly_rate: tutorData.experienceInfo?.hourly_rate || "N/A",
            yearsOfExperience: tutorData.experienceInfo?.yearsOfExperience || "N/A",
            bio: tutorData.bioInfo?.bio || "No bio available",
            specializations: tutorData.experienceInfo?.specializations || [],
            previousSchools: tutorData.experienceInfo?.previousSchools || [],
            lastActive: tutorData.lastActive || null,
            profilePicture: tutorData.bioInfo?.profilePicture || null, // Add this line to fetch profile picture
          }
        }) as Tutor[]

        console.log("Fetched Recommended Tutors:", tutors)
        setRecommendedTutors(tutors)

        // Extract all possible search terms for autocomplete
        const allSearchTerms = new Set<string>()
        tutors.forEach((tutor) => {
          // Add name
          if (tutor.fullName && tutor.fullName !== "N/A") {
            allSearchTerms.add(tutor.fullName)
          }

          // Add location
          if (tutor.location && tutor.location !== "N/A - N/A") {
            allSearchTerms.add(tutor.location)
          }

          // Add specializations
          tutor.specializations.forEach((spec) => {
            if (spec) allSearchTerms.add(spec)
          })
        })
        setSearchSuggestions(Array.from(allSearchTerms))

        // Fetch all jobs from Firestore
        const jobsCollection = collection(db, "jobs")
        const jobSnapshot = await getDocs(jobsCollection)
        const fetchedJobs: Job[] = jobSnapshot.docs.map((doc) => {
          const jobData = doc.data()
          return {
            id: doc.id,
            jobTitle: jobData.jobTitle || "N/A",
            location: jobData.location || "N/A",
            appliedTutors: jobData.appliedTutors || [],
            accepted_tutor_id: jobData.accepted_tutor_id || null,
          }
        })
        setJobs(fetchedJobs)

        // Extract tutor IDs from job data
        const appliedTutorIds = new Set<string>()
        const acceptedTutorIds = new Set<string>()

        fetchedJobs.forEach((job) => {
          job.appliedTutors?.forEach((tutorId) => appliedTutorIds.add(tutorId))
          if (job.accepted_tutor_id) acceptedTutorIds.add(job.accepted_tutor_id.id)
        })

        // Filter tutors for My Requests
        const appliedTutors = tutors.filter((tutor) => appliedTutorIds.has(tutor.id))
        console.log("Fetched My Requests:", appliedTutors)
        setMyRequests(appliedTutors)

        // Filter tutors for Upcoming Sessions
        const acceptedTutors = tutors.filter((tutor) => acceptedTutorIds.has(tutor.id))
        console.log("Fetched Upcoming Sessions:", acceptedTutors)
        setAppointments(acceptedTutors)

        // Fetch accepted hire requests
        const parentsSnapshot = await getDocs(collection(db, "parents"))
        const acceptedHires: any[] = []

        parentsSnapshot.docs.forEach((parentDoc) => {
          const parentData = parentDoc.data()
          if (parentData.hires) {
            Object.entries(parentData.hires).forEach(([hireId, hire]: [string, any]) => {
              if (hire.status === "accepted") {
                acceptedHires.push({
                  ...hire,
                  id: `hire_${hireId}`,
                  parentId: parentDoc.id,
                  isHireRequest: true,
                })
              }
            })
          }
        })

        // Add accepted hires to appointments
        const acceptedHireTutors = tutors.filter((tutor) => acceptedHires.some((hire) => hire.tutor_id === tutor.id))

        setAppointments((prevAppointments) => [...prevAppointments, ...acceptedHireTutors])

        // Default to Recommended Tutors
        setFilteredTutors(tutors)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchTutorsAndJobs()
  }, [db])

  // Update pagination when filtered tutors change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredTutors.length / itemsPerPage))
    setPage(1) // Reset to first page when filters change
  }, [filteredTutors, itemsPerPage])

  // Update displayed tutors when page changes
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayedTutors(filteredTutors.slice(startIndex, endIndex))
  }, [filteredTutors, page, itemsPerPage])

  useEffect(() => {
    if (jobs.length > 0) {
      setStatsCards((prevCards) =>
        prevCards.map((card) => (card.title === "Jobs Posted" ? { ...card, value: jobs.length.toString() } : card)),
      )
    }
  }, [jobs])

  useEffect(() => {
    setStatsCards((prevCards) =>
      prevCards.map((card) =>
        card.title === "Active Sessions" ? { ...card, value: appointments.length.toString() } : card,
      ),
    )
  }, [appointments])

  const calculateTotalHours = () => {
    let totalMinutes = 0
      ; (Object.keys(selectedDays) as DayKey[]).forEach((day) => {
        if (selectedDays[day] && dayTimes[day].start && dayTimes[day].end) {
          const startTime = dayTimes[day].start
          const endTime = dayTimes[day].end
          const diffMinutes = differenceInMinutes(endTime, startTime)
          if (diffMinutes > 0) {
            totalMinutes += diffMinutes
          }
        }
      })

    return Math.round(totalMinutes / 60)
  }

  useEffect(() => {
    const totalHours = calculateTotalHours()
    const calculatedTotal = hourlyRate * totalHours
    setTotalBill(calculatedTotal)
  }, [hourlyRate, selectedDays, dayTimes])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "Recommended Tutors") {
      setFilteredTutors(searchQuery ? searchResults : recommendedTutors)
    } else if (tab === "My Requests") {
      setFilteredTutors(myRequests)
    } else if (tab === "Upcoming Sessions") {
      setFilteredTutors(appointments)
    }
    setPage(1) // Reset to first page when changing tabs
  }

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "decline"
    jobId: string
    tutorId: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleAcceptTutor = (jobId: string, tutorId: string) => {
    setConfirmAction({ type: "accept", jobId, tutorId })
    setConfirmDialogOpen(true)
  }

  const handleDeclineTutor = (jobId: string, tutorId: string) => {
    setConfirmAction({ type: "decline", jobId, tutorId })
    setConfirmDialogOpen(true)
  }

  const handleConfirmAction = async (confirmed: boolean) => {
    if (confirmed && confirmAction) {
      try {
        const jobRef = doc(db, "jobs", confirmAction.jobId)

        if (confirmAction.type === "accept") {
          await updateDoc(jobRef, {
            accepted_tutor_id: { id: confirmAction.tutorId },
            appliedTutors: [], // Clear all applied tutors
          })

          // Update jobs state
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job.id === confirmAction.jobId
                ? { ...job, accepted_tutor_id: { id: confirmAction.tutorId }, appliedTutors: [] }
                : job,
            ),
          )

          // Add the accepted tutor to appointments
          setAppointments((prevAppointments) => [
            ...prevAppointments,
            ...myRequests.filter((tutor) => tutor.id === confirmAction.tutorId),
          ])

          // Remove ALL tutors who applied for this specific job from myRequests
          setMyRequests((prevRequests) =>
            prevRequests.filter(
              (tutor) => !jobs.find((j) => j.id === confirmAction.jobId)?.appliedTutors?.includes(tutor.id),
            ),
          )

          setSuccessMessage("Tutor accepted! You can view your upcoming session in the 'Upcoming Sessions' tab.")
        } else {
          await updateDoc(jobRef, {
            appliedTutors: (prevAppliedTutors: string[]) =>
              prevAppliedTutors.filter((id) => id !== confirmAction.tutorId),
          })

          setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== confirmAction.tutorId))
          setSuccessMessage("Tutor declined successfully.")
        }
      } catch (err) {
        console.error(`Error ${confirmAction.type === "accept" ? "accepting" : "declining"} tutor:`, err)
        setSuccessMessage(null)
      }
    }
    setConfirmDialogOpen(false)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const confirmApplication = (confirmed: boolean) => {
    if (confirmed && confirmApplyJobId) {
      // Implement the logic for confirming the application
      console.log(`Application confirmed for job ID: ${confirmApplyJobId}`)
      // You might want to update the database or state here
    }
    setConfirmApplyJobId(null)
  }

  const handleHireClick = (tutor: Tutor) => {
    setSelectedTutor(tutor)
    setOpenHireConfirm(true)
  }

  const handleHireConfirm = () => {
    setOpenHireConfirm(false)
    setOpenHireForm(true)
  }

  const handleCloseHireForm = () => {
    setOpenHireForm(false)
    setSelectedTutor(null)
    resetHireForm()
  }

  const resetHireForm = () => {
    setJobTitle("")
    setHourlyRate(1500)
    setStudyLevel("Learners category")
    setJobDescription("")
    setSkillsRequired("")
    setLocation("")
    setContactInfo("")
    setHireErrorMessage("")
    setHireSuccessMessage("")
    setChildAttachments([{ name: "", age: "", grade: "" }])
    setShowHireSummary(false)
  }

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value)
    setHourlyRate(value)

    if (value < 1500 || value > 3000) {
      setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
    } else {
      setHireErrorMessage("")
    }
  }

  // New function to handle adding a child
  const handleAddChild = () => {
    setChildAttachments([...childAttachments, { name: "", age: "", grade: "" }])
  }

  // New function to handle removing a child
  const handleRemoveChild = (index: number) => {
    const updatedAttachments = [...childAttachments]
    updatedAttachments.splice(index, 1)
    setChildAttachments(updatedAttachments)
  }

  // New function to handle child information changes
  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedAttachments = [...childAttachments]
    updatedAttachments[index] = { ...updatedAttachments[index], [field]: value }
    setChildAttachments(updatedAttachments)
  }

  // New function to handle review before submission
  const handleHireReview = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (hourlyRate < 1500 || hourlyRate > 3000) {
      setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
      return
    }

    if (!auth.currentUser) {
      setHireErrorMessage("You must be logged in to hire a tutor.")
      return
    }

    if (!selectedTutor) {
      setHireErrorMessage("No tutor selected.")
      return
    }

    setShowHireSummary(true)
  }

  // New function to go back from summary to form
  const handleBackToHireForm = () => {
    setShowHireSummary(false)
  }

  const handleHireSubmit = async (): Promise<void> => {
    if (!auth.currentUser) {
      setHireErrorMessage("You must be logged in to hire a tutor.")
      return
    }

    if (!selectedTutor) {
      setHireErrorMessage("No tutor selected.")
      return
    }

    setHireLoading(true)

    const formattedDayTimes: Record<string, { start: string; end: string }> = {}
      ; (Object.keys(dayTimes) as DayKey[]).forEach((day) => {
        if (selectedDays[day] && dayTimes[day].start && dayTimes[day].end) {
          formattedDayTimes[day] = {
            start: format(dayTimes[day].start, "h:mm a"),
            end: format(dayTimes[day].end, "h:mm a"),
          }
        }
      })

    const hireData = {
      jobTitle,
      hourlyRate: `${hourlyRate}`,
      weeklyHours: `${calculateTotalHours()}`,
      studyLevel,
      selectedDays,
      dayTimes: formattedDayTimes,
      jobDescription,
      subjectAreas: skillsRequired,
      tutoringAddress: location,
      phoneNumber: contactInfo,
      created_at: new Date(),
      status: "pending",
      tutor_id: selectedTutor.id,
      tutorName: selectedTutor.fullName,
      totalBill,
      childAttachments,
    }

    try {
      // Update the parent's document with the new hire data
      const parentRef = doc(db, "parents", auth.currentUser.uid)
      const hireId = `hire_${Date.now()}` // Generate a unique ID for this hire

      await updateDoc(parentRef, {
        [`hires.${hireId}`]: hireData,
      })

      setHireSuccessMessage("Your hire request has been sent successfully!")
      setTimeout(() => {
        handleCloseHireForm()
      }, 2000)
    } catch (error) {
      console.error("Error hiring tutor: ", error)
      setHireErrorMessage("There was an error processing your request. Please try again.")
    } finally {
      setHireLoading(false)
      setShowHireSummary(false)
    }
  }

  const handleProfilePictureClick = (profilePicture: string | undefined) => {
    if (profilePicture) {
      setSelectedProfilePicture(profilePicture)
    }
  }

  const handleReadMore = (tutorId: string) => {
    setExpandedTutorId(expandedTutorId === tutorId ? null : tutorId)
  }

  // Navigate to profile page to upload profile picture
  const handleProfilePictureClick2 = () => {
    navigate("/parent-profile")
  }

  // Handle pagination change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  // Throttled search function with caching
  const searchTutors = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        if (activeTab === "Recommended Tutors") {
          setFilteredTutors(recommendedTutors)
        }
        return
      }

      // Check cache first
      if (searchCache.has(query)) {
        const cachedResults = searchCache.get(query) || []
        setSearchResults(cachedResults)
        if (activeTab === "Recommended Tutors") {
          setFilteredTutors(cachedResults)
        }
        return
      }

      // Perform search
      const lowerQuery = query.toLowerCase()
      const results = recommendedTutors.filter(
        (tutor) =>
          tutor.fullName.toLowerCase().includes(lowerQuery) ||
          tutor.location.toLowerCase().includes(lowerQuery) ||
          tutor.specializations.some((spec) => spec.toLowerCase().includes(lowerQuery)) ||
          tutor.bio.toLowerCase().includes(lowerQuery),
      )

      // Cache results
      searchCache.set(query, results)

      setSearchResults(results)
      if (activeTab === "Recommended Tutors") {
        setFilteredTutors(results)
      }
    }, 300),
    [recommendedTutors, activeTab],
  )

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    searchTutors(query)
  }

  // Handle search selection from autocomplete
  const handleSearchSelect = (_event: React.SyntheticEvent, value: string | null) => {
    if (value) {
      setSearchQuery(value)
      searchTutors(value)
    }
  }

  // Create a Cloudinary image object if profilePicture exists
  const profileImage = profilePicture
    ? cld
      .image(profilePicture.includes("/") ? profilePicture.split("/").pop()?.split(".")[0] || "" : profilePicture)
      .format("auto")
      .quality("auto")
      .resize(fill().gravity(autoGravity()).width(40).height(40))
    : null

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
      <StyledAppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
              Kopa360
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={notifications} color="error">
                    <Notifications sx={{ color: "text.secondary" }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton color="inherit">
                  <Settings sx={{ color: "text.secondary" }} />
                </IconButton>
              </Tooltip>
              {/* Profile Picture with Menu */}
              <ProfileAvatarWrapper>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {profileImage ? (
                    <Avatar sx={{ width: 40, height: 40 }}>
                      <AdvancedImage
                        cldImg={profileImage}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Avatar>
                  ) : (
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <AccountCircle />
                    </Avatar>
                  )}
                </IconButton>
                <UploadIconButton className="upload-icon" size="small" onClick={handleProfilePictureClick2}>
                  <PhotoCamera fontSize="small" />
                </UploadIconButton>
              </ProfileAvatarWrapper>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} to="/parent-profile">
                  Profile
                </MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
            Welcome back, <span style={{ color: theme.palette.primary.main }}>{firstName}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated on your latest tutoring job posts
          </Typography>
        </Box>

        {/* Navigation */}
        <Paper sx={{ mb: 4, p: 2, borderRadius: theme.shape.borderRadius * 2 }} elevation={0}>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                color={item.active ? "primary" : "inherit"}
                onClick={() => (item.text === "History" ? setActiveTab("History") : setActiveTab("Recommended Tutors"))}
                sx={{
                  mr: 2,
                  mb: { xs: 1, md: 0 },
                  borderRadius: theme.shape.borderRadius * 5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {item.text}
              </Button>
            ))}
            <MuiButton
              variant="contained"
              color="primary"
              href="/job-form"
              startIcon={<PostAdd />}
              sx={{
                borderRadius: theme.shape.borderRadius * 5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Post a Job
            </MuiButton>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
            Overview
          </Typography>
          <Grid container spacing={3}>
            {statsCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StyledCard elevation={0} sx={{ bgcolor: alpha(card.color, 0.1) }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography color="text.secondary" gutterBottom variant="body2">
                            {card.title}
                          </Typography>
                          <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {card.value}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: alpha(card.color, 0.2),
                            color: card.color,
                          }}
                        >
                          {card.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* <ExportTeachers /> */}
        {/* Tutors Section */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
            Available Tutors
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              freeSolo
              fullWidth
              options={searchSuggestions}
              value={searchQuery}
              onChange={handleSearchSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search tutors by name, location, or specialization..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {["Recommended Tutors", "My Requests", "Upcoming Sessions", "History"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "contained" : "outlined"}
                onClick={() => handleTabChange(tab)}
                sx={{
                  borderRadius: theme.shape.borderRadius * 5,
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  mb: { xs: 1, md: 0 },
                  fontWeight: 600,
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          <AnimatePresence mode="wait">
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : activeTab === "History" ? (
              <JobHistory activeTab={activeTab} />
            ) : displayedTutors?.length ? (
              <>
                <Grid container spacing={3}>
                  {displayedTutors.map((tutor) => {
                    const job =
                      activeTab === "My Requests"
                        ? jobs.find((job) => job.appliedTutors?.includes(tutor.id))
                        : activeTab === "Upcoming Sessions"
                          ? jobs.find((job) => job.accepted_tutor_id?.id === tutor.id)
                          : null
                    return (
                      <Grid item xs={12} md={6} key={tutor.id}>
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StyledCard elevation={0}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatLastActive(tutor.lastActive)}
                                </Typography>
                                <IconButton size="small">
                                  <Bookmark sx={{ color: theme.palette.primary.main }} />
                                </IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" gap={2} mb={2}>
                                {/* Add profile picture here */}
                                {tutor.profilePicture ? (
                                  <Avatar
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      cursor: "pointer",
                                      transition: "transform 0.2s",
                                      "&:hover": {
                                        transform: "scale(1.05)",
                                      },
                                    }}
                                    onClick={() => handleProfilePictureClick(tutor.profilePicture)}
                                  >
                                    <AdvancedImage
                                      cldImg={cld
                                        .image(
                                          tutor.profilePicture.includes("/")
                                            ? tutor.profilePicture.split("/").pop()?.split(".")[0] || ""
                                            : tutor.profilePicture,
                                        )
                                        .format("auto")
                                        .quality("auto")
                                        .resize(fill().gravity(autoGravity()).width(60).height(60))}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  </Avatar>
                                ) : (
                                  <Avatar sx={{ width: 60, height: 60, bgcolor: theme.palette.primary.main }}>
                                    {tutor.fullName?.charAt(0) || "T"}
                                  </Avatar>
                                )}
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                                    {tutor.fullName || "Tutor Profile"}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {tutor.location}
                                  </Typography>
                                </Box>
                              </Box>
                              {job && (
                                <Box display="flex" gap={1} mb={2} alignItems="center">
                                  <Typography variant="subtitle1" color="primary">
                                    {job.jobTitle || "Job Title not provided"}
                                  </Typography>
                                  <Divider orientation="vertical" flexItem />
                                  <Typography variant="body2" color="text.secondary">
                                    {job.location || "Location not provided"}
                                  </Typography>
                                </Box>
                              )}
                              <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
                                <Chip
                                  label={`${tutor.yearsOfExperience} years experience`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                  }}
                                />
                                <Chip
                                  label={`₦${tutor.hourly_rate}/hour`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>

                              {/* Only show bio for tabs other than Upcoming Sessions */}
                              {activeTab !== "Upcoming Sessions" && (
                                <>
                                  <Typography
                                    mb={1}
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: expandedTutorId === tutor.id ? "unset" : 3,
                                      WebkitBoxOrient: "vertical",
                                      overflow: expandedTutorId === tutor.id ? "visible" : "hidden",
                                    }}
                                  >
                                    {tutor.bio}
                                  </Typography>
                                  <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => handleReadMore(tutor.id)}
                                    sx={{ mb: 2, p: 0, fontWeight: 500 }}
                                  >
                                    {expandedTutorId === tutor.id ? "Show Less" : "Read More"}
                                  </Button>
                                </>
                              )}

                              {/* Only show specializations for tabs other than Upcoming Sessions */}
                              {activeTab !== "Upcoming Sessions" && (
                                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                                  {tutor.specializations.map((skill, index) => (
                                    <Chip
                                      key={index}
                                      label={skill}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}

                              {activeTab === "My Requests" && job && (
                                <Box display="flex" gap={2} mt={2}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleAcceptTutor(job.id, tutor.id)}
                                    sx={{
                                      borderRadius: theme.shape.borderRadius * 5,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeclineTutor(job.id, tutor.id)}
                                    sx={{
                                      borderRadius: theme.shape.borderRadius * 5,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </Box>
                              )}

                              {activeTab === "Recommended Tutors" && (
                                <Box display="flex" gap={2} mt={2}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleHireClick(tutor)}
                                    sx={{
                                      borderRadius: theme.shape.borderRadius * 5,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Hire
                                  </Button>
                                </Box>
                              )}
                            </CardContent>
                          </StyledCard>
                        </motion.div>
                      </Grid>
                    )
                  })}
                </Grid>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: theme.shape.borderRadius * 5,
                      },
                    }}
                  />
                </Box>
              </>
            ) : (
              <Typography align="center" color="text.secondary">
                No tutors found for this category.
              </Typography>
            )}
          </AnimatePresence>
        </Box>
      </Container>

      {/* Confirmation dialog for accept/decline */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmAction?.type === "accept"
              ? "Are you sure you want to accept this tutor?"
              : "Are you sure you want to decline this tutor?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConfirmAction(false)}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            No
          </Button>
          <Button
            onClick={() => handleConfirmAction(true)}
            variant="contained"
            color={confirmAction?.type === "accept" ? "success" : "error"}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message dialog */}
      <Dialog
        open={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Success</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSuccessMessage(null)}
            variant="contained"
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application confirmation dialog */}
      <Dialog
        open={!!confirmApplyJobId}
        onClose={() => setConfirmApplyJobId(null)}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Application</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to apply for this position?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => confirmApplication(false)}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => confirmApplication(true)}
            variant="contained"
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hire Confirmation Dialog */}
      <Dialog
        open={openHireConfirm}
        onClose={() => setOpenHireConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Hire</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to hire {selectedTutor?.fullName}?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenHireConfirm(false)}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleHireConfirm}
            variant="contained"
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hire Form Modal */}
      <Modal
        open={openHireForm}
        onClose={handleCloseHireForm}
        aria-labelledby="hire-form-modal"
        aria-describedby="hire-form-description"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "70%" },
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "auto",
            p: 4,
            borderRadius: theme.shape.borderRadius * 2,
          }}
        >
          {!showHireSummary ? (
            <>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Hire {selectedTutor?.fullName}
              </Typography>

              {hireSuccessMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>{hireSuccessMessage}</strong>
                </Alert>
              )}

              {hireErrorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <strong>{hireErrorMessage}</strong>
                </Alert>
              )}

              <form onSubmit={handleHireReview}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      variant="outlined"
                      placeholder="Home Tutor Needed for Basic Math"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hourly offer (₦)"
                      variant="outlined"
                      type="number"
                      placeholder="3000"
                      value={hourlyRate}
                      onChange={handleHourlyRateChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      }}
                      inputProps={{
                        min: 1500,
                        max: 3000,
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Weekly hours"
                      variant="outlined"
                      type="number"
                      value={calculateTotalHours()}
                      InputProps={{
                        readOnly: true,
                      }}
                      helperText="Automatically calculated from selected times"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ bgcolor: "info.light", p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle1">Weekly Estimated Bill:</Typography>
                      <Typography variant="h6">₦{totalBill.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Select
                      fullWidth
                      label="Learners category"
                      value={studyLevel}
                      onChange={(e) => setStudyLevel(e.target.value as string)}
                      required
                    >
                      <MenuItem value="pre school">Pre School</MenuItem>
                      <MenuItem value="basic 1-5">Basic 1-5</MenuItem>
                      <MenuItem value="JSS1-3">JSS1-3</MenuItem>
                      <MenuItem value="SS1-3">SS1-3</MenuItem>
                      <MenuItem value="O level Exams, UTME, POST UTME">O level Exams, UTME, POST UTME</MenuItem>
                      <MenuItem value="OTHERS">OTHERS (SPECIFY)</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject Areas"
                      variant="outlined"
                      placeholder="Mathematics, English, Physics"
                      value={skillsRequired}
                      onChange={(e) => setSkillsRequired(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tutoring address"
                      variant="outlined"
                      placeholder="Benin City, Edo"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography>Work Type:</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox id="remote" />
                        <Typography component="label" htmlFor="remote">
                          Remote
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                        <Checkbox id="onsite" defaultChecked />
                        <Typography component="label" htmlFor="onsite">
                          Onsite
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      variant="outlined"
                      placeholder="Your phone number"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      required
                    />
                  </Grid>

                  {/* Child Information Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Child Information
                    </Typography>
                    {childAttachments.map((child, index) => (
                      <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">
                              Child {index + 1}
                              {index > 0 && (
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => handleRemoveChild(index)}
                                  sx={{ ml: 2 }}
                                >
                                  Remove
                                </Button>
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Child's Name"
                              variant="outlined"
                              value={child.name}
                              onChange={(e) => handleChildChange(index, "name", e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Age"
                              variant="outlined"
                              type="number"
                              value={child.age}
                              onChange={(e) => handleChildChange(index, "age", e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Grade/Class"
                              variant="outlined"
                              value={child.grade}
                              onChange={(e) => handleChildChange(index, "grade", e.target.value)}
                              required
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button variant="outlined" color="primary" onClick={handleAddChild} sx={{ mt: 1 }}>
                      Add Another Child
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Select days and times
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {(Object.keys(selectedDays) as DayKey[]).map((day) => (
                          <Box key={day} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Checkbox
                              checked={selectedDays[day]}
                              onChange={(e) => setSelectedDays({ ...selectedDays, [day]: e.target.checked })}
                              name={day}
                            />
                            <Typography sx={{ width: "100px", textTransform: "capitalize" }}>{day}</Typography>
                            <TimePicker
                              disabled={!selectedDays[day]}
                              label="Start Time"
                              value={dayTimes[day].start}
                              onChange={(newValue) =>
                                setDayTimes({
                                  ...dayTimes,
                                  [day]: { ...dayTimes[day], start: newValue },
                                })
                              }
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography sx={{ mx: 1 }}>to</Typography>
                            <TimePicker
                              disabled={!selectedDays[day]}
                              label="End Time"
                              value={dayTimes[day].end}
                              onChange={(newValue) =>
                                setDayTimes({
                                  ...dayTimes,
                                  [day]: { ...dayTimes[day], end: newValue },
                                })
                              }
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      sx={{
                        borderRadius: theme.shape.borderRadius * 5,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Continue to Review
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </>
          ) : (
            <>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Hire Summary
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Job Title:
                  </Typography>
                  <Typography variant="body1">{jobTitle}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Hourly Rate:
                  </Typography>
                  <Typography variant="body1">₦{hourlyRate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Weekly Hours:
                  </Typography>
                  <Typography variant="body1">{calculateTotalHours()} hours</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Weekly Estimated Bill:
                  </Typography>
                  <Typography variant="body1">₦{totalBill.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Study Level:
                  </Typography>
                  <Typography variant="body1">{studyLevel}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Subject Areas:
                  </Typography>
                  <Typography variant="body1">{skillsRequired}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tutoring Address:
                  </Typography>
                  <Typography variant="body1">{location}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Contact Information:
                  </Typography>
                  <Typography variant="body1">{contactInfo}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Schedule:
                  </Typography>
                  {Object.keys(selectedDays).map((day) => {
                    if (selectedDays[day as DayKey] && dayTimes[day as DayKey].start && dayTimes[day as DayKey].end) {
                      return (
                        <Typography key={day} variant="body1" sx={{ textTransform: "capitalize" }}>
                          {day}: {format(dayTimes[day as DayKey].start!, "h:mm a")} -{" "}
                          {format(dayTimes[day as DayKey].end!, "h:mm a")}
                        </Typography>
                      )
                    }
                    return null
                  })}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Child Information:
                  </Typography>
                  {childAttachments.map((child, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        Child {index + 1}: {child.name}, Age: {child.age}, Grade: {child.grade}
                      </Typography>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" color="primary" onClick={handleBackToHireForm} sx={{ minWidth: "120px" }}>
                    Back to Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleHireSubmit}
                    disabled={hireLoading}
                    startIcon={hireLoading && <CircularProgress size={20} color="inherit" />}
                    sx={{ minWidth: "120px" }}
                  >
                    {hireLoading ? "Processing..." : "Confirm & Hire"}
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Modal>
      {/* Profile Picture Zoom Modal */}
      <Modal
        open={!!selectedProfilePicture}
        onClose={() => setSelectedProfilePicture(null)}
        aria-labelledby="profile-picture-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "90vw",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => setSelectedProfilePicture(null)}
            sx={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
          >
            <Close />
          </IconButton>
          {selectedProfilePicture && (
            <Box
              sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <AdvancedImage
                cldImg={cld
                  .image(
                    selectedProfilePicture.includes("/")
                      ? selectedProfilePicture.split("/").pop()?.split(".")[0] || ""
                      : selectedProfilePicture,
                  )
                  .format("auto")
                  .quality("auto")}
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
              />
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  )
}
















// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import {
//   Box,
//   Typography,
//   TextField,
//   Avatar,
//   Button,
//   Chip,
//   Paper,
//   InputAdornment,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   CircularProgress,
//   Grid,
//   Card,
//   CardContent,
//   IconButton,
//   Tooltip,
//   Badge,
//   Divider,
//   useTheme,
//   AppBar,
//   Toolbar,
//   Menu,
//   MenuItem,
//   Container,
//   Select,
//   Modal,
//   Alert,
// } from "@mui/material"
// import { Button as MuiButton } from "@mui/material"
// import {
//   Dashboard as DashboardIcon,
//   Description as ProjectsIcon,
//   Receipt as InvoicesIcon,
//   Assessment as ReportsIcon,
//   Search as SearchIcon,
//   Bookmark,
//   Notifications,
//   Settings,
//   AccessTime,
//   Star,
//   TrendingDown,
//   PostAdd,
//   AccountCircle,
//   PhotoCamera,
//   Close,
// } from "@mui/icons-material"
// import { motion, AnimatePresence } from "framer-motion"
// import { styled, alpha } from "@mui/material/styles"
// import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// import { getAuth, signOut } from "firebase/auth"
// import "bootstrap/dist/css/bootstrap.min.css"
// import { Cloudinary } from "@cloudinary/url-gen"
// import { AdvancedImage } from "@cloudinary/react"
// import { fill } from "@cloudinary/url-gen/actions/resize"
// import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"

// // Initialize Cloudinary instance
// const cld = new Cloudinary({
//   cloud: {
//     cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
//   },
// })

// interface Tutor {
//   fullName: string
//   id: string
//   location: string
//   hourly_rate: string
//   yearsOfExperience: string
//   bio: string
//   specializations: string[]
//   previousSchools: string[]
//   lastActive?: number // Timestamp in milliseconds
//   profilePicture?: string // Add this field for profile pictures
// }

// interface Job {
//   id: string
//   jobTitle: string
//   location: string
//   appliedTutors?: string[]
//   accepted_tutor_id?: { id: string }
// }

// const StyledCard = styled(Card)(({ theme }) => ({
//   transition: "transform 0.3s ease, box-shadow 0.3s ease",
//   "&:hover": {
//     transform: "translateY(-5px)",
//     boxShadow: theme.shadows[8],
//   },
//   borderRadius: theme.shape.borderRadius * 2,
// }))

// const StyledAppBar = styled(AppBar)(({ theme }) => ({
//   backgroundColor: alpha(theme.palette.background.paper, 0.8),
//   backdropFilter: "blur(10px)",
// }))

// const SearchTextField = styled(TextField)(({ theme }) => ({
//   "& .MuiOutlinedInput-root": {
//     borderRadius: theme.shape.borderRadius * 5,
//     backgroundColor: alpha(theme.palette.common.white, 0.15),
//     "&:hover": {
//       backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     "& fieldset": {
//       borderColor: "transparent",
//     },
//     "&:hover fieldset": {
//       borderColor: "transparent",
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: theme.palette.primary.main,
//     },
//   },
// }))

// // Styled avatar with upload button overlay
// const ProfileAvatarWrapper = styled(Box)(({ }) => ({
//   position: "relative",
//   "&:hover .upload-icon": {
//     opacity: 1,
//   },
// }))

// const UploadIconButton = styled(IconButton)(({ theme }) => ({
//   position: "absolute",
//   bottom: 0,
//   right: 0,
//   backgroundColor: theme.palette.primary.main,
//   color: theme.palette.primary.contrastText,
//   padding: theme.spacing(0.5),
//   opacity: 0,
//   transition: "opacity 0.3s ease",
//   "&:hover": {
//     backgroundColor: theme.palette.primary.dark,
//   },
// }))

// export default function Dashboard() {
//   const [firstName, setFirstName] = useState("")
//   const [profilePicture, setProfilePicture] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState("Recommended Tutors")
//   const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
//   const [myRequests, setMyRequests] = useState<Tutor[]>([])
//   const [appointments, setAppointments] = useState<Tutor[]>([])
//   const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [jobs, setJobs] = useState<Job[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
//   const [notifications] = useState(3)
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
//   const theme = useTheme()
//   const auth = getAuth()
//   const db = getFirestore()
//   const navigate = useNavigate()

//   const [openHireConfirm, setOpenHireConfirm] = useState<boolean>(false)
//   const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
//   const [openHireForm, setOpenHireForm] = useState<boolean>(false)
//   const [jobTitle, setJobTitle] = useState<string>("")
//   const [hourlyRate, setHourlyRate] = useState<number>(1500)
//   const [studyLevel, setStudyLevel] = useState<string>("Beginner Level")
//   const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(2)
//   const [jobDescription, setJobDescription] = useState<string>("")
//   const [skillsRequired, setSkillsRequired] = useState<string>("")
//   const [location, setLocation] = useState<string>("")
//   const [contactInfo, setContactInfo] = useState<string>("")
//   const [hireErrorMessage, setHireErrorMessage] = useState<string>("")
//   const [hireSuccessMessage, setHireSuccessMessage] = useState<string>("")
//   const [hireLoading, setHireLoading] = useState<boolean>(false)
//   const [hoursDaily, setHoursDaily] = useState<number>(2)
//   const [totalBill, setTotalBill] = useState(0)
//   const [selectedProfilePicture, setSelectedProfilePicture] = useState<string | null>(null)
//   const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null)

//   // Stats cards data
//   const [statsCards, setStatsCards] = useState([
//     { title: "Total Spent", value: "N/A", icon: <TrendingDown />, color: theme.palette.error.main },
//     { title: "Active Sessions", value: "N/A", icon: <AccessTime />, color: theme.palette.secondary.main },
//     { title: "Tutor Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
//     {
//       title: "Jobs Posted",
//       value: jobs.length.toString() || "N/A",
//       icon: <PostAdd />,
//       color: theme.palette.success.main,
//     },
//   ])

//   const navItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, active: true },
//     { text: "Payments", icon: <ProjectsIcon /> },
//     { text: "Invoices", icon: <InvoicesIcon /> },
//     { text: "Reports", icon: <ReportsIcon /> },
//   ]

//   const formatLastActive = (timestamp?: number) => {
//     if (!timestamp) return "Last active recently"

//     const now = new Date().getTime()
//     const lastActive = timestamp
//     const diffInMs = now - lastActive

//     // Convert to minutes, hours, days
//     const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

//     if (diffInMinutes < 1) return "Last active just now"
//     if (diffInMinutes < 60) return `Last active ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
//     if (diffInHours < 24) return `Last active ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
//     return `Last active ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
//   }

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = auth.currentUser
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid))
//         if (userDoc.exists()) {
//           const userData = userDoc.data()
//           setFirstName(userData.firstName || "")
//         }

//         // Fetch parent profile data to get the profile picture
//         const parentDoc = await getDoc(doc(db, "parents", user.uid))
//         if (parentDoc.exists()) {
//           const parentData = parentDoc.data()
//           if (parentData.personalInfo?.profilePicture) {
//             setProfilePicture(parentData.personalInfo.profilePicture)
//           }
//         }
//       }
//     }

//     fetchUserData()
//   }, [auth.currentUser, db])

//   useEffect(() => {
//     const fetchTutorsAndJobs = async () => {
//       setLoading(true)
//       try {
//         // Fetch all tutors from Firestore
//         const tutorsCollection = collection(db, "tutors")
//         const tutorsSnapshot = await getDocs(tutorsCollection)
//         const tutors = tutorsSnapshot.docs.map((doc) => {
//           const tutorData = doc.data()
//           return {
//             id: doc.id,
//             fullName: tutorData.personalInfo?.fullName || "N/A",
//             location: `${tutorData.locationInfo?.state || "N/A"} - ${tutorData.locationInfo?.selectedLGA || "N/A"}`,
//             hourly_rate: tutorData.experienceInfo?.hourly_rate || "N/A",
//             yearsOfExperience: tutorData.experienceInfo?.yearsOfExperience || "N/A",
//             bio: tutorData.bioInfo?.bio || "No bio available",
//             specializations: tutorData.experienceInfo?.specializations || [],
//             previousSchools: tutorData.experienceInfo?.previousSchools || [],
//             lastActive: tutorData.lastActive || null,
//             profilePicture: tutorData.bioInfo?.profilePicture || null, // Add this line to fetch profile picture
//           }
//         }) as Tutor[]

//         console.log("Fetched Recommended Tutors:", tutors)
//         setRecommendedTutors(tutors)

//         // Fetch all jobs from Firestore
//         const jobsCollection = collection(db, "jobs")
//         const jobSnapshot = await getDocs(jobsCollection)
//         const fetchedJobs: Job[] = jobSnapshot.docs.map((doc) => {
//           const jobData = doc.data()
//           return {
//             id: doc.id,
//             jobTitle: jobData.jobTitle || "N/A",
//             location: jobData.location || "N/A",
//             appliedTutors: jobData.appliedTutors || [],
//             accepted_tutor_id: jobData.accepted_tutor_id || null,
//           }
//         })
//         setJobs(fetchedJobs)

//         // Extract tutor IDs from job data
//         const appliedTutorIds = new Set<string>()
//         const acceptedTutorIds = new Set<string>()

//         fetchedJobs.forEach((job) => {
//           job.appliedTutors?.forEach((tutorId) => appliedTutorIds.add(tutorId))
//           if (job.accepted_tutor_id) acceptedTutorIds.add(job.accepted_tutor_id.id)
//         })

//         // Filter tutors for My Requests
//         const appliedTutors = tutors.filter((tutor) => appliedTutorIds.has(tutor.id))
//         console.log("Fetched My Requests:", appliedTutors)
//         setMyRequests(appliedTutors)

//         // Filter tutors for Upcoming Sessions
//         const acceptedTutors = tutors.filter((tutor) => acceptedTutorIds.has(tutor.id))
//         console.log("Fetched Upcoming Sessions:", acceptedTutors)
//         setAppointments(acceptedTutors)

//         // Fetch accepted hire requests
//         const parentsSnapshot = await getDocs(collection(db, "parents"))
//         const acceptedHires: any[] = []

//         parentsSnapshot.docs.forEach((parentDoc) => {
//           const parentData = parentDoc.data()
//           if (parentData.hires) {
//             Object.entries(parentData.hires).forEach(([hireId, hire]: [string, any]) => {
//               if (hire.status === "accepted") {
//                 acceptedHires.push({
//                   ...hire,
//                   id: `hire_${hireId}`,
//                   parentId: parentDoc.id,
//                   isHireRequest: true,
//                 })
//               }
//             })
//           }
//         })

//         // Add accepted hires to appointments
//         const acceptedHireTutors = tutors.filter((tutor) => acceptedHires.some((hire) => hire.tutor_id === tutor.id))

//         setAppointments((prevAppointments) => [...prevAppointments, ...acceptedHireTutors])

//         // Default to Recommended Tutors
//         setFilteredTutors(tutors)
//       } catch (err) {
//         console.error("Error fetching data:", err)
//         setError("Failed to load data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTutorsAndJobs()
//   }, [db])

//   useEffect(() => {
//     if (jobs.length > 0) {
//       setStatsCards((prevCards) =>
//         prevCards.map((card) => (card.title === "Jobs Posted" ? { ...card, value: jobs.length.toString() } : card)),
//       )
//     }
//   }, [jobs])

//   useEffect(() => {
//     setStatsCards((prevCards) =>
//       prevCards.map((card) =>
//         card.title === "Active Sessions" ? { ...card, value: appointments.length.toString() } : card,
//       ),
//     )
//   }, [appointments])

//   useEffect(() => {
//     const calculatedTotal = hourlyRate * hoursDaily * sessionsPerWeek
//     setTotalBill(calculatedTotal)
//   }, [hourlyRate, hoursDaily, sessionsPerWeek])

//   const handleLogout = async () => {
//     try {
//       await signOut(auth)
//       navigate("/login")
//     } catch (error) {
//       console.error("Logout failed:", error)
//     }
//   }

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab)
//     if (tab === "Recommended Tutors") {
//       setFilteredTutors(recommendedTutors)
//     } else if (tab === "My Requests") {
//       setFilteredTutors(myRequests)
//     } else if (tab === "Upcoming Sessions") {
//       setFilteredTutors(appointments)
//     }
//   }

//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
//   const [confirmAction, setConfirmAction] = useState<{
//     type: "accept" | "decline"
//     jobId: string
//     tutorId: string
//   } | null>(null)
//   const [successMessage, setSuccessMessage] = useState<string | null>(null)

//   const handleAcceptTutor = (jobId: string, tutorId: string) => {
//     setConfirmAction({ type: "accept", jobId, tutorId })
//     setConfirmDialogOpen(true)
//   }

//   const handleDeclineTutor = (jobId: string, tutorId: string) => {
//     setConfirmAction({ type: "decline", jobId, tutorId })
//     setConfirmDialogOpen(true)
//   }

//   const handleConfirmAction = async (confirmed: boolean) => {
//     if (confirmed && confirmAction) {
//       try {
//         const jobRef = doc(db, "jobs", confirmAction.jobId)

//         if (confirmAction.type === "accept") {
//           await updateDoc(jobRef, {
//             accepted_tutor_id: { id: confirmAction.tutorId },
//             appliedTutors: [], // Clear all applied tutors
//           })

//           // Update jobs state
//           setJobs((prevJobs) =>
//             prevJobs.map((job) =>
//               job.id === confirmAction.jobId
//                 ? { ...job, accepted_tutor_id: { id: confirmAction.tutorId }, appliedTutors: [] }
//                 : job,
//             ),
//           )

//           // Find the job to get its ID
//           // const job = jobs.find((job) => job.id === confirmAction.jobId)

//           // Add the accepted tutor to appointments
//           setAppointments((prevAppointments) => [
//             ...prevAppointments,
//             ...myRequests.filter((tutor) => tutor.id === confirmAction.tutorId),
//           ])

//           // Remove ALL tutors who applied for this specific job from myRequests
//           setMyRequests((prevRequests) =>
//             prevRequests.filter(
//               (tutor) => !jobs.find((j) => j.id === confirmAction.jobId)?.appliedTutors?.includes(tutor.id),
//             ),
//           )

//           setSuccessMessage("Tutor accepted! You can view your upcoming session in the 'Upcoming Sessions' tab.")
//         } else {
//           await updateDoc(jobRef, {
//             appliedTutors: (prevAppliedTutors: string[]) =>
//               prevAppliedTutors.filter((id) => id !== confirmAction.tutorId),
//           })

//           setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== confirmAction.tutorId))
//           setSuccessMessage("Tutor declined successfully.")
//         }
//       } catch (err) {
//         console.error(`Error ${confirmAction.type === "accept" ? "accepting" : "declining"} tutor:`, err)
//         setSuccessMessage(null)
//       }
//     }
//     setConfirmDialogOpen(false)
//   }

//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleClose = () => {
//     setAnchorEl(null)
//   }

//   const confirmApplication = (confirmed: boolean) => {
//     if (confirmed && confirmApplyJobId) {
//       // Implement the logic for confirming the application
//       console.log(`Application confirmed for job ID: ${confirmApplyJobId}`)
//       // You might want to update the database or state here
//     }
//     setConfirmApplyJobId(null)
//   }

//   const handleHireClick = (tutor: Tutor) => {
//     setSelectedTutor(tutor)
//     setOpenHireConfirm(true)
//   }

//   const handleHireConfirm = () => {
//     setOpenHireConfirm(false)
//     setOpenHireForm(true)
//   }

//   const handleCloseHireForm = () => {
//     setOpenHireForm(false)
//     setSelectedTutor(null)
//     resetHireForm()
//   }

//   const resetHireForm = () => {
//     setJobTitle("")
//     setHourlyRate(1500)
//     setHoursDaily(2)
//     setStudyLevel("Beginner Level")
//     setSessionsPerWeek(2)
//     setJobDescription("")
//     setSkillsRequired("")
//     setLocation("")
//     setContactInfo("")
//     setHireErrorMessage("")
//     setHireSuccessMessage("")
//   }

//   const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const value = Number(e.target.value)
//     setHourlyRate(value)

//     if (value < 1500 || value > 3000) {
//       setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
//     } else {
//       setHireErrorMessage("")
//     }
//   }

//   const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault()

//     if (hourlyRate < 1500 || hourlyRate > 3000) {
//       setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
//       return
//     }

//     if (!auth.currentUser) {
//       setHireErrorMessage("You must be logged in to hire a tutor.")
//       return
//     }

//     if (!selectedTutor) {
//       setHireErrorMessage("No tutor selected.")
//       return
//     }

//     setHireLoading(true)

//     const hireData = {
//       jobTitle,
//       hourlyRate: `${hourlyRate}`,
//       hoursDaily: `${hoursDaily}`,
//       studyLevel,
//       sessionsPerWeek: `${sessionsPerWeek}`,
//       jobDescription,
//       skillsRequired,
//       location,
//       contactInfo,
//       created_at: new Date(),
//       status: "pending",
//       tutor_id: selectedTutor.id,
//       tutorName: selectedTutor.fullName,
//       totalBill,
//     }

//     try {
//       // Update the parent's document with the new hire data
//       const parentRef = doc(db, "parents", auth.currentUser.uid)
//       const hireId = `hire_${Date.now()}` // Generate a unique ID for this hire

//       await updateDoc(parentRef, {
//         [`hires.${hireId}`]: hireData,
//       })

//       setHireSuccessMessage("Your hire request has been sent successfully!")
//       setTimeout(() => {
//         handleCloseHireForm()
//       }, 2000)
//     } catch (error) {
//       console.error("Error hiring tutor: ", error)
//       setHireErrorMessage("There was an error processing your request. Please try again.")
//     } finally {
//       setHireLoading(false)
//     }
//   }

//   const handleProfilePictureClick = (profilePicture: string | undefined) => {
//     if (profilePicture) {
//       setSelectedProfilePicture(profilePicture)
//     }
//   }

//   const handleReadMore = (tutorId: string) => {
//     setExpandedTutorId(expandedTutorId === tutorId ? null : tutorId)
//   }

//   // Navigate to profile page to upload profile picture
//   const handleProfilePictureClick2 = () => {
//     navigate("/parent-profile")
//   }

//   // Create a Cloudinary image object if profilePicture exists
//   const profileImage = profilePicture
//     ? cld
//       .image(profilePicture.includes("/") ? profilePicture.split("/").pop()?.split(".")[0] || "" : profilePicture)
//       .format("auto")
//       .quality("auto")
//       .resize(fill().gravity(autoGravity()).width(40).height(40))
//     : null

//   return (
//     <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
//       <StyledAppBar position="sticky" elevation={0}>
//         <Container maxWidth="xl">
//           <Toolbar disableGutters>
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
//               Kopa360
//             </Typography>
//             <Box sx={{ display: "flex", alignItems: "center" }}>
//               <SearchTextField
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 variant="outlined"
//                 size="small"
//                 sx={{ mr: 2, width: { xs: 120, sm: 200 } }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon sx={{ color: "text.secondary" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Tooltip title="Notifications">
//                 <IconButton color="inherit">
//                   <Badge badgeContent={notifications} color="error">
//                     <Notifications sx={{ color: "text.secondary" }} />
//                   </Badge>
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Settings">
//                 <IconButton color="inherit">
//                   <Settings sx={{ color: "text.secondary" }} />
//                 </IconButton>
//               </Tooltip>
//               {/* Profile Picture with Menu */}
//               <ProfileAvatarWrapper>
//                 <IconButton
//                   size="large"
//                   aria-label="account of current user"
//                   aria-controls="menu-appbar"
//                   aria-haspopup="true"
//                   onClick={handleMenu}
//                   color="inherit"
//                 >
//                   {profileImage ? (
//                     <Avatar sx={{ width: 40, height: 40 }}>
//                       <AdvancedImage
//                         cldImg={profileImage}
//                         style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                       />
//                     </Avatar>
//                   ) : (
//                     <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
//                       <AccountCircle />
//                     </Avatar>
//                   )}
//                 </IconButton>
//                 <UploadIconButton className="upload-icon" size="small" onClick={handleProfilePictureClick2}>
//                   <PhotoCamera fontSize="small" />
//                 </UploadIconButton>
//               </ProfileAvatarWrapper>
//               <Menu
//                 id="menu-appbar"
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "right",
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: "top",
//                   horizontal: "right",
//                 }}
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//               >
//                 <MenuItem onClick={handleClose} component={Link} to="/parent-profile">
//                   Profile
//                 </MenuItem>
//                 <MenuItem onClick={handleClose}>My account</MenuItem>
//                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
//               </Menu>
//             </Box>
//           </Toolbar>
//         </Container>
//       </StyledAppBar>

//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
//             Welcome back, <span style={{ color: theme.palette.primary.main }}>{firstName}</span>
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Stay updated on your latest tutoring job posts
//           </Typography>
//         </Box>

//         {/* Navigation */}
//         <Paper sx={{ mb: 4, p: 2, borderRadius: theme.shape.borderRadius * 2 }} elevation={0}>
//           <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
//             {navItems.map((item) => (
//               <Button
//                 key={item.text}
//                 startIcon={item.icon}
//                 color={item.active ? "primary" : "inherit"}
//                 sx={{
//                   mr: 2,
//                   mb: { xs: 1, md: 0 },
//                   borderRadius: theme.shape.borderRadius * 5,
//                   textTransform: "none",
//                   fontWeight: 600,
//                 }}
//               >
//                 {item.text}
//               </Button>
//             ))}
//             <MuiButton
//               variant="contained"
//               color="primary"
//               href="/job-form"
//               startIcon={<PostAdd />}
//               sx={{
//                 borderRadius: theme.shape.borderRadius * 5,
//                 textTransform: "none",
//                 fontWeight: 600,
//               }}
//             >
//               Post a Job
//             </MuiButton>
//           </Box>
//         </Paper>

//         {/* Stats Cards */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
//             Overview
//           </Typography>
//           <Grid container spacing={3}>
//             {statsCards.map((card, index) => (
//               <Grid item xs={12} sm={6} md={3} key={index}>
//                 <motion.div
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <StyledCard elevation={0} sx={{ bgcolor: alpha(card.color, 0.1) }}>
//                     <CardContent>
//                       <Box display="flex" justifyContent="space-between" alignItems="center">
//                         <Box>
//                           <Typography color="text.secondary" gutterBottom variant="body2">
//                             {card.title}
//                           </Typography>
//                           <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
//                             {card.value}
//                           </Typography>
//                         </Box>
//                         <Avatar
//                           sx={{
//                             bgcolor: alpha(card.color, 0.2),
//                             color: card.color,
//                           }}
//                         >
//                           {card.icon}
//                         </Avatar>
//                       </Box>
//                     </CardContent>
//                   </StyledCard>
//                 </motion.div>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Tutors Section */}
//         <Box>
//           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
//             Available Tutors
//           </Typography>
//           <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
//             {["Recommended Tutors", "My Requests", "Upcoming Sessions"].map((tab) => (
//               <Button
//                 key={tab}
//                 variant={activeTab === tab ? "contained" : "outlined"}
//                 onClick={() => handleTabChange(tab)}
//                 sx={{
//                   borderRadius: theme.shape.borderRadius * 5,
//                   textTransform: "none",
//                   px: 3,
//                   py: 1,
//                   mb: { xs: 1, md: 0 },
//                   fontWeight: 600,
//                 }}
//               >
//                 {tab}
//               </Button>
//             ))}
//           </Box>

//           <AnimatePresence mode="wait">
//             {loading ? (
//               <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//                 <CircularProgress />
//               </Box>
//             ) : error ? (
//               <Typography color="error">{error}</Typography>
//             ) : filteredTutors?.length ? (
//               <Grid container spacing={3}>
//                 {filteredTutors.map((tutor) => {
//                   const job =
//                     activeTab === "My Requests"
//                       ? jobs.find((job) => job.appliedTutors?.includes(tutor.id))
//                       : activeTab === "Upcoming Sessions"
//                         ? jobs.find((job) => job.accepted_tutor_id?.id === tutor.id)
//                         : null
//                   return (
//                     <Grid item xs={12} md={6} key={tutor.id}>
//                       <motion.div
//                         initial={{ scale: 0.95, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         exit={{ scale: 0.95, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <StyledCard elevation={0}>
//                           <CardContent>
//                             <Box display="flex" justifyContent="space-between" mb={2}>
//                               <Typography variant="caption" color="text.secondary">
//                                 {formatLastActive(tutor.lastActive)}
//                               </Typography>
//                               <IconButton size="small">
//                                 <Bookmark sx={{ color: theme.palette.primary.main }} />
//                               </IconButton>
//                             </Box>
//                             <Box display="flex" alignItems="center" gap={2} mb={2}>
//                               {/* Add profile picture here */}
//                               {tutor.profilePicture ? (
//                                 <Avatar
//                                   sx={{
//                                     width: 60,
//                                     height: 60,
//                                     cursor: "pointer",
//                                     transition: "transform 0.2s",
//                                     "&:hover": {
//                                       transform: "scale(1.05)",
//                                     },
//                                   }}
//                                   onClick={() => handleProfilePictureClick(tutor.profilePicture)}
//                                 >
//                                   <AdvancedImage
//                                     cldImg={cld
//                                       .image(
//                                         tutor.profilePicture.includes("/")
//                                           ? tutor.profilePicture.split("/").pop()?.split(".")[0] || ""
//                                           : tutor.profilePicture,
//                                       )
//                                       .format("auto")
//                                       .quality("auto")
//                                       .resize(fill().gravity(autoGravity()).width(60).height(60))}
//                                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                                   />
//                                 </Avatar>
//                               ) : (
//                                 <Avatar sx={{ width: 60, height: 60, bgcolor: theme.palette.primary.main }}>
//                                   {tutor.fullName?.charAt(0) || "T"}
//                                 </Avatar>
//                               )}
//                               <Box>
//                                 <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
//                                   {tutor.fullName || "Tutor Profile"}
//                                 </Typography>
//                                 <Typography variant="body2" color="text.secondary">
//                                   {tutor.location}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                             {job && (
//                               <Box display="flex" gap={1} mb={2} alignItems="center">
//                                 <Typography variant="subtitle1" color="primary">
//                                   {job.jobTitle || "Job Title not provided"}
//                                 </Typography>
//                                 <Divider orientation="vertical" flexItem />
//                                 <Typography variant="body2" color="text.secondary">
//                                   {job.location || "Location not provided"}
//                                 </Typography>
//                               </Box>
//                             )}
//                             <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
//                               <Chip
//                                 label={`${tutor.yearsOfExperience} years experience`}
//                                 size="small"
//                                 sx={{
//                                   bgcolor: alpha(theme.palette.secondary.main, 0.1),
//                                   color: theme.palette.secondary.main,
//                                 }}
//                               />
//                               <Chip
//                                 label={`₦${tutor.hourly_rate}/hour`}
//                                 size="small"
//                                 sx={{
//                                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                   color: theme.palette.primary.main,
//                                   fontWeight: 600,
//                                 }}
//                               />
//                             </Box>

//                             {/* Only show bio for tabs other than Upcoming Sessions */}
//                             {activeTab !== "Upcoming Sessions" && (
//                               <>
//                                 <Typography
//                                   mb={1}
//                                   variant="body2"
//                                   color="text.secondary"
//                                   sx={{
//                                     display: "-webkit-box",
//                                     WebkitLineClamp: expandedTutorId === tutor.id ? "unset" : 3,
//                                     WebkitBoxOrient: "vertical",
//                                     overflow: expandedTutorId === tutor.id ? "visible" : "hidden",
//                                   }}
//                                 >
//                                   {tutor.bio}
//                                 </Typography>
//                                 <Button
//                                   variant="text"
//                                   size="small"
//                                   onClick={() => handleReadMore(tutor.id)}
//                                   sx={{ mb: 2, p: 0, fontWeight: 500 }}
//                                 >
//                                   {expandedTutorId === tutor.id ? "Show Less" : "Read More"}
//                                 </Button>
//                               </>
//                             )}

//                             {/* Only show specializations for tabs other than Upcoming Sessions */}
//                             {activeTab !== "Upcoming Sessions" && (
//                               <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//                                 {tutor.specializations.map((skill, index) => (
//                                   <Chip
//                                     key={index}
//                                     label={skill}
//                                     size="small"
//                                     sx={{
//                                       bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                       color: theme.palette.primary.main,
//                                     }}
//                                   />
//                                 ))}
//                               </Box>
//                             )}

//                             {activeTab === "My Requests" && job && (
//                               <Box display="flex" gap={2} mt={2}>
//                                 <Button
//                                   variant="contained"
//                                   color="success"
//                                   onClick={() => handleAcceptTutor(job.id, tutor.id)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Accept
//                                 </Button>
//                                 <Button
//                                   variant="outlined"
//                                   color="error"
//                                   onClick={() => handleDeclineTutor(job.id, tutor.id)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Decline
//                                 </Button>
//                               </Box>
//                             )}

//                             {activeTab === "Recommended Tutors" && (
//                               <Box display="flex" gap={2} mt={2}>
//                                 <Button
//                                   variant="contained"
//                                   color="primary"
//                                   onClick={() => handleHireClick(tutor)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Hire
//                                 </Button>
//                               </Box>
//                             )}
//                           </CardContent>
//                         </StyledCard>
//                       </motion.div>
//                     </Grid>
//                   )
//                 })}
//               </Grid>
//             ) : (
//               <Typography align="center" color="text.secondary">
//                 No tutors found for this category.
//               </Typography>
//             )}
//           </AnimatePresence>
//         </Box>
//       </Container>

//       {/* Confirmation dialog for accept/decline */}
//       <Dialog
//         open={confirmDialogOpen}
//         onClose={() => setConfirmDialogOpen(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Action</DialogTitle>
//         <DialogContent>
//           <Typography>
//             {confirmAction?.type === "accept"
//               ? "Are you sure you want to accept this tutor?"
//               : "Are you sure you want to decline this tutor?"}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => handleConfirmAction(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             No
//           </Button>
//           <Button
//             onClick={() => handleConfirmAction(true)}
//             variant="contained"
//             color={confirmAction?.type === "accept" ? "success" : "error"}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Success message dialog */}
//       <Dialog
//         open={!!successMessage}
//         onClose={() => setSuccessMessage(null)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Success</DialogTitle>
//         <DialogContent>
//           <Typography>{successMessage}</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setSuccessMessage(null)}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Application confirmation dialog */}
//       <Dialog
//         open={!!confirmApplyJobId}
//         onClose={() => setConfirmApplyJobId(null)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Application</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to apply for this position?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => confirmApplication(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={() => confirmApplication(true)}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hire Confirmation Dialog */}
//       <Dialog
//         open={openHireConfirm}
//         onClose={() => setOpenHireConfirm(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Hire</DialogTitle>
//         <DialogContent>
//           <DialogContentText>Are you sure you want to hire {selectedTutor?.fullName}?</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setOpenHireConfirm(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleHireConfirm}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Yes, Continue
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hire Form Modal */}
//       <Modal
//         open={openHireForm}
//         onClose={handleCloseHireForm}
//         aria-labelledby="hire-form-modal"
//         aria-describedby="hire-form-description"
//       >
//         <Paper
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: { xs: "90%", sm: "80%", md: "70%" },
//             maxWidth: 800,
//             maxHeight: "90vh",
//             overflow: "auto",
//             p: 4,
//             borderRadius: theme.shape.borderRadius * 2,
//           }}
//         >
//           <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
//             Hire {selectedTutor?.fullName}
//           </Typography>

//           {hireSuccessMessage && (
//             <Alert severity="success" sx={{ mb: 2 }}>
//               <strong>{hireSuccessMessage}</strong>
//             </Alert>
//           )}

//           {hireErrorMessage && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               <strong>{hireErrorMessage}</strong>
//             </Alert>
//           )}

//           <form onSubmit={handleHireSubmit}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Job Title"
//                   variant="outlined"
//                   placeholder="Home Tutor Needed for Basic Math"
//                   value={jobTitle}
//                   onChange={(e) => setJobTitle(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Hourly Rate (₦)"
//                   variant="outlined"
//                   type="number"
//                   placeholder="3000"
//                   value={hourlyRate}
//                   onChange={handleHourlyRateChange}
//                   InputProps={{
//                     startAdornment: <InputAdornment position="start">₦</InputAdornment>,
//                   }}
//                   inputProps={{
//                     min: 1500,
//                     max: 3000,
//                   }}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Sessions per Week"
//                   variant="outlined"
//                   type="number"
//                   placeholder="2"
//                   value={sessionsPerWeek}
//                   onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Hours Per Day"
//                   variant="outlined"
//                   type="number"
//                   placeholder="2"
//                   value={hoursDaily}
//                   onChange={(e) => setHoursDaily(Number(e.target.value))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box sx={{ bgcolor: "info.light", p: 2, borderRadius: 1 }}>
//                   <Typography variant="subtitle1">Weekly Estimated Bill:</Typography>
//                   <Typography variant="h6">₦{totalBill.toLocaleString()}</Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12}>
//                 <Select
//                   fullWidth
//                   label="Level of Study"
//                   value={studyLevel}
//                   onChange={(e) => setStudyLevel(e.target.value as string)}
//                   required
//                 >
//                   <MenuItem value="Beginner Level">Beginner Level</MenuItem>
//                   <MenuItem value="Intermediate Level">Intermediate Level</MenuItem>
//                   <MenuItem value="Advanced Level">Advanced Level</MenuItem>
//                 </Select>
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Job Description"
//                   variant="outlined"
//                   multiline
//                   rows={4}
//                   placeholder="Describe the job in detail"
//                   value={jobDescription}
//                   onChange={(e) => setJobDescription(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Skills Required"
//                   variant="outlined"
//                   placeholder="Mathematics, Patience"
//                   value={skillsRequired}
//                   onChange={(e) => setSkillsRequired(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Location"
//                   variant="outlined"
//                   placeholder="Benin City, Edo"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Contact Information"
//                   variant="outlined"
//                   placeholder="Phone number or Email"
//                   value={contactInfo}
//                   onChange={(e) => setContactInfo(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   fullWidth
//                   size="large"
//                   disabled={hireLoading}
//                   startIcon={hireLoading && <CircularProgress size={20} color="inherit" />}
//                   sx={{
//                     borderRadius: theme.shape.borderRadius * 5,
//                     textTransform: "none",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {hireLoading ? "Processing..." : "Hire Tutor"}
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         </Paper>
//       </Modal>
//       {/* Profile Picture Zoom Modal */}
//       <Modal
//         open={!!selectedProfilePicture}
//         onClose={() => setSelectedProfilePicture(null)}
//         aria-labelledby="profile-picture-modal"
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             maxWidth: "90vw",
//             maxHeight: "90vh",
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             boxShadow: 24,
//             p: 2,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <IconButton
//             onClick={() => setSelectedProfilePicture(null)}
//             sx={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
//           >
//             <Close />
//           </IconButton>
//           {selectedProfilePicture && (
//             <Box
//               sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
//             >
//               <AdvancedImage
//                 cldImg={cld
//                   .image(
//                     selectedProfilePicture.includes("/")
//                       ? selectedProfilePicture.split("/").pop()?.split(".")[0] || ""
//                       : selectedProfilePicture,
//                   )
//                   .format("auto")
//                   .quality("auto")}
//                 style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
//               />
//             </Box>
//           )}
//         </Box>
//       </Modal>
//     </Box>
//   )
// }









// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import {
//   Box,
//   Typography,
//   TextField,
//   Avatar,
//   Button,
//   Chip,
//   Paper,
//   InputAdornment,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   CircularProgress,
//   Grid,
//   Card,
//   CardContent,
//   IconButton,
//   Tooltip,
//   Badge,
//   Divider,
//   useTheme,
//   AppBar,
//   Toolbar,
//   Menu,
//   MenuItem,
//   Container,
//   Select,
//   Modal,
//   Alert,
// } from "@mui/material"
// import { Button as MuiButton } from "@mui/material"
// import {
//   Dashboard as DashboardIcon,
//   Description as ProjectsIcon,
//   Receipt as InvoicesIcon,
//   Assessment as ReportsIcon,
//   Search as SearchIcon,
//   Bookmark,
//   Notifications,
//   Settings,
//   AccessTime,
//   Star,
//   TrendingDown,
//   PostAdd,
//   AccountCircle,
//   PhotoCamera,
// } from "@mui/icons-material"
// import { motion, AnimatePresence } from "framer-motion"
// import { styled, alpha } from "@mui/material/styles"
// import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// import { getAuth, signOut } from "firebase/auth"
// import "bootstrap/dist/css/bootstrap.min.css"
// import { Cloudinary } from "@cloudinary/url-gen"
// import { AdvancedImage } from "@cloudinary/react"
// import { fill } from "@cloudinary/url-gen/actions/resize"
// import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity"

// // Initialize Cloudinary instance
// const cld = new Cloudinary({
//   cloud: {
//     cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drsdycckb",
//   },
// })

// interface Tutor {
//   fullName: string
//   id: string
//   location: string
//   hourly_rate: string
//   yearsOfExperience: string
//   bio: string
//   specializations: string[]
//   previousSchools: string[]
//   lastActive?: number // Timestamp in milliseconds
// }

// interface Job {
//   id: string
//   jobTitle: string
//   location: string
//   appliedTutors?: string[]
//   accepted_tutor_id?: { id: string }
// }

// const StyledCard = styled(Card)(({ theme }) => ({
//   transition: "transform 0.3s ease, box-shadow 0.3s ease",
//   "&:hover": {
//     transform: "translateY(-5px)",
//     boxShadow: theme.shadows[8],
//   },
//   borderRadius: theme.shape.borderRadius * 2,
// }))

// const StyledAppBar = styled(AppBar)(({ theme }) => ({
//   backgroundColor: alpha(theme.palette.background.paper, 0.8),
//   backdropFilter: "blur(10px)",
// }))

// const SearchTextField = styled(TextField)(({ theme }) => ({
//   "& .MuiOutlinedInput-root": {
//     borderRadius: theme.shape.borderRadius * 5,
//     backgroundColor: alpha(theme.palette.common.white, 0.15),
//     "&:hover": {
//       backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     "& fieldset": {
//       borderColor: "transparent",
//     },
//     "&:hover fieldset": {
//       borderColor: "transparent",
//     },
//     "&.Mui-focused fieldset": {
//       borderColor: theme.palette.primary.main,
//     },
//   },
// }))

// // Styled avatar with upload button overlay
// const ProfileAvatarWrapper = styled(Box)(({ }) => ({
//   position: "relative",
//   "&:hover .upload-icon": {
//     opacity: 1,
//   },
// }))

// const UploadIconButton = styled(IconButton)(({ theme }) => ({
//   position: "absolute",
//   bottom: 0,
//   right: 0,
//   backgroundColor: theme.palette.primary.main,
//   color: theme.palette.primary.contrastText,
//   padding: theme.spacing(0.5),
//   opacity: 0,
//   transition: "opacity 0.3s ease",
//   "&:hover": {
//     backgroundColor: theme.palette.primary.dark,
//   },
// }))

// export default function Dashboard() {
//   const [firstName, setFirstName] = useState("")
//   const [profilePicture, setProfilePicture] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState("Recommended Tutors")
//   const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
//   const [myRequests, setMyRequests] = useState<Tutor[]>([])
//   const [appointments, setAppointments] = useState<Tutor[]>([])
//   const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [jobs, setJobs] = useState<Job[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
//   const [notifications] = useState(3)
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
//   const theme = useTheme()
//   const auth = getAuth()
//   const db = getFirestore()
//   const navigate = useNavigate()

//   const [openHireConfirm, setOpenHireConfirm] = useState<boolean>(false)
//   const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
//   const [openHireForm, setOpenHireForm] = useState<boolean>(false)
//   const [jobTitle, setJobTitle] = useState<string>("")
//   const [hourlyRate, setHourlyRate] = useState<number>(1500)
//   const [studyLevel, setStudyLevel] = useState<string>("Beginner Level")
//   const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(2)
//   const [jobDescription, setJobDescription] = useState<string>("")
//   const [skillsRequired, setSkillsRequired] = useState<string>("")
//   const [location, setLocation] = useState<string>("")
//   const [contactInfo, setContactInfo] = useState<string>("")
//   const [hireErrorMessage, setHireErrorMessage] = useState<string>("")
//   const [hireSuccessMessage, setHireSuccessMessage] = useState<string>("")
//   const [hireLoading, setHireLoading] = useState<boolean>(false)
//   const [hoursDaily, setHoursDaily] = useState<number>(2)
//   const [totalBill, setTotalBill] = useState(0)

//   // Stats cards data
//   const [statsCards, setStatsCards] = useState([
//     { title: "Total Spent", value: "N/A", icon: <TrendingDown />, color: theme.palette.error.main },
//     { title: "Active Sessions", value: "N/A", icon: <AccessTime />, color: theme.palette.secondary.main },
//     { title: "Tutor Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
//     {
//       title: "Jobs Posted",
//       value: jobs.length.toString() || "N/A",
//       icon: <PostAdd />,
//       color: theme.palette.success.main,
//     },
//   ])

//   const navItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, active: true },
//     { text: "Payments", icon: <ProjectsIcon /> },
//     { text: "Invoices", icon: <InvoicesIcon /> },
//     { text: "Reports", icon: <ReportsIcon /> },
//   ]

//   const formatLastActive = (timestamp?: number) => {
//     if (!timestamp) return "Last active recently"

//     const now = new Date().getTime()
//     const lastActive = timestamp
//     const diffInMs = now - lastActive

//     // Convert to minutes, hours, days
//     const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

//     if (diffInMinutes < 1) return "Last active just now"
//     if (diffInMinutes < 60) return `Last active ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
//     if (diffInHours < 24) return `Last active ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
//     return `Last active ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
//   }

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = auth.currentUser
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid))
//         if (userDoc.exists()) {
//           const userData = userDoc.data()
//           setFirstName(userData.firstName || "")
//         }

//         // Fetch parent profile data to get the profile picture
//         const parentDoc = await getDoc(doc(db, "parents", user.uid))
//         if (parentDoc.exists()) {
//           const parentData = parentDoc.data()
//           if (parentData.personalInfo?.profilePicture) {
//             setProfilePicture(parentData.personalInfo.profilePicture)
//           }
//         }
//       }
//     }

//     fetchUserData()
//   }, [auth.currentUser, db])

//   useEffect(() => {
//     const fetchTutorsAndJobs = async () => {
//       setLoading(true)
//       try {
//         // Fetch all tutors from Firestore
//         const tutorsCollection = collection(db, "tutors")
//         const tutorsSnapshot = await getDocs(tutorsCollection)
//         const tutors = tutorsSnapshot.docs.map((doc) => {
//           const tutorData = doc.data()
//           return {
//             id: doc.id,
//             fullName: tutorData.personalInfo?.fullName || "N/A",
//             location: `${tutorData.locationInfo?.state || "N/A"} - ${tutorData.locationInfo?.selectedLGA || "N/A"}`,
//             hourly_rate: tutorData.experienceInfo?.hourly_rate || "N/A",
//             yearsOfExperience: tutorData.experienceInfo?.yearsOfExperience || "N/A",
//             bio: tutorData.bioInfo?.bio || "No bio available",
//             specializations: tutorData.experienceInfo?.specializations || [],
//             previousSchools: tutorData.experienceInfo?.previousSchools || [],
//             lastActive: tutorData.lastActive || null,
//           }
//         }) as Tutor[]

//         console.log("Fetched Recommended Tutors:", tutors)
//         setRecommendedTutors(tutors)

//         // Fetch all jobs from Firestore
//         const jobsCollection = collection(db, "jobs")
//         const jobSnapshot = await getDocs(jobsCollection)
//         const fetchedJobs: Job[] = jobSnapshot.docs.map((doc) => {
//           const jobData = doc.data()
//           return {
//             id: doc.id,
//             jobTitle: jobData.jobTitle || "N/A",
//             location: jobData.location || "N/A",
//             appliedTutors: jobData.appliedTutors || [],
//             accepted_tutor_id: jobData.accepted_tutor_id || null,
//           }
//         })
//         setJobs(fetchedJobs)

//         // Extract tutor IDs from job data
//         const appliedTutorIds = new Set<string>()
//         const acceptedTutorIds = new Set<string>()

//         fetchedJobs.forEach((job) => {
//           job.appliedTutors?.forEach((tutorId) => appliedTutorIds.add(tutorId))
//           if (job.accepted_tutor_id) acceptedTutorIds.add(job.accepted_tutor_id.id)
//         })

//         // Filter tutors for My Requests
//         const appliedTutors = tutors.filter((tutor) => appliedTutorIds.has(tutor.id))
//         console.log("Fetched My Requests:", appliedTutors)
//         setMyRequests(appliedTutors)

//         // Filter tutors for Upcoming Sessions
//         const acceptedTutors = tutors.filter((tutor) => acceptedTutorIds.has(tutor.id))
//         console.log("Fetched Upcoming Sessions:", acceptedTutors)
//         setAppointments(acceptedTutors)

//         // Fetch accepted hire requests
//         const parentsSnapshot = await getDocs(collection(db, "parents"))
//         const acceptedHires: any[] = []

//         parentsSnapshot.docs.forEach((parentDoc) => {
//           const parentData = parentDoc.data()
//           if (parentData.hires) {
//             Object.entries(parentData.hires).forEach(([hireId, hire]: [string, any]) => {
//               if (hire.status === "accepted") {
//                 acceptedHires.push({
//                   ...hire,
//                   id: `hire_${hireId}`,
//                   parentId: parentDoc.id,
//                   isHireRequest: true,
//                 })
//               }
//             })
//           }
//         })

//         // Add accepted hires to appointments
//         const acceptedHireTutors = tutors.filter((tutor) => acceptedHires.some((hire) => hire.tutor_id === tutor.id))

//         setAppointments((prevAppointments) => [...prevAppointments, ...acceptedHireTutors])

//         // Default to Recommended Tutors
//         setFilteredTutors(tutors)
//       } catch (err) {
//         console.error("Error fetching data:", err)
//         setError("Failed to load data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTutorsAndJobs()
//   }, [db])

//   useEffect(() => {
//     if (jobs.length > 0) {
//       setStatsCards((prevCards) =>
//         prevCards.map((card) => (card.title === "Jobs Posted" ? { ...card, value: jobs.length.toString() } : card)),
//       )
//     }
//   }, [jobs])

//   useEffect(() => {
//     setStatsCards((prevCards) =>
//       prevCards.map((card) =>
//         card.title === "Active Sessions" ? { ...card, value: appointments.length.toString() } : card,
//       ),
//     )
//   }, [appointments])

//   useEffect(() => {
//     const calculatedTotal = hourlyRate * hoursDaily * sessionsPerWeek
//     setTotalBill(calculatedTotal)
//   }, [hourlyRate, hoursDaily, sessionsPerWeek])

//   const handleLogout = async () => {
//     try {
//       await signOut(auth)
//       navigate("/login")
//     } catch (error) {
//       console.error("Logout failed:", error)
//     }
//   }

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab)
//     if (tab === "Recommended Tutors") {
//       setFilteredTutors(recommendedTutors)
//     } else if (tab === "My Requests") {
//       setFilteredTutors(myRequests)
//     } else if (tab === "Upcoming Sessions") {
//       setFilteredTutors(appointments)
//     }
//   }

//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
//   const [confirmAction, setConfirmAction] = useState<{
//     type: "accept" | "decline"
//     jobId: string
//     tutorId: string
//   } | null>(null)
//   const [successMessage, setSuccessMessage] = useState<string | null>(null)

//   const handleAcceptTutor = (jobId: string, tutorId: string) => {
//     setConfirmAction({ type: "accept", jobId, tutorId })
//     setConfirmDialogOpen(true)
//   }

//   const handleDeclineTutor = (jobId: string, tutorId: string) => {
//     setConfirmAction({ type: "decline", jobId, tutorId })
//     setConfirmDialogOpen(true)
//   }

//   const handleConfirmAction = async (confirmed: boolean) => {
//     if (confirmed && confirmAction) {
//       try {
//         const jobRef = doc(db, "jobs", confirmAction.jobId)

//         if (confirmAction.type === "accept") {
//           await updateDoc(jobRef, {
//             accepted_tutor_id: { id: confirmAction.tutorId },
//             appliedTutors: [], // Clear all applied tutors
//           })

//           // Update jobs state
//           setJobs((prevJobs) =>
//             prevJobs.map((job) =>
//               job.id === confirmAction.jobId
//                 ? { ...job, accepted_tutor_id: { id: confirmAction.tutorId }, appliedTutors: [] }
//                 : job,
//             ),
//           )

//           // Find the job to get its ID
//           // const job = jobs.find((job) => job.id === confirmAction.jobId)

//           // Add the accepted tutor to appointments
//           setAppointments((prevAppointments) => [
//             ...prevAppointments,
//             ...myRequests.filter((tutor) => tutor.id === confirmAction.tutorId),
//           ])

//           // Remove ALL tutors who applied for this specific job from myRequests
//           setMyRequests((prevRequests) =>
//             prevRequests.filter(
//               (tutor) => !jobs.find((j) => j.id === confirmAction.jobId)?.appliedTutors?.includes(tutor.id),
//             ),
//           )

//           setSuccessMessage("Tutor accepted! You can view your upcoming session in the 'Upcoming Sessions' tab.")
//         } else {
//           await updateDoc(jobRef, {
//             appliedTutors: (prevAppliedTutors: string[]) =>
//               prevAppliedTutors.filter((id) => id !== confirmAction.tutorId),
//           })

//           setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== confirmAction.tutorId))
//           setSuccessMessage("Tutor declined successfully.")
//         }
//       } catch (err) {
//         console.error(`Error ${confirmAction.type === "accept" ? "accepting" : "declining"} tutor:`, err)
//         setSuccessMessage(null)
//       }
//     }
//     setConfirmDialogOpen(false)
//   }

//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleClose = () => {
//     setAnchorEl(null)
//   }

//   const confirmApplication = (confirmed: boolean) => {
//     if (confirmed && confirmApplyJobId) {
//       // Implement the logic for confirming the application
//       console.log(`Application confirmed for job ID: ${confirmApplyJobId}`)
//       // You might want to update the database or state here
//     }
//     setConfirmApplyJobId(null)
//   }

//   const handleHireClick = (tutor: Tutor) => {
//     setSelectedTutor(tutor)
//     setOpenHireConfirm(true)
//   }

//   const handleHireConfirm = () => {
//     setOpenHireConfirm(false)
//     setOpenHireForm(true)
//   }

//   const handleCloseHireForm = () => {
//     setOpenHireForm(false)
//     setSelectedTutor(null)
//     resetHireForm()
//   }

//   const resetHireForm = () => {
//     setJobTitle("")
//     setHourlyRate(1500)
//     setHoursDaily(2)
//     setStudyLevel("Beginner Level")
//     setSessionsPerWeek(2)
//     setJobDescription("")
//     setSkillsRequired("")
//     setLocation("")
//     setContactInfo("")
//     setHireErrorMessage("")
//     setHireSuccessMessage("")
//   }

//   const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const value = Number(e.target.value)
//     setHourlyRate(value)

//     if (value < 1500 || value > 3000) {
//       setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
//     } else {
//       setHireErrorMessage("")
//     }
//   }

//   const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault()

//     if (hourlyRate < 1500 || hourlyRate > 3000) {
//       setHireErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
//       return
//     }

//     if (!auth.currentUser) {
//       setHireErrorMessage("You must be logged in to hire a tutor.")
//       return
//     }

//     if (!selectedTutor) {
//       setHireErrorMessage("No tutor selected.")
//       return
//     }

//     setHireLoading(true)

//     const hireData = {
//       jobTitle,
//       hourlyRate: `${hourlyRate}`,
//       hoursDaily: `${hoursDaily}`,
//       studyLevel,
//       sessionsPerWeek: `${sessionsPerWeek}`,
//       jobDescription,
//       skillsRequired,
//       location,
//       contactInfo,
//       created_at: new Date(),
//       status: "pending",
//       tutor_id: selectedTutor.id,
//       tutorName: selectedTutor.fullName,
//       totalBill,
//     }

//     try {
//       // Update the parent's document with the new hire data
//       const parentRef = doc(db, "parents", auth.currentUser.uid)
//       const hireId = `hire_${Date.now()}` // Generate a unique ID for this hire

//       await updateDoc(parentRef, {
//         [`hires.${hireId}`]: hireData,
//       })

//       setHireSuccessMessage("Your hire request has been sent successfully!")
//       setTimeout(() => {
//         handleCloseHireForm()
//       }, 2000)
//     } catch (error) {
//       console.error("Error hiring tutor: ", error)
//       setHireErrorMessage("There was an error processing your request. Please try again.")
//     } finally {
//       setHireLoading(false)
//     }
//   }

//   // Navigate to profile page to upload profile picture
//   const handleProfilePictureClick = () => {
//     navigate("/parent-profile")
//   }

//   // Create a Cloudinary image object if profilePicture exists
//   const profileImage = profilePicture
//     ? cld
//       .image(profilePicture.includes("/") ? profilePicture.split("/").pop()?.split(".")[0] || "" : profilePicture)
//       .format("auto")
//       .quality("auto")
//       .resize(fill().gravity(autoGravity()).width(40).height(40))
//     : null

//   return (
//     <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
//       <StyledAppBar position="sticky" elevation={0}>
//         <Container maxWidth="xl">
//           <Toolbar disableGutters>
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
//               Kopa360
//             </Typography>
//             <Box sx={{ display: "flex", alignItems: "center" }}>
//               <SearchTextField
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 variant="outlined"
//                 size="small"
//                 sx={{ mr: 2, width: { xs: 120, sm: 200 } }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon sx={{ color: "text.secondary" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Tooltip title="Notifications">
//                 <IconButton color="inherit">
//                   <Badge badgeContent={notifications} color="error">
//                     <Notifications sx={{ color: "text.secondary" }} />
//                   </Badge>
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Settings">
//                 <IconButton color="inherit">
//                   <Settings sx={{ color: "text.secondary" }} />
//                 </IconButton>
//               </Tooltip>
//               {/* Profile Picture with Menu */}
//               <ProfileAvatarWrapper>
//                 <IconButton
//                   size="large"
//                   aria-label="account of current user"
//                   aria-controls="menu-appbar"
//                   aria-haspopup="true"
//                   onClick={handleMenu}
//                   color="inherit"
//                 >
//                   {profileImage ? (
//                     <Avatar sx={{ width: 40, height: 40 }}>
//                       <AdvancedImage
//                         cldImg={profileImage}
//                         style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                       />
//                     </Avatar>
//                   ) : (
//                     <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
//                       <AccountCircle />
//                     </Avatar>
//                   )}
//                 </IconButton>
//                 <UploadIconButton className="upload-icon" size="small" onClick={handleProfilePictureClick}>
//                   <PhotoCamera fontSize="small" />
//                 </UploadIconButton>
//               </ProfileAvatarWrapper>
//               <Menu
//                 id="menu-appbar"
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "right",
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: "top",
//                   horizontal: "right",
//                 }}
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//               >
//                 <MenuItem onClick={handleClose} component={Link} to="/parent-profile">
//                   Profile
//                 </MenuItem>
//                 <MenuItem onClick={handleClose}>My account</MenuItem>
//                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
//               </Menu>
//             </Box>
//           </Toolbar>
//         </Container>
//       </StyledAppBar>

//       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
//             Welcome back, <span style={{ color: theme.palette.primary.main }}>{firstName}</span>
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Stay updated on your latest tutoring job posts
//           </Typography>
//         </Box>

//         {/* Navigation */}
//         <Paper sx={{ mb: 4, p: 2, borderRadius: theme.shape.borderRadius * 2 }} elevation={0}>
//           <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
//             {navItems.map((item) => (
//               <Button
//                 key={item.text}
//                 startIcon={item.icon}
//                 color={item.active ? "primary" : "inherit"}
//                 sx={{
//                   mr: 2,
//                   mb: { xs: 1, md: 0 },
//                   borderRadius: theme.shape.borderRadius * 5,
//                   textTransform: "none",
//                   fontWeight: 600,
//                 }}
//               >
//                 {item.text}
//               </Button>
//             ))}
//             <MuiButton
//               variant="contained"
//               color="primary"
//               href="/job-form"
//               startIcon={<PostAdd />}
//               sx={{
//                 borderRadius: theme.shape.borderRadius * 5,
//                 textTransform: "none",
//                 fontWeight: 600,
//               }}
//             >
//               Post a Job
//             </MuiButton>
//           </Box>
//         </Paper>

//         {/* Stats Cards */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
//             Overview
//           </Typography>
//           <Grid container spacing={3}>
//             {statsCards.map((card, index) => (
//               <Grid item xs={12} sm={6} md={3} key={index}>
//                 <motion.div
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <StyledCard elevation={0} sx={{ bgcolor: alpha(card.color, 0.1) }}>
//                     <CardContent>
//                       <Box display="flex" justifyContent="space-between" alignItems="center">
//                         <Box>
//                           <Typography color="text.secondary" gutterBottom variant="body2">
//                             {card.title}
//                           </Typography>
//                           <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
//                             {card.value}
//                           </Typography>
//                         </Box>
//                         <Avatar
//                           sx={{
//                             bgcolor: alpha(card.color, 0.2),
//                             color: card.color,
//                           }}
//                         >
//                           {card.icon}
//                         </Avatar>
//                       </Box>
//                     </CardContent>
//                   </StyledCard>
//                 </motion.div>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Tutors Section */}
//         <Box>
//           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
//             Available Tutors
//           </Typography>
//           <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
//             {["Recommended Tutors", "My Requests", "Upcoming Sessions"].map((tab) => (
//               <Button
//                 key={tab}
//                 variant={activeTab === tab ? "contained" : "outlined"}
//                 onClick={() => handleTabChange(tab)}
//                 sx={{
//                   borderRadius: theme.shape.borderRadius * 5,
//                   textTransform: "none",
//                   px: 3,
//                   py: 1,
//                   mb: { xs: 1, md: 0 },
//                   fontWeight: 600,
//                 }}
//               >
//                 {tab}
//               </Button>
//             ))}
//           </Box>

//           <AnimatePresence mode="wait">
//             {loading ? (
//               <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//                 <CircularProgress />
//               </Box>
//             ) : error ? (
//               <Typography color="error">{error}</Typography>
//             ) : filteredTutors?.length ? (
//               <Grid container spacing={3}>
//                 {filteredTutors.map((tutor) => {
//                   const job =
//                     activeTab === "My Requests"
//                       ? jobs.find((job) => job.appliedTutors?.includes(tutor.id))
//                       : activeTab === "Upcoming Sessions"
//                         ? jobs.find((job) => job.accepted_tutor_id?.id === tutor.id)
//                         : null
//                   return (
//                     <Grid item xs={12} md={6} key={tutor.id}>
//                       <motion.div
//                         initial={{ scale: 0.95, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         exit={{ scale: 0.95, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <StyledCard elevation={0}>
//                           <CardContent>
//                             <Box display="flex" justifyContent="space-between" mb={2}>
//                               <Typography variant="caption" color="text.secondary">
//                                 {formatLastActive(tutor.lastActive)}
//                               </Typography>
//                               <IconButton size="small">
//                                 <Bookmark sx={{ color: theme.palette.primary.main }} />
//                               </IconButton>
//                             </Box>
//                             <Typography variant="h6" mb={1} sx={{ fontWeight: 600, color: "text.primary" }}>
//                               {tutor.fullName || "Tutor Profile"}
//                             </Typography>
//                             {job && (
//                               <Box display="flex" gap={1} mb={2} alignItems="center">
//                                 <Typography variant="subtitle1" color="primary">
//                                   {job.jobTitle || "Job Title not provided"}
//                                 </Typography>
//                                 <Divider orientation="vertical" flexItem />
//                                 <Typography variant="body2" color="text.secondary">
//                                   {job.location || "Location not provided"}
//                                 </Typography>
//                               </Box>
//                             )}
//                             <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
//                               <Chip
//                                 label={`${tutor.yearsOfExperience} years experience`}
//                                 size="small"
//                                 sx={{
//                                   bgcolor: alpha(theme.palette.secondary.main, 0.1),
//                                   color: theme.palette.secondary.main,
//                                 }}
//                               />
//                             </Box>

//                             {/* Only show bio for tabs other than Upcoming Sessions */}
//                             {activeTab !== "Upcoming Sessions" && (
//                               <Typography
//                                 mb={2}
//                                 variant="body2"
//                                 color="text.secondary"
//                                 sx={{
//                                   display: "-webkit-box",
//                                   WebkitLineClamp: 3,
//                                   WebkitBoxOrient: "vertical",
//                                   overflow: "hidden",
//                                 }}
//                               >
//                                 {tutor.bio}
//                               </Typography>
//                             )}

//                             {/* Only show specializations for tabs other than Upcoming Sessions */}
//                             {activeTab !== "Upcoming Sessions" && (
//                               <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//                                 {tutor.specializations.map((skill, index) => (
//                                   <Chip
//                                     key={index}
//                                     label={skill}
//                                     size="small"
//                                     sx={{
//                                       bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                       color: theme.palette.primary.main,
//                                     }}
//                                   />
//                                 ))}
//                               </Box>
//                             )}

//                             {activeTab === "My Requests" && job && (
//                               <Box display="flex" gap={2} mt={2}>
//                                 <Button
//                                   variant="contained"
//                                   color="success"
//                                   onClick={() => handleAcceptTutor(job.id, tutor.id)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Accept
//                                 </Button>
//                                 <Button
//                                   variant="outlined"
//                                   color="error"
//                                   onClick={() => handleDeclineTutor(job.id, tutor.id)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Decline
//                                 </Button>
//                               </Box>
//                             )}

//                             {activeTab === "Recommended Tutors" && (
//                               <Box display="flex" gap={2} mt={2}>
//                                 <Button
//                                   variant="contained"
//                                   color="primary"
//                                   onClick={() => handleHireClick(tutor)}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Hire
//                                 </Button>
//                               </Box>
//                             )}
//                           </CardContent>
//                         </StyledCard>
//                       </motion.div>
//                     </Grid>
//                   )
//                 })}
//               </Grid>
//             ) : (
//               <Typography align="center" color="text.secondary">
//                 No tutors found for this category.
//               </Typography>
//             )}
//           </AnimatePresence>
//         </Box>
//       </Container>

//       {/* Confirmation dialog for accept/decline */}
//       <Dialog
//         open={confirmDialogOpen}
//         onClose={() => setConfirmDialogOpen(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Action</DialogTitle>
//         <DialogContent>
//           <Typography>
//             {confirmAction?.type === "accept"
//               ? "Are you sure you want to accept this tutor?"
//               : "Are you sure you want to decline this tutor?"}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => handleConfirmAction(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             No
//           </Button>
//           <Button
//             onClick={() => handleConfirmAction(true)}
//             variant="contained"
//             color={confirmAction?.type === "accept" ? "success" : "error"}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Yes
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Success message dialog */}
//       <Dialog
//         open={!!successMessage}
//         onClose={() => setSuccessMessage(null)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Success</DialogTitle>
//         <DialogContent>
//           <Typography>{successMessage}</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setSuccessMessage(null)}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Application confirmation dialog */}
//       <Dialog
//         open={!!confirmApplyJobId}
//         onClose={() => setConfirmApplyJobId(null)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Application</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to apply for this position?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => confirmApplication(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={() => confirmApplication(true)}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hire Confirmation Dialog */}
//       <Dialog
//         open={openHireConfirm}
//         onClose={() => setOpenHireConfirm(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: theme.shape.borderRadius * 2,
//             p: 2,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Hire</DialogTitle>
//         <DialogContent>
//           <DialogContentText>Are you sure you want to hire {selectedTutor?.fullName}?</DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setOpenHireConfirm(false)}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleHireConfirm}
//             variant="contained"
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             Yes, Continue
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hire Form Modal */}
//       <Modal
//         open={openHireForm}
//         onClose={handleCloseHireForm}
//         aria-labelledby="hire-form-modal"
//         aria-describedby="hire-form-description"
//       >
//         <Paper
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: { xs: "90%", sm: "80%", md: "70%" },
//             maxWidth: 800,
//             maxHeight: "90vh",
//             overflow: "auto",
//             p: 4,
//             borderRadius: theme.shape.borderRadius * 2,
//           }}
//         >
//           <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
//             Hire {selectedTutor?.fullName}
//           </Typography>

//           {hireSuccessMessage && (
//             <Alert severity="success" sx={{ mb: 2 }}>
//               <strong>{hireSuccessMessage}</strong>
//             </Alert>
//           )}

//           {hireErrorMessage && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               <strong>{hireErrorMessage}</strong>
//             </Alert>
//           )}

//           <form onSubmit={handleHireSubmit}>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Job Title"
//                   variant="outlined"
//                   placeholder="Home Tutor Needed for Basic Math"
//                   value={jobTitle}
//                   onChange={(e) => setJobTitle(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Hourly Rate (₦)"
//                   variant="outlined"
//                   type="number"
//                   placeholder="3000"
//                   value={hourlyRate}
//                   onChange={handleHourlyRateChange}
//                   InputProps={{
//                     startAdornment: <InputAdornment position="start">₦</InputAdornment>,
//                   }}
//                   inputProps={{
//                     min: 1500,
//                     max: 3000,
//                   }}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Sessions per Week"
//                   variant="outlined"
//                   type="number"
//                   placeholder="2"
//                   value={sessionsPerWeek}
//                   onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Hours Per Day"
//                   variant="outlined"
//                   type="number"
//                   placeholder="2"
//                   value={hoursDaily}
//                   onChange={(e) => setHoursDaily(Number(e.target.value))}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box sx={{ bgcolor: "info.light", p: 2, borderRadius: 1 }}>
//                   <Typography variant="subtitle1">Weekly Estimated Bill:</Typography>
//                   <Typography variant="h6">₦{totalBill.toLocaleString()}</Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={12}>
//                 <Select
//                   fullWidth
//                   label="Level of Study"
//                   value={studyLevel}
//                   onChange={(e) => setStudyLevel(e.target.value as string)}
//                   required
//                 >
//                   <MenuItem value="Beginner Level">Beginner Level</MenuItem>
//                   <MenuItem value="Intermediate Level">Intermediate Level</MenuItem>
//                   <MenuItem value="Advanced Level">Advanced Level</MenuItem>
//                 </Select>
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Job Description"
//                   variant="outlined"
//                   multiline
//                   rows={4}
//                   placeholder="Describe the job in detail"
//                   value={jobDescription}
//                   onChange={(e) => setJobDescription(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Skills Required"
//                   variant="outlined"
//                   placeholder="Mathematics, Patience"
//                   value={skillsRequired}
//                   onChange={(e) => setSkillsRequired(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Location"
//                   variant="outlined"
//                   placeholder="Benin City, Edo"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Contact Information"
//                   variant="outlined"
//                   placeholder="Phone number or Email"
//                   value={contactInfo}
//                   onChange={(e) => setContactInfo(e.target.value)}
//                   required
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   fullWidth
//                   size="large"
//                   disabled={hireLoading}
//                   startIcon={hireLoading && <CircularProgress size={20} color="inherit" />}
//                   sx={{
//                     borderRadius: theme.shape.borderRadius * 5,
//                     textTransform: "none",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {hireLoading ? "Processing..." : "Hire Tutor"}
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         </Paper>
//       </Modal>
//     </Box>
//   )
// }







// // import type React from "react"
// // import { useState, useEffect } from "react"
// // import { useNavigate } from "react-router-dom"
// // import {
// //   Box,
// //   Typography,
// //   TextField,
// //   Avatar,
// //   Button,
// //   Chip,
// //   Paper,
// //   InputAdornment,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   CircularProgress,
// //   Grid,
// //   Card,
// //   CardContent,
// //   IconButton,
// //   Tooltip,
// //   Badge,
// //   Divider,
// //   useTheme,
// //   AppBar,
// //   Toolbar,
// //   Menu,
// //   MenuItem,
// //   Container,
// // } from "@mui/material"
// // import { Button as MuiButton } from "@mui/material"
// // import {
// //   Dashboard as DashboardIcon,
// //   Description as ProjectsIcon,
// //   Receipt as InvoicesIcon,
// //   Assessment as ReportsIcon,
// //   Search as SearchIcon,
// //   Bookmark,
// //   Notifications,
// //   Settings,
// //   AccessTime,
// //   Star,
// //   TrendingDown,
// //   PostAdd,
// //   AccountCircle,
// // } from "@mui/icons-material"
// // import { motion, AnimatePresence } from "framer-motion"
// // import { styled, alpha } from "@mui/material/styles"
// // import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// // import { getAuth, signOut } from "firebase/auth"
// // import "bootstrap/dist/css/bootstrap.min.css"

// // interface Tutor {
// //   fullName: string
// //   id: string
// //   location: string
// //   hourly_rate: string
// //   yearsOfExperience: string
// //   bio: string
// //   specializations: string[]
// //   previousSchools: string[]
// // }

// // interface Job {
// //   id: string
// //   jobTitle: string
// //   location: string
// //   appliedTutors?: string[]
// //   accepted_tutor_id?: { id: string }
// // }

// // const StyledCard = styled(Card)(({ theme }) => ({
// //   transition: "transform 0.3s ease, box-shadow 0.3s ease",
// //   "&:hover": {
// //     transform: "translateY(-5px)",
// //     boxShadow: theme.shadows[8],
// //   },
// //   borderRadius: theme.shape.borderRadius * 2,
// // }))

// // const StyledAppBar = styled(AppBar)(({ theme }) => ({
// //   backgroundColor: alpha(theme.palette.background.paper, 0.8),
// //   backdropFilter: "blur(10px)",
// // }))

// // const SearchTextField = styled(TextField)(({ theme }) => ({
// //   "& .MuiOutlinedInput-root": {
// //     borderRadius: theme.shape.borderRadius * 5,
// //     backgroundColor: alpha(theme.palette.common.white, 0.15),
// //     "&:hover": {
// //       backgroundColor: alpha(theme.palette.common.white, 0.25),
// //     },
// //     "& fieldset": {
// //       borderColor: "transparent",
// //     },
// //     "&:hover fieldset": {
// //       borderColor: "transparent",
// //     },
// //     "&.Mui-focused fieldset": {
// //       borderColor: theme.palette.primary.main,
// //     },
// //   },
// // }))

// // export default function Dashboard() {
// //   const [firstName, setFirstName] = useState("")
// //   const [activeTab, setActiveTab] = useState("Recommended Tutors")
// //   const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
// //   const [myRequests, setMyRequests] = useState<Tutor[]>([])
// //   const [appointments, setAppointments] = useState<Tutor[]>([])
// //   const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
// //   const [jobs, setJobs] = useState<Job[]>([])
// //   const [searchQuery, setSearchQuery] = useState("")
// //   const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
// //   const [notifications] = useState(3)
// //   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
// //   const theme = useTheme()
// //   const auth = getAuth()
// //   const db = getFirestore()
// //   const navigate = useNavigate()

// //   // Stats cards data
// //   const [statsCards, setStatsCards] = useState([
// //     { title: "Total Spent", value: "N/A", icon: <TrendingDown />, color: theme.palette.error.main },
// //     { title: "Active Sessions", value: "N/A", icon: <AccessTime />, color: theme.palette.secondary.main },
// //     { title: "Tutor Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
// //     {
// //       title: "Jobs Posted",
// //       value: jobs.length.toString() || "N/A",
// //       icon: <PostAdd />,
// //       color: theme.palette.success.main,
// //     },
// //   ])

// //   const navItems = [
// //     { text: "Dashboard", icon: <DashboardIcon />, active: true },
// //     { text: "Payments", icon: <ProjectsIcon /> },
// //     { text: "Invoices", icon: <InvoicesIcon /> },
// //     { text: "Reports", icon: <ReportsIcon /> },
// //   ]

// //   useEffect(() => {
// //     const fetchUserData = async () => {
// //       const user = auth.currentUser
// //       if (user) {
// //         const userDoc = await getDoc(doc(db, "users", user.uid))
// //         if (userDoc.exists()) {
// //           const userData = userDoc.data()
// //           setFirstName(userData.firstName || "")
// //         }
// //       }
// //     }

// //     fetchUserData()
// //   }, [auth.currentUser, db])

// //   useEffect(() => {
// //     const fetchTutorsAndJobs = async () => {
// //       setLoading(true)
// //       try {
// //         // Fetch all tutors from Firestore
// //         const tutorsCollection = collection(db, "tutors")
// //         const tutorsSnapshot = await getDocs(tutorsCollection)
// //         const tutors = tutorsSnapshot.docs.map((doc) => {
// //           const tutorData = doc.data()
// //           return {
// //             id: doc.id,
// //             fullName: tutorData.personalInfo?.fullName || "N/A",
// //             location: `${tutorData.locationInfo?.state || "N/A"} - ${tutorData.locationInfo?.selectedLGA || "N/A"}`,
// //             hourly_rate: tutorData.experienceInfo?.hourly_rate || "N/A",
// //             yearsOfExperience: tutorData.experienceInfo?.yearsOfExperience || "N/A",
// //             bio: tutorData.bioInfo?.bio || "No bio available",
// //             specializations: tutorData.experienceInfo?.specializations || [],
// //             previousSchools: tutorData.experienceInfo?.previousSchools || [],
// //           }
// //         }) as Tutor[]

// //         console.log("Fetched Recommended Tutors:", tutors)
// //         setRecommendedTutors(tutors)

// //         // Fetch all jobs from Firestore
// //         const jobsCollection = collection(db, "jobs")
// //         const jobSnapshot = await getDocs(jobsCollection)
// //         const fetchedJobs: Job[] = jobSnapshot.docs.map((doc) => {
// //           const jobData = doc.data()
// //           return {
// //             id: doc.id,
// //             jobTitle: jobData.jobTitle || "N/A",
// //             location: jobData.location || "N/A",
// //             appliedTutors: jobData.appliedTutors || [],
// //             accepted_tutor_id: jobData.accepted_tutor_id || null,
// //           }
// //         })
// //         setJobs(fetchedJobs)

// //         // Extract tutor IDs from job data
// //         const appliedTutorIds = new Set<string>()
// //         const acceptedTutorIds = new Set<string>()

// //         fetchedJobs.forEach((job) => {
// //           job.appliedTutors?.forEach((tutorId) => appliedTutorIds.add(tutorId))
// //           if (job.accepted_tutor_id) acceptedTutorIds.add(job.accepted_tutor_id.id)
// //         })

// //         // Filter tutors for My Requests
// //         const appliedTutors = tutors.filter((tutor) => appliedTutorIds.has(tutor.id))
// //         console.log("Fetched My Requests:", appliedTutors)
// //         setMyRequests(appliedTutors)

// //         // Filter tutors for Upcoming Sessions
// //         const acceptedTutors = tutors.filter((tutor) => acceptedTutorIds.has(tutor.id))
// //         console.log("Fetched Upcoming Sessions:", acceptedTutors)
// //         setAppointments(acceptedTutors)

// //         // Default to Recommended Tutors
// //         setFilteredTutors(tutors)
// //       } catch (err) {
// //         console.error("Error fetching data:", err)
// //         setError("Failed to load data")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchTutorsAndJobs()
// //   }, [db])

// //   useEffect(() => {
// //     if (jobs.length > 0) {
// //       setStatsCards((prevCards) =>
// //         prevCards.map((card) => (card.title === "Jobs Posted" ? { ...card, value: jobs.length.toString() } : card)),
// //       )
// //     }
// //   }, [jobs])

// //   useEffect(() => {
// //     setStatsCards((prevCards) =>
// //       prevCards.map((card) =>
// //         card.title === "Active Sessions" ? { ...card, value: appointments.length.toString() } : card,
// //       ),
// //     )
// //   }, [appointments])

// //   const handleLogout = async () => {
// //     try {
// //       await signOut(auth)
// //       navigate("/login")
// //     } catch (error) {
// //       console.error("Logout failed:", error)
// //     }
// //   }

// //   const handleTabChange = (tab: string) => {
// //     setActiveTab(tab)
// //     if (tab === "Recommended Tutors") {
// //       setFilteredTutors(recommendedTutors)
// //     } else if (tab === "My Requests") {
// //       setFilteredTutors(myRequests)
// //     } else if (tab === "Upcoming Sessions") {
// //       setFilteredTutors(appointments)
// //     }
// //   }

// //   const handleAcceptTutor = async (jobId: string, tutorId: string) => {
// //     try {
// //       const jobRef = doc(db, "jobs", jobId)
// //       await updateDoc(jobRef, {
// //         accepted_tutor_id: { id: tutorId },
// //         appliedTutors: [],
// //       })

// //       setJobs((prevJobs) =>
// //         prevJobs.map((job) => (job.id === jobId ? { ...job, accepted_tutor_id: { id: tutorId } } : job)),
// //       )
// //       setAppointments((prevAppointments) => [
// //         ...prevAppointments,
// //         ...myRequests.filter((tutor) => tutor.id === tutorId),
// //       ])
// //       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
// //     } catch (err) {
// //       console.error("Error accepting tutor:", err)
// //     }
// //   }

// //   const handleDeclineTutor = async (jobId: string, tutorId: string) => {
// //     try {
// //       const jobRef = doc(db, "jobs", jobId)
// //       await updateDoc(jobRef, {
// //         appliedTutors: (prevAppliedTutors: string[]) => prevAppliedTutors.filter((id) => id !== tutorId),
// //       })

// //       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
// //     } catch (err) {
// //       console.error("Error declining tutor:", err)
// //     }
// //   }

// //   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
// //     setAnchorEl(event.currentTarget)
// //   }

// //   const handleClose = () => {
// //     setAnchorEl(null)
// //   }

// //   const confirmApplication = (confirmed: boolean) => {
// //     if (confirmed && confirmApplyJobId) {
// //       // Implement the logic for confirming the application
// //       console.log(`Application confirmed for job ID: ${confirmApplyJobId}`)
// //       // You might want to update the database or state here
// //     }
// //     setConfirmApplyJobId(null)
// //   }

// //   return (
// //     <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
// //       <StyledAppBar position="sticky" elevation={0}>
// //         <Container maxWidth="xl">
// //           <Toolbar disableGutters>
// //             <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
// //               Kopa360
// //             </Typography>
// //             <Box sx={{ display: "flex", alignItems: "center" }}>
// //               <SearchTextField
// //                 placeholder="Search..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 variant="outlined"
// //                 size="small"
// //                 sx={{ mr: 2, width: { xs: 120, sm: 200 } }}
// //                 InputProps={{
// //                   startAdornment: (
// //                     <InputAdornment position="start">
// //                       <SearchIcon sx={{ color: "text.secondary" }} />
// //                     </InputAdornment>
// //                   ),
// //                 }}
// //               />
// //               <Tooltip title="Notifications">
// //                 <IconButton color="inherit">
// //                   <Badge badgeContent={notifications} color="error">
// //                     <Notifications sx={{ color: "text.secondary" }} />
// //                   </Badge>
// //                 </IconButton>
// //               </Tooltip>
// //               <Tooltip title="Settings">
// //                 <IconButton color="inherit">
// //                   <Settings sx={{ color: "text.secondary" }} />
// //                 </IconButton>
// //               </Tooltip>
// //               <IconButton
// //                 size="large"
// //                 aria-label="account of current user"
// //                 aria-controls="menu-appbar"
// //                 aria-haspopup="true"
// //                 onClick={handleMenu}
// //                 color="inherit"
// //               >
// //                 <AccountCircle sx={{ color: "text.secondary" }} />
// //               </IconButton>
// //               <Menu
// //                 id="menu-appbar"
// //                 anchorEl={anchorEl}
// //                 anchorOrigin={{
// //                   vertical: "bottom",
// //                   horizontal: "right",
// //                 }}
// //                 keepMounted
// //                 transformOrigin={{
// //                   vertical: "top",
// //                   horizontal: "right",
// //                 }}
// //                 open={Boolean(anchorEl)}
// //                 onClose={handleClose}
// //               >
// //                 <MenuItem onClick={handleClose}>Profile</MenuItem>
// //                 <MenuItem onClick={handleClose}>My account</MenuItem>
// //                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
// //               </Menu>
// //             </Box>
// //           </Toolbar>
// //         </Container>
// //       </StyledAppBar>

// //       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
// //         <Box sx={{ mb: 4 }}>
// //           <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
// //             Welcome back, <span style={{ color: theme.palette.primary.main }}>{firstName}</span>
// //           </Typography>
// //           <Typography variant="body1" color="text.secondary">
// //             Stay updated on your latest tutoring job posts
// //           </Typography>
// //         </Box>

// //         {/* Navigation */}
// //         <Paper sx={{ mb: 4, p: 2, borderRadius: theme.shape.borderRadius * 2 }} elevation={0}>
// //           <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
// //             {navItems.map((item) => (
// //               <Button
// //                 key={item.text}
// //                 startIcon={item.icon}
// //                 color={item.active ? "primary" : "inherit"}
// //                 sx={{
// //                   mr: 2,
// //                   mb: { xs: 1, md: 0 },
// //                   borderRadius: theme.shape.borderRadius * 5,
// //                   textTransform: "none",
// //                   fontWeight: 600,
// //                 }}
// //               >
// //                 {item.text}
// //               </Button>
// //             ))}
// //             <MuiButton
// //               variant="contained"
// //               color="primary"
// //               href="/job-form"
// //               startIcon={<PostAdd />}
// //               sx={{
// //                 borderRadius: theme.shape.borderRadius * 5,
// //                 textTransform: "none",
// //                 fontWeight: 600,
// //               }}
// //             >
// //               Post a Job
// //             </MuiButton>
// //           </Box>
// //         </Paper>

// //         {/* Stats Cards */}
// //         <Box sx={{ mb: 4 }}>
// //           <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
// //             Overview
// //           </Typography>
// //           <Grid container spacing={3}>
// //             {statsCards.map((card, index) => (
// //               <Grid item xs={12} sm={6} md={3} key={index}>
// //                 <motion.div
// //                   initial={{ y: 20, opacity: 0 }}
// //                   animate={{ y: 0, opacity: 1 }}
// //                   transition={{ delay: index * 0.1 }}
// //                 >
// //                   <StyledCard elevation={0} sx={{ bgcolor: alpha(card.color, 0.1) }}>
// //                     <CardContent>
// //                       <Box display="flex" justifyContent="space-between" alignItems="center">
// //                         <Box>
// //                           <Typography color="text.secondary" gutterBottom variant="body2">
// //                             {card.title}
// //                           </Typography>
// //                           <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
// //                             {card.value}
// //                           </Typography>
// //                         </Box>
// //                         <Avatar
// //                           sx={{
// //                             bgcolor: alpha(card.color, 0.2),
// //                             color: card.color,
// //                           }}
// //                         >
// //                           {card.icon}
// //                         </Avatar>
// //                       </Box>
// //                     </CardContent>
// //                   </StyledCard>
// //                 </motion.div>
// //               </Grid>
// //             ))}
// //           </Grid>
// //         </Box>

// //         {/* Tutors Section */}
// //         <Box>
// //           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
// //             Available Tutors
// //           </Typography>
// //           <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
// //             {["Recommended Tutors", "My Requests", "Upcoming Sessions"].map((tab) => (
// //               <Button
// //                 key={tab}
// //                 variant={activeTab === tab ? "contained" : "outlined"}
// //                 onClick={() => handleTabChange(tab)}
// //                 sx={{
// //                   borderRadius: theme.shape.borderRadius * 5,
// //                   textTransform: "none",
// //                   px: 3,
// //                   py: 1,
// //                   mb: { xs: 1, md: 0 },
// //                   fontWeight: 600,
// //                 }}
// //               >
// //                 {tab}
// //               </Button>
// //             ))}
// //           </Box>

// //           <AnimatePresence mode="wait">
// //             {loading ? (
// //               <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
// //                 <CircularProgress />
// //               </Box>
// //             ) : error ? (
// //               <Typography color="error">{error}</Typography>
// //             ) : filteredTutors?.length ? (
// //               <Grid container spacing={3}>
// //                 {filteredTutors.map((tutor) => {
// //                   const job = activeTab === "My Requests" && jobs.find((job) => job.appliedTutors?.includes(tutor.id))
// //                   return (
// //                     <Grid item xs={12} md={6} key={tutor.id}>
// //                       <motion.div
// //                         initial={{ scale: 0.95, opacity: 0 }}
// //                         animate={{ scale: 1, opacity: 1 }}
// //                         exit={{ scale: 0.95, opacity: 0 }}
// //                         transition={{ duration: 0.3 }}
// //                       >
// //                         <StyledCard elevation={0}>
// //                           <CardContent>
// //                             <Box display="flex" justifyContent="space-between" mb={2}>
// //                               <Typography variant="caption" color="text.secondary">
// //                                 Last active 2 hours ago
// //                               </Typography>
// //                               <IconButton size="small">
// //                                 <Bookmark sx={{ color: theme.palette.primary.main }} />
// //                               </IconButton>
// //                             </Box>
// //                             <Typography variant="h6" mb={1} sx={{ fontWeight: 600, color: "text.primary" }}>
// //                               {tutor.fullName || "Tutor Profile"}
// //                             </Typography>
// //                             {job && (
// //                               <Box display="flex" gap={1} mb={2} alignItems="center">
// //                                 <Typography variant="subtitle1" color="primary">
// //                                   {job.jobTitle || "Job Title not provided"}
// //                                 </Typography>
// //                                 <Divider orientation="vertical" flexItem />
// //                                 <Typography variant="body2" color="text.secondary">
// //                                   {job.location || "Location not provided"}
// //                                 </Typography>
// //                               </Box>
// //                             )}
// //                             <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
// //                               <Chip
// //                                 label={`${tutor.yearsOfExperience} years experience`}
// //                                 size="small"
// //                                 sx={{
// //                                   bgcolor: alpha(theme.palette.secondary.main, 0.1),
// //                                   color: theme.palette.secondary.main,
// //                                 }}
// //                               />
// //                             </Box>
// //                             <Typography
// //                               mb={2}
// //                               variant="body2"
// //                               color="text.secondary"
// //                               sx={{
// //                                 display: "-webkit-box",
// //                                 WebkitLineClamp: 3,
// //                                 WebkitBoxOrient: "vertical",
// //                                 overflow: "hidden",
// //                               }}
// //                             >
// //                               {tutor.bio}
// //                             </Typography>
// //                             <Box display="flex" gap={1} mb={2} flexWrap="wrap">
// //                               {tutor.specializations.map((skill, index) => (
// //                                 <Chip
// //                                   key={index}
// //                                   label={skill}
// //                                   size="small"
// //                                   sx={{
// //                                     bgcolor: alpha(theme.palette.primary.main, 0.1),
// //                                     color: theme.palette.primary.main,
// //                                   }}
// //                                 />
// //                               ))}
// //                             </Box>
// //                             {activeTab === "My Requests" && job && (
// //                               <Box display="flex" gap={2} mt={2}>
// //                                 <Button
// //                                   variant="contained"
// //                                   color="success"
// //                                   onClick={() => handleAcceptTutor(job.id, tutor.id)}
// //                                   sx={{
// //                                     borderRadius: theme.shape.borderRadius * 5,
// //                                     textTransform: "none",
// //                                     fontWeight: 600,
// //                                   }}
// //                                 >
// //                                   Accept
// //                                 </Button>
// //                                 <Button
// //                                   variant="outlined"
// //                                   color="error"
// //                                   onClick={() => handleDeclineTutor(job.id, tutor.id)}
// //                                   sx={{
// //                                     borderRadius: theme.shape.borderRadius * 5,
// //                                     textTransform: "none",
// //                                     fontWeight: 600,
// //                                   }}
// //                                 >
// //                                   Decline
// //                                 </Button>
// //                               </Box>
// //                             )}
// //                           </CardContent>
// //                         </StyledCard>
// //                       </motion.div>
// //                     </Grid>
// //                   )
// //                 })}
// //               </Grid>
// //             ) : (
// //               <Typography align="center" color="text.secondary">
// //                 No tutors found for this category.
// //               </Typography>
// //             )}
// //           </AnimatePresence>
// //         </Box>
// //       </Container>

// //       {/* Application confirmation dialog */}
// //       <Dialog
// //         open={!!confirmApplyJobId}
// //         onClose={() => setConfirmApplyJobId(null)}
// //         PaperProps={{
// //           sx: {
// //             borderRadius: theme.shape.borderRadius * 2,
// //             p: 2,
// //           },
// //         }}
// //       >
// //         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Application</DialogTitle>
// //         <DialogContent>
// //           <Typography>Are you sure you want to apply for this position?</Typography>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button
// //             onClick={() => confirmApplication(false)}
// //             sx={{
// //               borderRadius: theme.shape.borderRadius * 5,
// //               textTransform: "none",
// //               fontWeight: 600,
// //             }}
// //           >
// //             Cancel
// //           </Button>
// //           <Button
// //             onClick={() => confirmApplication(true)}
// //             variant="contained"
// //             sx={{
// //               borderRadius: theme.shape.borderRadius * 5,
// //               textTransform: "none",
// //               fontWeight: 600,
// //             }}
// //           >
// //             Confirm
// //           </Button>
// //         </DialogActions>
// //       </Dialog>
// //     </Box>
// //   )
// // }










// // "use client"

// // import React, { useState, useEffect } from "react"
// // import { useNavigate } from "react-router-dom"
// // import {
// //   Box,
// //   Typography,
// //   TextField,
// //   Avatar,
// //   Button,
// //   Chip,
// //   Paper,
// //   InputAdornment,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   CircularProgress,
// //   Grid,
// //   Card,
// //   CardContent,
// //   IconButton,
// //   Tooltip,
// //   Badge,
// //   Divider,
// //   useTheme,
// //   AppBar,
// //   Toolbar,
// //   Menu,
// //   MenuItem,
// //   Container,
// // } from "@mui/material"
// // import { Button as MuiButton } from "@mui/material"
// // import {
// //   Dashboard as DashboardIcon,
// //   Description as ProjectsIcon,
// //   Receipt as InvoicesIcon,
// //   Assessment as ReportsIcon,
// //   Search as SearchIcon,
// //   Bookmark,
// //   Notifications,
// //   Settings,
// //   AccessTime,
// //   Star,
// //   TrendingDown,
// //   PostAdd,
// //   AccountCircle,
// // } from "@mui/icons-material"
// // import { motion, AnimatePresence } from "framer-motion"
// // import { styled, alpha } from "@mui/material/styles"
// // import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// // import { getAuth, signOut } from "firebase/auth"
// // import "bootstrap/dist/css/bootstrap.min.css"

// // interface Tutor {
// //   fullName: string
// //   id: string
// //   location: string
// //   hourly_rate: string
// //   yearsOfExperience: string
// //   bio: string
// //   specializations: string[]
// //   previousSchools: string[]
// // }

// // interface Job {
// //   id: string
// //   jobTitle: string
// //   location: string
// //   appliedTutors?: string[]
// //   accepted_tutor_id?: { id: string }
// // }

// // const StyledCard = styled(Card)(({ theme }) => ({
// //   transition: "transform 0.3s ease, box-shadow 0.3s ease",
// //   "&:hover": {
// //     transform: "translateY(-5px)",
// //     boxShadow: theme.shadows[8],
// //   },
// //   borderRadius: theme.shape.borderRadius * 2,
// // }))

// // const StyledAppBar = styled(AppBar)(({ theme }) => ({
// //   backgroundColor: alpha(theme.palette.background.paper, 0.8),
// //   backdropFilter: "blur(10px)",
// // }))

// // const SearchTextField = styled(TextField)(({ theme }) => ({
// //   "& .MuiOutlinedInput-root": {
// //     borderRadius: theme.shape.borderRadius * 5,
// //     backgroundColor: alpha(theme.palette.common.white, 0.15),
// //     "&:hover": {
// //       backgroundColor: alpha(theme.palette.common.white, 0.25),
// //     },
// //     "& fieldset": {
// //       borderColor: "transparent",
// //     },
// //     "&:hover fieldset": {
// //       borderColor: "transparent",
// //     },
// //     "&.Mui-focused fieldset": {
// //       borderColor: theme.palette.primary.main,
// //     },
// //   },
// // }))

// // export default function Dashboard() {
// //   const [firstName, setFirstName] = useState("")
// //   const [activeTab, setActiveTab] = useState("Recommended Tutors")
// //   const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
// //   const [myRequests, setMyRequests] = useState<Tutor[]>([])
// //   const [appointments, setAppointments] = useState<Tutor[]>([])
// //   const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
// //   const [jobs, setJobs] = useState<Job[]>([])
// //   const [searchQuery, setSearchQuery] = useState("")
// //   const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
// //   const [notifications] = useState(3)
// //   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
// //   const theme = useTheme()
// //   const auth = getAuth()
// //   const db = getFirestore()
// //   const navigate = useNavigate()

// //   // Stats cards data
// //   const statsCards = [
// //     { title: "Total Spent", value: "₦125,000", icon: <TrendingDown />, color: theme.palette.error.main },
// //     { title: "Active Sessions", value: "12", icon: <AccessTime />, color: theme.palette.secondary.main },
// //     { title: "Tutor Rating", value: "4.8", icon: <Star />, color: theme.palette.warning.main },
// //     { title: "Jobs Posted", value: "38", icon: <PostAdd />, color: theme.palette.success.main },
// //   ]

// //   const navItems = [
// //     { text: "Dashboard", icon: <DashboardIcon />, active: true },
// //     { text: "Payments", icon: <ProjectsIcon /> },
// //     { text: "Invoices", icon: <InvoicesIcon /> },
// //     { text: "Reports", icon: <ReportsIcon /> },
// //   ]

// //   useEffect(() => {
// //     const fetchUserData = async () => {
// //       const user = auth.currentUser
// //       if (user) {
// //         const userDoc = await getDoc(doc(db, "users", user.uid))
// //         if (userDoc.exists()) {
// //           const userData = userDoc.data()
// //           setFirstName(userData.firstName || "")
// //         }
// //       }
// //     }

// //     fetchUserData()
// //   }, [auth.currentUser, db])

// //   useEffect(() => {
// //     const fetchTutorsAndJobs = async () => {
// //       setLoading(true)
// //       try {
// //         // Fetch all tutors from Firestore
// //         const tutorsCollection = collection(db, "tutors")
// //         const tutorsSnapshot = await getDocs(tutorsCollection)
// //         const tutors = tutorsSnapshot.docs.map((doc) => {
// //           const tutorData = doc.data()
// //           return {
// //             id: doc.id,
// //             fullName: tutorData.personalInfo?.fullName || "N/A",
// //             location: `${tutorData.locationInfo?.state || "N/A"} - ${tutorData.locationInfo?.selectedLGA || "N/A"}`,
// //             hourly_rate: tutorData.experienceInfo?.hourly_rate || "N/A",
// //             yearsOfExperience: tutorData.experienceInfo?.yearsOfExperience || "N/A",
// //             bio: tutorData.bioInfo?.bio || "No bio available",
// //             specializations: tutorData.experienceInfo?.specializations || [],
// //             previousSchools: tutorData.experienceInfo?.previousSchools || [],
// //           }
// //         }) as Tutor[]

// //         console.log("Fetched Recommended Tutors:", tutors)
// //         setRecommendedTutors(tutors)

// //         // Fetch all jobs from Firestore
// //         const jobsCollection = collection(db, "jobs")
// //         const jobSnapshot = await getDocs(jobsCollection)
// //         const fetchedJobs: Job[] = jobSnapshot.docs.map((doc) => {
// //           const jobData = doc.data()
// //           return {
// //             id: doc.id,
// //             jobTitle: jobData.jobTitle || "N/A",
// //             location: jobData.location || "N/A",
// //             appliedTutors: jobData.appliedTutors || [],
// //             accepted_tutor_id: jobData.accepted_tutor_id || null,
// //           }
// //         })
// //         setJobs(fetchedJobs)

// //         // Extract tutor IDs from job data
// //         const appliedTutorIds = new Set<string>()
// //         const acceptedTutorIds = new Set<string>()

// //         fetchedJobs.forEach((job) => {
// //           job.appliedTutors?.forEach((tutorId) => appliedTutorIds.add(tutorId))
// //           if (job.accepted_tutor_id) acceptedTutorIds.add(job.accepted_tutor_id.id)
// //         })

// //         // Filter tutors for My Requests
// //         const appliedTutors = tutors.filter((tutor) => appliedTutorIds.has(tutor.id))
// //         console.log("Fetched My Requests:", appliedTutors)
// //         setMyRequests(appliedTutors)

// //         // Filter tutors for Upcoming Sessions
// //         const acceptedTutors = tutors.filter((tutor) => acceptedTutorIds.has(tutor.id))
// //         console.log("Fetched Upcoming Sessions:", acceptedTutors)
// //         setAppointments(acceptedTutors)

// //         // Default to Recommended Tutors
// //         setFilteredTutors(tutors)
// //       } catch (err) {
// //         console.error("Error fetching data:", err)
// //         setError("Failed to load data")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchTutorsAndJobs()
// //   }, [db])

// //   const handleLogout = async () => {
// //     try {
// //       await signOut(auth)
// //       navigate("/login")
// //     } catch (error) {
// //       console.error("Logout failed:", error)
// //     }
// //   }

// //   const handleTabChange = (tab: string) => {
// //     setActiveTab(tab)
// //     if (tab === "Recommended Tutors") {
// //       setFilteredTutors(recommendedTutors)
// //     } else if (tab === "My Requests") {
// //       setFilteredTutors(myRequests)
// //     } else if (tab === "Upcoming Sessions") {
// //       setFilteredTutors(appointments)
// //     }
// //   }

// //   const handleAcceptTutor = async (jobId: string, tutorId: string) => {
// //     try {
// //       const jobRef = doc(db, "jobs", jobId)
// //       await updateDoc(jobRef, {
// //         accepted_tutor_id: { id: tutorId },
// //         appliedTutors: [],
// //       })

// //       setJobs((prevJobs) =>
// //         prevJobs.map((job) => (job.id === jobId ? { ...job, accepted_tutor_id: { id: tutorId } } : job)),
// //       )
// //       setAppointments((prevAppointments) => [
// //         ...prevAppointments,
// //         ...myRequests.filter((tutor) => tutor.id === tutorId),
// //       ])
// //       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
// //     } catch (err) {
// //       console.error("Error accepting tutor:", err)
// //     }
// //   }

// //   const handleDeclineTutor = async (jobId: string, tutorId: string) => {
// //     try {
// //       const jobRef = doc(db, "jobs", jobId)
// //       await updateDoc(jobRef, {
// //         appliedTutors: (prevAppliedTutors: string[]) => prevAppliedTutors.filter((id) => id !== tutorId),
// //       })

// //       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
// //     } catch (err) {
// //       console.error("Error declining tutor:", err)
// //     }
// //   }

// //   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
// //     setAnchorEl(event.currentTarget)
// //   }

// //   const handleClose = () => {
// //     setAnchorEl(null)
// //   }

// //   const confirmApplication = (confirmed: boolean) => {
// //     if (confirmed && confirmApplyJobId) {
// //       // Implement the logic for confirming the application
// //       console.log(`Application confirmed for job ID: ${confirmApplyJobId}`)
// //       // You might want to update the database or state here
// //     }
// //     setConfirmApplyJobId(null)
// //   }

// //   return (
// //     <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
// //       <StyledAppBar position="sticky" elevation={0}>
// //         <Container maxWidth="xl">
// //           <Toolbar disableGutters>
// //             <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
// //               Kopa360
// //             </Typography>
// //             <Box sx={{ display: "flex", alignItems: "center" }}>
// //               <SearchTextField
// //                 placeholder="Search..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 variant="outlined"
// //                 size="small"
// //                 sx={{ mr: 2, width: { xs: 120, sm: 200 } }}
// //                 InputProps={{
// //                   startAdornment: (
// //                     <InputAdornment position="start">
// //                       <SearchIcon sx={{ color: "text.secondary" }} />
// //                     </InputAdornment>
// //                   ),
// //                 }}
// //               />
// //               <Tooltip title="Notifications">
// //                 <IconButton color="inherit">
// //                   <Badge badgeContent={notifications} color="error">
// //                     <Notifications sx={{ color: "text.secondary" }} />
// //                   </Badge>
// //                 </IconButton>
// //               </Tooltip>
// //               <Tooltip title="Settings">
// //                 <IconButton color="inherit">
// //                   <Settings sx={{ color: "text.secondary" }} />
// //                 </IconButton>
// //               </Tooltip>
// //               <IconButton
// //                 size="large"
// //                 aria-label="account of current user"
// //                 aria-controls="menu-appbar"
// //                 aria-haspopup="true"
// //                 onClick={handleMenu}
// //                 color="inherit"
// //               >
// //                 <AccountCircle sx={{ color: "text.secondary" }} />
// //               </IconButton>
// //               <Menu
// //                 id="menu-appbar"
// //                 anchorEl={anchorEl}
// //                 anchorOrigin={{
// //                   vertical: "bottom",
// //                   horizontal: "right",
// //                 }}
// //                 keepMounted
// //                 transformOrigin={{
// //                   vertical: "top",
// //                   horizontal: "right",
// //                 }}
// //                 open={Boolean(anchorEl)}
// //                 onClose={handleClose}
// //               >
// //                 <MenuItem onClick={handleClose}>Profile</MenuItem>
// //                 <MenuItem onClick={handleClose}>My account</MenuItem>
// //                 <MenuItem onClick={handleLogout}>Logout</MenuItem>
// //               </Menu>
// //             </Box>
// //           </Toolbar>
// //         </Container>
// //       </StyledAppBar>

// //       <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
// //         <Box sx={{ mb: 4 }}>
// //           <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
// //             Welcome back, <span style={{ color: theme.palette.primary.main }}>{firstName}</span>
// //           </Typography>
// //           <Typography variant="body1" color="text.secondary">
// //             Stay updated on your latest tutoring job posts
// //           </Typography>
// //         </Box>

// //         {/* Navigation */}
// //         <Paper sx={{ mb: 4, p: 2, borderRadius: theme.shape.borderRadius * 2 }} elevation={0}>
// //           <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
// //             {navItems.map((item) => (
// //               <Button
// //                 key={item.text}
// //                 startIcon={item.icon}
// //                 color={item.active ? "primary" : "inherit"}
// //                 sx={{
// //                   mr: 2,
// //                   mb: { xs: 1, md: 0 },
// //                   borderRadius: theme.shape.borderRadius * 5,
// //                   textTransform: "none",
// //                   fontWeight: 600,
// //                 }}
// //               >
// //                 {item.text}
// //               </Button>
// //             ))}
// //             <MuiButton
// //               variant="contained"
// //               color="primary"
// //               href="/job-form"
// //               startIcon={<PostAdd />}
// //               sx={{
// //                 borderRadius: theme.shape.borderRadius * 5,
// //                 textTransform: "none",
// //                 fontWeight: 600,
// //               }}
// //             >
// //               Post a Job
// //             </MuiButton>
// //           </Box>
// //         </Paper>

// //         {/* Stats Cards */}
// //         <Box sx={{ mb: 4 }}>
// //           <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
// //             Overview
// //           </Typography>
// //           <Grid container spacing={3}>
// //             {statsCards.map((card, index) => (
// //               <Grid item xs={12} sm={6} md={3} key={index}>
// //                 <motion.div
// //                   initial={{ y: 20, opacity: 0 }}
// //                   animate={{ y: 0, opacity: 1 }}
// //                   transition={{ delay: index * 0.1 }}
// //                 >
// //                   <StyledCard elevation={0} sx={{ bgcolor: alpha(card.color, 0.1) }}>
// //                     <CardContent>
// //                       <Box display="flex" justifyContent="space-between" alignItems="center">
// //                         <Box>
// //                           <Typography color="text.secondary" gutterBottom variant="body2">
// //                             {card.title}
// //                           </Typography>
// //                           <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
// //                             {card.value}
// //                           </Typography>
// //                         </Box>
// //                         <Avatar
// //                           sx={{
// //                             bgcolor: alpha(card.color, 0.2),
// //                             color: card.color,
// //                           }}
// //                         >
// //                           {card.icon}
// //                         </Avatar>
// //                       </Box>
// //                     </CardContent>
// //                   </StyledCard>
// //                 </motion.div>
// //               </Grid>
// //             ))}
// //           </Grid>
// //         </Box>

// //         {/* Tutors Section */}
// //         <Box>
// //           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
// //             Available Tutors
// //           </Typography>
// //           <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
// //             {["Recommended Tutors", "My Requests", "Upcoming Sessions"].map((tab) => (
// //               <Button
// //                 key={tab}
// //                 variant={activeTab === tab ? "contained" : "outlined"}
// //                 onClick={() => handleTabChange(tab)}
// //                 sx={{
// //                   borderRadius: theme.shape.borderRadius * 5,
// //                   textTransform: "none",
// //                   px: 3,
// //                   py: 1,
// //                   mb: { xs: 1, md: 0 },
// //                   fontWeight: 600,
// //                 }}
// //               >
// //                 {tab}
// //               </Button>
// //             ))}
// //           </Box>

// //           <AnimatePresence mode="wait">
// //             {loading ? (
// //               <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
// //                 <CircularProgress />
// //               </Box>
// //             ) : error ? (
// //               <Typography color="error">{error}</Typography>
// //             ) : filteredTutors?.length ? (
// //               <Grid container spacing={3}>
// //                 {filteredTutors.map((tutor) => {
// //                   const job = activeTab === "My Requests" && jobs.find((job) => job.appliedTutors?.includes(tutor.id))
// //                   return (
// //                     <Grid item xs={12} md={6} key={tutor.id}>
// //                       <motion.div
// //                         initial={{ scale: 0.95, opacity: 0 }}
// //                         animate={{ scale: 1, opacity: 1 }}
// //                         exit={{ scale: 0.95, opacity: 0 }}
// //                         transition={{ duration: 0.3 }}
// //                       >
// //                         <StyledCard elevation={0}>
// //                           <CardContent>
// //                             <Box display="flex" justifyContent="space-between" mb={2}>
// //                               <Typography variant="caption" color="text.secondary">
// //                                 Last active 2 hours ago
// //                               </Typography>
// //                               <IconButton size="small">
// //                                 <Bookmark sx={{ color: theme.palette.primary.main }} />
// //                               </IconButton>
// //                             </Box>
// //                             <Typography variant="h6" mb={1} sx={{ fontWeight: 600, color: "text.primary" }}>
// //                               {tutor.fullName || "Tutor Profile"}
// //                             </Typography>
// //                             {job && (
// //                               <Box display="flex" gap={1} mb={2} alignItems="center">
// //                                 <Typography variant="subtitle1" color="primary">
// //                                   {job.jobTitle || "Job Title not provided"}
// //                                 </Typography>
// //                                 <Divider orientation="vertical" flexItem />
// //                                 <Typography variant="body2" color="text.secondary">
// //                                   {job.location || "Location not provided"}
// //                                 </Typography>
// //                               </Box>
// //                             )}
// //                             <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
// //                               <Chip
// //                                 label={`${tutor.yearsOfExperience} years experience`}
// //                                 size="small"
// //                                 sx={{
// //                                   bgcolor: alpha(theme.palette.secondary.main, 0.1),
// //                                   color: theme.palette.secondary.main,
// //                                 }}
// //                               />
// //                             </Box>
// //                             <Typography
// //                               mb={2}
// //                               variant="body2"
// //                               color="text.secondary"
// //                               sx={{
// //                                 display: "-webkit-box",
// //                                 WebkitLineClamp: 3,
// //                                 WebkitBoxOrient: "vertical",
// //                                 overflow: "hidden",
// //                               }}
// //                             >
// //                               {tutor.bio}
// //                             </Typography>
// //                             <Box display="flex" gap={1} mb={2} flexWrap="wrap">
// //                               {tutor.specializations.map((skill, index) => (
// //                                 <Chip
// //                                   key={index}
// //                                   label={skill}
// //                                   size="small"
// //                                   sx={{
// //                                     bgcolor: alpha(theme.palette.primary.main, 0.1),
// //                                     color: theme.palette.primary.main,
// //                                   }}
// //                                 />
// //                               ))}
// //                             </Box>
// //                             {activeTab === "My Requests" && job && (
// //                               <Box display="flex" gap={2} mt={2}>
// //                                 <Button
// //                                   variant="contained"
// //                                   color="success"
// //                                   onClick={() => handleAcceptTutor(job.id, tutor.id)}
// //                                   sx={{
// //                                     borderRadius: theme.shape.borderRadius * 5,
// //                                     textTransform: "none",
// //                                     fontWeight: 600,
// //                                   }}
// //                                 >
// //                                   Accept
// //                                 </Button>
// //                                 <Button
// //                                   variant="outlined"
// //                                   color="error"
// //                                   onClick={() => handleDeclineTutor(job.id, tutor.id)}
// //                                   sx={{
// //                                     borderRadius: theme.shape.borderRadius * 5,
// //                                     textTransform: "none",
// //                                     fontWeight: 600,
// //                                   }}
// //                                 >
// //                                   Decline
// //                                 </Button>
// //                               </Box>
// //                             )}
// //                           </CardContent>
// //                         </StyledCard>
// //                       </motion.div>
// //                     </Grid>
// //                   )
// //                 })}
// //               </Grid>
// //             ) : (
// //               <Typography align="center" color="text.secondary">
// //                 No tutors found for this category.
// //               </Typography>
// //             )}
// //           </AnimatePresence>
// //         </Box>
// //       </Container>

// //       {/* Application confirmation dialog */}
// //       <Dialog
// //         open={!!confirmApplyJobId}
// //         onClose={() => setConfirmApplyJobId(null)}
// //         PaperProps={{
// //           sx: {
// //             borderRadius: theme.shape.borderRadius * 2,
// //             p: 2,
// //           },
// //         }}
// //       >
// //         <DialogTitle sx={{ fontWeight: 600 }}>Confirm Application</DialogTitle>
// //         <DialogContent>
// //           <Typography>Are you sure you want to apply for this position?</Typography>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button
// //             onClick={() => confirmApplication(false)}
// //             sx={{
// //               borderRadius: theme.shape.borderRadius * 5,
// //               textTransform: "none",
// //               fontWeight: 600,
// //             }}
// //           >
// //             Cancel
// //           </Button>
// //           <Button
// //             onClick={() => confirmApplication(true)}
// //             variant="contained"
// //             sx={{
// //               borderRadius: theme.shape.borderRadius * 5,
// //               textTransform: "none",
// //               fontWeight: 600,
// //             }}
// //           >
// //             Confirm
// //           </Button>
// //         </DialogActions>
// //       </Dialog>
// //     </Box>
// //   )
// // }
