import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";

// Defining prop types
type PersonalInfoProps = {
  onDataChange?: (data: { fullName: string; gender: string }) => void;
  initialData?: { fullName: string; gender: string };
};

export default function PersonalInfo({ onDataChange, initialData }: PersonalInfoProps) {
  // Setting up state for fullName and gender
  const [personalInfo, setPersonalInfo] = useState({
    fullName: initialData?.fullName || "",
    gender: initialData?.gender || "",
  });

  // Effect to notify parent when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(personalInfo);
    }
  }, [personalInfo, onDataChange]);

  // Function to handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600}>
        Personal Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Please provide your basic information
      </Typography>

      {/* Full Name Input */}
      <TextField
        fullWidth
        label="Full Name"
        variant="outlined"
        name="fullName"
        value={personalInfo.fullName}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Gender Selection */}
      <FormControl>
        <FormLabel>Gender</FormLabel>
        <RadioGroup name="gender" value={personalInfo.gender} onChange={handleChange} row>
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="female" control={<Radio />} label="Female" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
}
