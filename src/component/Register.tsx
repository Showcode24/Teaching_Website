import type React from "react"

import { useState } from "react"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  type SelectChangeEvent,
} from "@mui/material"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase/firebase"
import { nigeriaLGAs } from "../data/location"


const states = Object.keys(nigeriaLGAs)

export default function SignupForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    state: "",
    localGovernment: "",
    emailUpdates: true,
    termsAccepted: false,
    role: "parent",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await sendEmailVerification(userCredential.user)
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...formData,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setOpenSnackbar(true)
      setTimeout(() => {
        navigate(formData.role === "tutor" ? "/tutor-registration" : "/parent-registration")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset LGA if state changes
      ...(name === "state" && { localGovernment: "" }),
    }))
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" fullWidth margin="normal">
            <Typography>I am a:</Typography>
            <RadioGroup row name="role" value={formData.role} onChange={handleInputChange}>
              <FormControlLabel value="parent" control={<Radio />} label="Parent" />
              <FormControlLabel value="tutor" control={<Radio />} label="Tutor" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            required
            onChange={handleInputChange}
            margin="normal"
          />

          <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            required
            onChange={handleInputChange}
            margin="normal"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            onChange={handleInputChange}
            margin="normal"
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            onChange={handleInputChange}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* State Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>State</InputLabel>
            <Select name="state" value={formData.state} onChange={handleSelectChange} required>
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* LGA Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Local Government Area</InputLabel>
            <Select
              name="localGovernment"
              value={formData.localGovernment}
              onChange={handleSelectChange}
              disabled={!formData.state}
              required
            >
              {formData.state &&
                nigeriaLGAs[formData.state]?.map((lga) => (
                  <MenuItem key={lga} value={lga}>
                    {lga}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={formData.emailUpdates} onChange={handleInputChange} name="emailUpdates" />}
            label="Send me emails with tips on finding tutors."
          />

          <FormControlLabel
            control={
              <Checkbox checked={formData.termsAccepted} onChange={handleInputChange} name="termsAccepted" required />
            }
            label={
              <Typography>
                I agree to the <a href="/terms">Terms</a>,<a href="/user-agreement">User Agreement</a>, and
                <a href="/privacy">Privacy Policy</a>.
              </Typography>
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !formData.termsAccepted}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create my account"}
          </Button>
        </form>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success">Account created successfully! Redirecting...</Alert>
      </Snackbar>
    </Container>
  )
}

