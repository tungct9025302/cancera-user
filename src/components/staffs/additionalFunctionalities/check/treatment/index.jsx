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

const CheckTreatment = () => {
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
  const { name, pid, boxTitle } = location.state;

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
      }
      setFetchedList(userData);
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
    try {
      if (
        currentPatient["treatments"] === undefined ||
        isEmptyArray(currentPatient["treatments"])
      ) {
        alert(
          "Error: This treatment is not existed in the patient treatments anymore."
        );
        window.location.reload();
      } else {
        setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          treatments: [
            ...currentPatient["treatments"].filter(
              (treatment) => !deepEqual(treatment, deletedTreatment)
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
      return "done";
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
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientTreatment) => {
        return patientTreatment["treatments"] !== undefined
          ? patientTreatment["treatments"]
              .filter((filteredTreatment) => filteredTreatment.date === date)
              .map((treatment, index) => {
                return <Box key={index}>{renderData(treatment, index)}</Box>;
              })
          : null;
      });
  };

  const renderAllTreatmentHistory = () => {
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientTreatment) => {
        return patientTreatment["treatments"] !== undefined
          ? patientTreatment["treatments"].map((treatment, index) => {
              return <Box key={index}>{renderData(treatment, index)}</Box>;
            })
          : null;
      });
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

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt="2px"
            alignContent="center"
          >
            <Flex direction="row">
              <Icon as={FaUserMd} w={4} h={4} m="2px 2px 0 0" />
              <Box maxW="500px">Creator: {treatment["creator name"]}</Box>
            </Flex>
            <Flex direction="row" mt="5px">
              <Text>Creator ID:</Text>
              <Text ml="1px" fontStyle="italic">
                {treatment["creator id"]}
              </Text>
            </Flex>
          </Flex>

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt="5px"
          >
            <Box></Box>

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
                  <Icon as={FaTools} w={4} h={4}></Icon>
                </Link>
              </Box>

              <Box>
                <DeleteIcon
                  onClick={() => {
                    onOpen();
                    setDeletedTreatment(treatment);
                  }}
                  cursor="pointer"
                  mb="8px"
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
    if (fetchedList !== undefined) {
      if (
        currentPatient["treatments"] === undefined ||
        isEmptyArray(currentPatient["treatments"])
      ) {
        return "There is currently no record of treatment for this patient.";
      } else {
        return null;
      }
    }
  };

  return currentPatient !== undefined ? (
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

export default CheckTreatment;
