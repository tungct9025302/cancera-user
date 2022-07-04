import React from "react";

import { useLocation } from "react-router-dom";

import ModifyAppointment from "./appointment";

import ModifyGeneralExamination from "./general_examination";
import ModifyTreatment from "./treatment";

const Modify = () => {
  // const [value, onChange] = useState(new Date());

  const location = useLocation();

  const { boxTitle } = location.state;

  return boxTitle === "appointments" ? (
    <ModifyAppointment></ModifyAppointment>
  ) : boxTitle === "general examinations" ? (
    <ModifyGeneralExamination></ModifyGeneralExamination>
  ) : boxTitle === "treatments" ? (
    <ModifyTreatment></ModifyTreatment>
  ) : null;
};

export default Modify;
