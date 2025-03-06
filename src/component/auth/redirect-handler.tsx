"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../../firebase/firebase"
import { User } from "firebase/auth"

const RedirectHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== "/") {
      return
    }

    const isReturningUser = localStorage.getItem("returningUser")

    const handleAuthChange = async (user: User | null) => {
      if (location.pathname !== "/") {
        return
      }

      if (!isReturningUser) {
        localStorage.setItem("returningUser", "true")
        return
      }

      if (user) {
        try {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const userType = userSnap.data().role
            if (userType === "parent") {
              navigate("/parent-dashboard")
            } else if (userType === "tutor") {
              navigate("/tutor-dashboard")
            } else {
              navigate("/")
            }
          } else {
            navigate("/")
          }
        } catch (error) {
          console.error("Error checking user type:", error)
          navigate("/")
        }
      }
    }

    const unsubscribe = auth.onAuthStateChanged(handleAuthChange)
    return () => unsubscribe()
  }, [navigate, location.pathname])

  return null
}

export default RedirectHandler
