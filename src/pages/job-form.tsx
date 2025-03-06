"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { auth, db } from "../firebase/firebase"
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  Box,
  InputAdornment,
  CircularProgress,
} from "@mui/material"

const TutorJobForm = () => {
  const [jobTitle, setJobTitle] = useState<string>("")
  const [hourlyRate, setHourlyRate] = useState<number>(0)
  const [studyLevel, setStudyLevel] = useState<string>("Beginner Level")
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(0)
  const [jobDescription, setJobDescription] = useState<string>("")
  const [skillsRequired, setSkillsRequired] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [contactInfo, setContactInfo] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [hoursDaily, setHoursDaily] = useState<number>(0)
  const [totalBill, setTotalBill] = useState(0)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        setErrorMessage("Please log in to post a job.")
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const calculatedTotal = hourlyRate * hoursDaily * sessionsPerWeek
    setTotalBill(calculatedTotal)
  }, [hourlyRate, hoursDaily, sessionsPerWeek])

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value)
    setHourlyRate(value)

    if (value < 1500 || value > 3000) {
      setErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
    } else {
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (hourlyRate < 1500 || hourlyRate > 3000) {
      setErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
      return
    }

    if (!userId) {
      setErrorMessage("User ID is required to post the job.")
      return
    }

    setLoading(true)

    const newJob = {
      jobTitle,
      hourlyRate: `${hourlyRate}`,
      hoursDaily: `${hoursDaily}`,
      studyLevel,
      sessionsPerWeek: `${sessionsPerWeek}`,
      jobDescription,
      skillsRequired,
      location,
      contactInfo,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
      status: "open",
      parent_id: userId,
      accepted_tutor_id: "/tutors/tutor_document_id",
    }

    try {
      const docRef = await addDoc(collection(db, "jobs"), newJob)
      console.log("Job successfully posted with ID: ", docRef.id)
      setSuccessMessage("Congratulations! Your job has been successfully posted.")

      // Clear input fields
      setJobTitle("")
      setHourlyRate(0)
      setHoursDaily(0)
      setStudyLevel("Beginner Level")
      setSessionsPerWeek(0)
      setJobDescription("")
      setSkillsRequired("")
      setLocation("")
      setContactInfo("")
    } catch (error) {
      console.error("Error posting job: ", error)
      setErrorMessage("There was an error posting your job. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <Alert severity="warning">
        <strong>{errorMessage}</strong>
      </Alert>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Post a Tutor Job
        </Typography>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>{successMessage}</strong>
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>{errorMessage}</strong>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
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
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? "Posting..." : "Post Job"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}

export default TutorJobForm

