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

const ViewMyTreatments = () => {
  const [date, setDate] = useState("");
  const [lastestDate, setLatestDate] = useState("");
  const [deletedTreatment, setDeletedTreatment] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const cancelRef = React.useRef();
  const location = useLocation();
  const { boxTitle } = location.state;

  let attributes = [
    {
      id: "treatment",
    },
    {
      id: "duration",
    },
  ];

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

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const checkState = (value) => {
    let x = lastestDate;
    let y = value;

    if (y > x) {
    } else if (x === y) {
      return "today";
    } else {
      return "passed";
    }
  };

  const getLastestTreatment = () => {
    if (
      fetchedList !== undefined &&
      currentPatient["treatments"] !== undefined &&
      !isEmptyArray(currentPatient["treatments"])
    ) {
      currentPatient["treatments"]
        .filter((patient) => patient["pid"] === pid)
        .map((patientTreatment) => {
          patientTreatment["treatments"].map((treatment) => {
            if (treatment["date"] > lastestDate) {
              setLatestDate(treatment["date"]);
            }
          });
        });
    } else {
      return null;
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
          <AlertDialogHeader>Delete this treatment?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this treatment record? Deleted
            records can not be recovered.
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

  const renderFilteredTreatmentHistory = () => {
    return fetchedList["treatments"] !== undefined
      ? fetchedList["treatments"].map((treatment, index) => {
          return treatment["date"] === date ? (
            <Box key={index}>{renderData(treatment, index)}</Box>
          ) : null;
        })
      : null;
  };

  const renderAllTreatmentHistory = () => {
    return fetchedList["treatments"] !== undefined
      ? fetchedList["treatments"].map((treatment, index) => {
          return <Box key={index}>{renderData(treatment, index)}</Box>;
        })
      : null;
  };

  const renderData = (treatment, index) => {
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
                  treatment["date"] === lastestDate ? "blue" : "teal"
                }
              >
                {treatment["date"] === lastestDate ? "current" : "done"}
              </Badge>

              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                &bull;{treatment["date"]}
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
              Treatment ID: {index}
            </Box>
          </Box>

          {attributes.map((attribute, index) => {
            return (
              <Flex direction="row" key={index} mt="5px">
                <Text fontWeight={550} mr="5px">
                  {Capitalize(attribute["id"])}:
                </Text>
                {treatment[`${attribute["id"]}`]}
              </Flex>
            );
          })}

          <Flex direction="row" mt="2px">
            <Icon as={FaUserMd} w={4} h={4} m="2px 2px 0 0" />
            <Text>Doctor: {treatment["doctor name"]}</Text>
          </Flex>

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt="2px"
          >
            <Flex direction="row">
              <Flex>
                <Text>Doctor ID:</Text>
              </Flex>
              <Box maxW="500px">
                <Text ml="1px" fontStyle="italic">
                  {treatment["doctor id"]}
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
    if (fetchedList !== undefined) {
      fetchedList["treatments"].map((treatment, index) => {
        if (treatment["date"] === date) {
          exist = true;
        }
      });
    }

    if (fetchedList !== undefined) {
      if (
        fetchedList["treatments"] === undefined ||
        isEmptyArray(fetchedList["treatments"])
      ) {
        return "There is currently no treatment.";
      } else if (date !== "" && !exist) {
        return `No record of treatment has been found on ${date}.`;
      } else {
        return null;
      }
    }
  };

  return fetchedList["pid"] !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox boxTitle="treatment" role={fetchedList["role"]} />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          My Treatments
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
              ? renderAllTreatmentHistory()
              : renderFilteredTreatmentHistory()}
          </InfiniteScroll>
        </Flex>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default ViewMyTreatments;
