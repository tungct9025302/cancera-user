import React from "react";

import { useLocation } from "react-router-dom";

import Appointment from "./appointment";
import GeneralExamination from "./general_examination";
import Treatment from "./treatment";

const CheckHistory = () => {
  // const [value, onChange] = useState(new Date());

  const location = useLocation();

  const { boxTitle } = location.state;

  return boxTitle === "appointments" ? (
    <Appointment></Appointment>
  ) : boxTitle === "general examinations" ? (
    <GeneralExamination></GeneralExamination>
  ) : boxTitle === "treatments" ? (
    <Treatment></Treatment>
  ) : null;
};

export default CheckHistory;
