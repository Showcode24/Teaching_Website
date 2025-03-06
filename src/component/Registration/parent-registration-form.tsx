import { useState } from "react"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../../firebase/firebase"

// Form steps components
import PersonalInfo from "./steps/personal-info"
import ContactInfo from "./steps/contact-info"
import LocationInfo from "./steps/location-info"
import ReviewInfo from "./steps/review-info"
import SubmitInfo from "./steps/submit-info"

export default function ParentRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [formData, setFormData] = useState({
    personalInfo: { fullName: "", gender: "" },
    contactInfo: { email: "", phoneNumber: "", address: "" },
    locationInfo: { selectedLGA: "", selectedState: "Edo" },
  })

  const handleDataChange = (step: keyof typeof formData, data: any) => { // eslint-disable-next-line @typescript-eslint/no-explicit-any

    setFormData((prev) => ({ ...prev, [step]: { ...prev[step], ...data } }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user found")
      }

      await setDoc(doc(db, "parents", user.uid), formData)
      alert("Registration submitted successfully!")
    } catch (error) {
      console.error("Error submitting registration:", error)
      alert("Failed to submit registration. Please try again.")
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfo
            onDataChange={(data) => handleDataChange("personalInfo", data)}
            initialData={formData.personalInfo}
          />
        )
      case 2:
        return (
          <ContactInfo
            onDataChange={(data) => handleDataChange("contactInfo", data)}
            initialData={formData.contactInfo}
          />
        )
      case 3:
        return (
          <LocationInfo
            onDataChange={(data) => handleDataChange("locationInfo", data)}
            initialData={formData.locationInfo}
          />
        )
      case 4:
        return <ReviewInfo formData={formData as any} />// eslint-disable-next-line @typescript-eslint/no-explicit-any

      case 5:
        return <SubmitInfo onSubmit={handleSubmit} />
      default:
        return null
    }
  }

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-5">
      <h1 className="mb-4">Parent Registration</h1>
      <div className="w-100 text-left mb-4">{renderStep()}</div>

      <div className="w-100 mt-4">
        <div className="progress" style={{ height: "4px" }}>
          <div
            className={`progress-bar ${currentStep < 3 ? "bg-primary" : currentStep < 4 ? "bg-info" : "bg-success"}`}
            role="progressbar"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            aria-valuenow={(currentStep / totalSteps) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>

      <div className="d-flex justify-content-between w-100 mt-4">
        {currentStep > 1 && (
          <button className="btn btn-outline-secondary" onClick={handleBack}>
            Back
          </button>
        )}
        {currentStep < totalSteps ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ marginLeft: currentStep === 1 ? "auto" : "0" }}
          >
            Next
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit}>
            Submit Registration
          </button>
        )}
      </div>
    </div>
  )
}

