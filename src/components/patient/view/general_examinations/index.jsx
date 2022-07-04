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
  Spacer,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FaTools } from "react-icons/fa";
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

const ViewMyGeneralExaminations = () => {
  const [date, setDate] = useState("");
  const [deletedGeneralExamination, setDeletedGeneralExamination] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const cancelRef = React.useRef();

  //use Location
  const location = useLocation();
  const { boxTitle } = location.state;

  useEffect(() => {
    fetchData();
    return () => {
      setFetchedList([]);
    };
  }, []);

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

  //backend
  const fetchData = async () => {
    let userData = [];
    // try {
    //get user data
    const userDocSnap = await getDoc(doc(db, "patients", currentUser.uid));
    if (userDocSnap.exists()) {
      userData = { ...userDocSnap.data() };
    }
    setFetchedList(userData);
    // } catch (err) {
    //   console.log(err);
    // }
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

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const checkState = (value, action) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;
    switch (action) {
      case "state":
        if (y < x) {
          return "passed";
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

  const renderFilteredGeneralExaminationsHistory = () => {
    return fetchedList["general examinations"] !== undefined
      ? fetchedList["general examinations"].map(
          (general_examination, index) => {
            return general_examination["date"] === date ? (
              <Box key={index}>{renderData(general_examination, index)}</Box>
            ) : null;
          }
        )
      : null;
  };

  const renderAllGeneralExaminationsHistory = () => {
    return fetchedList["general examinations"] !== undefined
      ? fetchedList["general examinations"].map(
          (general_examination, index) => {
            return (
              <Box key={index}>{renderData(general_examination, index)}</Box>
            );
          }
        )
      : null;
  };

  const renderData = (generalExamination, index) => {
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
                colorScheme={checkState(generalExamination["date"], "color")}
              >
                {checkState(generalExamination["date"], "state")}
              </Badge>

              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                &bull;{generalExamination.date}
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
              General Examination ID: {index}
            </Box>
          </Box>

          {attributes.map((attribute, index) => {
            return (
              <Flex direction="row" m="5px 5px 0 0" key={index}>
                <Text fontWeight={550} mr="3px">
                  {Capitalize(attribute["id"])}:
                </Text>
                <Text mr="5px">{generalExamination[`${attribute["id"]}`]}</Text>
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
                Doctor: {generalExamination["doctor name"]}
              </Box>
            </Flex>
            <Flex direction="row" mt="5px">
              <Text>Doctor ID:</Text>
              <Text ml="1px" fontStyle="italic">
                {generalExamination["doctor id"]}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    let exist;
    if (fetchedList !== undefined) {
      fetchedList["general examinations"].map((general_examination, index) => {
        if (general_examination["date"] === date) {
          exist = true;
        }
      });
    }

    if (fetchedList !== undefined) {
      if (
        fetchedList["general examinations"] === undefined ||
        isEmptyArray(fetchedList["general examinations"])
      ) {
        return "There is currently no record of general examination record.";
      } else if (date !== "" && !exist) {
        return `No record of general examination has been found on ${date}.`;
      } else {
        return null;
      }
    }
  };

  return fetchedList["pid"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox boxTitle="general examination" role={fetchedList["role"]} />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          My general examinations
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
              ? renderAllGeneralExaminationsHistory()
              : renderFilteredGeneralExaminationsHistory()}
          </InfiniteScroll>
        </Flex>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default ViewMyGeneralExaminations;
