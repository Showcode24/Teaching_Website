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
  DialogActions,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Container,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Description as ProjectsIcon,
  Receipt as InvoicesIcon,
  Assessment as ReportsIcon,
  Search as SearchIcon,
  Bookmark,
  Notifications,
  Settings,
  TrendingUp,
  AccessTime,
  Star,
  LocationOn,
  School,
  AccountCircle,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { styled, alpha } from "@mui/material/styles"
import { collection, getDocs, getDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "../../firebase/firebase"


// Interfaces
interface Job {
  id: string
  jobTitle: string
  jobDescription: string
  hourlyRate: string
  studyLevel: string
  sessionsPerWeek: string
  location: string
  skillsRequired: string
  status: string
  created_at: string
  appliedTutors?: string[]
  accepted_tutor_id: { id: string } | null
  isHireRequest?: boolean
  hoursDaily?: string
  totalBill?: number
  contactInfo?: string
  parentId?: string
}

interface HireRequest {
  jobTitle: string
  hourlyRate: string
  hoursDaily: string
  studyLevel: string
  sessionsPerWeek: string
  jobDescription: string
  skillsRequired: string
  location: string
  contactInfo: string
  created_at: any
  status: string
  tutor_id: string
  tutorName: string
  totalBill: number
  parentId?: string
  hireId?: string
}

interface Parent {
  id: string
  hires?: Record<string, HireRequest>
  personalInfo?: {
    fullName: string
  }
  contactInfo?: {
    email: string
    phoneNumber: string
  }
}

// Styled Components
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
  const [jobs, setJobs] = useState<Job[]>([])
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("Best Matches")
  const [filteredJobs, setFilteredJobs] = useState<Job[] | null>(null)
  const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications] = useState(3)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const navigate = useNavigate()
  const currentUserId = auth.currentUser?.uid
  const [activeSessionsCount, setActiveSessionsCount] = useState<string>("N/A")
  const [, setSuccessMessage] = useState<string | null>(null)

  const [confirmHireAction, setConfirmHireAction] = useState<{
    type: "accept" | "decline"
    parentId: string
    hireId: string
  } | null>(null)

  const [confirmHireDialogOpen, setConfirmHireDialogOpen] = useState(false)

  // Stats cards data
  const statsCards = [
    { title: "Total Earnings", value: "N/A", icon: <TrendingUp />, color: theme.palette.primary.main },
    { title: "Active Sessions", value: activeSessionsCount, icon: <AccessTime />, color: theme.palette.secondary.main },
    { title: "Student Rating", value: "N/A", icon: <Star />, color: theme.palette.warning.main },
    { title: "Completed Jobs", value: "N/A", icon: <School />, color: theme.palette.success.main },
  ]

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, active: true },
    { text: "Payments", icon: <ProjectsIcon /> },
    { text: "Invoices", icon: <InvoicesIcon /> },
    { text: "Reports", icon: <ReportsIcon /> },
  ]

  useEffect(() => {
    const fetchJobsAndHires = async () => {
      setLoading(true)
      try {
        // Fetch jobs
        const jobsQuery = query(collection(db, "jobs"), orderBy("created_at", "desc"))
        const jobSnapshot = await getDocs(jobsQuery)
        const jobList: Job[] = jobSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Job[]

        const filteredJobs = jobList.filter(
          (job) =>
            job.jobTitle &&
            job.jobDescription &&
            job.hourlyRate &&
            job.studyLevel &&
            job.sessionsPerWeek &&
            job.location &&
            job.skillsRequired &&
            job.status,
        )

        setJobs(filteredJobs)

        // Fetch hire requests from parents
        if (currentUserId) {
          const parentsSnapshot = await getDocs(collection(db, "parents"))
          const hireRequestsList: HireRequest[] = []

          parentsSnapshot.docs.forEach((parentDoc) => {
            const parentData = parentDoc.data() as Parent
            const parentId = parentDoc.id

            if (parentData.hires) {
              Object.entries(parentData.hires).forEach(([hireId, hire]) => {
                if (hire.tutor_id === currentUserId) {
                  hireRequestsList.push({
                    ...hire,
                    parentId,
                    hireId,
                  })
                }
              })
            }
          })

          setHireRequests(hireRequestsList)
        }

        // Set initial filtered jobs
        setFilteredJobs(filteredJobs)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchJobsAndHires()
  }, [currentUserId])

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setFirstName(userData.firstName || "")
        }
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (jobs.length > 0 && currentUserId) {
      const appointmentsCount = jobs.filter((job) => job.accepted_tutor_id?.id === currentUserId).length
      setActiveSessionsCount(appointmentsCount.toString())
    }
  }, [jobs, currentUserId])

  const handleHireAction = (type: "accept" | "decline", parentId: string, hireId: string) => {
    setConfirmHireAction({ type, parentId, hireId })
    setConfirmHireDialogOpen(true)
  }

  const handleConfirmHire = async (confirmed: boolean) => {
    if (confirmed && confirmHireAction && currentUserId) {
      setIsApplying(true)
      try {
        const parentRef = doc(db, "parents", confirmHireAction.parentId)
        const parentDoc = await getDoc(parentRef)

        if (parentDoc.exists()) {
          const parentData = parentDoc.data()
          const hireData = parentData.hires?.[confirmHireAction.hireId]

          if (hireData) {
            // Update the hire status
            await updateDoc(parentRef, {
              [`hires.${confirmHireAction.hireId}.status`]:
                confirmHireAction.type === "accept" ? "accepted" : "declined",
            })

            // Update local state
            setHireRequests((prev) => prev.filter((hire) => hire.hireId !== confirmHireAction.hireId))

            if (confirmHireAction.type === "accept") {
              // Add to appointments
              const appointmentData = {
                id: `hire_${confirmHireAction.hireId}`,
                jobTitle: hireData.jobTitle,
                jobDescription: hireData.jobDescription,
                hourlyRate: hireData.hourlyRate,
                studyLevel: hireData.studyLevel,
                sessionsPerWeek: hireData.sessionsPerWeek,
                location: hireData.location,
                skillsRequired: hireData.skillsRequired,
                status: "accepted",
                created_at: new Date().toISOString(),
                accepted_tutor_id: { id: currentUserId },
                isHireRequest: true,
                hoursDaily: hireData.hoursDaily,
                totalBill: hireData.totalBill,
                contactInfo: hireData.contactInfo,
                parentId: confirmHireAction.parentId,
              }

              setFilteredJobs((prev) => {
                if (activeTab === "Appointments") {
                  return [...(prev || []), appointmentData]
                }
                return (
                  prev?.filter((job) => (job.isHireRequest ? job.id !== `hire_${confirmHireAction.hireId}` : true)) ||
                  []
                )
              })
            }

            setSuccessMessage(
              confirmHireAction.type === "accept"
                ? "Hire request accepted successfully! You can view it in the Appointments tab."
                : "Hire request declined successfully.",
            )
          }
        }
      } catch (err) {
        console.error("Error handling hire request:", err)
        setError("Failed to process hire request")
      } finally {
        setIsApplying(false)
      }
    }
    setConfirmHireDialogOpen(false)
    setConfirmHireAction(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "Best Matches") {
      // Only show jobs that don't have an accepted tutor (where accepted_tutor_id is null or doesn't have an id)
      setFilteredJobs(jobs.filter((job) => !job.accepted_tutor_id?.id))
    } else if (tab === "Requests") {
      // Combine job applications and hire requests
      const jobRequests = jobs.filter((job) => job.appliedTutors?.includes(currentUserId || ""))

      // Convert hire requests to a format compatible with jobs for display
      const formattedHireRequests = hireRequests.map((hire) => ({
        id: `hire_${hire.hireId}`,
        jobTitle: hire.jobTitle,
        jobDescription: hire.jobDescription,
        hourlyRate: hire.hourlyRate,
        studyLevel: hire.studyLevel,
        sessionsPerWeek: hire.sessionsPerWeek,
        location: hire.location,
        skillsRequired: hire.skillsRequired,
        status: hire.status,
        created_at: hire.created_at?.toDate?.() || hire.created_at,
        isHireRequest: true,
        totalBill: hire.totalBill,
        hoursDaily: hire.hoursDaily,
        contactInfo: hire.contactInfo,
        parentId: hire.parentId,
      }))

      setFilteredJobs(
        [...jobRequests, ...formattedHireRequests].map(job => ({
          ...job,
          accepted_tutor_id: "accepted_tutor_id" in job ? job.accepted_tutor_id : null
        })) as Job[]
      );

    } else if (tab === "Appointments") {
      setFilteredJobs(jobs.filter((job) => job.accepted_tutor_id?.id === currentUserId))
    }
  }

  const handleApply = async (jobId: string) => {
    setConfirmApplyJobId(jobId)
  }

  const confirmApplication = async (confirmation: boolean) => {
    if (confirmation && confirmApplyJobId && currentUserId) {
      setIsApplying(true)
      try {
        const jobRef = doc(db, "jobs", confirmApplyJobId)
        const jobDoc = await getDoc(jobRef)
        const jobData = jobDoc.data()

        if (jobData) {
          const appliedTutors = jobData.appliedTutors || []
          if (!appliedTutors.includes(currentUserId)) {
            await updateDoc(jobRef, {
              appliedTutors: [...appliedTutors, currentUserId],
            })

            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === confirmApplyJobId ? { ...job, appliedTutors: [...appliedTutors, currentUserId] } : job,
              ),
            )
          }
        }
      } catch (err) {
        console.error("Error applying for job", err)
      } finally {
        setIsApplying(false)
        setConfirmApplyJobId(null)
      }
    } else {
      setConfirmApplyJobId(null)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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
            Check out new tutoring opportunities waiting for you
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

        {/* Jobs Section */}
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
            Available Opportunities
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {["Best Matches", "Requests", "Appointments"].map((tab) => (
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
            ) : filteredJobs?.length ? (
              <Grid container spacing={3}>
                {filteredJobs.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
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
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </Typography>
                            <IconButton size="small">
                              <Bookmark sx={{ color: theme.palette.primary.main }} />
                            </IconButton>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                              {job.jobTitle}
                            </Typography>
                            {job.isHireRequest && (
                              <Chip
                                label="Direct Hire"
                                size="small"
                                color="secondary"
                                sx={{
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>
                          <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={`₦${job.hourlyRate}/hour`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={job.studyLevel}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                              }}
                            />
                            <Chip
                              label={`${job.sessionsPerWeek} sessions/week`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                              }}
                            />
                          </Box>
                          {activeTab !== "Appointments" && (
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
                              {job.jobDescription}
                            </Typography>
                          )}
                          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                            {job.skillsRequired.split(",").map((skill: string, index: number) => (
                              <Chip
                                key={index}
                                label={skill.trim()}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            ))}
                          </Box>
                          {job.isHireRequest && (
                            <Box mt={2} p={2} bgcolor={alpha(theme.palette.secondary.main, 0.1)} borderRadius={1}>
                              <Typography variant="subtitle2" color="secondary" fontWeight={600} mb={1}>
                                Hire Request Details
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Hours per day:</strong> {job.hoursDaily}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Weekly bill:</strong> ₦{job.totalBill?.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Contact:</strong> {job.contactInfo}
                              </Typography>
                            </Box>
                          )}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocationOn fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                              <Typography variant="body2" color="text.secondary">
                                {job.location}
                              </Typography>
                            </Box>
                            {activeTab !== "Appointments" &&
                              (job.isHireRequest ? (
                                <Box display="flex" gap={1}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      handleHireAction("accept", job.parentId!, job.id.replace("hire_", ""))
                                    }
                                    sx={{
                                      borderRadius: theme.shape.borderRadius * 5,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Accept Hire
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() =>
                                      handleHireAction("decline", job.parentId!, job.id.replace("hire_", ""))
                                    }
                                    sx={{
                                      borderRadius: theme.shape.borderRadius * 5,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </Box>
                              ) : !job.appliedTutors?.includes(currentUserId || "") ? (
                                <Button
                                  variant="contained"
                                  onClick={() => handleApply(job.id)}
                                  disabled={isApplying}
                                  sx={{
                                    borderRadius: theme.shape.borderRadius * 5,
                                    textTransform: "none",
                                    fontWeight: 600,
                                  }}
                                >
                                  Apply Now
                                </Button>
                              ) : (
                                <Chip
                                  label="Applied"
                                  color="primary"
                                  sx={{
                                    borderRadius: theme.shape.borderRadius * 5,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography align="center" color="text.secondary">
                No jobs available at the moment.
              </Typography>
            )}
          </AnimatePresence>
        </Box>
      </Container>

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
            disabled={isApplying}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isApplying ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hire confirmation dialog */}
      <Dialog
        open={confirmHireDialogOpen}
        onClose={() => setConfirmHireDialogOpen(false)}
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
            {confirmHireAction?.type === "accept"
              ? "Are you sure you want to accept this hire request?"
              : "Are you sure you want to decline this hire request?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConfirmHire(false)}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleConfirmHire(true)}
            variant="contained"
            color={confirmHireAction?.type === "accept" ? "success" : "error"}
            disabled={isApplying}
            sx={{
              borderRadius: theme.shape.borderRadius * 5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isApplying ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}






// "use client"

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
//   useTheme,
//   AppBar,
//   Toolbar,
//   Menu,
//   MenuItem,
//   Container,
// } from "@mui/material"
// import {
//   Dashboard as DashboardIcon,
//   Description as ProjectsIcon,
//   Receipt as InvoicesIcon,
//   Assessment as ReportsIcon,
//   Search as SearchIcon,
//   Bookmark,
//   Notifications,
//   Settings,
//   TrendingUp,
//   AccessTime,
//   Star,
//   LocationOn,
//   School,
//   AccountCircle,
// } from "@mui/icons-material"
// import { motion, AnimatePresence } from "framer-motion"
// import { styled, alpha } from "@mui/material/styles"
// import { collection, getDocs, getDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
// import { signOut } from "firebase/auth"
// import { auth, db } from "../../firebase/firebase"

// // Interfaces
// interface Job {
//   id: string
//   jobTitle: string
//   jobDescription: string
//   hourlyRate: string
//   studyLevel: string
//   sessionsPerWeek: string
//   location: string
//   skillsRequired: string
//   status: string
//   created_at: string
//   appliedTutors?: string[]
//   accepted_tutor_id: { id: string } | null
// }

// // Styled Components
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
//   const [jobs, setJobs] = useState<Job[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState("Best Matches")
//   const [filteredJobs, setFilteredJobs] = useState<Job[] | null>(null)
//   const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
//   const [isApplying, setIsApplying] = useState(false)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [notifications] = useState(3)
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
//   const theme = useTheme()
//   const navigate = useNavigate()
//   const currentUserId = auth.currentUser?.uid

//   // Stats cards data
//   const statsCards = [
//     { title: "Total Earnings", value: "₦125,000", icon: <TrendingUp />, color: theme.palette.primary.main },
//     { title: "Active Sessions", value: "12", icon: <AccessTime />, color: theme.palette.secondary.main },
//     { title: "Student Rating", value: "4.8", icon: <Star />, color: theme.palette.warning.main },
//     { title: "Completed Jobs", value: "38", icon: <School />, color: theme.palette.success.main },
//   ]

//   const navItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, active: true },
//     { text: "Payments", icon: <ProjectsIcon /> },
//     { text: "Invoices", icon: <InvoicesIcon /> },
//     { text: "Reports", icon: <ReportsIcon /> },
//   ]

//   useEffect(() => {
//     const fetchJobs = async () => {
//       setLoading(true)
//       try {
//         const jobsQuery = query(collection(db, "jobs"), orderBy("created_at", "desc"))
//         const jobSnapshot = await getDocs(jobsQuery)
//         const jobList: Job[] = jobSnapshot.docs.map((doc) => ({
//           ...doc.data(),
//           id: doc.id,
//         })) as Job[]

//         const filteredJobs = jobList.filter(
//           (job) =>
//             job.jobTitle &&
//             job.jobDescription &&
//             job.hourlyRate &&
//             job.studyLevel &&
//             job.sessionsPerWeek &&
//             job.location &&
//             job.skillsRequired &&
//             job.status,
//         )

//         setJobs(filteredJobs)
//         setFilteredJobs(filteredJobs)
//       } catch (err) {
//         setError("Failed to load jobs")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchJobs()
//   }, [])

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (auth.currentUser) {
//         const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
//         if (userDoc.exists()) {
//           const userData = userDoc.data()
//           setFirstName(userData.firstName || "")
//         }
//       }
//     }

//     fetchUserData()
//   }, [])

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab)
//     if (tab === "Best Matches") {
//       setFilteredJobs(jobs)
//     } else if (tab === "Requests") {
//       setFilteredJobs(jobs.filter((job) => job.appliedTutors?.includes(currentUserId || "")))
//     } else if (tab === "Appointments") {
//       setFilteredJobs(jobs.filter((job) => job.accepted_tutor_id?.id === currentUserId))
//     }
//   }

//   const handleApply = async (jobId: string) => {
//     setConfirmApplyJobId(jobId)
//   }

//   const confirmApplication = async (confirmation: boolean) => {
//     if (confirmation && confirmApplyJobId && currentUserId) {
//       setIsApplying(true)
//       try {
//         const jobRef = doc(db, "jobs", confirmApplyJobId)
//         const jobDoc = await getDoc(jobRef)
//         const jobData = jobDoc.data()

//         if (jobData) {
//           const appliedTutors = jobData.appliedTutors || []
//           if (!appliedTutors.includes(currentUserId)) {
//             await updateDoc(jobRef, {
//               appliedTutors: [...appliedTutors, currentUserId],
//             })

//             setJobs((prevJobs) =>
//               prevJobs.map((job) =>
//                 job.id === confirmApplyJobId ? { ...job, appliedTutors: [...appliedTutors, currentUserId] } : job,
//               ),
//             )
//           }
//         }
//       } catch (err) {
//         console.error("Error applying for job", err)
//       } finally {
//         setIsApplying(false)
//         setConfirmApplyJobId(null)
//       }
//     } else {
//       setConfirmApplyJobId(null)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       await signOut(auth)
//       navigate("/login")
//     } catch (error) {
//       console.error("Logout failed:", error)
//     }
//   }

//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleClose = () => {
//     setAnchorEl(null)
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
//             Check out new tutoring opportunities waiting for you
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

//         {/* Jobs Section */}
//         <Box>
//           <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
//             Available Opportunities
//           </Typography>
//           <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
//             {["Best Matches", "Requests", "Appointments"].map((tab) => (
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
//             ) : filteredJobs?.length ? (
//               <Grid container spacing={3}>
//                 {filteredJobs.map((job) => (
//                   <Grid item xs={12} md={6} key={job.id}>
//                     <motion.div
//                       initial={{ scale: 0.95, opacity: 0 }}
//                       animate={{ scale: 1, opacity: 1 }}
//                       exit={{ scale: 0.95, opacity: 0 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <StyledCard elevation={0}>
//                         <CardContent>
//                           <Box display="flex" justifyContent="space-between" mb={2}>
//                             <Typography variant="caption" color="text.secondary">
//                               Posted {new Date(job.created_at).toLocaleDateString()}
//                             </Typography>
//                             <IconButton size="small">
//                               <Bookmark sx={{ color: theme.palette.primary.main }} />
//                             </IconButton>
//                           </Box>
//                           <Typography variant="h6" mb={1} sx={{ fontWeight: 600, color: "text.primary" }}>
//                             {job.jobTitle}
//                           </Typography>
//                           <Box display="flex" gap={1} mb={2} alignItems="center" flexWrap="wrap">
//                             <Chip
//                               label={`₦${job.hourlyRate}/hour`}
//                               size="small"
//                               sx={{
//                                 bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                 color: theme.palette.primary.main,
//                                 fontWeight: 600,
//                               }}
//                             />
//                             <Chip
//                               label={job.studyLevel}
//                               size="small"
//                               sx={{
//                                 bgcolor: alpha(theme.palette.secondary.main, 0.1),
//                                 color: theme.palette.secondary.main,
//                               }}
//                             />
//                             <Chip
//                               label={`${job.sessionsPerWeek} sessions/week`}
//                               size="small"
//                               sx={{
//                                 bgcolor: alpha(theme.palette.info.main, 0.1),
//                                 color: theme.palette.info.main,
//                               }}
//                             />
//                           </Box>
//                           {activeTab !== "Appointments" && (
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
//                               {job.jobDescription}
//                             </Typography>
//                           )}
//                           <Box display="flex" gap={1} mb={2} flexWrap="wrap">
//                             {job.skillsRequired.split(",").map((skill: string, index: number) => (
//                               <Chip
//                                 key={index}
//                                 label={skill.trim()}
//                                 size="small"
//                                 sx={{
//                                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                                   color: theme.palette.primary.main,
//                                 }}
//                               />
//                             ))}
//                           </Box>
//                           <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
//                             <Box display="flex" alignItems="center" gap={1}>
//                               <LocationOn fontSize="small" sx={{ color: theme.palette.text.secondary }} />
//                               <Typography variant="body2" color="text.secondary">
//                                 {job.location}
//                               </Typography>
//                             </Box>
//                             {activeTab !== "Appointments" &&
//                               (!job.appliedTutors?.includes(currentUserId || "") ? (
//                                 <Button
//                                   variant="contained"
//                                   onClick={() => handleApply(job.id)}
//                                   disabled={isApplying}
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     textTransform: "none",
//                                     fontWeight: 600,
//                                   }}
//                                 >
//                                   Apply Now
//                                 </Button>
//                               ) : (
//                                 <Chip
//                                   label="Applied"
//                                   color="primary"
//                                   sx={{
//                                     borderRadius: theme.shape.borderRadius * 5,
//                                     fontWeight: 600,
//                                   }}
//                                 />
//                               ))}
//                           </Box>
//                         </CardContent>
//                       </StyledCard>
//                     </motion.div>
//                   </Grid>
//                 ))}
//               </Grid>
//             ) : (
//               <Typography align="center" color="text.secondary">
//                 No jobs available at the moment.
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
//             disabled={isApplying}
//             sx={{
//               borderRadius: theme.shape.borderRadius * 5,
//               textTransform: "none",
//               fontWeight: 600,
//             }}
//           >
//             {isApplying ? <CircularProgress size={24} /> : "Confirm"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }
