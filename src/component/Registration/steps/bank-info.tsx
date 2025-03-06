import React, { useState, useEffect } from "react";
import { Box, Typography, TextField } from "@mui/material";

// Defining prop types
type BankInfoProps = {
  onDataChange?: (data: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  }) => void;
  initialData?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
};

export default function BankInfo({ onDataChange, initialData }: BankInfoProps) {
  // State for bank information
  const [bankInfo, setBankInfo] = useState({
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
    bankName: initialData?.bankName || "",
  });

  // Effect to notify parent when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(bankInfo);
    }
  }, [bankInfo, onDataChange]);

  // Function to handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600}>
        Bank Information
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Please provide your banking details
      </Typography>

      {/* Account Name Input */}
      <TextField
        fullWidth
        label="Account Name"
        variant="outlined"
        name="accountName"
        value={bankInfo.accountName}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Account Number Input */}
      <TextField
        fullWidth
        label="Account Number"
        variant="outlined"
        name="accountNumber"
        type="text"
        inputProps={{ maxLength: 10 }}
        value={bankInfo.accountNumber}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {/* Bank Name Input */}
      <TextField
        fullWidth
        label="Bank Name"
        variant="outlined"
        name="bankName"
        value={bankInfo.bankName}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
    </Box>
  );
}
