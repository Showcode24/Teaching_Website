import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase"; // Adjust this import based on your Firebase config file location

// Form steps components
import PersonalInfo from "./steps/personal-info";
import ContactInfo from "./steps/contact-info";
import BankInfo from "./steps/bank-info";
import LocationInfo from "./steps/location-info";
import EducationInfo from "./steps/education-info";
import ExperienceInfo from "./steps/experience-info";
import SubjectsSelection from "./steps/subjects-selection";
import BioInfo from "./steps/bio-info";
import ReviewInfo from "./steps/review-info";
import SubmitInfo from "./steps/submit-info";

export default function TutorRegistrationForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 10;

  const [formData, setFormData] = useState({
    personalInfo: { fullName: "", gender: "" },
    contactInfo: { email: "", phoneNumber: "", address: "" },
    bankInfo: { accountName: "", accountNumber: "", bankName: "" },
    locationInfo: { selectedLGA: "", selectedState: "Edo" }, // Fixed property name
    educationInfo: { qualification: "", institution: "", graduationYear: "" },
    experienceInfo: { yearsOfExperience: "", previousSchools: [], specializations: [] },
    subjectSelection: {
      mathematics: [],
      sciences: [],
      languages: [],
      arts: [],
      technical: [],
      vocational: [],
    },
    bioInfo: { bio: "", achievements: [], interests: [] },
  });

  const handleDataChange = (step: keyof typeof formData, data: any) => {
    setFormData((prev) => ({ ...prev, [step]: { ...prev[step], ...data } }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      await setDoc(doc(db, "tutors", user.uid), formData);
      alert("Registration submitted successfully. Click 'OK' to proceed to your dashboard");
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Failed to submit registration. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo onDataChange={(data) => handleDataChange("personalInfo", data)} initialData={formData.personalInfo} />;
      case 2:
        return <ContactInfo onDataChange={(data) => handleDataChange("contactInfo", data)} initialData={formData.contactInfo} />;
      case 3:
        return <BankInfo onDataChange={(data) => handleDataChange("bankInfo", data)} initialData={formData.bankInfo} />;
      case 4:
        return <LocationInfo onDataChange={(data) => handleDataChange("locationInfo", data)} initialData={formData.locationInfo} />;
      case 5:
        return <EducationInfo onDataChange={(data) => handleDataChange("educationInfo", data)} initialData={formData.educationInfo} />;
      case 6:
        return <ExperienceInfo onDataChange={(data) => handleDataChange("experienceInfo", data)} initialData={formData.experienceInfo} />;
      case 7:
        return <SubjectsSelection onDataChange={(data) => handleDataChange("subjectSelection", data)} initialData={formData.subjectSelection} />;
      case 8:
        return <BioInfo onDataChange={(data) => handleDataChange("bioInfo", data)} initialData={formData.bioInfo} />;
      case 9:
        return <ReviewInfo formData={formData} />;
      case 10:
        return <SubmitInfo onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center p-5">
      <div className="w-100 text-left mb-4">{renderStep()}</div>

      <div className="w-100 mt-4">
        <div className="progress" style={{ height: "4px" }}>
          <div
            className={`progress-bar ${currentStep < 5 ? "progress-bar-primary" : currentStep < 8 ? "progress-bar-success" : "progress-bar-danger"}`}
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
          <button className="btn btn-primary" onClick={handleNext} style={{ marginLeft: currentStep === 1 ? "auto" : "0" }}>
            Next
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
