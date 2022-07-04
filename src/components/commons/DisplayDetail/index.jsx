import React, { useState, useEffect, useContext } from "react";

import { useParams, useLocation, Link, useNavigate } from "react-router-dom";

import {
  Box,
  Flex,
  Text,
  List,
  ListItem,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  Table,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  ButtonGroup,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  HStack,
  VStack,
  Tooltip,
  Alert,
  AlertIcon,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCloseButton,
  AlertDialogBody,
} from "@chakra-ui/react";
import {
  ChevronRightIcon,
  AddIcon,
  DeleteIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import { connect } from "react-redux";

import DialogBox from "../../commons/DialogBox";
import {
  addToMyPatient,
  removeFromMyPatient,
  removeFromPatientList,
} from "../../../redux/actions";

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
import treatment from "../../guest/treatment";

const Detail = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  let { targetName } = useParams();
  const { dataType, pid, id } = location.state;
  const [existed, setExisted] = useState(false);

  const [existedInList, setExistedInList] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({});
  const cancelRef = React.useRef();
  const { currentUser } = useContext(AuthContext);

  //Patient data
  const [fetchedList, setFetchedList] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  //Cancer data
  const [fetchedCancerList, setFetchedCancerList] = useState([]);
  const [fetchedTreatmentList, setFetchedTreatmentList] = useState([]);
  //

  let behaviorIndicators;
  let externalIndicators;
  useEffect(() => {
    fetchData();
    return () => {
      setCurrentPatient({});
      setAllPatients([]);
      setFetchedList({});
    };
  }, []);

  //database
  const fetchData = async () => {
    let patientData,
      userData = [];
    let guestData = {};
    // try {
    //get all cancers and treatments
    const guestDocSnap = await getDoc(
      doc(db, "guests", "q6hUkmJo4Nq6Laaqtt5q")
    );
    if (guestDocSnap.exists()) {
      guestData = { ...guestDocSnap.data() };

      setFetchedCancerList(guestData["cancer data"]);
      setFetchedTreatmentList(guestData["treatment data"]);
    }

    //get all patients
    const allPatientsDocSnap = await getDoc(
      doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy")
    );
    if (allPatientsDocSnap.exists()) {
      patientData = { ...allPatientsDocSnap.data() };
      setAllPatients(patientData["allPatients"]);
    }

    //get user data
    const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
    if (userDocSnap.exists()) {
      userData = { ...userDocSnap.data() };
      setFetchedList(userData);
    }

    //set current patient
    if (!isEmptyArray(patientData)) {
      for (let i = 0; i < patientData["allPatients"].length; i++) {
        if (
          (pid === patientData["allPatients"][i].pid && pid !== undefined) ||
          patientData["allPatients"][i].pid === pid
        ) {
          setCurrentPatient(patientData["allPatients"][i]);
        }
      }
    }

    //set exist button
    if (!isEmptyArray(userData["myPatients"])) {
      for (let i = 0; i < userData["myPatients"].length; i++) {
        if (
          (pid === userData["myPatients"][i].pid && pid !== undefined) ||
          userData["myPatients"][i].pid === pid
        ) {
          setExisted(true);
        }
      }
    }
    // }
    // catch (err) {
    //   console.log(err);
    // }
  };
  const handleAdd = async (e) => {
    e.preventDefault();

    const checkExistedInList = () => {
      fetchedList["myPatients"].map((patient) => {
        if (currentPatient["pid"] === patient["pid"]) {
          setExistedInList(true);
        }
      });
      return existedInList;
    };

    try {
      if (
        fetchedList.myPatients === undefined ||
        isEmptyArray(fetchedList.myPatients)
      ) {
        await setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          myPatients: [{ ...currentPatient }],
        });
        setExisted(true);
      } else {
        if (!checkExistedInList()) {
          setDoc(doc(db, "users", currentUser.uid), {
            ...fetchedList,
            myPatients: [...fetchedList.myPatients, { ...currentPatient }],
          });
          setExisted(true);
        } else {
          alert("This patient is already existed in your patient list.");
          setExisted(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    const checkExistedInList = () => {
      fetchedList["myPatients"].map((patient) => {
        if (currentPatient["pid"] === patient["pid"]) {
          setExistedInList(true);
        }
      });
      return existedInList;
    };

    try {
      if (fetchedList["myPatients"] === undefined || checkExistedInList()) {
        alert(
          "Error: This patient is already not existed in your patient list."
        );
        setExisted(false);
      } else {
        await setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          myPatients: fetchedList["myPatients"].filter(
            (patient) => currentPatient["pid"] === patient["pid"]
          ),
        });

        setExisted(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const handleDelete = async (e) => {
  //   e.preventDefault();

  //   try {
  //     if (
  //       fetchedList["allPatients"] === undefined ||
  //       isEmptyArray(fetchedList["allPatients"])
  //     ) {
  //       alert(
  //         "Error: This patient is not existed in the patient list anymore."
  //       );
  //       setExisted(false);
  //     } else {
  //       setDoc(doc(db, "users", currentUser.uid), {
  //         ...fetchedList,
  //         allPatients: fetchedList["allPatients"].filter(
  //           (patient) => !deepEqual(patient, currentPatient)
  //         ),
  //       });
  //       setExisted(false);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  //common

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

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  //Building table
  const getChosenDatalist = () => {
    let list = [];
    if (dataType === "TreatmentData") {
      return fetchedTreatmentList.map((treatment) => {
        return null;
      });

      // for (let i = 0; i < fetchedTreatmentList.length; i++) {
      //   if ((pid === list[i].pid && pid !== undefined) || list[i].id === pid) {
      //     return list[i];
      //   }
      // }
    } else if (dataType === "CancerData") {
      fetchedCancerList.map((cancer) => {
        if (cancer["name"].toLowerCase() === targetName) {
          list = { ...cancer };
        }
      });
      return list;
    } else {
      return null;
    }
  };

  const renderPatientTable = () => {
    return (
      <Table variant="striped" bg="blue.100" size="md">
        <Tbody>
          {Object.keys(currentPatient)
            .filter(
              (key) =>
                key.toLowerCase() !== "patient name" &&
                key.toLowerCase() !== "pid" &&
                key.toLowerCase() !== "appointments" &&
                key.toLowerCase() !== "general examinations" &&
                key.toLowerCase() !== "treatments"
            )
            .map((key) => {
              return (
                <React.Fragment key={key}>
                  <Tr>
                    <Td style={{ border: "2px solid rgb(0, 0, 0)" }}>
                      <Text
                        fontSize="3xl"
                        fontFamily="serif"
                        whiteSpace="nowrap"
                      >
                        {Capitalize(key)}
                      </Text>
                    </Td>
                    <Td style={{ border: "2px solid rgb(0, 0, 0)" }}>
                      {renderDetailOfTable(currentPatient[key], key)}
                    </Td>
                  </Tr>
                </React.Fragment>
              );
            })}
        </Tbody>
      </Table>
    );
  };

  const renderTableByList = (list) => {
    return (
      <Table variant="striped" bg="blue.100" size="md">
        <Tbody>
          {Object.keys(list)
            .filter((key) => key.toLowerCase() !== "name")
            .map((key) => {
              return (
                <React.Fragment key={key}>
                  <Tr>
                    <Td style={{ border: "2px solid rgb(0, 0, 0)" }}>
                      <Text
                        fontSize="3xl"
                        fontFamily="serif"
                        whiteSpace="nowrap"
                      >
                        {Capitalize(key)}
                      </Text>
                    </Td>
                    <Td style={{ border: "2px solid rgb(0, 0, 0)" }}>
                      {renderDetailOfTable(list[key], key)}
                    </Td>
                  </Tr>
                </React.Fragment>
              );
            })}
        </Tbody>
      </Table>
    );
  };

  const renderDetailOfTable = (firstAttributes, key) => {
    if (Array.isArray(firstAttributes)) {
      return firstAttributes.map((firstAttribute, index) => {
        if (Array.isArray(Object.keys(firstAttribute))) {
          return Object.keys(firstAttribute).map((attribute) => {
            if (Array.isArray(firstAttribute[`${attribute}`])) {
              return firstAttribute[`${attribute}`].map((secondAttribute) => {
                return Capitalize(secondAttribute.toString());
              });
            } else {
              return Capitalize(firstAttribute[`${attribute}`]);
            }
          });
        } else {
          return Capitalize(firstAttribute.toString());
        }
      });
    } else {
      return Capitalize(firstAttributes);
    }
  };

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
          <AlertDialogHeader>Request to delete this patient?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Your request to delete this patient will be sent out and approved by
            admin.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>

            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                onClose();
                // console.log(fetchedList.myPatients === undefined);
                // handleDelete(event);
                // navigate("/search-patient");
              }}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  //get data for indicators
  const getIndicatorData = () => {
    return (
      <Box m="0% 20%">
        <Box>
          <Text
            fontSize="5xl"
            padding="2% 5%"
            fontFamily="serif"
            fontWeight="550"
          >
            {renderNumberOfResults()}
          </Text>
        </Box>
        <Box m="0 5% 0 5%">
          <List>
            {fetchedCancerList.map((cancer, index) => {
              return getCancerByIndicator(cancer);
            })}
          </List>
        </Box>
      </Box>
    );
  };

  const renderNumberOfResults = () => {
    let totalResults = 0;
    let message;

    fetchedCancerList.map((cancer, index) => {
      behaviorIndicators = cancer["behavior indicators"];
      externalIndicators = cancer["external indicators"];
      behaviorIndicators.map((indicator) => {
        if (indicator.toLowerCase() === targetName) {
          totalResults = totalResults + 1;
        }
      });
      externalIndicators.map((indicator) => {
        if (indicator.toLowerCase() === targetName) {
          totalResults = totalResults + 1;
        }
      });
    });

    if (totalResults > 1) {
      message = `${totalResults} results for "${targetName.toLowerCase()}" :`;
    } else if (totalResults === 1) {
      message = `1 result for "${targetName.toLowerCase()}" :`;
    } else {
      message = `No result for "${targetName.toLowerCase()}".`;
    }
    return message;
  };

  const getCancerByIndicator = (cancer, findIndicator) => {
    behaviorIndicators = cancer["behavior indicators"];
    externalIndicators = cancer["external indicators"];

    const allIndicators = behaviorIndicators.concat(externalIndicators);

    return allIndicators.map((indicator, index) => {
      if (indicator.toLowerCase() === targetName.toLowerCase()) {
        return (
          <ListItem key={index} w="fit-content">
            <Link
              to={`/search/${cancer["name"].toLowerCase()}`}
              state={{ dataType: "CancerData", id: cancer["id"] }}
            >
              <Flex direction="row">
                <ChevronRightIcon w={7} h={7} mt="8px"></ChevronRightIcon>
                <Text fontSize="3xl" fontWeight={400}>
                  {Capitalize(cancer["name"])}
                </Text>
              </Flex>
            </Link>
          </ListItem>
        );
      }
    });
  };

  //get data for treatments or cancers

  const getTreatmentOrCancerData = () => {
    return (
      <Box p="0% 20%">
        <Box>
          <Text
            fontSize="5xl"
            padding="2% 5%"
            fontFamily="serif"
            fontWeight="550"
          >
            {Capitalize(targetName)}
            {/* {dataType === "CancerData"
              ? getTreatmentOrCancerName(allCancerTypesListRedux)
              : getTreatmentOrCancerName(allTreatmentsListRedux)} */}
          </Text>
        </Box>

        <Box m="0 5% 0 5%">{renderTableByList(getChosenDatalist())}</Box>
      </Box>
    );
  };

  // const getTreatmentOrCancerName = (list) => {
  //   for (let i = 0; i < list.length; i++) {
  //     if (list[i].id === id) {
  //       return list[i]["name"];
  //     }
  //   }
  // };

  //get data for patients

  const getPatientData = () => {
    return (
      <Flex direction="row" w="100%" p="0 12% 0% 12%" h="max-content">
        <DialogBox
          name={currentPatient["patient name"]}
          pid={pid}
          boxTitle={undefined}
        />

        <Box minW="600px" w="100%" p="0 2% 0% 2%" h="fit-content">
          <Flex direction="row" padding="1rem 5rem 1rem 3rem" align="center">
            <Text fontSize="5xl" fontFamily="serif" fontWeight="550" mr="1rem">
              {currentPatient["patient name"]}
            </Text>

            {existed ? (
              <Tooltip
                label="Remove from my patient list"
                aria-label="A tooltip"
              >
                <Button
                  size="xs"
                  bgColor="red.300"
                  borderWidth="1px"
                  mr="5px"
                  onClick={() => {
                    handleRemove(event);
                    // removeData(getPatientID(patientListRedux));
                    // removeFromMyPatient(
                    //   getPatientID(patientListRedux),
                    //   myPatientList
                    // );
                    // setExisted(false);
                  }}
                >
                  <MinusIcon w={4} h={4}></MinusIcon>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip
                label="Add this patient to your patient list"
                aria-label="A tooltip"
              >
                <Button
                  size="xs"
                  bgColor="green.300"
                  borderWidth="1px"
                  mr="5px"
                  onClick={() => {
                    handleAdd(event);
                  }}
                >
                  <AddIcon w={4} h={4}></AddIcon>
                </Button>
              </Tooltip>
            )}

            <Tooltip
              label="Delete this patient permanently"
              aria-label="A tooltip"
            >
              <Button
                size="xs"
                bgColor="red.300"
                borderWidth="1px"
                onClick={onOpen}
              >
                <DeleteIcon w={4} h={4}></DeleteIcon>
                {renderAlertDialog()}
              </Button>
            </Tooltip>
          </Flex>

          <Box m="0 5% 0 5%">{renderPatientTable()}</Box>
        </Box>

        <Box minW="18%"></Box>
      </Flex>
    );
  };

  //main
  return (
    <Box>
      {dataType === "TreatmentData" || dataType === "CancerData"
        ? getTreatmentOrCancerData()
        : dataType === "PatientData"
        ? getPatientData()
        : dataType === "IndicatorData"
        ? getIndicatorData()
        : null}
    </Box>
  );
};

export default Detail;
