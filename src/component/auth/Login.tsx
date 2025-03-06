import type React from "react"
import { useState } from "react"
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material"
import { auth, db } from "../../firebase/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState("")
  const [resendSuccess, setResendSuccess] = useState(false)
  const navigate = useNavigate()

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendError("")
    setResendSuccess(false)

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
        setResendSuccess(true)
      }
    } catch (error) {
      setResendError((error as Error).message)
    } finally {
      setIsResending(false)
    }
  }

  const handleUserRedirect = async (uid: string) => {
    try {
      // Check in tutors collection
      const tutorDoc = await getDoc(doc(db, "tutors", uid))
      if (tutorDoc.exists()) {
        navigate("/tutor-dashboard")
        return
      }

      // Check in parents collection
      const parentDoc = await getDoc(doc(db, "parents", uid))
      if (parentDoc.exists()) {
        navigate("/parent-dashboard")
        return
      }

      // If not found in tutors or parents, check users collection
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        // Check if email is verified
        if (!auth.currentUser?.emailVerified) {
          setShowVerificationDialog(true)
          return
        }

        const userData = userDoc.data()
        const role = userData.role

        if (role === "tutor") {
          navigate("/tutor-registration")
        } else if (role === "parent") {
          navigate("/parent-registration")
        } else {
          console.error("Unknown role:", role)
          alert("User role is not recognized.")
        }
      } else {
        console.error("User document not found.")
        alert("No user data found. Please complete registration.")
        navigate("/register")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      alert("Failed to fetch user data. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid
      console.log("Login successful with email:", email)

      await handleUserRedirect(uid)
    } catch (error) {
      console.error("Error logging in:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const uid = userCredential.user.uid
      console.log("Login successful with Google")

      await handleUserRedirect(uid)
    } catch (error) {
      console.error("Error with Google Sign-In:", error)
      alert((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Log in to Kopa360</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                className="form-control custom-placeholder search-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <input
                type="password"
                className="form-control custom-placeholder search-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="continue-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button type="button" className="google-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.61 0 3.05.56 4.18 1.65l3.13-3.13C17.44 1.39 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84C6.71 5.69 9.14 4.77 12 4.77z"
            />
          </svg>
          {isLoading ? "Signing in..." : "Google"}
        </button>

        <div className="signup-prompt">
          <p>
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Email Verification Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            We sent a verification link to <strong>{auth.currentUser?.email}</strong>.
            Please check your email and click the link to verify your account.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If you don't see the email, check your spam folder.
          </Typography>
          {resendError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {resendError}
            </Alert>
          )}
          {resendSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Verification email sent successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowVerificationDialog(false)}
            color="inherit"
          >
            Close
          </Button>
          <Button
            onClick={handleResendVerification}
            variant="contained"
            disabled={isResending}
            startIcon={isResending ? <CircularProgress size={20} /> : null}
          >
            Resend Verification Email
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}





// import type React from "react"
// import { useState } from "react"
// import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
// import { doc, getDoc } from "firebase/firestore"
// import { useNavigate } from "react-router-dom"
// import { auth, db } from "../../firebase/firebase"


// export default function Login() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const navigate = useNavigate()

//   const handleUserRedirect = async (uid: string) => {
//     try {
//       // Check in tutors collection
//       const tutorDoc = await getDoc(doc(db, "tutors", uid))
//       if (tutorDoc.exists()) {
//         navigate("/tutor-dashboard")
//         return
//       }

//       // Check in parents collection
//       const parentDoc = await getDoc(doc(db, "parents", uid))
//       if (parentDoc.exists()) {
//         navigate("/parent-dashboard")
//         return
//       }

//       // If not found in tutors or parents, check users collection
//       const userDoc = await getDoc(doc(db, "users", uid))
//       if (userDoc.exists()) {
//         const userData = userDoc.data()
//         const role = userData.role

//         if (role === "tutor") {
//           navigate("/tutor-registration")
//         } else if (role === "parent") {
//           navigate("/parent-registration")
//         } else {
//           console.error("Unknown role:", role)
//           alert("User role is not recognized.")
//         }
//       } else {
//         console.error("User document not found.")
//         alert("No user data found. Please complete registration.")
//         navigate("/register")
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error)
//       alert("Failed to fetch user data. Please try again.")
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password)
//       const uid = userCredential.user.uid
//       console.log("Login successful with email:", email)

//       await handleUserRedirect(uid)
//     } catch (error) {
//       console.error("Error logging in:", error)
//       alert((error as Error).message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleGoogleSignIn = async () => {
//     setIsLoading(true)

//     try {
//       const provider = new GoogleAuthProvider()
//       const userCredential = await signInWithPopup(auth, provider)
//       const uid = userCredential.user.uid
//       console.log("Login successful with Google")

//       await handleUserRedirect(uid)
//     } catch (error) {
//       console.error("Error with Google Sign-In:", error)
//       alert((error as Error).message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h1 className="login-title">Log in to Kopa360</h1>

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <div className="input-container">
//               <input
//                 type="email"
//                 className="form-control custom-placeholder search-input"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <div className="input-container">
//               <input
//                 type="password"
//                 className="form-control custom-placeholder search-input"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <button type="submit" className="continue-btn" disabled={isLoading}>
//             {isLoading ? "Logging in..." : "Continue"}
//           </button>
//         </form>

//         <div className="divider">
//           <span>or</span>
//         </div>

//         <button type="button" className="google-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
//           <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
//             <path
//               fill="#4285F4"
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//             />
//             <path
//               fill="#34A853"
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//             />
//             <path
//               fill="#FBBC05"
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//             />
//             <path
//               fill="#EA4335"
//               d="M12 4.77c1.61 0 3.05.56 4.18 1.65l3.13-3.13C17.44 1.39 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84C6.71 5.69 9.14 4.77 12 4.77z"
//             />
//           </svg>
//           {isLoading ? "Signing in..." : "Google"}
//         </button>

//         <div className="signup-prompt">
//           <p>
//             Don't have an account? <a href="/register">Register</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

