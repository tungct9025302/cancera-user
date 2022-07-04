import React, { useContext, useState, useEffect } from "react";

import { useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../../../database/firebaseConfigs";
import { async } from "@firebase/util";
import Appointment from "./appointment";
import GeneralExamination from "./general_examination";
import Treatment from "./treatment";

const Add = () => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const { boxTitle } = location.state;
  const [fetchedList, setFetchedList] = useState([]);
  useEffect(() => {
    if (currentUser !== null) {
      fetchUserData(currentUser);
    }

    return () => {
      setFetchedList([]);
    };
  }, []);

  const fetchUserData = async (user) => {
    let userData = [];
    if (user !== undefined) {
      try {
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const patientDocSnap = await getDoc(doc(db, "patients", user.uid));

        if (userDocSnap.exists()) {
          userData = { ...userDocSnap.data() };
        }

        if (patientDocSnap.exists()) {
          userData = { ...patientDocSnap.data() };
        }

        setFetchedList(userData);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return boxTitle === "appointments" && fetchedList["role"] === "doctor" ? (
    <Appointment></Appointment>
  ) : boxTitle === "general examinations" ? (
    <GeneralExamination></GeneralExamination>
  ) : boxTitle === "treatments" ? (
    <Treatment></Treatment>
  ) : null;
};

export default Add;
