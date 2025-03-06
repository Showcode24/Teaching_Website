type ReviewInfoProps = {
  formData: {
    personalInfo: {
      fullName: string
      gender: string
    }
    contactInfo: {
      email: string
      phoneNumber: string
      address: string
    }
    bankInfo: {
      accountName: string
      accountNumber: string
      bankName: string
    }
    locationInfo: {
      selectedLGA: string
      selectedState: string
    }
    educationInfo: {
      qualification: string
      institution: string
      graduationYear: string
    }
    experienceInfo: {
      yearsOfExperience: string
      previousSchools: string[]
      specializations: string[]
    }
    subjectSelection: {
      [key: string]: string[]
    }
    bioInfo: {
      bio: string
      achievements: string[]
      interests: string[]
    }
  }
}

export default function ReviewInfo({ formData }: ReviewInfoProps) {
  return (
    <div>
      <h2 className="h3 mb-5">Review Your Information</h2>
      <p className="text-muted mb-4">Please review the information you've provided</p>

      {/* PERSONAL INFO */}
      {formData.personalInfo && (
        <div className="mb-5">
          <h5>Personal Information</h5>
          <p><strong>Name:</strong> {formData.personalInfo.fullName}</p>
          <p><strong>Gender:</strong> {formData.personalInfo.gender}</p>
        </div>
      )}

      {/* CONTACT INFO */}
      {formData.contactInfo && (
        <div className="mb-5">
          <h5>Contact Information</h5>
          <p><strong>Email:</strong> {formData.contactInfo.email}</p>
          <p><strong>Phone:</strong> {formData.contactInfo.phoneNumber}</p>
          <p><strong>Address:</strong> {formData.contactInfo.address}</p>
        </div>
      )}

      {/* BANK INFO (TUTORS ONLY) */}
      {formData.bankInfo && (
        <div className="mb-5">
          <h5>Bank Information</h5>
          <p><strong>Account Name:</strong> {formData.bankInfo?.accountName}</p>
          <p><strong>Account Number:</strong> {formData.bankInfo?.accountNumber}</p>
          <p><strong>Bank Name:</strong> {formData.bankInfo?.bankName}</p>
        </div>
      )}

      {/* LOCATION INFO */}
      {formData.locationInfo && (
        <div className="mb-5">
          <h5>Location</h5>
          <p><strong>LGA:</strong> {formData.locationInfo.selectedLGA}</p>
          <p><strong>State:</strong> {formData.locationInfo.selectedState}</p>
        </div>
      )}

      {/* EDUCATION INFO (TUTORS ONLY) */}
      {formData.educationInfo && (
        <div className="mb-5">
          <h5>Education</h5>
          <p><strong>Qualification:</strong> {formData.educationInfo?.qualification}</p>
          <p><strong>Institution:</strong> {formData.educationInfo?.institution}</p>
          <p><strong>Graduation Year:</strong> {formData.educationInfo?.graduationYear}</p>
        </div>
      )}

      {/* EXPERIENCE INFO (TUTORS ONLY) */}
      {formData.experienceInfo && (
        <div className="mb-5">
          <h5>Experience</h5>
          <p><strong>Years of Experience:</strong> {formData.experienceInfo?.yearsOfExperience}</p>
          <p><strong>Previous Schools:</strong> {formData.experienceInfo?.previousSchools?.join(", ")}</p>
          <p><strong>Specializations:</strong> {formData.experienceInfo?.specializations?.join(", ")}</p>
        </div>
      )}

      {/* SUBJECT SELECTION (TUTORS ONLY) */}
      {formData.subjectSelection && (
        <div className="mb-5">
          <h5>Subjects</h5>
          {Object.entries(formData.subjectSelection).map(([category, subjects]) => (
            <p key={category}>
              <strong>{category}:</strong> {subjects.join(", ")}
            </p>
          ))}
        </div>
      )}

      {/* BIO INFO (TUTORS ONLY) */}
      {formData.bioInfo && (
        <div className="mb-5">
          <h5>Bio Information</h5>
          <p><strong>Bio:</strong> {formData.bioInfo?.bio}</p>
          <p><strong>Achievements:</strong> {formData.bioInfo?.achievements?.join(", ")}</p>
          <p><strong>Interests:</strong> {formData.bioInfo?.interests?.join(", ")}</p>
        </div>
      )}

      <p className="text-muted">If you need to make any changes, please go back to the relevant section.</p>
    </div>
  )
}


