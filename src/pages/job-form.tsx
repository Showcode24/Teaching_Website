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
  Checkbox,
} from "@mui/material"
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { format, differenceInMinutes } from "date-fns"
import { useNavigate } from "react-router-dom"

const TutorJobForm = () => {
  const navigate = useNavigate()
  const [jobTitle, setJobTitle] = useState<string>("")
  const [hourlyRate, setHourlyRate] = useState<number>(1500)
  const [studyLevel, setStudyLevel] = useState<string>("Learners category")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [skillsRequired, setSkillsRequired] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [contactInfo, setContactInfo] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [totalBill, setTotalBill] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [childAttachments, setChildAttachments] = useState([{ name: "", age: "", grade: "" }])

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

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.target.value)
    setHourlyRate(value)

    if (value < 1500 || value > 3000) {
      setErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
    } else {
      setErrorMessage("")
    }
  }

  const handleAddChild = () => {
    setChildAttachments([...childAttachments, { name: "", age: "", grade: "" }])
  }

  const handleRemoveChild = (index: number) => {
    const updatedAttachments = [...childAttachments]
    updatedAttachments.splice(index, 1)
    setChildAttachments(updatedAttachments)
  }

  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedAttachments = [...childAttachments]
    updatedAttachments[index] = { ...updatedAttachments[index], [field]: value }
    setChildAttachments(updatedAttachments)
  }

  const handleContinue = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (hourlyRate < 1500 || hourlyRate > 3000) {
      setErrorMessage("Hourly rate must be between ₦1,500 and ₦3,000.")
      return
    }

    if (!userId) {
      setErrorMessage("User ID is required to post the job.")
      return
    }

    setShowSummary(true)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!userId) {
      setErrorMessage("User ID is required to post the job.")
      return
    }

    setLoading(true)

    const formattedDayTimes: Record<string, { start: string; end: string }> = {}
      ; (Object.keys(dayTimes) as DayKey[]).forEach((day) => {
        if (selectedDays[day] && dayTimes[day].start && dayTimes[day].end) {
          formattedDayTimes[day] = {
            start: format(dayTimes[day].start, "h:mm a"),
            end: format(dayTimes[day].end, "h:mm a"),
          }
        }
      })

    const newJob = {
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
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
      status: "open",
      parent_id: userId,
      totalBill,
      childAttachments,
    }

    try {
      const docRef = await addDoc(collection(db, "jobs"), newJob)
      console.log("Job successfully posted with ID: ", docRef.id)
      setSuccessMessage("Congratulations! Your job has been successfully posted.")

      // Clear input fields
      setJobTitle("")
      setHourlyRate(1500)
      setStudyLevel("Learners category")
      setJobDescription("")
      setSkillsRequired("")
      setLocation("")
      setContactInfo("")
      setChildAttachments([{ name: "", age: "", grade: "" }])

      // Reset days and times
      setSelectedDays({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      })

      setDayTimes({
        monday: { start: null, end: null },
        tuesday: { start: null, end: null },
        wednesday: { start: null, end: null },
        thursday: { start: null, end: null },
        friday: { start: null, end: null },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null },
      })

      // Return to dashboard after successful submission
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error posting job: ", error)
      setErrorMessage("There was an error posting your job. Please try again later.")
    } finally {
      setLoading(false)
      setShowSummary(false)
    }
  }

  const handleBack = () => {
    setShowSummary(false)
  }

  if (!userId) {
    return (
      <Alert severity="warning">
        <strong>{errorMessage}</strong>
      </Alert>
    )
  }

  if (showSummary) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            Job Summary
          </Typography>
          <Typography variant="h6" gutterBottom>
            Please review your job details before posting
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
              <Button variant="outlined" color="primary" onClick={handleBack} sx={{ minWidth: "120px" }}>
                Back to Edit
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                sx={{ minWidth: "120px" }}
              >
                {loading ? "Posting..." : "Confirm & Post"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
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
        <form onSubmit={handleContinue}>
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
                          <Button color="error" size="small" onClick={() => handleRemoveChild(index)} sx={{ ml: 2 }}>
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
              <Typography variant="h6" gutterBottom>
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
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Continue to Review
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}

export default TutorJobForm

