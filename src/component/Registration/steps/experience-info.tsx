import type React from "react"
import { useState, useEffect } from "react"
import { Box, Typography, TextField } from "@mui/material"

// Define prop types
type ExperienceInfoProps = {
  onDataChange?: (data: {
    yearsOfExperience: string
    previousSchools: string[]
    specializations: string[]
  }) => void
  initialData?: {
    yearsOfExperience: string
    previousSchools: string[]
    specializations: string[]
  }
}

export default function ExperienceInfo({ onDataChange, initialData }: ExperienceInfoProps) {
  const [experienceInfo, setExperienceInfo] = useState({
    yearsOfExperience: initialData?.yearsOfExperience || "",
    previousSchools: initialData?.previousSchools || [],
    specializations: initialData?.specializations || [],
  })

  // Track raw input values for text fields
  const [rawInputs, setRawInputs] = useState({
    previousSchools: experienceInfo.previousSchools.join(", "),
    specializations: experienceInfo.specializations.join(", "),
  })

  useEffect(() => {
    if (onDataChange) {
      onDataChange(experienceInfo)
    }
  }, [experienceInfo, onDataChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "previousSchools" || name === "specializations") {
      // Update the raw input first
      setRawInputs((prev) => ({ ...prev, [name]: value }))

      // Then update the processed array
      const processedArray = value
        ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : []
      setExperienceInfo((prev) => ({ ...prev, [name]: processedArray }))
    } else {
      // For yearsOfExperience, just update normally
      setExperienceInfo((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Experience Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Please provide details about your teaching experience
      </Typography>

      {/* Years of Experience - unchanged */}
      <TextField
        fullWidth
        label="Years of Teaching Experience"
        variant="outlined"
        name="yearsOfExperience"
        type="number"
        inputProps={{ min: 0 }}
        placeholder="Enter your years of experience"
        value={experienceInfo.yearsOfExperience}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Previous Schools - using raw input value */}
      <TextField
        fullWidth
        label="Previous Schools (if any)"
        variant="outlined"
        name="previousSchools"
        multiline
        rows={3}
        placeholder="List the schools you've taught at previously, separated by commas"
        value={rawInputs.previousSchools}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Areas of Specialization - using raw input value */}
      <TextField
        fullWidth
        label="Areas of Specialization"
        variant="outlined"
        name="specializations"
        placeholder="Enter your teaching specializations, separated by commas"
        value={rawInputs.specializations}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
    </Box>
  )
}

