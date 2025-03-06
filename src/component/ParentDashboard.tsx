"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
} from "@mui/material"
import { Button as MuiButton } from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Description as ProjectsIcon,
  Receipt as InvoicesIcon,
  Assessment as ReportsIcon,
  Search as SearchIcon,
  Bookmark,
  Notifications,
  Settings,
  AccessTime,
  Star,
  TrendingDown,
  PostAdd,
  AccountCircle,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { styled, alpha } from "@mui/material/styles"
import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
import { getAuth, signOut } from "firebase/auth"
import "bootstrap/dist/css/bootstrap.min.css"

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
}

interface Job {
  id: string
  jobTitle: string
  location: string
  appliedTutors?: string[]
  accepted_tutor_id?: { id: string }
}

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

const SearchTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 5,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}))

export default function Dashboard() {
  const [firstName, setFirstName] = useState("")
  const [activeTab, setActiveTab] = useState("Recommended Tutors")
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([])
  const [myRequests, setMyRequests] = useState<Tutor[]>([])
  const [appointments, setAppointments] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
  const [notifications] = useState(3)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const auth = getAuth()
  const db = getFirestore()
  const navigate = useNavigate()

  const [openHireConfirm, setOpenHireConfirm] = useState<boolean>(false)
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [openHireForm, setOpenHireForm] = useState<boolean>(false)
  const [jobTitle, setJobTitle] = useState<string>("")
  const [hourlyRate, setHourlyRate] = useState<number>(1500)
  const [studyLevel, setStudyLevel] = useState<string>("Beginner Level")
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(2)
  const [jobDescription, setJobDescription] = useState<string>("")
  const [skillsRequired, setSkillsRequired] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [contactInfo, setContactInfo] = useState<string>("")
  const [hireErrorMessage, setHireErrorMessage] = useState<string>("")
  const [hireSuccessMessage, setHireSuccessMessage] = useState<string>("")
  const [hireLoading, setHireLoading] = useState<boolean>(false)
  const [hoursDaily, setHoursDaily] = useState<number>(2)
  const [totalBill, setTotalBill] = useState(0)

  // Stats cards data
  const [statsCards, setStatsCards] = useState([
    { title: "Total Spent", value: "N/A", icon: <TrendingDown />, color: theme.palette.error.main },
    { title: "Active Sessions", value: "N/A", icon: <AccessTime />, color: theme.palette.secondary.main },
    { title: "Tutor Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
    {
      title: "Jobs Posted",
      value: jobs.length.toString() || "N/A",
      icon: <PostAdd />,
      color: theme.palette.success.main,
    },
  ])

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, active: true },
    { text: "Payments", icon: <ProjectsIcon /> },
    { text: "Invoices", icon: <InvoicesIcon /> },
    { text: "Reports", icon: <ReportsIcon /> },
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
          }
        }) as Tutor[]

        console.log("Fetched Recommended Tutors:", tutors)
        setRecommendedTutors(tutors)

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

  useEffect(() => {
    const calculatedTotal = hourlyRate * hoursDaily * sessionsPerWeek
    setTotalBill(calculatedTotal)
  }, [hourlyRate, hoursDaily, sessionsPerWeek])

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
      setFilteredTutors(recommendedTutors)
    } else if (tab === "My Requests") {
      setFilteredTutors(myRequests)
    } else if (tab === "Upcoming Sessions") {
      setFilteredTutors(appointments)
    }
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

          // Find the job to get its ID
          // const job = jobs.find((job) => job.id === confirmAction.jobId)

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
    setHoursDaily(2)
    setStudyLevel("Beginner Level")
    setSessionsPerWeek(2)
    setJobDescription("")
    setSkillsRequired("")
    setLocation("")
    setContactInfo("")
    setHireErrorMessage("")
    setHireSuccessMessage("")
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

  const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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

    setHireLoading(true)

    const hireData = {
      jobTitle,
      hourlyRate: `${hourlyRate}`,
      hoursDaily: `${hoursDaily}`,
      studyLevel,
      sessionsPerWeek: `${sessionsPerWeek}`,
      jobDescription,
      skillsRequired,
      location,
      contactInfo,
      created_at: new Date(),
      status: "pending",
      tutor_id: selectedTutor.id,
      tutorName: selectedTutor.fullName,
      totalBill,
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
    }
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
      <StyledAppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
              Kopa360
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SearchTextField
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 2, width: { xs: 120, sm: 200 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
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
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle sx={{ color: "text.secondary" }} />
              </IconButton>
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
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

        {/* Tutors Section */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
            Available Tutors
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {["Recommended Tutors", "My Requests", "Upcoming Sessions"].map((tab) => (
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
            ) : filteredTutors?.length ? (
              <Grid container spacing={3}>
                {filteredTutors.map((tutor) => {
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
                            <Typography variant="h6" mb={1} sx={{ fontWeight: 600, color: "text.primary" }}>
                              {tutor.fullName || "Tutor Profile"}
                            </Typography>
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
                            </Box>

                            {/* Only show bio for tabs other than Upcoming Sessions */}
                            {activeTab !== "Upcoming Sessions" && (
                              <Typography
                                mb={2}
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {tutor.bio}
                              </Typography>
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

          <form onSubmit={handleHireSubmit}>
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
                  label="Hourly Rate (₦)"
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
                  label="Sessions per Week"
                  variant="outlined"
                  type="number"
                  placeholder="2"
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hours Per Day"
                  variant="outlined"
                  type="number"
                  placeholder="2"
                  value={hoursDaily}
                  onChange={(e) => setHoursDaily(Number(e.target.value))}
                  required
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
                  label="Level of Study"
                  value={studyLevel}
                  onChange={(e) => setStudyLevel(e.target.value as string)}
                  required
                >
                  <MenuItem value="Beginner Level">Beginner Level</MenuItem>
                  <MenuItem value="Intermediate Level">Intermediate Level</MenuItem>
                  <MenuItem value="Advanced Level">Advanced Level</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="Describe the job in detail"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills Required"
                  variant="outlined"
                  placeholder="Mathematics, Patience"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  variant="outlined"
                  placeholder="Benin City, Edo"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Information"
                  variant="outlined"
                  placeholder="Phone number or Email"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={hireLoading}
                  startIcon={hireLoading && <CircularProgress size={20} color="inherit" />}
                  sx={{
                    borderRadius: theme.shape.borderRadius * 5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {hireLoading ? "Processing..." : "Hire Tutor"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Modal>
    </Box>
  )
}







// import type React from "react"
// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
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
// } from "@mui/icons-material"
// import { motion, AnimatePresence } from "framer-motion"
// import { styled, alpha } from "@mui/material/styles"
// import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// import { getAuth, signOut } from "firebase/auth"
// import "bootstrap/dist/css/bootstrap.min.css"

// interface Tutor {
//   fullName: string
//   id: string
//   location: string
//   hourly_rate: string
//   yearsOfExperience: string
//   bio: string
//   specializations: string[]
//   previousSchools: string[]
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

// export default function Dashboard() {
//   const [firstName, setFirstName] = useState("")
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

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = auth.currentUser
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid))
//         if (userDoc.exists()) {
//           const userData = userDoc.data()
//           setFirstName(userData.firstName || "")
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

//   const handleAcceptTutor = async (jobId: string, tutorId: string) => {
//     try {
//       const jobRef = doc(db, "jobs", jobId)
//       await updateDoc(jobRef, {
//         accepted_tutor_id: { id: tutorId },
//         appliedTutors: [],
//       })

//       setJobs((prevJobs) =>
//         prevJobs.map((job) => (job.id === jobId ? { ...job, accepted_tutor_id: { id: tutorId } } : job)),
//       )
//       setAppointments((prevAppointments) => [
//         ...prevAppointments,
//         ...myRequests.filter((tutor) => tutor.id === tutorId),
//       ])
//       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
//     } catch (err) {
//       console.error("Error accepting tutor:", err)
//     }
//   }

//   const handleDeclineTutor = async (jobId: string, tutorId: string) => {
//     try {
//       const jobRef = doc(db, "jobs", jobId)
//       await updateDoc(jobRef, {
//         appliedTutors: (prevAppliedTutors: string[]) => prevAppliedTutors.filter((id) => id !== tutorId),
//       })

//       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
//     } catch (err) {
//       console.error("Error declining tutor:", err)
//     }
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
//               <IconButton
//                 size="large"
//                 aria-label="account of current user"
//                 aria-controls="menu-appbar"
//                 aria-haspopup="true"
//                 onClick={handleMenu}
//                 color="inherit"
//               >
//                 <AccountCircle sx={{ color: "text.secondary" }} />
//               </IconButton>
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
//                 <MenuItem onClick={handleClose}>Profile</MenuItem>
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
//                   const job = activeTab === "My Requests" && jobs.find((job) => job.appliedTutors?.includes(tutor.id))
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
//                                 Last active 2 hours ago
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
//                             <Typography
//                               mb={2}
//                               variant="body2"
//                               color="text.secondary"
//                               sx={{
//                                 display: "-webkit-box",
//                                 WebkitLineClamp: 3,
//                                 WebkitBoxOrient: "vertical",
//                                 overflow: "hidden",
//                               }}
//                             >
//                               {tutor.bio}
//                             </Typography>
//                             <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//                               {tutor.specializations.map((skill, index) => (
//                                 <Chip
//                                   key={index}
//                                   label={skill}
//                                   size="small"
//                                   sx={{
//                                     bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                     color: theme.palette.primary.main,
//                                   }}
//                                 />
//                               ))}
//                             </Box>
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
//     </Box>
//   )
// }










// "use client"

// import React, { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
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
// } from "@mui/icons-material"
// import { motion, AnimatePresence } from "framer-motion"
// import { styled, alpha } from "@mui/material/styles"
// import { collection, getDocs, getDoc, doc, updateDoc, getFirestore } from "firebase/firestore"
// import { getAuth, signOut } from "firebase/auth"
// import "bootstrap/dist/css/bootstrap.min.css"

// interface Tutor {
//   fullName: string
//   id: string
//   location: string
//   hourly_rate: string
//   yearsOfExperience: string
//   bio: string
//   specializations: string[]
//   previousSchools: string[]
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

// export default function Dashboard() {
//   const [firstName, setFirstName] = useState("")
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

//   // Stats cards data
//   const statsCards = [
//     { title: "Total Spent", value: "₦125,000", icon: <TrendingDown />, color: theme.palette.error.main },
//     { title: "Active Sessions", value: "12", icon: <AccessTime />, color: theme.palette.secondary.main },
//     { title: "Tutor Rating", value: "4.8", icon: <Star />, color: theme.palette.warning.main },
//     { title: "Jobs Posted", value: "38", icon: <PostAdd />, color: theme.palette.success.main },
//   ]

//   const navItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, active: true },
//     { text: "Payments", icon: <ProjectsIcon /> },
//     { text: "Invoices", icon: <InvoicesIcon /> },
//     { text: "Reports", icon: <ReportsIcon /> },
//   ]

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const user = auth.currentUser
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid))
//         if (userDoc.exists()) {
//           const userData = userDoc.data()
//           setFirstName(userData.firstName || "")
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

//   const handleAcceptTutor = async (jobId: string, tutorId: string) => {
//     try {
//       const jobRef = doc(db, "jobs", jobId)
//       await updateDoc(jobRef, {
//         accepted_tutor_id: { id: tutorId },
//         appliedTutors: [],
//       })

//       setJobs((prevJobs) =>
//         prevJobs.map((job) => (job.id === jobId ? { ...job, accepted_tutor_id: { id: tutorId } } : job)),
//       )
//       setAppointments((prevAppointments) => [
//         ...prevAppointments,
//         ...myRequests.filter((tutor) => tutor.id === tutorId),
//       ])
//       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
//     } catch (err) {
//       console.error("Error accepting tutor:", err)
//     }
//   }

//   const handleDeclineTutor = async (jobId: string, tutorId: string) => {
//     try {
//       const jobRef = doc(db, "jobs", jobId)
//       await updateDoc(jobRef, {
//         appliedTutors: (prevAppliedTutors: string[]) => prevAppliedTutors.filter((id) => id !== tutorId),
//       })

//       setMyRequests((prevRequests) => prevRequests.filter((tutor) => tutor.id !== tutorId))
//     } catch (err) {
//       console.error("Error declining tutor:", err)
//     }
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
//               <IconButton
//                 size="large"
//                 aria-label="account of current user"
//                 aria-controls="menu-appbar"
//                 aria-haspopup="true"
//                 onClick={handleMenu}
//                 color="inherit"
//               >
//                 <AccountCircle sx={{ color: "text.secondary" }} />
//               </IconButton>
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
//                 <MenuItem onClick={handleClose}>Profile</MenuItem>
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
//                   const job = activeTab === "My Requests" && jobs.find((job) => job.appliedTutors?.includes(tutor.id))
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
//                                 Last active 2 hours ago
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
//                             <Typography
//                               mb={2}
//                               variant="body2"
//                               color="text.secondary"
//                               sx={{
//                                 display: "-webkit-box",
//                                 WebkitLineClamp: 3,
//                                 WebkitBoxOrient: "vertical",
//                                 overflow: "hidden",
//                               }}
//                             >
//                               {tutor.bio}
//                             </Typography>
//                             <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//                               {tutor.specializations.map((skill, index) => (
//                                 <Chip
//                                   key={index}
//                                   label={skill}
//                                   size="small"
//                                   sx={{
//                                     bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                     color: theme.palette.primary.main,
//                                   }}
//                                 />
//                               ))}
//                             </Box>
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
//     </Box>
//   )
// }
