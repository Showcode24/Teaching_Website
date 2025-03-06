"use client"

import { useState } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import Layout from "../component/Layouts/Layout"
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormGroup,
  Chip,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material"
import { styled } from "@mui/system"

interface FormData {
  fullName: string
  contactNumber: string
  email: string
  stateOfService: string
  callUpNumber: string
  batchStream: string
  motivation: string
  impact: string
  skills: string[]
  otherSkills: string
  interests: string[]
  termsAccepted: boolean
  emailUpdates: boolean
}

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

const batchStreams = [
  "Batch A Stream 1",
  "Batch A Stream 2",
  "Batch B Stream 1",
  "Batch B Stream 2",
  "Batch C Stream 1",
  "Batch C Stream 2",
]

const skillsList = ["Leadership", "Project Management", "Public Speaking", "Graphic Design"]

const interestsList = ["Community Development", "Volunteering", "Mentorship", "Entrepreneurship"]

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e88e5",
    },
    secondary: {
      main: "#ff4081",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
})

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2, 0),
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "30px",
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
}))

export default function InnovationBox() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm<FormData>()
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const steps = [
    "Personal Information",
    "Service Information",
    "Motivation & Vision",
    "Skills & Interests",
    "Declaration",
  ]

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true)
    setSubmitMessage("Submitting application...")
    window.location.href = "https://chat.whatsapp.com/LbttK9Vw7hl18XaPRjDkzU"

    try {
      console.log("Starting file upload process...")

      const applicationData = {
        ...data,
        submittedAt: new Date().toISOString(),
      }

      console.log("Prepared application data:", applicationData)

      console.log("Adding document to Firestore...")
      const docRef = await addDoc(collection(db, "applications"), applicationData)
      console.log("Document written with ID: ", docRef.id)

      setSubmitMessage("Application submitted successfully!")
      reset()
      setActiveStep(0)
    } catch (error) {
      console.error("Error submitting application:", error)
      setSubmitMessage("An error occurred while submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = getFieldsToValidate(activeStep)
    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const getFieldsToValidate = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ["fullName", "contactNumber", "email"]
      case 1:
        return ["stateOfService", "callUpNumber", "batchStream"]
      case 2:
        return ["motivation", "impact"]
      case 3:
        return ["skills", "interests"]
      case 4:
        return ["termsAccepted"]
      default:
        return []
    }
  }

  const watchedFields = watch()

  const isStepComplete = (step: number): boolean => {
    const fieldsToCheck = getFieldsToValidate(step)
    return fieldsToCheck.every((field) => !!watchedFields[field])
  }

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Box sx={{ maxWidth: 800, margin: "0 auto", padding: { xs: 2, sm: 4 }, marginBottom: "100px" }}>
          <Typography variant={isMobile ? "h4" : "h3"} align="center" gutterBottom>
            Welcome to the Winner's Circle!
          </Typography>
          <Typography variant={isMobile ? "body1" : "h6"} align="center" color="textSecondary" paragraph>
            Begin your journey of impactful service and personal growth
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ marginBottom: 4 }}
            orientation={isMobile ? "vertical" : "horizontal"}
          >
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            <StyledPaper elevation={3}>
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fullName"
                      control={control}
                      rules={{ required: "Full name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          variant="outlined"
                          fullWidth
                          error={!!errors.fullName}
                          helperText={errors.fullName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="contactNumber"
                      control={control}
                      rules={{
                        required: "Contact number is required",
                        pattern: {
                          value: /^[0-9]{11}$/,
                          message: "Please enter a valid 11-digit phone number",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Contact Number"
                          variant="outlined"
                          fullWidth
                          error={!!errors.contactNumber}
                          helperText={errors.contactNumber?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email Address"
                          variant="outlined"
                          fullWidth
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="stateOfService"
                      control={control}
                      rules={{ required: "State of service is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="State of Service"
                          variant="outlined"
                          fullWidth
                          error={!!errors.stateOfService}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select a state
                          </MenuItem>
                          {states.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.stateOfService && (
                      <Typography color="error" variant="caption">
                        {errors.stateOfService.message}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="callUpNumber"
                      control={control}
                      rules={{
                        required: "Call-up number is required",
                        pattern: {
                          value: /^NYSC\/[A-Z]{3}\/\d{4}\/\d{6}$/,
                          message: "Please enter a valid NYSC call-up number (e.g., NYSC/ABC/2023/123456)",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="NYSC Call-Up Number"
                          variant="outlined"
                          fullWidth
                          error={!!errors.callUpNumber}
                          helperText={errors.callUpNumber?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="batchStream"
                      control={control}
                      rules={{ required: "Batch/Stream is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Batch/Stream"
                          variant="outlined"
                          fullWidth
                          error={!!errors.batchStream}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Batch/Stream
                          </MenuItem>
                          {batchStreams.map((batch) => (
                            <MenuItem key={batch} value={batch}>
                              {batch}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.batchStream && (
                      <Typography color="error" variant="caption">
                        {errors.batchStream.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="motivation"
                      control={control}
                      rules={{
                        required: "This field is required",
                        minLength: {
                          value: 50,
                          message: "Please provide at least 50 characters",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Why do you want to join the Winner's Circle?"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.motivation}
                          helperText={errors.motivation?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="impact"
                      control={control}
                      rules={{
                        required: "This field is required",
                        minLength: {
                          value: 50,
                          message: "Please provide at least 50 characters",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="What impact do you intend to make during your service year?"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.impact}
                          helperText={errors.impact?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Key Skills
                    </Typography>
                    <Controller
                      name="skills"
                      control={control}
                      rules={{ required: "Please select at least one skill" }}
                      render={({ field }) => (
                        <FormGroup>
                          {skillsList.map((skill) => (
                            <FormControlLabel
                              key={skill}
                              control={
                                <Checkbox
                                  checked={field.value?.includes(skill)}
                                  onChange={(e) => {
                                    const updatedSkills = e.target.checked
                                      ? [...(field.value || []), skill]
                                      : (field.value || []).filter((s) => s !== skill)
                                    field.onChange(updatedSkills)
                                  }}
                                />
                              }
                              label={skill}
                            />
                          ))}
                        </FormGroup>
                      )}
                    />
                    {errors.skills && (
                      <Typography color="error" variant="caption">
                        {errors.skills.message}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="otherSkills"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Other Skills"
                          variant="outlined"
                          fullWidth
                          placeholder="Specify other skills..."
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Areas of Interest
                    </Typography>
                    <Controller
                      name="interests"
                      control={control}
                      rules={{ required: "Please select at least one area of interest" }}
                      render={({ field }) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {interestsList.map((interest) => (
                            <Chip
                              key={interest}
                              label={interest}
                              onClick={() => {
                                const updatedInterests = field.value?.includes(interest)
                                  ? field.value.filter((i) => i !== interest)
                                  : [...(field.value || []), interest]
                                field.onChange(updatedInterests)
                              }}
                              color={field.value?.includes(interest) ? "primary" : "default"}
                            />
                          ))}
                        </Box>
                      )}
                    />
                    {errors.interests && (
                      <Typography color="error" variant="caption">
                        {errors.interests.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}

              {activeStep === 4 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="termsAccepted"
                      control={control}
                      rules={{ required: "You must accept the terms and conditions" }}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} />}
                          label="I agree to the terms and conditions of the Winner's Circle"
                        />
                      )}
                    />
                    {errors.termsAccepted && <Typography color="error">{errors.termsAccepted.message}</Typography>}
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="emailUpdates"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} />}
                          label="I would like to receive email updates and notifications"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 3,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <StyledButton
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                  fullWidth={isMobile}
                  sx={{ marginBottom: isMobile ? 2 : 0 }}
                >
                  Back
                </StyledButton>
                {activeStep === steps.length - 1 ? (
                  <StyledButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !isStepComplete(activeStep)}
                    fullWidth={isMobile}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </StyledButton>
                ) : (
                  <StyledButton
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    fullWidth={isMobile}
                    disabled={!isStepComplete(activeStep)}
                  >
                    Next
                  </StyledButton>
                )}
              </Box>
            </StyledPaper>
          </form>

          {submitMessage && (
            <Typography variant="body1" align="center" color="primary" sx={{ marginTop: 2 }}>
              {submitMessage}
            </Typography>
          )}
        </Box>
      </Layout>
    </ThemeProvider>
  )
}

