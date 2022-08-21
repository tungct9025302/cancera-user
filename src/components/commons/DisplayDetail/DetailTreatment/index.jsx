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

const DetailTreatment = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  let { treatmentname } = useParams();
  const [existed, setExisted] = useState(false);

  const [existedInList, setExistedInList] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({});
  const cancelRef = React.useRef();
  const { currentUser } = useContext(AuthContext);

  //Patient data
  const [fetchedList, setFetchedList] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  //Treatment data
  const [fetchedTreatmentList, setFetchedTreatmentList] = useState([]);

  let behaviorIndicators;
  let externalIndicators;
  useEffect(() => {
    fetchData();
    // return () => {
    //   setCurrentPatient({});
    //   setAllPatients([]);
    //   setFetchedList({});
    // };
  }, []);

  //database
  const fetchData = async () => {
    let list = [];
    try {
      //get cancer data
      const querySnapshot = await getDocs(collection(db, "treatments"));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setFetchedTreatmentList(list);
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

    fetchedTreatmentList.map((treatment) => {
      if (treatment["type"].toLowerCase() === treatmentname) {
        list = { ...treatment };
      }
    });
    return list;
  };

  const renderTableByList = (list) => {
    return (
      <Table variant="striped" bg="blue.100" size="md">
        <Tbody>
          {Object.keys(list)
            .filter(
              (key) =>
                key.toLowerCase() !== "type" && key.toLowerCase() !== "id"
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
        return isObject(firstAttribute) ? (
          Object.keys(firstAttribute).map((attribute) => {
            if (Array.isArray(firstAttribute[`${attribute}`])) {
              return firstAttribute[`${attribute}`].map(
                (secondAttribute, index) => {
                  return (
                    <Text key={index} fontSize="20px" lineHeight="2rem">
                      - {secondAttribute.toString()}
                    </Text>
                  );
                }
              );
            } else {
              return (
                <Flex mb="10px" mt="10px" fontWeight={550} fontSize="20px">
                  <Text mr="5px">{Capitalize(attribute)}: </Text>
                  <Text>{firstAttribute[`${attribute}`]}</Text>
                </Flex>
              );
            }
          })
        ) : (
          <Text key={index} fontSize="20px" lineHeight="2rem">
            - {Capitalize(firstAttribute.toString())}
          </Text>
        );
      });
    } else {
      return (
        <Text fontSize="20px" lineHeight="2rem">
          {Capitalize(firstAttributes.toString())}
        </Text>
      );
    }
  };

  //main
  return !isEmptyArray(fetchedTreatmentList) ? (
    <Box p="0% 20%">
      <Box>
        <Text
          fontSize="5xl"
          padding="2% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          {Capitalize(treatmentname)}
        </Text>
      </Box>

      <Box m="0 5% 0 5%">{renderTableByList(getChosenDatalist())}</Box>
    </Box>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default DetailTreatment;
