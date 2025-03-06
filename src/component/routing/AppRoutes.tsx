import { Route, Routes, useLocation } from "react-router";
import { AppRouteKeys } from "./AppRouteKeys";
import Home from "../../pages/home";
import NotFound from "../../pages/not-found";
import Login from "../auth/Login";
import ParentDashboard from "../ParentDashboard";
import TutorDashboard from "../auth/TutorDashboard";
import TutorJobForm from "../../pages/job-form";
import SignupForm from "../Register";
import ParentRegistrationForm from "../Registration/parent-registration-form";
import TutorRegistrationForm from "../Registration/tutor-registration-form";
import InnovationBox from "../../pages/innovation-box";



const AppRoutes = () => {
  const location = useLocation();
  return (
    <Routes key={location.pathname} location={location}>
      <Route path={AppRouteKeys.root} element={<Home />} />
      <Route path={AppRouteKeys.login} element={<Login />} />
      <Route path={AppRouteKeys.tutorDashboard} element={<TutorDashboard />} />
      <Route path={AppRouteKeys.parentDashboard} element={<ParentDashboard />} />
      <Route path={AppRouteKeys.jobForm} element={<TutorJobForm />} />
      <Route path={AppRouteKeys.signup} element={<SignupForm />} />
      <Route path={AppRouteKeys.parentRegistration} element={<ParentRegistrationForm />} />
      <Route path={AppRouteKeys.tutorRegistration} element={<TutorRegistrationForm />} />
      <Route path={AppRouteKeys.innovationBox} element={<InnovationBox />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
