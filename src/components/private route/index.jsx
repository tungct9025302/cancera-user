import React, { Component, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export const PrivateRoute = ({ children, path, fetchedList }) => {
  const { currentUser } = useContext(AuthContext);
  let propertiesPath = {
    patientPaths: [
      "/view/my-appointments",
      "/view/my-general-examinations",
      "/view/my-treatments",
    ],

    nursePaths: [
      "/my-patients",
      "/search-patient",
      "/search-patient/id=:pid/check-history/:type",
      "/search-patient/id=:pid/add/:boxType",
      "/modify/pid=:pid/:type/id=:id",
      "/search/cancer/:cancername",
      "/search/patient/id=:pid",
    ],
    doctorPaths: [
      "/my-patients",
      "/my-appointments",
      "/search-patient",
      "/search-patient/id=:pid/check-history/:type",
      "/search-patient/id=:pid/add/:boxType",
      "/modify/pid=:pid/:type/id=:id",
      "/search/cancer/:cancername",
      "/search/patient/id=:pid",
    ],
  };

  switch (fetchedList["role"]) {
    case "doctor":
      if (propertiesPath["doctorPaths"].includes(path)) {
        return children;
      } else {
        return null;
      }
    case "nurse":
      if (propertiesPath["nursePaths"].includes(path)) {
        return children;
      } else {
        return null;
      }
    case "patient":
      if (propertiesPath["patientPaths"].includes(path)) {
        return children;
      } else {
        return null;
      }

    default:
      if (!currentUser) {
        return children;
      } else {
        return null;
      }
  }
};
