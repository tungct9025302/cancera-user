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
  Select,
  Spinner,
} from "@chakra-ui/react";
import { MinusIcon, EditIcon } from "@chakra-ui/icons";
import { FaTools } from "react-icons/fa";
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
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../commons/Spinner";

const MyPatient = () => {
  const [filterName, setFilterName] = useState("");
  const [existedInList, setExistedInList] = useState(false);
  const [myPatients, setMyPatients] = useState([]);
  const [deletedPatient, setDeletedPatient] = useState();
  const [fetchedList, setFetchedList] = useState();
  const [allPatients, setAllPatients] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser } = useContext(AuthContext);
  const cancelRef = React.useRef();
  const location = useLocation();

  let properties = {
    cancerList: ["Tumor", "Brain", "Lung"],
  };
  //database
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let patientsData = [];
    let userData = [];

    try {
      // get user data
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
      //set current patient
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    const existInList = () => {
      fetchedList["my patients"].map((patient) => {
        if (deepEqual(patient, deletedPatient)) {
          setExistedInList(true);
        }
      });
      return existedInList;
    };

    try {
      if (fetchedList["my patients"] === undefined || existInList()) {
        alert(
          "Error: This patient is already not existed in your patient list."
        );
        window.location.reload();
      } else {
        await setDoc(doc(db, "users", currentUser.uid), {
          ...fetchedList,
          ["my patients"]: fetchedList["my patients"].filter(
            (patient) => patient["pid"] !== deletedPatient["pid"]
          ),
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
          <AlertDialogHeader>Delete this patient?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Text mb="5px">
              Are you sure you want to delete this patient from your patient
              list?
            </Text>
            <Text>
              Deleted patient can only be added back to your patient list by
              adding in search patient.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                handleRemove(event);
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

  const renderFilteredPatientList = () => {
    return allPatients
      .filter((filteredPatients) =>
        filteredPatients["name"]
          .toLowerCase()
          .includes(filterName.toLowerCase())
      )
      .map((patient, index) => {
        return myPatients.map((myPatient, index) => {
          if (myPatient["pid"] === patient["pid"]) {
            return <Box key={index}>{renderData(patient)}</Box>;
          }
        });
      });
  };

  const renderAllPatientList = () => {
    return allPatients.map((patient, index) => {
      return myPatients.map((myPatient, index) => {
        if (patient["pid"] === myPatient["pid"]) {
          return <Box key={index}>{renderData(patient)}</Box>;
        }
      });
    });
  };

  const renderData = (patient) => {
    return (
      <Box
        w="100%"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bgColor="#fcfcfc"
        display="flex"
        direction="column"
        justifyContent="space-between"
        p="6"
      >
        <Link
          to={`/search/patient/id=${patient["pid"]}`}
          state={{ dataType: "PatientData", pid: patient["pid"] }}
        >
          <Box>
            <Box display="flex" direction="row" mb="10px">
              <Box display="flex" alignItems="baseline" w="340px">
                <Badge borderRadius="full" px="2">
                  {patient["name"]}
                </Badge>
              </Box>
              <Box
                w=""
                color="gray.600"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                Patient ID: {patient["pid"]}
              </Box>
            </Box>

            <Box display="flex" direction="row">
              <Box
                w="334px"
                color="gray.600"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                {patient["cancer"]} cancer
              </Box>
              <Box
                color="gray.600"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                Next appointment: {patient["next appointment"]}
              </Box>
            </Box>
          </Box>
        </Link>

        <Box alignSelf="center">
          <Button
            size="xs"
            bgColor="red.300"
            borderWidth="1px"
            onClick={() => {
              onOpen();
              setDeletedPatient(patient);
            }}
            cursor="pointer"
          >
            <MinusIcon></MinusIcon>
            {renderAlertDialog()}
          </Button>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    if (fetchedList !== undefined) {
      if (myPatients.length > 0) {
        return null;
      } else {
        return "There is currently no patient in your list... :(";
      }
    }
  };

  return fetchedList !== undefined ? (
    <Flex direction="row" w="100%" p="0 12%">
      <DialogBox name={undefined} pid={undefined} role={fetchedList["role"]} />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          My Patient
        </Text>
        <Flex direction="column" m="0 5% 0 5%">
          <Flex direction="row" mb="10px" align="center">
            <Text fontWeight="600" mr="5px" whiteSpace="nowrap">
              Search by name:
            </Text>
            <FormControl w="160px">
              <Input
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                type="text"
                value={filterName}
                onChange={(e) => {
                  setFilterName(e.target.value);
                }}
                _placeholder={{
                  fontSize: "15px",
                }}
                placeholder="Nguyen Van A"
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
            {filterName === ""
              ? renderAllPatientList()
              : renderFilteredPatientList()}
          </InfiniteScroll>
        </Flex>
      </Box>

      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default MyPatient;
