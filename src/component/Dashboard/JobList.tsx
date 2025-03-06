"use client"

import { useState } from "react"
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material"
import { Bookmark, LocationOn } from "@mui/icons-material"
import { motion } from "framer-motion"
import { Job } from "./types"


interface JobListProps {
  jobs: Job[]
  loading: boolean
  error: string | null
  activeTab: string
  setActiveTab: (tab: string) => void
  currentUserId: string | undefined
}

export default function JobList({ jobs, loading, error, activeTab, setActiveTab, currentUserId }: JobListProps) {
  const [confirmApplyJobId, setConfirmApplyJobId] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleApply = (jobId: string) => {
    setConfirmApplyJobId(jobId)
  }

  const confirmApplication = async (confirmation: boolean) => {
    if (confirmation && confirmApplyJobId) {
      setIsApplying(true)
      // Implement the application logic here
      setTimeout(() => {
        setIsApplying(false)
        setConfirmApplyJobId(null)
      }, 1000)
    } else {
      setConfirmApplyJobId(null)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "Best Matches") return true
    if (activeTab === "Requests") return job.appliedTutors?.includes(currentUserId || "")
    if (activeTab === "Appointments") return job.accepted_tutor_id?.id === currentUserId
    return false
  })

  return (
    <>
      <Box mb={3}>
        <Typography variant="h5" mb={3}>
          Available Opportunities
        </Typography>
        <Box display="flex" gap={2} mb={3}>
          {["Best Matches", "Requests", "Appointments"].map((tab) => (
            <Button key={tab} variant={activeTab === tab ? "contained" : "outlined"} onClick={() => setActiveTab(tab)}>
              {tab}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : filteredJobs.length ? (
          <Grid container spacing={3}>
            {filteredJobs.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </Typography>
                        <IconButton size="small">
                          <Bookmark />
                        </IconButton>
                      </Box>
                      <Typography variant="h6" mb={1}>
                        {job.jobTitle}
                      </Typography>
                      <Box display="flex" gap={1} mb={2} alignItems="center">
                        <Typography variant="subtitle1" color="primary">
                          ₦{job.hourlyRate}/hour
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" color="text.secondary">
                          {job.studyLevel}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" color="text.secondary">
                          {job.sessionsPerWeek} sessions/week
                        </Typography>
                      </Box>
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
                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {job.skillsRequired.split(",").map((skill: string, index: number) => (
                          <Chip key={index} label={skill.trim()} size="small" />
                        ))}
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        {!job.appliedTutors?.includes(currentUserId || "") ? (
                          <Button variant="contained" onClick={() => handleApply(job.id)}>
                            Apply Now
                          </Button>
                        ) : (
                          <Chip label="Applied" color="primary" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center" color="text.secondary">
            No jobs available at the moment.
          </Typography>
        )}
      </Box>

      <Dialog
        open={!!confirmApplyJobId}
        onClose={() => setConfirmApplyJobId(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle>Confirm Application</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to apply for this position?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => confirmApplication(false)}>Cancel</Button>
          <Button onClick={() => confirmApplication(true)} variant="contained" disabled={isApplying}>
            {isApplying ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

