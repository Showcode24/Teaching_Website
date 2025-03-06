import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Box, Button, Checkbox, FormControlLabel, Typography, Alert } from "@mui/material";

interface SubmitInfoProps {
  onSubmit: () => Promise<void>;
}

export default function SubmitInfo({ onSubmit }: SubmitInfoProps) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async () => {
    if (!agreed) {
      setError("Please agree to the terms and conditions before submitting.");
      return;
    }
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is signed in");

      await onSubmit();

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        navigate(userRole === "tutor" ? "/tutor-dashboard" : userRole === "parent" ? "/parent-dashboard" : "/");
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("An error occurred while submitting your application. Please try again.");
    }
  };

  return (
    <Box textAlign="center" maxWidth={500} mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>
        Submit Your Application
      </Typography>
      <Typography color="textSecondary" mb={3}>
        You're almost done! Click the button below to submit your application.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControlLabel
        control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
        label="I agree to the terms and conditions"
      />

      <Button variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
        Submit Application
      </Button>

      <Typography variant="body2" color="textSecondary" mt={2}>
        By clicking "Submit Application", you confirm that all the information provided is accurate and complete.
      </Typography>
    </Box>
  );
}
