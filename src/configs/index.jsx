//Guest
import Indicator from "../components/guest/indicator";
import Search from "../components/guest/search";
import Treatment from "../components/guest/treatment";
import Guideline from "../components/guest/guideline";
import Home from "../components/guest/home";
import DetailIndicator from "../components/commons/DisplayDetail/DetailIndicator";
import DetailCancer from "../components/commons/DisplayDetail/DetailCancer";
import DetailTreatment from "../components/commons/DisplayDetail/DetailTreatment";

//Staff
import Check from "../components/staffs/additionalFunctionalities/check";
import Add from "../components/staffs/additionalFunctionalities/add";
import Modify from "../components/staffs/additionalFunctionalities/modify";
import SearchPatient from "../components/staffs/searchPatient";
import MyPatient from "../components/staffs/myPatient";
import DetailPatient from "../components/commons/DisplayDetail/DetailPatient";
import MyGeneralExaminations from "../components/staffs/myGeneralExaminations";

//Doctor Only
import MyAppointments from "../components/staffs/doctorOnly/myAppointments";

//Patient
import ViewMyTreatments from "../components/patient/view/treatments";
import ViewMyAppointments from "../components/patient/view/appointments";
import ViewMyGeneralExaminations from "../components/patient/view/general_examinations";
import AddPatient from "../components/staffs/addPatient";

export const secondGuestHeaderConfigs = [
  {
    label: "HOME",
    path: "/home",
    color: "#4a4a4a",
  },
  {
    label: "INDICATOR",
    path: "/indicator",
    color: "#4a4a4a",
  },
  {
    label: "TREATMENT",
    path: "/treatment",
    color: "#4a4a4a",
  },
  {
    label: "GUIDELINE",
    path: "/guideline",
    color: "#4a4a4a",
  },
];

export const firstGuestHeaderConfigs = [
  {
    label: "CORONA NEWS",
    path: "/corona-news",
    color: "red",
  },
  {
    label: "FIND A DOCTOR",
    path: "/find-doctor",
    color: "#187aab",
  },
  {
    label: "CONNECT TO CARE",
    path: "/connect-to-care",
    color: "#187aab",
  },
  {
    label: "FIND DRUG PRICES",
    path: "/find-drug-prices",
    color: "#187aab",
  },
];

//Doctors
export const secondDoctorHeaderConfigs = [
  {
    label: "MY PATIENTS",
    path: "/my-patients",
    color: "#4a4a4a",
  },
  {
    label: "MY APPOINTMENTS",
    path: "/my-appointments",
    color: "#4a4a4a",
  },
  {
    label: "MY GENERAL EXAMINATIONS",
    path: "/my-general-examinations",
    color: "#4a4a4a",
  },
  {
    label: "SEARCH PATIENT",
    path: "/search-patient",
    color: "#4a4a4a",
  },
];

export const firstDoctorHeaderConfigs = [
  {
    label: "CORONA NEWS",
    path: "/corona-news",
    color: "red",
  },
  {
    label: "FIND A DOCTOR",
    path: "/find-doctor",
    color: "#187aab",
  },
  {
    label: "CONNECT TO CARE",
    path: "/connect-to-care",
    color: "#187aab",
  },
  {
    label: "FIND DRUG PRICES",
    path: "/find-drug-prices",
    color: "#187aab",
  },
];

//Nurses
export const secondNurseHeaderConfigs = [
  {
    label: "MY PATIENTS",
    path: "/my-patients",
    color: "#4a4a4a",
  },
  {
    label: "MY GENERAL EXAMINATIONS",
    path: "/my-general-examinations",
    color: "#4a4a4a",
  },
  {
    label: "SEARCH PATIENT",
    path: "/search-patient",
    color: "#4a4a4a",
  },
];

export const firstNurseHeaderConfigs = [
  {
    label: "CORONA NEWS",
    path: "/corona-news",
    color: "red",
  },
  {
    label: "FIND A DOCTOR",
    path: "/find-doctor",
    color: "#187aab",
  },
  {
    label: "CONNECT TO CARE",
    path: "/connect-to-care",
    color: "#187aab",
  },
  {
    label: "FIND DRUG PRICES",
    path: "/find-drug-prices",
    color: "#187aab",
  },
];

//Patient
export const secondPatientHeaderConfigs = [
  {
    label: "HOME",
    path: "/home",
    color: "#4a4a4a",
  },
  {
    label: "MY APPOINTMENTS",
    path: "/view/my-appointments",
    color: "#4a4a4a",
  },
  {
    label: "MY GENERAL EXAMINATIONS",
    path: "/view/my-general-examinations",
    color: "#4a4a4a",
  },
  {
    label: "MY TREATMENTS",
    path: "/view/my-treatments",
    color: "#4a4a4a",
  },
];

export const firstPatientHeaderConfigs = [
  {
    label: "CORONA NEWS",
    path: "/corona-news",
    color: "red",
  },
  {
    label: "FIND A DOCTOR",
    path: "/find-doctor",
    color: "#187aab",
  },
  {
    label: "CONNECT TO CARE",
    path: "/connect-to-care",
    color: "#187aab",
  },
  {
    label: "FIND DRUG PRICES",
    path: "/find-drug-prices",
    color: "#187aab",
  },
];

//Default setup
const defaultColor = "blue";

export const colorConfigs = {
  primaryColor: `${defaultColor}.400`,
  primaryHover: `${defaultColor}.200`,
  secondaryColor: `#2977c2`,
};

//Set path
export const routeConfigs = [
  //Doctor

  {
    path: "/my-appointments",
    element: <MyAppointments />,
  },

  //Nurse and Doctor
  {
    path: "/search-patient",
    element: <SearchPatient />,
  },
  {
    path: "/search-patient/id=:pid/check-history/:type",
    element: <Check />,
  },
  {
    path: "/search-patient/id=:pid/add/:boxType",
    element: <Add />,
  },
  {
    path: "/modify/pid=:pid/:type/id=:id",
    element: <Modify />,
  },
  {
    path: "/my-patients",
    element: <MyPatient />,
  },
  {
    path: "/search/patient/id=:pid",
    element: <DetailPatient />,
  },
  {
    path: "/add-patient",
    element: <AddPatient />,
  },
  {
    path: "/my-general-examinations",
    element: <MyGeneralExaminations />,
  },
  //Guest
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/indicator",
    element: <Indicator />,
  },
  {
    path: "/treatment",
    element: <Treatment />,
  },
  {
    path: "/guideline",
    element: <Guideline />,
  },
  {
    path: "/search/cancer/:cancername",
    element: <DetailCancer />,
  },
  {
    path: "/search/indicator/:indicatorname",
    element: <DetailIndicator />,
  },
  {
    path: "/search/treatment/:treatmentname",
    element: <DetailTreatment />,
  },

  //Patient
  {
    path: "/view/my-appointments",
    element: <ViewMyAppointments />,
  },
  {
    path: "/view/my-general-examinations",
    element: <ViewMyGeneralExaminations />,
  },
  {
    path: "/view/my-treatments",
    element: <ViewMyTreatments />,
  },
];

// path: "/check-history/:type",
