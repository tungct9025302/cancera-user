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

import DialogBox from "../../../commons/DialogBox";
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
import SpinnerComponent from "../../../commons/Spinner";

const MyAppointment = () => {
  const [date, setDate] = useState("");
  const [deletedAppointment, setDeletedAppointment] = useState();
  const [patientDataOfDeletedAppointment, setPatientDataOfDeletedAppointment] =
    useState();
  const [myPatients, setMyPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const { currentUser } = useContext(AuthContext);
  const [fetchedList, setFetchedList] = useState([]);

  useEffect(() => {
    fetchData();
    return () => {
      setAllPatients([]);
      setFetchedList([]);
    };
  }, []);

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
        patientDataOfDeletedAppointment["appointments"] === undefined ||
        isEmptyArray(patientDataOfDeletedAppointment["appointments"])
      ) {
        alert(
          "Error: This appointment is not existed in the patient appointments anymore."
        );
        window.location.reload();
      } else {
        await setDoc(
          doc(db, "patients", patientDataOfDeletedAppointment["id"]),
          {
            ...patientDataOfDeletedAppointment,
            appointments: patientDataOfDeletedAppointment[
              "appointments"
            ].filter(
              (appointment) => !deepEqual(appointment, deletedAppointment)
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

  const checkState = (value) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;

    if (y > x) {
      return "upcoming";
    } else if (x === y) {
      return "today";
    } else {
      return "passed";
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
          <AlertDialogHeader>Delete this appointment?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this appointment? Deleted
            appointments can not be recovered.
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

  const onDelete = (appointment) => {
    var array = [...allAppointments]; // make a separate copy of the array

    var index = array.indexOf(appointment);

    if (index !== -1) {
      array.splice(index, 1);
    }
    setAllAppointments(array);
  };

  const renderFilteredAppointmentHistory = () => {
    let myAppointmentID = -1;
    return fetchedList["my patients"].map((my_patient) => {
      return allPatients.map((patient, index) => {
        return patient["pid"] === my_patient["pid"]
          ? patient["appointments"] !== undefined &&
            !isEmptyArray(patient["appointments"])
            ? patient["appointments"].map((appointment) => {
                myAppointmentID = myAppointmentID + 1;
                return appointment["date"] === date ? (
                  <Box
                    key={index}
                    display={
                      patient["appointments"] !== undefined &&
                      !isEmptyArray(patient["appointments"])
                        ? "block"
                        : "unset"
                    }
                    mb={
                      index + 1 === fetchedList["my patients"].length
                        ? "0px"
                        : "40px"
                    }
                  >
                    {renderData(appointment, myAppointmentID, index, patient)}
                  </Box>
                ) : null;
              })
            : null
          : null;
      });
    });
  };

  const renderAllAppointmentHistory = () => {
    let myAppointmentID = -1;

    return fetchedList["my patients"].map((my_patient) => {
      return allPatients.map((patient, index) => {
        return (
          <Box
            key={index}
            display={
              patient["appointments"] !== undefined &&
              !isEmptyArray(patient["appointments"])
                ? "block"
                : "unset"
            }
            mb={
              index + 1 === fetchedList["my patients"].length ? "0px" : "40px"
            }
          >
            {patient["pid"] === my_patient["pid"]
              ? patient["appointments"] !== undefined &&
                !isEmptyArray(patient["appointments"])
                ? patient["appointments"].map((appointment, index) => {
                    myAppointmentID = myAppointmentID + 1;
                    return (
                      <Box key={index}>
                        {renderData(
                          appointment,
                          myAppointmentID,
                          index,
                          patient
                        )}
                      </Box>
                    );
                  })
                : null
              : null}
          </Box>
        );
      });
    });
  };

  const renderData = (appointment, myAppointmentID, index, patient) => {
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
                colorScheme={
                  checkState(appointment["date"]) === "upcoming"
                    ? "blue"
                    : checkState(appointment["date"]) === "today"
                    ? "yellow"
                    : "teal"
                }
              >
                {checkState(appointment["date"])}
              </Badge>

              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                &bull; {appointment["date"]} &bull; Room:
                {appointment["room"]} &bull; Floor:{appointment["floor"]} &bull;
                Time:
                {appointment["time"]}
              </Box>
            </Box>
            <Box
              color="blue.600"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
            >
              Appointment ID: {myAppointmentID}
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Box
              mt="1"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
              textAlign="center"
            >
              Name: {patient["patient name"]}
            </Box>
            <Box
              color="blue.600"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
              alignSelf="center"
            >
              Patient ID: {patient["pid"]}
            </Box>
          </Box>

          <Flex direction="row" justifyContent="space-between">
            <Box> Title: {appointment["title"]}</Box>
            <Box>{appointment["cancer"]} cancer</Box>
          </Flex>

          <Flex direction="row">
            <Icon as={FaUserMd} w={4} h={4} m="2px 2px 0 0" />
            <Text>Doctor: {appointment["doctor name"]}</Text>
          </Flex>

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex direction="row">
              <Flex>
                <Text>Doctor ID:</Text>
              </Flex>
              <Box maxW="500px">
                <Text ml="1px" fontStyle="italic">
                  {appointment["doctor id"]}
                </Text>
              </Box>
            </Flex>

            <HStack spacing={4}>
              {checkState(appointment["date"]) !== "passed" ? (
                <Box>
                  <Link
                    to={`/modify/pid=${patient["pid"]}/appointment/id=${index}`}
                    state={{
                      name: patient["patient name"],
                      id: index,
                      pid: patient["pid"],
                      boxTitle: "appointment",
                      previous_location: "my appointment",
                    }}
                  >
                    <Icon
                      as={FaTools}
                      w={4}
                      h={4}
                      display={
                        checkState(appointment["date"]) !== "done"
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
                    setPatientDataOfDeletedAppointment(patient);
                    setDeletedAppointment(appointment);
                  }}
                  cursor="pointer"
                ></DeleteIcon>
                {renderAlertDialog()}
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    let not_exist = true;

    fetchedList["my patients"].map((my_patient) => {
      allPatients
        .filter((patient) => patient["pid"] === my_patient["pid"])
        .map((foundPatient) => {
          if (
            foundPatient["appointments"] !== undefined &&
            !isEmptyArray(foundPatient["appointments"])
          ) {
            not_exist = false;
          }
        });
    });
    return not_exist ? "You do not have any appointments..." : null;
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
          My Appointments
        </Text>
        <Flex direction="column" m="0 5% 0 5%">
          <Flex direction="row" mb="10px" align="center">
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
            {date === ""
              ? renderAllAppointmentHistory()
              : renderFilteredAppointmentHistory()}
          </InfiniteScroll>
        </Flex>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default MyAppointment;
