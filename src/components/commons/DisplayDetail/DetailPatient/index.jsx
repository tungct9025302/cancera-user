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
  Icon,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCloseButton,
  AlertDialogBody,
  Spinner,
} from "@chakra-ui/react";
import {
  ChevronRightIcon,
  AddIcon,
  DeleteIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import { IoPersonRemoveOutline } from "react-icons/io5";
import { MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import RenderCreateAccount from "../../Account/RenderCreateAccount";
import DialogBox from "../../DialogBox";

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

import { AuthContext } from "../../../context/AuthContext";
import { auth, db } from "../../../../database/firebaseConfigs";
import { async } from "@firebase/util";
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../Spinner";

const DetailPatient = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  let { targetName } = useParams();
  const { dataType, pid, id } = location.state;
  const [existed, setExisted] = useState(false);
  const [command, setCommand] = useState("");
  const [role, setRole] = useState("");

  const [existedInList, setExistedInList] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({});
  const cancelRef = React.useRef();
  const { currentUser } = useContext(AuthContext);

  //Patient data
  const [fetchedList, setFetchedList] = useState({});
  const [allPatients, setAllPatients] = useState([]);

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
    let patientsData = [];
    let userData = [];
    let currentPatientData;

    try {
      //get all patients
      const querySnapshot = await getDocs(collection(db, "patients"));
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setAllPatients(patientsData);

      //set current patient
      if (!isEmptyArray(patientsData)) {
        for (let i = 0; i < patientsData.length; i++) {
          if (
            (pid === patientsData[i]["pid"] && pid !== undefined) ||
            patientsData[i].pid === pid
          ) {
            setCurrentPatient(patientsData[i]);
            currentPatientData = { ...patientsData[i] };
          }
        }
      }

      //get user data
      const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        userData = { ...userDocSnap.data() };
        setFetchedList(userData);

        if (userData["my patients"] !== undefined) {
          userData["my patients"].map((myPatient) => {
            if (myPatient["pid"] === currentPatientData["pid"]) {
              setExisted(true);
            }
          });
        }
      }

      const adminDocSnap = await getDoc(doc(db, "admins", currentUser.uid));
      if (adminDocSnap.exists()) {
        userData = { ...adminDocSnap.data() };
        setFetchedList(userData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const checkExistedInList = () => {
      if (fetchedList["my patients"] !== undefined) {
        fetchedList["my patients"].map((patient) => {
          if (currentPatient["pid"] === patient["pid"]) {
            setExistedInList(true);
          }
        });
        return existedInList;
      }
      return false;
    };

    try {
      if (
        fetchedList["my patients"] === undefined ||
        isEmptyArray(fetchedList["my patients"])
      ) {
        await setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          ["my patients"]: [
            {
              pid: currentPatient["pid"],
              ["patient name"]: currentPatient["patient name"],
            },
          ],
        });
        setExisted(true);
      } else {
        if (!checkExistedInList()) {
          setDoc(doc(db, "users", currentUser.uid), {
            ...fetchedList,
            ["my patients"]: [
              ...fetchedList["my patients"],
              {
                pid: currentPatient["pid"],
                ["patient name"]: currentPatient["patient name"],
              },
            ],
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
      fetchedList["my patients"].map((patient) => {
        if (currentPatient["pid"] === patient["pid"]) {
          setExistedInList(true);
        }
      });
      return existedInList;
    };

    try {
      if (fetchedList["my patients"] === undefined || checkExistedInList()) {
        alert(
          "Error: This patient is already not existed in your patient list."
        );
        setExisted(false);
      } else {
        await setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          ["my patients"]: fetchedList["my patients"].filter(
            (patient) => currentPatient["pid"] !== patient["pid"]
          ),
        });
        fetchData();
        setExisted(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      if (
        fetchedList["allPatients"] === undefined ||
        isEmptyArray(fetchedList["allPatients"])
      ) {
        alert(
          "Error: This patient is not existed in the patient list anymore."
        );
        setExisted(false);
      } else {
        setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          allPatients: fetchedList["allPatients"].filter(
            (patient) => !deepEqual(patient, currentPatient)
          ),
        });
        setExisted(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const handleRequest = async (e) => {
  //   e.preventDefault();
  //   let newAllPatients = [];
  //   allPatients.map((patient) => {
  //     if (patient["pid"] === pid) {
  //       if (!Object.keys(patient).includes("request")) {
  //         patient = { ...patient, request: true };
  //       } else {
  //         if (patient["request"] === false) {
  //           patient = { ...patient, request: true };
  //         } else {
  //           alert("Someone has already requested to delete this patient!");
  //         }
  //       }
  //     }
  //     newAllPatients.push(patient);
  //   });

  //   try {
  //     //   if (allPatients === undefined || isEmptyArray(allPatients)) {
  //     //     alert(
  //     //       "Error: This patient is not existed in the patient list anymore."
  //     //     );
  //     //   } else {
  //     setDoc(doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy"), {
  //       allPatients: newAllPatients,
  //     });
  //     //   }
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

  const renderPatientTable = () => {
    return (
      <Table variant="striped" bg="blue.100" size="md">
        <Tbody>
          {Object.keys(currentPatient)
            .filter(
              (key) =>
                key.toLowerCase() !== "patient name" &&
                key.toLowerCase() !== "id" &&
                key.toLowerCase() !== "password" &&
                // key.toLowerCase() !== "appointments" &&
                // key.toLowerCase() !== "general examinations" &&
                // key.toLowerCase() !== "treatments" &&
                key.toLowerCase() !== "create time"
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

  const renderDetailOfTable = (firstAttributes, key) => {
    if (Array.isArray(firstAttributes)) {
      return firstAttributes.map((firstAttribute, index) => {
        return isObject(firstAttribute) ? (
          <Box
            key={index}
            mb={index + 1 === firstAttributes.length ? "0px" : "40px"}
          >
            {Object.keys(firstAttribute).map((attribute, index) => {
              if (Array.isArray(firstAttribute[`${attribute}`])) {
                return firstAttribute[`${attribute}`].map(
                  (secondAttribute, index) => {
                    return (
                      <Text key={index} fontSize="20px" lineHeight="2rem">
                        {secondAttribute.toString()}
                      </Text>
                    );
                  }
                );
              } else {
                return (
                  <Flex key={index} mb="10px" mt="10px" fontSize="20px">
                    <Text mr="5px">{Capitalize(attribute)}: </Text>
                    <Text>{firstAttribute[`${attribute}`]}</Text>
                  </Flex>
                );
              }
            })}
          </Box>
        ) : (
          <Text key={index} fontSize="20px" lineHeight="2rem">
            {Capitalize(firstAttribute.toString())}
          </Text>
        );
      });
    } else {
      if (key !== "username") {
        return (
          <Text fontSize="20px" lineHeight="2rem">
            {Capitalize(firstAttributes.toString())}
          </Text>
        );
      } else {
        return (
          <Text fontSize="20px" lineHeight="2rem">
            {firstAttributes.toString()}
          </Text>
        );
      }
    }
  };

  const renderAlertDialog = (type) => {
    switch (type) {
      case "delete":
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
              <AlertDialogHeader>Delete this patient?</AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                After confirming, this patient will be permanently removed from
                your data and can not be recovered.
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
                    handleDelete(event);
                    navigate("/search-patient");
                  }}
                >
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      case "request":
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
                Request to delete this patient?
              </AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                Your request to delete this patient will be sent out and
                approved by admin.
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
                    handleRequest(event);
                  }}
                >
                  Yes
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      // case "create":
      //   return (
      //     <RenderCreateAccount
      //       onOpen={onOpen}
      //       isOpen={isOpen}
      //       onClose={onClose}
      //     ></RenderCreateAccount>
      //   );
      default:
        return null;
    }
  };

  //main
  return fetchedList["role"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12% 0% 12%" h="max-content">
      <DialogBox
        name={currentPatient["patient name"]}
        pid={pid}
        role={fetchedList["role"]}
      />

      <Box minW="600px" w="100%" p="0 2% 0% 2%" h="fit-content">
        <Flex direction="row" padding="1rem 5rem 1rem 3rem" align="center">
          <Text fontSize="5xl" fontFamily="serif" fontWeight="550" mr="1rem">
            {currentPatient["patient name"]}
          </Text>

          {/* add/remove from my patient icons */}
          {fetchedList["role"] !== "admin" ? (
            existed ? (
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
            )
          ) : null}

          {/* delete/request to delete this patient  */}
          {/* {fetchedList["role"] === "admin" ? (
            <Tooltip
              label="Delete this patient permanently"
              aria-label="A tooltip"
            >
              <Button
                size="xs"
                bgColor="red.300"
                borderWidth="1px"
                mr="5px"
                onClick={() => {
                  setCommand("delete");
                  onOpen();
                }}
              >
                <DeleteIcon w={4} h={4}></DeleteIcon>
              </Button>
            </Tooltip>
          ) : (
            <Tooltip
              label="Request to delete this patient"
              aria-label="A tooltip"
            >
              <Button
                size="xs"
                bgColor="red.300"
                borderWidth="1px"
                mr="5px"
                onClick={() => {
                  setCommand("request");
                  onOpen();
                }}
              >
                <Icon
                  ml={1}
                  w={5}
                  h={5}
                  as={IoPersonRemoveOutline}
                  color="black"
                />
              </Button>
            </Tooltip>
          )} */}

          {/* create an account for this patient */}

          {/* {(fetchedList["role"] === "nurse" ||
            fetchedList["role"] === "doctor") &&
          allPatients ? (
            <Tooltip
              label="Create an account for this patient"
              aria-label="A tooltip"
            >
              <Button
                size="xs"
                bgColor="blue.200"
                borderWidth="1px"
                onClick={() => {
                  setCommand("create");
                  onOpen();
                }}
              >
                <Icon ml={1} w={6} h={6} as={MdPlaylistAdd} color="black" />
              </Button>
            </Tooltip>
          ) : null} */}
        </Flex>

        {renderAlertDialog(command)}

        <Box m="0 5% 0 5%">{renderPatientTable()}</Box>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent />
  );
};

export default DetailPatient;
