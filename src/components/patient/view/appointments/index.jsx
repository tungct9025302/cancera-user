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
import { FaUserMd } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { connect } from "react-redux";
import { isEmptyArray } from "formik";

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
import { auth, db } from "../../../../database/firebaseConfigs";
import { AuthContext } from "../../../context/AuthContext";
import SpinnerComponent from "../../../commons/Spinner";

const ViewMyAppointments = () => {
  const [date, setDate] = useState("");

  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const { currentUser } = useContext(AuthContext);
  //alert dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  //use Location
  const location = useLocation();
  // const { boxTitle } = location.state;

  useEffect(() => {
    fetchData();
    return () => {
      setFetchedList([]);
    };
  }, []);

  //database
  const fetchData = async () => {
    let userData = [];
    try {
      //get user data
      const userDocSnap = await getDoc(doc(db, "patients", currentUser.uid));
      if (userDocSnap.exists()) {
        userData = { ...userDocSnap.data() };
      }
      setFetchedList(userData);
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

  const renderFilteredAppointmentHistory = () => {
    return fetchedList["appointments"] !== undefined
      ? fetchedList["appointments"].map((appointment, index) => {
          return appointment["date"] === date ? (
            <Box key={index}>{renderData(appointment, index)}</Box>
          ) : null;
        })
      : null;
  };

  const renderAllAppointmentsHistory = () => {
    return fetchedList["appointments"] !== undefined
      ? fetchedList["appointments"].map((appointment, index) => {
          return <Box key={index}>{renderData(appointment, index)}</Box>;
        })
      : null;
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

          <Flex direction="row" justifyContent="space-between">
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
          </Flex>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    let exist;
    if (fetchedList["appointments"] !== undefined) {
      fetchedList["appointments"].map((appointment, index) => {
        if (appointment["date"] === date) {
          exist = true;
        }
      });
    }

    if (fetchedList !== undefined) {
      if (
        fetchedList["appointments"] === undefined ||
        isEmptyArray(fetchedList["appointments"])
      ) {
        return "There is currently no appointment.";
      } else if (date !== "" && !exist) {
        return `No appointment has been found on ${date}.`;
      } else {
        return null;
      }
    }
  };

  return fetchedList["pid"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox boxTitle="appointments" role={fetchedList["role"]} />

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

export default ViewMyAppointments;
