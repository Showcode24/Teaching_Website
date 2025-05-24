// import { collection, getDocs } from "firebase/firestore";
// import * as XLSX from "xlsx";
// import { db } from "../firebase/firebase";

// const ExportTeachers = () => {
//   // const fetchDataAndExport = async () => {
//   //   try {
//   //     const querySnapshot = await getDocs(collection(db, "tutors"));
//   //     const allData: any[] = [];

//   //     querySnapshot.forEach((doc) => {
//   //       const data = doc.data();

//   //       const flattened = {
//   //         fullName: data.personalInfo?.fullName || "",
//   //         gender: data.personalInfo?.gender || "",
//   //         address: data.contactInfo?.address || "",
//   //         email: data.contactInfo?.email || "",
//   //         phone: data.contactInfo?.phoneNumber || "",
//   //         accountName: data.bankInfo?.accountName || "",
//   //         accountNumber: data.bankInfo?.accountNumber || "",
//   //         bankName: data.bankInfo?.bankName || "",
//   //         bio: data.bioInfo?.bio || "",
//   //         achievements: Array.isArray(data.bioInfo?.achievements)
//   //           ? data.bioInfo.achievements.join(", ")
//   //           : data.bioInfo?.achievements || "",
//   //         interests: Array.isArray(data.bioInfo?.interests)
//   //           ? data.bioInfo.interests.join(", ")
//   //           : data.bioInfo?.interests || "",
//   //         state: data.locationInfo?.selectedState || "",
//   //         lga: data.locationInfo?.selectedLGA || "",
//   //         qualification: data.educationInfo?.qualification || "",
//   //         graduationYear: data.educationInfo?.graduationYear || "",
//   //         institution: data.educationInfo?.institution || "",
//   //         yearsOfExperience: data.experienceInfo?.yearsOfExperience || "",
//   //         previousSchools: Array.isArray(data.experienceInfo?.previousSchools)
//   //           ? data.experienceInfo.previousSchools.join(", ")
//   //           : data.experienceInfo?.previousSchools || "",
//   //         specializations: Array.isArray(data.experienceInfo?.specializations)
//   //           ? data.experienceInfo.specializations.join(", ")
//   //           : data.experienceInfo?.specializations || "",
//   //         languages: Array.isArray(data.subjectSelection?.languages)
//   //           ? data.subjectSelection.languages.join(", ")
//   //           : data.subjectSelection?.languages || "",
//   //         arts: Array.isArray(data.subjectSelection?.arts)
//   //           ? data.subjectSelection.arts.join(", ")
//   //           : data.subjectSelection?.arts || "",
//   //         vocational: Array.isArray(data.subjectSelection?.vocational)
//   //           ? data.subjectSelection.vocational.join(", ")
//   //           : data.subjectSelection?.vocational || "",
//   //       };

//   //       allData.push(flattened);
//   //     });

//   //     const worksheet = XLSX.utils.json_to_sheet(allData);
//   //     const workbook = XLSX.utils.book_new();
//   //     XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");

//   //     XLSX.writeFile(workbook, "teachers_data.xlsx");
//   //   } catch (error) {
//   //     console.error("Error fetching or exporting data:", error);
//   //   }
//   // };

//   // return (
//   //   <div>
//   //     <button onClick={fetchDataAndExport}>Export Teachers to Excel</button>
//   //   </div>
//   // );
// };

// export default ExportTeachers;
