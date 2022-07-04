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

const CheckGeneralExamination = () => {
  const [date, setDate] = useState("");
  const [deletedGeneralExamination, setDeletedGeneralExamination] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const cancelRef = React.useRef();
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

  //backend
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
        currentPatient["general examinations"] === undefined ||
        isEmptyArray(currentPatient["general examinations"])
      ) {
        alert(
          "Error: This appointment is not existed in the patient general examinations anymore."
        );
        window.location.reload();
      } else {
        setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          ["general examinations"]: [
            ...currentPatient["general examinations"].filter(
              (general_examination) =>
                !deepEqual(general_examination, deletedGeneralExamination)
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

  const renderFilteredGeneralExaminationsHistory = () => {
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientGeneralExaminations) => {
        return patientGeneralExaminations["general examinations"] !== undefined
          ? patientGeneralExaminations["general examinations"]
              .filter(
                (filteredGeneralExamination) =>
                  filteredGeneralExamination.date === date
              )
              .map((generalExamination, index) => {
                return (
                  <Box key={index}>{renderData(generalExamination, index)}</Box>
                );
              })
          : null;
      });
  };

  const renderAllGeneralExaminationsHistory = () => {
    return allPatients
      .filter((patient) => patient["pid"] === pid)
      .map((patientGeneralExaminations) => {
        return patientGeneralExaminations["general examinations"] !== undefined
          ? patientGeneralExaminations["general examinations"].map(
              (generalExamination, index) => {
                return (
                  <Box key={index}>{renderData(generalExamination, index)}</Box>
                );
              }
            )
          : null;
      });
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
                Creator: {generalExamination["creator name"]}
              </Box>
            </Flex>
            <Flex direction="row" mt="5px">
              <Text>Creator ID:</Text>
              <Text ml="1px" fontStyle="italic">
                {generalExamination["creator id"]}
              </Text>
            </Flex>
          </Flex>

          <Flex
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            alignContent="center"
          >
            <Box></Box>
            <HStack spacing={4}>
              <Box align="center">
                <Link
                  to={`/modify/pid=${pid}/${boxTitle}/id=${index}`}
                  state={{
                    name: name,
                    id: index,
                    pid: pid,
                    boxTitle: boxTitle,
                  }}
                >
                  <Icon as={FaTools} w={4} h={4} mt="8px"></Icon>
                </Link>
              </Box>

              <Box>
                <DeleteIcon
                  onClick={() => {
                    onOpen();
                    setDeletedGeneralExamination(generalExamination);
                  }}
                  cursor="pointer"
                ></DeleteIcon>
                {renderAlertDialog()}
              </Box>
            </HStack>

            {/* <Box>
                <Text ml="1px" fontStyle="italic">
                  {generalExamination.note}
                </Text>
              </Box> */}
          </Flex>
        </Box>
      </Box>
    );
  };

  const renderEndMessage = () => {
    if (fetchedList !== undefined) {
      if (
        currentPatient["general examinations"] === undefined ||
        isEmptyArray(currentPatient["general examination"])
      ) {
        return "There is currently no record of general examination record for this patient.";
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
// const mapStateToProps = (state) => {
//   return {
//     generalExaminationListRedux: state.myPatient.generalExaminationList,
//   };
// };
// const mapDispatchToProps = (dispatch) => {
//   return {
//     removeFromPatientGeneralExaminationById: (pid, generalExaminationID) =>
//       dispatch(
//         removeFromPatientGeneralExaminationById(pid, generalExaminationID)
//       ),
//   };
// };
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(CheckGeneralExamination);

export default CheckGeneralExamination;
