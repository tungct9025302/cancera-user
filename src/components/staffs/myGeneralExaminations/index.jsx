import React, { useState, useEffect, useContext } from "react";

import { useLocation, Link } from "react-router-dom";
import {
  Text,
  Box,
  Flex,
  Badge,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Icon,
  useDisclosure,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialog,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FaTools } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";

import DialogBox from "../../commons/DialogBox";
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
import { AuthContext } from "../../context/AuthContext";
import { auth, db } from "../../../database/firebaseConfigs";
import { async } from "@firebase/util";
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../commons/Spinner";

const MyGeneralExaminations = () => {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [deletedGeneralExamination, setdeletedGeneralExamination] = useState();
  const [
    patientDataOfDeletedGeneralExamination,
    setpatientDataOfDeletedGeneralExamination,
  ] = useState();
  const [myPatients, setMyPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const { currentUser } = useContext(AuthContext);
  const [fetchedList, setFetchedList] = useState([]);
  let attributes = [
    {
      id: "blood pressure",
      rightAddon: "mmHg",
    },
    {
      id: "blood concentration",
      rightAddon: "g/dL",
    },
    {
      id: "blood glucose",
      rightAddon: "mg/dL",
    },
    {
      id: "heart rate",
      rightAddon: "bpm",
    },
  ];

  useEffect(() => {
    fetchData();
    return () => {
      setDate("");
      setName("");
    };
  }, []);

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const checkState = (value, action) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;
    switch (action) {
      case "state":
        if (y < x) {
          return "done";
        } else if (x === y) {
          return "today";
        } else {
          return "Future data?";
        }
      case "color":
        if (y < x) {
          return "teal";
        } else if (x === y) {
          return "yellow";
        } else {
          return "red";
        }
    }
  };

  //database
  const fetchData = async () => {
    let patientsData = [];
    let userData = [];

    try {
      //get user data
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        userData = { ...docSnap.data() };
      }
      if (userData["my patients"] !== undefined) {
        setMyPatients(userData["my patients"]);
      }
      setFetchedList(userData);
      //get all patients
      const querySnapshot = await getDocs(collection(db, "patients"));
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setAllPatients(patientsData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      if (
        patientDataOfDeletedGeneralExamination["general examinations"] ===
          undefined ||
        isEmptyArray(
          patientDataOfDeletedGeneralExamination["general examinations"]
        )
      ) {
        alert("Error: This general examination is no longer existed...");
        window.location.reload();
      } else {
        await setDoc(
          doc(db, "patients", patientDataOfDeletedGeneralExamination["id"]),
          {
            ...patientDataOfDeletedGeneralExamination,
            ["general examinations"]: patientDataOfDeletedGeneralExamination[
              "general examinations"
            ].filter(
              (general_examination) =>
                !deepEqual(general_examination, deletedGeneralExamination)
            ),
          }
        );
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        (areObjects && !deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  }
  function isObject(object) {
    return object != null && typeof object === "object";
  }

  const renderAlertDialog = () => {
    return (
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>
            Delete this general examination?
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this general examination record?
            Deleted records can not be recovered.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                handleDelete(event);
                onClose();
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  //   const onDelete = (general_examination) => {
  //     var array = [...allAppointments]; // make a separate copy of the array

  //     var index = array.indexOf(general_examination);

  //     if (index !== -1) {
  //       array.splice(index, 1);
  //     }
  //     setAllAppointments(array);
  //   };

  const renderFilteredGeneralExaminations = () => {
    let myGeneralExaminationID = -1;
    if (fetchedList["my patients"] != undefined) {
      return allPatients.map((patient) => {
        return fetchedList["my patients"].map((my_patient, index) => {
          return patient["pid"] === my_patient["pid"] ? (
            <Box mb={patient["pid"] !== my_patient["pid"] ? "0px" : "40px"}>
              {patient["general examinations"] !== undefined &&
              !isEmptyArray(patient["general examinations"])
                ? name === ""
                  ? patient["general examinations"].map(
                      (general_examination) => {
                        myGeneralExaminationID = myGeneralExaminationID + 1;
                        return general_examination["date"] === date ? (
                          <Box
                            key={myGeneralExaminationID}
                            display={
                              patient["general examinations"] !== undefined &&
                              !isEmptyArray(patient["general examinations"])
                                ? "block"
                                : "unset"
                            }
                          >
                            {renderData(
                              general_examination,
                              myGeneralExaminationID,
                              index,
                              patient
                            )}
                          </Box>
                        ) : null;
                      }
                    )
                  : patient["name"].toLowerCase().includes(name.toLowerCase())
                  ? date !== ""
                    ? patient["general examinations"].map(
                        (general_examination) => {
                          myGeneralExaminationID = myGeneralExaminationID + 1;
                          return general_examination["date"] === date ? (
                            <Box
                              key={myGeneralExaminationID}
                              display={
                                patient["general examinations"] !== undefined &&
                                !isEmptyArray(patient["general examinations"])
                                  ? "block"
                                  : "unset"
                              }
                            >
                              {renderData(
                                general_examination,
                                myGeneralExaminationID,
                                index,
                                patient
                              )}
                            </Box>
                          ) : null;
                        }
                      )
                    : patient["general examinations"].map(
                        (general_examination) => {
                          myGeneralExaminationID = myGeneralExaminationID + 1;
                          return (
                            <Box
                              key={myGeneralExaminationID}
                              display={
                                patient["general examinations"] !== undefined &&
                                !isEmptyArray(patient["general examinations"])
                                  ? "block"
                                  : "unset"
                              }
                              // mb={
                              //   patient["pid"] !== my_patient["pid"]
                              //     ? "0px"
                              //     : "40px"
                              // }
                            >
                              {renderData(
                                general_examination,
                                myGeneralExaminationID,
                                index,
                                patient
                              )}
                            </Box>
                          );
                        }
                      )
                  : null
                : null}
            </Box>
          ) : null;
        });
      });
    } else {
      return null;
    }
  };

  const renderAllGeneralExaminations = () => {
    let myGeneralExaminationID = -1;
    if (fetchedList["my patients"] !== undefined) {
      return allPatients.map((patient) => {
        return fetchedList["my patients"].map((my_patient, index) => {
          return (
            <Box
              key={index}
              display={
                patient["general examinations"] !== undefined &&
                !isEmptyArray(patient["general examinations"])
                  ? "block"
                  : "unset"
              }
              mb={my_patient["pid"] !== patient["pid"] ? "0px" : "40px"}
            >
              {patient["pid"] === my_patient["pid"]
                ? patient["general examinations"] !== undefined &&
                  !isEmptyArray(patient["general examinations"])
                  ? patient["general examinations"].map(
                      (general_examination, index) => {
                        myGeneralExaminationID = myGeneralExaminationID + 1;
                        return (
                          <Box key={index}>
                            {renderData(
                              general_examination,
                              myGeneralExaminationID,
                              index,
                              patient
                            )}
                          </Box>
                        );
                      }
                    )
                  : null
                : null}
            </Box>
          );
        });
      });
    } else {
      return null;
    }
  };

  // return patient["pid"] === my_patient["pid"]
  // ? patient["general examinations"] !== undefined &&
  //   !isEmptyArray(patient["general examinations"])
  //   ? patient["general examinations"].map((general_examination) => {
  //       myGeneralExaminationID = myGeneralExaminationID + 1;
  //       return general_examination["date"] === date ? (
  //         <Box
  //           key={index}
  //           display={
  //             patient["general examinations"] !== undefined &&
  //             !isEmptyArray(patient["general examinations"])
  //               ? "block"
  //               : "unset"
  //           }
  //           mb={
  //             index + 1 === fetchedList["my patients"].length
  //               ? "0px"
  //               : "40px"
  //           }
  //         >
  //           {renderData(
  //             general_examination,
  //             myGeneralExaminationID,
  //             index,
  //             patient
  //           )}
  //         </Box>
  //       ) : null;
  //     })
  //   : null
  // : null;

  const renderData = (
    general_examination,
    myGeneralExaminationID,
    index,
    patient
  ) => {
    return (
      <Box
        w="100%"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bgColor="#fcfcfc"
      >
        <Box p="6">
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="baseline">
              <Badge
                borderRadius="full"
                px="2"
                colorScheme={checkState(general_examination["date"], "color")}
              >
                {checkState(general_examination["date"], "state")}
              </Badge>

              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                &bull;{general_examination.date}
              </Box>
            </Box>
            <Box
              color="gray.600"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
            >
              General Examination ID: {myGeneralExaminationID}
            </Box>
          </Box>

          <Flex direction="row" m="5px 5px 0 0" key={index}>
            <Text fontWeight={550} mr="3px">
              Name:
            </Text>
            <Text mr="5px" fontWeight={550}>
              {patient["name"]}
            </Text>
          </Flex>

          {attributes.map((attribute, index) => {
            return (
              <Flex direction="row" m="5px 5px 0 0" key={index}>
                <Text mr="3px"> {Capitalize(attribute["id"])}:</Text>
                <Text mr="5px">
                  {general_examination[`${attribute["id"]}`]}
                </Text>
                {/* <Text>{attribute["rightAddon"]}</Text> */}
              </Flex>
            );
          })}

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt="2px"
            alignContent="center"
          >
            <Flex direction="row">
              <Icon as={FaUserMd} w={4} h={4} m="2px 2px 0 0" />
              <Box maxW="500px">
                Creator: {general_examination["creator name"]}
              </Box>
            </Flex>
            <Flex direction="row" mt="5px">
              <Text>Creator ID:</Text>
              <Text ml="1px" fontStyle="italic">
                {general_examination["creator id"]}
              </Text>
            </Flex>
          </Flex>
          <HStack spacing={4} float="right" mb="5px">
            {checkState(general_examination["date"]) !== "passed" ? (
              <Box>
                <Link
                  to={`/modify/pid=${patient["pid"]}/general-examination/id=${index}`}
                  state={{
                    name: patient["name"],
                    id: index,
                    pid: patient["pid"],
                    boxTitle: "general examinations",
                    previous_location: "my general examinations",
                  }}
                >
                  <Icon
                    as={FaTools}
                    w={4}
                    h={4}
                    display={
                      checkState(general_examination["date"]) !== "done"
                        ? "block"
                        : "none"
                    }
                  ></Icon>
                </Link>
              </Box>
            ) : null}

            <Box>
              <DeleteIcon
                onClick={() => {
                  onOpen();
                  setpatientDataOfDeletedGeneralExamination(patient);
                  setdeletedGeneralExamination(general_examination);
                }}
                cursor="pointer"
              ></DeleteIcon>
              {renderAlertDialog()}
            </Box>
          </HStack>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    let not_exist = true;
    if (fetchedList["my patients"] != undefined) {
      fetchedList["my patients"].map((my_patient) => {
        allPatients
          .filter((patient) => patient["pid"] === my_patient["pid"])
          .map((foundPatient) => {
            if (
              foundPatient["general examinations"] !== undefined &&
              !isEmptyArray(foundPatient["general examinations"])
            ) {
              not_exist = false;
            }
          });
      });
    }

    return not_exist ? "No general examination records can be found..." : null;
  };

  return fetchedList["role"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox name={undefined} pid={undefined} role={fetchedList["role"]} />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          My General Examinations
        </Text>
        <Flex direction="column" m="0 5% 0 5%">
          <Flex direction="row" justifyContent="space-between" mb="10px">
            <Flex direction="row" align="center">
              <Text fontWeight="600" mr="5px" whiteSpace="nowrap">
                Search by date:
              </Text>
              <FormControl w="160px">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                />
              </FormControl>
            </Flex>

            <Flex direction="row" align="center">
              <Text fontWeight="600" mr="5px" whiteSpace="nowrap">
                Search by patient name:
              </Text>
              <FormControl w="160px">
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  placeholder="Nguyen Van A"
                />
              </FormControl>
            </Flex>
          </Flex>

          <InfiniteScroll
            style={{ height: "600px" }}
            dataLength={4}
            hasMore={false}
            loader={<h4>Loading...</h4>}
            endMessage={
              <Text textAlign="center" fontWeight={550}>
                {renderEndMessage()}
              </Text>
            }
          >
            {date === "" && name === ""
              ? renderAllGeneralExaminations()
              : renderFilteredGeneralExaminations()}
          </InfiniteScroll>
        </Flex>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default MyGeneralExaminations;
