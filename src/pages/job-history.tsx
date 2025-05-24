"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Select,
  type SelectChangeEvent,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Alert,
  InputAdornment,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  ChildCare as ChildCareIcon,
} from "@mui/icons-material"
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface JobHistoryProps {
  activeTab: string
}

interface ChildAttachment {
  name: string
  age: string
  grade: string
}

interface Job {
  id: string
  jobTitle: string
  created_at: any
  status: string
  totalBill: number
  weeklyHours: string
  tutorName?: string
  childAttachments?: ChildAttachment[]
  location?: string
  hourlyRate?: string
  studyLevel?: string
  subjectAreas?: string
  isHireRequest?: boolean
  parent_id?: string
}

const JobHistory: React.FC<JobHistoryProps> = ({ activeTab }) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuJob, setMenuJob] = useState<Job | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const theme = useTheme()
  const auth = getAuth()
  const db = getFirestore()

  useEffect(() => {
    if (activeTab !== "History") return

    const fetchJobs = async () => {
      setLoading(true)
      try {
        const user = auth.currentUser
        if (!user) {
          setError("User not authenticated")
          return
        }

        // Fetch posted jobs
        const jobsQuery = query(collection(db, "jobs"), where("parent_id", "==", user.uid))
        const jobsSnapshot = await getDocs(jobsQuery)
        const jobsList = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isHireRequest: false,
        })) as Job[]

        // Fetch hire requests
        const parentDoc = await getDocs(collection(db, "parents"))
        const hireRequests: Job[] = []

        parentDoc.docs.forEach((doc) => {
          if (doc.id === user.uid) {
            const parentData = doc.data()
            if (parentData.hires) {
              Object.entries(parentData.hires).forEach(([hireId, hire]: [string, any]) => {
                hireRequests.push({
                  id: hireId,
                  jobTitle: hire.jobTitle || "Hire Request",
                  created_at: hire.created_at,
                  status: hire.status,
                  totalBill: hire.totalBill || 0,
                  weeklyHours: hire.weeklyHours || "0",
                  tutorName: hire.tutorName,
                  childAttachments: hire.childAttachments,
                  location: hire.tutoringAddress,
                  hourlyRate: hire.hourlyRate,
                  studyLevel: hire.studyLevel,
                  subjectAreas: hire.subjectAreas,
                  isHireRequest: true,
                  parent_id: user.uid,
                })
              })
            }
          }
        })

        // Combine and sort by date
        const allJobs = [...jobsList, ...hireRequests].sort((a, b) => {
          const dateA = a.created_at?.toDate?.() || new Date(a.created_at)
          const dateB = b.created_at?.toDate?.() || new Date(b.created_at)
          return dateB.getTime() - dateA.getTime()
        })

        setJobs(allJobs)
        setFilteredJobs(allJobs)
      } catch (err) {
        console.error("Error fetching job history:", err)
        setError("Failed to load job history")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [activeTab, auth.currentUser, db])

  // Apply filters and search
  useEffect(() => {
    let result = [...jobs]

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((job) => job.status.toLowerCase() === filterStatus.toLowerCase())
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(query) ||
          (job.tutorName && job.tutorName.toLowerCase().includes(query)) ||
          (job.location && job.location.toLowerCase().includes(query)) ||
          (job.subjectAreas && job.subjectAreas.toLowerCase().includes(query)),
      )
    }

    setFilteredJobs(result)
    setPage(1) // Reset to first page when filters change
  }, [jobs, filterStatus, searchQuery])

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode)
  }

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleEditClick = (job: Job) => {
    setEditJob(job)
    setOpenEditDialog(true)
    setAnchorEl(null)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setEditJob(null)
  }

  const handleSaveEdit = async () => {
    if (!editJob) return

    setEditLoading(true)
    try {
      if (editJob.isHireRequest) {
        // Update hire request in parent document
        const parentRef = doc(db, "parents", editJob.parent_id || auth.currentUser?.uid || "")

        // Get the current parent document to ensure we're not overwriting other data
        const parentDoc = await getDoc(parentRef)
        if (!parentDoc.exists()) {
          throw new Error("Parent document not found")
        }

        // Update only the specific hire request fields
        await updateDoc(parentRef, {
          [`hires.${editJob.id}.jobTitle`]: editJob.jobTitle,
          [`hires.${editJob.id}.status`]: editJob.status,
          [`hires.${editJob.id}.totalBill`]: Number(editJob.totalBill),
          [`hires.${editJob.id}.weeklyHours`]: editJob.weeklyHours,
          [`hires.${editJob.id}.tutoringAddress`]: editJob.location || "",
          [`hires.${editJob.id}.hourlyRate`]: editJob.hourlyRate || "",
          [`hires.${editJob.id}.studyLevel`]: editJob.studyLevel || "",
          [`hires.${editJob.id}.subjectAreas`]: editJob.subjectAreas || "",
          [`hires.${editJob.id}.childAttachments`]: editJob.childAttachments || [],
        })
      } else {
        // Update job document
        const jobRef = doc(db, "jobs", editJob.id)

        // Create an update object with only the fields we want to update
        const updateData: Record<string, any> = {
          jobTitle: editJob.jobTitle,
          status: editJob.status,
          totalBill: Number(editJob.totalBill),
          weeklyHours: editJob.weeklyHours,
        }

        // Only add optional fields if they exist
        if (editJob.location) updateData.location = editJob.location
        if (editJob.hourlyRate) updateData.hourlyRate = editJob.hourlyRate
        if (editJob.studyLevel) updateData.studyLevel = editJob.studyLevel
        if (editJob.subjectAreas) updateData.subjectAreas = editJob.subjectAreas
        if (editJob.childAttachments) updateData.childAttachments = editJob.childAttachments

        await updateDoc(jobRef, updateData)
      }

      // Update local state
      setJobs(jobs.map((job) => (job.id === editJob.id ? editJob : job)))
      setFilteredJobs(filteredJobs.map((job) => (job.id === editJob.id ? editJob : job)))
      setSuccessMessage("Job updated successfully!")

      setTimeout(() => {
        setSuccessMessage(null)
        setOpenEditDialog(false)
        setEditJob(null)
      }, 2000)
    } catch (error) {
      console.error("Error updating job:", error)
      setError("Failed to update job. Please try again.")

      // Show the error for 3 seconds
      setTimeout(() => {
        setError(null)
      }, 3000)
    } finally {
      setEditLoading(false)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, job: Job) => {
    event.stopPropagation() // Prevent event bubbling
    setMenuJob(job)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuJob(null)
  }

  // Calculate pagination
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const displayedJobs = filteredJobs.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return theme.palette.info.main
      case "pending":
        return theme.palette.warning.main
      case "accepted":
        return theme.palette.success.main
      case "completed":
        return theme.palette.success.dark
      case "cancelled":
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <AccessTimeIcon fontSize="small" />
      case "pending":
        return <AccessTimeIcon fontSize="small" />
      case "accepted":
        return <CheckIcon fontSize="small" />
      case "completed":
        return <CheckIcon fontSize="small" />
      case "cancelled":
        return <CloseIcon fontSize="small" />
      default:
        return <AccessTimeIcon fontSize="small" />
    }
  }

  if (activeTab !== "History") return null

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        Job History
      </Typography>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: theme.shape.borderRadius * 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                label="Status"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: "center", md: "flex-end" }}>
              <Tooltip title="List View">
                <IconButton
                  color={viewMode === "list" ? "primary" : "default"}
                  onClick={() => handleViewModeChange("list")}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid View">
                <IconButton
                  color={viewMode === "grid" ? "primary" : "default"}
                  onClick={() => handleViewModeChange("grid")}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                href="/job-form"
                sx={{ borderRadius: theme.shape.borderRadius * 5 }}
              >
                Post a Job
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredJobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: theme.shape.borderRadius * 2 }}>
          <Typography variant="body1" color="text.secondary">
            No job history found. Post a job or hire a tutor to see your history here.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/job-form"
            sx={{ mt: 2, borderRadius: theme.shape.borderRadius * 5 }}
          >
            Post a Job
          </Button>
        </Paper>
      ) : viewMode === "list" ? (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: theme.shape.borderRadius * 2, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Date Posted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Weekly Hours</TableCell>
                  <TableCell>Weekly Bill</TableCell>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Children</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedJobs.map((job) => {
                  const jobDate = job.created_at?.toDate?.() || new Date(job.created_at)
                  const formattedDate = isNaN(jobDate.getTime()) ? "Invalid date" : format(jobDate, "MMM dd, yyyy")

                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.jobTitle}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(job.status)}
                          label={job.status}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(job.status), 0.1),
                            color: getStatusColor(job.status),
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>{job.weeklyHours || "N/A"}</TableCell>
                      <TableCell>₦{job.totalBill?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>{job.tutorName || "Not assigned"}</TableCell>
                      <TableCell>
                        {job.childAttachments && job.childAttachments.length > 0 ? (
                          <Tooltip
                            title={job.childAttachments.map((child) => `${child.name} (${child.age})`).join(", ")}
                          >
                            <Chip
                              label={`${job.childAttachments.length} ${job.childAttachments.length === 1 ? "Child" : "Children"}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, job)}
                          aria-label="more options"
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 150, zIndex: 1400 },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => menuJob && handleEditClick(menuJob)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            {/* We can add more options here like Delete, View Details, etc. */}
          </Menu>
        </>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {displayedJobs.map((job) => {
              const jobDate = job.created_at?.toDate?.() || new Date(job.created_at)
              const formattedDate = isNaN(jobDate.getTime()) ? "Invalid date" : format(jobDate, "MMM dd, yyyy")

              return (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        borderRadius: theme.shape.borderRadius * 2,
                        boxShadow: theme.shadows[2],
                        position: "relative",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, job)}
                          sx={{
                            bgcolor: "background.paper",
                            boxShadow: theme.shadows[2],
                            "&:hover": { bgcolor: "background.paper" },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: alpha(getStatusColor(job.status), 0.1),
                          borderTopLeftRadius: theme.shape.borderRadius * 2,
                          borderTopRightRadius: theme.shape.borderRadius * 2,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Chip
                            icon={getStatusIcon(job.status)}
                            label={job.status}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(job.status), 0.2),
                              color: getStatusColor(job.status),
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formattedDate}
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap title={job.jobTitle}>
                          {job.jobTitle}
                        </Typography>

                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          {job.tutorName && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <PersonIcon fontSize="small" color="primary" />
                              <Typography variant="body2">{job.tutorName}</Typography>
                            </Box>
                          )}

                          {job.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <LocationIcon fontSize="small" color="primary" />
                              <Typography variant="body2" noWrap title={job.location}>
                                {job.location}
                              </Typography>
                            </Box>
                          )}

                          {job.subjectAreas && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <SchoolIcon fontSize="small" color="primary" />
                              <Typography variant="body2" noWrap title={job.subjectAreas}>
                                {job.subjectAreas}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccessTimeIcon fontSize="small" color="primary" />
                            <Typography variant="body2">{job.weeklyHours || "0"} hours/week</Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AttachMoneyIcon fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="bold">
                              ₦{job.totalBill?.toLocaleString() || "0"}/week
                            </Typography>
                          </Box>

                          {job.childAttachments && job.childAttachments.length > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <ChildCareIcon fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {job.childAttachments.length} {job.childAttachments.length === 1 ? "Child" : "Children"}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              )
            })}
          </AnimatePresence>
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: theme.shape.borderRadius * 5,
              },
            }}
          />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: theme.shape.borderRadius * 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Job</DialogTitle>
        <DialogContent dividers>
          {editJob && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={editJob.jobTitle}
                  onChange={(e) => setEditJob({ ...editJob, jobTitle: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editJob.status}
                    label="Status"
                    onChange={(e) => setEditJob({ ...editJob, status: e.target.value })}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weekly Hours"
                  type="number"
                  value={editJob.weeklyHours}
                  onChange={(e) => setEditJob({ ...editJob, weeklyHours: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hourly Rate (₦)"
                  type="number"
                  value={editJob.hourlyRate}
                  onChange={(e) => {
                    const hourlyRate = e.target.value
                    const weeklyHours = Number.parseFloat(editJob.weeklyHours) || 0
                    const totalBill = Number.parseFloat(hourlyRate) * weeklyHours
                    setEditJob({
                      ...editJob,
                      hourlyRate,
                      totalBill: isNaN(totalBill) ? 0 : totalBill,
                    })
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weekly Bill (₦)"
                  type="number"
                  value={editJob.totalBill}
                  onChange={(e) => setEditJob({ ...editJob, totalBill: Number.parseFloat(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editJob.location || ""}
                  onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Study Level</InputLabel>
                  <Select
                    value={editJob.studyLevel || ""}
                    label="Study Level"
                    onChange={(e) => setEditJob({ ...editJob, studyLevel: e.target.value })}
                  >
                    <MenuItem value="pre school">Pre School</MenuItem>
                    <MenuItem value="basic 1-5">Basic 1-5</MenuItem>
                    <MenuItem value="JSS1-3">JSS1-3</MenuItem>
                    <MenuItem value="SS1-3">SS1-3</MenuItem>
                    <MenuItem value="O level Exams, UTME, POST UTME">O level Exams, UTME, POST UTME</MenuItem>
                    <MenuItem value="OTHERS">OTHERS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Areas"
                  value={editJob.subjectAreas || ""}
                  onChange={(e) => setEditJob({ ...editJob, subjectAreas: e.target.value })}
                />
              </Grid>

              {/* Child Attachments Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Child Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {editJob.childAttachments &&
                  editJob.childAttachments.map((child, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Child's Name"
                            value={child.name}
                            onChange={(e) => {
                              const updatedAttachments = [...editJob.childAttachments!]
                              updatedAttachments[index] = { ...child, name: e.target.value }
                              setEditJob({ ...editJob, childAttachments: updatedAttachments })
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Age"
                            value={child.age}
                            onChange={(e) => {
                              const updatedAttachments = [...editJob.childAttachments!]
                              updatedAttachments[index] = { ...child, age: e.target.value }
                              setEditJob({ ...editJob, childAttachments: updatedAttachments })
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Grade/Class"
                            value={child.grade}
                            onChange={(e) => {
                              const updatedAttachments = [...editJob.childAttachments!]
                              updatedAttachments[index] = { ...child, grade: e.target.value }
                              setEditJob({ ...editJob, childAttachments: updatedAttachments })
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            sx={{ borderRadius: theme.shape.borderRadius * 5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            color="primary"
            disabled={editLoading}
            startIcon={editLoading && <CircularProgress size={20} color="inherit" />}
            sx={{ borderRadius: theme.shape.borderRadius * 5 }}
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default JobHistory

