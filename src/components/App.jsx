import React, { useContext, useState, useEffect } from "react";

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
import { auth, db } from "../database/firebaseConfigs";
import { async } from "@firebase/util";
import { Box, Flex, Button } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "../components/commons/Header";
import Footer from "../components/commons/Footer";
import { routeConfigs } from "../configs";
import { AuthContext } from "./context/AuthContext";
import { PrivateRoute } from "./private route";

const App = () => {
  const { currentUser } = useContext(AuthContext);
  const [fetchedList, setFetchedList] = useState([]);

  // useEffect(() => {
  //   fetchUserData(currentUser);

  //   return () => {
  //     setFetchedList([]);
  //   };
  // }, []);

  // const fetchUserData = async (user) => {
  //   let userData = [];
  //   if (user !== undefined) {
  //     try {
  //       const userDocSnap = await getDoc(doc(db, "users", user.uid));
  //       const patientDocSnap = await getDoc(doc(db, "patients", user.uid));

  //       if (userDocSnap.exists()) {
  //         userData = { ...userDocSnap.data() };
  //       }

  //       if (patientDocSnap.exists()) {
  //         userData = { ...patientDocSnap.data() };
  //       }

  //       setFetchedList(userData);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  // };

  const renderRoutes = () => {
    return routeConfigs.map(({ path, element }) => (
      <Route
        key={path}
        path={path}
        // element={
        //   <PrivateRoute path={path} fetchedList={fetchedList}>
        //     {element}
        //   </PrivateRoute>
        // }
        element={element}
      />
    ));
  };
  //ok
  return (
    <BrowserRouter>
      <Box
        // position="relative"
        margin="0"
        padding="0"
        overflow="auto"
      >
        <Header position="absolute" />
        <Box minH="70vh" pb="56px">
          <Routes>{renderRoutes()}</Routes>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
};

export default App;
