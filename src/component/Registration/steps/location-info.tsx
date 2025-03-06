import { useState, useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { nigeriaLGAs } from "../../../data/location";

interface LocationInfoProps {
  initialData?: { selectedState: string; selectedLGA: string }; // Optional initial values
  onDataChange?: (data: { selectedState: string; selectedLGA: string }) => void; // Callback function
}

export default function LocationInfo({ initialData, onDataChange }: LocationInfoProps) {
  const [selectedState, setSelectedState] = useState(initialData?.selectedState || "");
  const [selectedLGA, setSelectedLGA] = useState(initialData?.selectedLGA || "");

  useEffect(() => {
    if (onDataChange) {
      onDataChange({ selectedState, selectedLGA });
    }
  }, [selectedState, selectedLGA, onDataChange]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Location
      </Typography>

      {/* Select State */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>State</InputLabel>
        <Select
          value={selectedState}
          label="State"
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedLGA(""); // Reset LGA when State changes
          }}
        >
          <MenuItem value="">Select State</MenuItem>
          {Object.keys(nigeriaLGAs).map((state) => (
            <MenuItem key={state} value={state}>
              {state}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Select LGA */}
      <FormControl fullWidth sx={{ mb: 3 }} disabled={!selectedState}>
        <InputLabel>Local Government Area</InputLabel>
        <Select
          value={selectedLGA}
          label="Local Government Area"
          onChange={(e) => setSelectedLGA(e.target.value)}
        >
          <MenuItem value="">Select LGA</MenuItem>
          {selectedState &&
            nigeriaLGAs[selectedState]?.map((lga) => (
              <MenuItem key={lga} value={lga}>
                {lga}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Display Selected Location */}
      <TextField
        fullWidth
        label="Selected Location"
        variant="outlined"
        value={selectedState && selectedLGA ? `${selectedLGA}, ${selectedState}` : ""}
        InputProps={{ readOnly: true }}
      />
    </Box>
  );
}
