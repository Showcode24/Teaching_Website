import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

type EducationInfoProps = {
  onDataChange?: (data: {
    qualification: string;
    institution: string;
    graduationYear: string;
  }) => void;
  initialData?: {
    qualification: string;
    institution: string;
    graduationYear: string;
  };
};

export default function EducationInfo({ onDataChange, initialData }: EducationInfoProps) {
  const [educationInfo, setEducationInfo] = useState({
    qualification: initialData?.qualification || "",
    institution: initialData?.institution || "",
    graduationYear: initialData?.graduationYear || "",
  });

  useEffect(() => {
    if (onDataChange) {
      onDataChange(educationInfo);
    }
  }, [educationInfo, onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEducationInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setEducationInfo((prev) => ({ ...prev, qualification: e.target.value }));
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Education Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Please provide details about your educational background
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Highest Qualification</InputLabel>
        <Select name="qualification" value={educationInfo.qualification} onChange={handleSelectChange}>
          <MenuItem value="">Select your highest qualification</MenuItem>
          <MenuItem value="high-school">High School</MenuItem>
          <MenuItem value="bachelors">Bachelor's Degree</MenuItem>
          <MenuItem value="masters">Master's Degree</MenuItem>
          <MenuItem value="phd">Ph.D.</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Institution Name"
        variant="outlined"
        name="institution"
        placeholder="Enter the name of your institution"
        value={educationInfo.institution}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Year of Graduation"
        variant="outlined"
        name="graduationYear"
        type="number"
        inputProps={{ min: 1900, max: new Date().getFullYear() }}
        placeholder="Enter your graduation year"
        value={educationInfo.graduationYear}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
    </Box>
  );
}