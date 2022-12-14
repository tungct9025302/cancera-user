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

const DetailCancer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  let { cancername } = useParams();

  const [existed, setExisted] = useState(false);

  const [existedInList, setExistedInList] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({});
  const cancelRef = React.useRef();
  const { currentUser } = useContext(AuthContext);

  //Cancer data
  const [fetchedCancerList, setFetchedCancerList] = useState([]);

  let behaviorIndicators;
  let externalIndicators;
  useEffect(() => {
    fetchData();
    // return () => {
    //   setFetchedCancerList([]);
    // };
  }, []);

  //database
  const fetchData = async () => {
    let list = [];
    try {
      //get cancer data
      const querySnapshot = await getDocs(collection(db, "cancers"));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setFetchedCancerList(list);
    } catch (err) {
      console.log(err);
    }
  };

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

    fetchedCancerList.map((cancer) => {
      if (cancer["type"].toLowerCase() === cancername) {
        list = { ...cancer };
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
          Object.keys(firstAttribute)
            .sort((a, b) => a.localeCompare(b))
            .map((attribute, index) => {
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
                  <Flex
                    mb="10px"
                    key={index}
                    mt="10px"
                    fontWeight={550}
                    fontSize="20px"
                  >
                    <Text mr="5px" lineHeight="1.5rem">
                      {Capitalize(attribute)}:{" "}
                    </Text>
                    <Text lineHeight="1.5rem">
                      {Capitalize(firstAttribute[`${attribute}`])}
                    </Text>
                  </Flex>
                );
              }
            })
        ) : (
          <Text fontSize="20px" lineHeight="2rem" key={index}>
            - {Capitalize(firstAttribute.toString())}
          </Text>
        );
      });
    } else {
      return Capitalize(firstAttributes);
    }
  };

  //main
  return !isEmptyArray(fetchedCancerList) ? (
    <Box p="0% 20%">
      <Box>
        <Text
          fontSize="5xl"
          padding="2% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          {Capitalize(cancername)}
          {/* {dataType === "CancerData"
            ? getTreatmentOrCancerName(allCancerTypesListRedux)
            : getTreatmentOrCancerName(allTreatmentsListRedux)} */}
        </Text>
      </Box>

      <Box m="0 5% 0 5%">{renderTableByList(getChosenDatalist())}</Box>
    </Box>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default DetailCancer;
