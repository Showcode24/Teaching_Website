export enum AppRouteKeys {
  root = "/",
  signup = "/sign-up",
  register = "/register",
  login = "/login",
  tutorDashboard = "/tutor-dashboard",
  parentDashboard = "/parent-dashboard",
  tutorRegistration = "/tutor-registration",
  parentRegistration = "/parent-registration",
  innovationBox = "/innovation-box",
  jobForm = "/job-form"
}

export type AppRouteType = {
  label: string;
  role: string;
};

export const AppRouteMap: { [key in AppRouteKeys]: AppRouteType } = {
  [AppRouteKeys.root]: { label: "Home | Kopa360", role: "none" },
 "/sign-up": {
    label: "Sign Up",
    role: "none",
  },
  "/register": {
    label: "Register",
    role: "none",
  },
  "/login": {
    label: "Login",
    role: "none",
  },
  "/tutor-dashboard": {
    label: "Tutor Dashboard",
    role: "none",
  },
  "/parent-dashboard": {
    label: "Parent Dashboard",
    role: "none",
  },
  "/tutor-registration": {
    label: "Tutor Registration",
    role: "none",
  },
  "/parent-registration": {
    label: "Parent Registration",
    role: "none",
  },
  "/innovation-box": {
    label: "Innovation Box",
    role: "none",
  },
  "/job-form": {
    label: "Job Form",
    role: "none",
  }
};

export default AppRouteKeys;
