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
import { connect } from "react-redux";
import { isEmptyArray } from "formik";

import DialogBox from "../../../../commons/DialogBox";
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
import { auth, db } from "../../../../../database/firebaseConfigs";
import { AuthContext } from "../../../../context/AuthContext";
import SpinnerComponent from "../../../../commons/Spinner";

const CheckAppointment = () => {
  const [date, setDate] = useState("");
  const [deletedAppointment, setDeletedAppointment] = useState();
  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const { currentUser } = useContext(AuthContext);
  //alert dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  //use Location
  const location = useLocation();
  const { name, pid, boxTitle } = location.state;

  useEffect(() => {
    fetchData();
    return () => {
      setCurrentPatient({});
      setFetchedList([]);
      setAllPatients([]);
    };
  }, []);

  //database
  const fetchData = async () => {
    let patientsData = [];
    let userData = [];
    try {
      //get all patients
      const querySnapshot = await getDocs(collection(db, "patients"));
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() });
      });
      setAllPatients(patientsData);

      //get user data
      const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        userData = { ...userDocSnap.data() };
        setFetchedList(userData);
      }

      //set current patient
      if (!isEmptyArray(patientsData)) {
        for (let i = 0; i < patientsData.length; i++) {
          if (
            (pid === patientsData[i].pid && pid !== undefined) ||
            patientsData[i].pid === pid
          ) {
            setCurrentPatient(patientsData[i]);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      if (
        currentPatient["appointments"] === undefined ||
        isEmptyArray(currentPatient["appointments"])
      ) {
        alert(
          "Error: This appointment is not existed in the patient appointments anymore."
        );
        window.location.reload();
      } else {
        setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          appointments: [
            ...currentPatient["appointments"].filter(
              (appointment) => !deepEqual(appointment, deletedAppointment)
            ),
          ],
        });
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
      return "done";
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

  const renderFilteredAppointmentHistory = () => {
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientAppointment) => {
        return patientAppointment["appointments"] !== undefined
          ? patientAppointment["appointments"]
              .filter(
                (filteredAppointment) => filteredAppointment.date === date
              )
              .map((appointment, index) => {
                return <Box key={index}>{renderData(appointment, index)}</Box>;
              })
          : null;
      });
  };

  const renderAllAppointmentsHistory = () => {
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientAppointment) => {
        return patientAppointment["appointments"] !== undefined
          ? patientAppointment["appointments"].map((appointment, index) => {
              return <Box key={index}>{renderData(appointment, index)}</Box>;
            })
          : null;
      });
  };

  const renderData = (appointment, index) => {
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
                  checkState(appointment.date) === "upcoming"
                    ? "blue"
                    : checkState(appointment.date) === "today"
                    ? "yellow"
                    : "teal"
                }
              >
                {checkState(appointment.date)}
              </Badge>

              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                &bull; {appointment.date} &bull; Room:
                {appointment.room} &bull; Floor:{appointment.floor} &bull; Time:
                {appointment.time}
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
              Appointment ID: {index}
            </Box>
          </Box>

          <Box
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            isTruncated
          >
            {appointment.title}
          </Box>

          <Flex direction="row" justifyContent="space-between" mt="5px">
            <Flex direction="row">
              <Icon as={FaUserMd} w={4} h={4} m="2px 2px 0 0" />
              <Text>Doctor: {appointment["doctor name"]}</Text>
            </Flex>
            <Box>{appointment.cancer} cancer</Box>
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
            {fetchedList["role"] !== "nurse" ? (
              <HStack spacing={4}>
                <Box>
                  <Link
                    to={`/modify/pid=${pid}/${boxTitle}/id=${index}`}
                    state={{
                      name: name,
                      id: index,
                      pid: pid,
                      boxTitle: boxTitle,
                    }}
                  >
                    <Icon
                      as={FaTools}
                      w={4}
                      h={4}
                      mt="2px"
                      display={
                        checkState(appointment.date) !== "done"
                          ? "block"
                          : "none"
                      }
                    ></Icon>
                  </Link>
                </Box>

                <Box>
                  <DeleteIcon
                    onClick={() => {
                      setDeletedAppointment(appointment);
                      onOpen();
                    }}
                    cursor="pointer"
                  ></DeleteIcon>
                  {renderAlertDialog()}
                </Box>
              </HStack>
            ) : (
              ""
            )}
          </Flex>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    if (fetchedList !== undefined) {
      if (
        currentPatient["appointments"] === undefined ||
        isEmptyArray(currentPatient["appointments"])
      ) {
        return "There is currently no appointment for this patient.";
      } else {
        return null;
      }
    }
  };

  return currentPatient["pid"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox
        name={name}
        pid={pid}
        boxTitle={boxTitle}
        role={fetchedList["role"]}
      />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          {name}
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
              {/* {isError(date, "date") ? (
                <FormErrorMessage>Date is required</FormErrorMessage>
              ) : isPast(date) ? (
                <FormErrorMessage>
                  Unable to set appointment on this date.
                </FormErrorMessage>
              ) : null} */}
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
              ? renderAllAppointmentsHistory()
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

export default CheckAppointment;
