import React, { useState, useEffect } from "react";
import { Box, Typography, TextField } from "@mui/material";

type ContactInfoProps = {
  onDataChange?: (data: {
    email: string;
    phoneNumber: string;
    address: string;
  }) => void;
  initialData?: {
    email: string;
    phoneNumber: string;
    address: string;
  };
};

export default function ContactInfo({ onDataChange, initialData }: ContactInfoProps) {
  const [contactInfo, setContactInfo] = useState({
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    address: initialData?.address || "",
  });

  useEffect(() => {
    if (onDataChange) {
      onDataChange(contactInfo);
    }
  }, [contactInfo, onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600}>
        Contact Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        How can we reach you?
      </Typography>

      {/* Email Input */}
      <TextField
        fullWidth
        label="Email Address"
        variant="outlined"
        name="email"
        type="email"
        value={contactInfo.email}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Phone Number Input */}
      <TextField
        fullWidth
        label="Phone Number"
        variant="outlined"
        name="phoneNumber"
        type="tel"
        value={contactInfo.phoneNumber}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Address Input */}
      <TextField
        fullWidth
        label="Address"
        variant="outlined"
        name="address"
        multiline
        rows={3}
        value={contactInfo.address}
        onChange={handleChange}
      />
    </Box>
  );
}
