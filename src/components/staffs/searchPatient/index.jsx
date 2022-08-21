import React, { useState, useEffect, useContext } from "react";
import { Text, Box, Flex, List, ListItem, Spinner } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import DoctorBackground from "../../../pictures/doctor_background.jpg";
import SearchBar from "../../commons/SearchBar";

import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../../database/firebaseConfigs";
import { AuthContext } from "../../context/AuthContext";
import SpinnerComponent from "../../commons/Spinner";

const SearchPatient = () => {
  const { currentUser } = useContext(AuthContext);
  const [fetchedList, setFetchedList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [role, setRole] = useState("");
  const [allPatients, setAllPatients] = useState([]);
  const [wordEntered, setWordEntered] = useState("");
  const [clickedAlphabet, setClickedAlphabet] = useState();
  const [sameAlphabet, setSameAlphabet] = useState(false);
  const [expand, setExpand] = useState(false);
  //database
  useEffect(() => {
    fetchData();
    return () => {
      setFetchedList([]);
    };
  }, []);
  let listExistedAlphabet = [];
  let listExistedPatients = [];
  const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");

  const fetchData = async () => {
    let userData,
      patientsData = [];

    try {
      //get all patients
      const querySnapshot = await getDocs(collection(db, "patients"));
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setAllPatients(patientsData);

      //get data if user
      const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        userData = { ...userDocSnap.data() };
        setFetchedList(userData);
        setRole(userData["role"]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);

    const newFilter = allPatients.filter((value) => {
      if (searchWord.match(/^\d/)) {
        return value["pid"].toString().includes(searchWord);
      } else {
        return value["name"].toLowerCase().includes(searchWord.toLowerCase());
      }
    });

    if (searchWord === "") {
      setFilteredData([]);
    } else {
      setFilteredData(newFilter);
    }
  };

  const renderPatientsList = (alphabet) => {
    return allPatients !== undefined
      ? allPatients.map((patient, index) => {
          return (
            <ListItem
              key={index}
              display={
                // listExistedAlphabet.includes(alphabet) &&
                patient["name"].charAt(0).toLowerCase() === alphabet &&
                !listExistedPatients.includes(patient["pid"])
                  ? "inline-block"
                  : "none"
              }
              pb="20px"
              w="100%"
              mr="20px"
            >
              <Flex direction="column">
                <Link
                  to={`/search/patient/id=${patient["pid"]}`}
                  state={{ dataType: "PatientData", pid: patient["pid"] }}
                >
                  <Flex direction="row" justifyContent="space-between">
                    <Text
                      color="#034254"
                      fontFamily="Source Sans Pro,Verdana,sans-serif"
                      fontSize="1.25rem"
                      fontWeight={500}
                      lineHeight="1.25rem"
                      textDecor="none"
                      textTransform="capitalize"
                    >
                      {renderPatientByAlphabet(patient, alphabet)}
                    </Text>
                    <Text
                      color="#034254"
                      fontFamily="Source Sans Pro,Verdana,sans-serif"
                      fontSize="1.25rem"
                      fontWeight={500}
                      lineHeight="1.25rem"
                      textDecor="none"
                      textTransform="capitalize"
                      textAlign="right"
                    >
                      {patient["pid"]}
                    </Text>
                  </Flex>
                </Link>
              </Flex>
            </ListItem>
          );
        })
      : null;
  };

  const renderPatientByAlphabet = (patient, alphabet) => {
    if (patient["name"].charAt(0).toLowerCase() === alphabet) {
      listExistedPatients.push(patient["pid"]);
      return patient["name"];
    }
  };

  // const getAlphabetExist = () => {
  //   patientListRedux.map((patient, index) => {
  //     if (
  //       !listExistedAlphabet.includes(patient["name"].charAt(0).toLowerCase())
  //     ) {
  //       listExistedAlphabet.push(patient["name"].charAt(0).toLowerCase());
  //     }
  //   });
  // };
  return fetchedList["role"] !== undefined ? (
    <Flex direction="column" letterSpacing="-.017069rem">
      <Box margin="0 auto" minW="730px" position="relative" p="5px 0">
        <Text
          fontWeight={400}
          color="#187aab"
          cursor="pointer"
          fontFamily="Source Sans Pro"
        >
          Patient Search & Administration
        </Text>
      </Box>
      <Box align="center">
        <Box
          width="100%"
          p="15px 0 65px 0"
          backgroundImage={DoctorBackground}
          backgroundPosition="50%"
          color="black"
          backgroundSize="auto"
        >
          <Text
            fontWeight={700}
            textTransform="capitalize"
            fontSize="3.3125rem"
            p="1% 0 0 0"
            fontFamily="Source Sans Pro,Verdana,sans-serif"
          >
            Search & Administration
          </Text>
          <Text
            fontSize="20px"
            fontWeight={400}
            fontFamily="Source Sans Pro,Verdana,sans-serif"
          >
            Powerful engine to manage your patients
          </Text>
        </Box>

        <Box
          maxW="734px"
          marginTop="-50px"
          width="100%"
          boxShadow="0 2px 4px 0"
          borderRadius="7px"
          bgColor="#dcf3f7"
          align="left"
        >
          <Box p="16px">
            <SearchBar
              setFilteredData={setFilteredData}
              wordEntered={wordEntered}
              filteredData={filteredData}
              handleFilter={handleFilter}
              setWordEntered={setWordEntered}
              width="37%"
              placeholder="Find Patients by ID or name"
              type="patient"
            ></SearchBar>

            <Box mt="1rem">
              <Box display="flex" justifyContent="space-between">
                <Box
                  display="flex"
                  flexDirection="row"
                  onClick={() => setExpand(!expand)}
                >
                  <Text
                    fontFamily="Source Sans Pro,Verdana,sans-serif"
                    fontSize="20px"
                    fontWeight={400}
                    lineHeight="normal"
                    letterSpacing="normal"
                    color="#034254 "
                    cursor="pointer"
                  >
                    Search Patients by Letter
                  </Text>
                  {expand ? (
                    <ChevronUpIcon w="7" h="7" cursor="pointer"></ChevronUpIcon>
                  ) : (
                    <ChevronDownIcon
                      w="7"
                      h="7"
                      cursor="pointer"
                    ></ChevronDownIcon>
                  )}
                </Box>
                {role !== "admin" ? (
                  <Link to="/add-patient">
                    <Box>
                      <Text
                        fontFamily="Source Sans Pro,Verdana,sans-serif"
                        fontSize="20px"
                        fontWeight={400}
                        lineHeight="normal"
                        letterSpacing="normal"
                        color="#316342 "
                        cursor="pointer"
                      >
                        Add new patient
                      </Text>
                    </Box>
                  </Link>
                ) : null}
              </Box>

              <Box
                display={expand ? "flex" : "none"}
                flexWrap="wrap"
                width="100%"
              >
                {alphabets.map((alphabet, index) => {
                  return (
                    <Text
                      key={alphabet}
                      display="block"
                      fontFamily="Source Sans Pro,Verdana,sans-serif"
                      fontSize="1.313rem"
                      lineHeight="2"
                      textDecoration="none"
                      textTransform="uppercase"
                      cursor="pointer"
                      justifyContent="center"
                      textAlign="center"
                      width="37px"
                      height="41px"
                      verticalAlign="middle"
                      color={
                        alphabet === clickedAlphabet && !sameAlphabet
                          ? "white"
                          : "#1c2833"
                      }
                      bgColor={
                        alphabet === clickedAlphabet && !sameAlphabet
                          ? "#034254"
                          : "white"
                      }
                      onClick={() => {
                        if (clickedAlphabet !== alphabet) {
                          setClickedAlphabet(alphabet);
                          setSameAlphabet(false);
                        } else {
                          setSameAlphabet(!sameAlphabet);
                        }
                      }}
                      m="5px"
                    >
                      {alphabet}
                    </Text>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box maxW="46em" ml="auto" mr="auto" position="relative">
          {alphabets.map((alphabet, index) => {
            return (
              <Flex
                key={alphabet}
                direction="column"
                display={
                  alphabet === clickedAlphabet && sameAlphabet === false
                    ? "block"
                    : "none"
                }
              >
                <Flex
                  direction="row"
                  justifyContent="space-between"
                  bg="#c5e7e8"
                  mb="1.188rem"
                  p="0.3rem 2.3rem 0.3rem 1.7rem"
                  mt="1.5rem"
                >
                  <Text
                    color="#4a4a4a"
                    fontFamily="Source Sans Pro,Verdana,sans-serif"
                    fontWeight={400}
                    fontSize="1em"
                    textTransform="capitalize"
                  >
                    {alphabet}
                  </Text>
                  <Text
                    color="#4a4a4a"
                    fontFamily="Source Sans Pro,Verdana,sans-serif"
                    fontWeight={400}
                    fontSize="1em"
                    textTransform="capitalize"
                  >
                    ID
                  </Text>
                </Flex>

                <List
                  w="100%"
                  paddingRight="2rem"
                  display="block"
                  // display="{
                  //   listExistedAlphabet.includes(alphabet) ? "block" : "none"
                  // }"
                  listStyleType="disc"
                  paddingInlineStart="25px"
                >
                  {renderPatientsList(alphabet)}
                </List>
              </Flex>
            );
          })}
        </Box>
      </Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default SearchPatient;
