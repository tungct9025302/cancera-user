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

const DetailIndicator = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  let { indicatorname } = useParams();

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
    //   setFetchedCancerList({});
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

  const renderNumberOfResults = () => {
    let totalResults = 0;
    let message;

    fetchedCancerList.map((cancer, index) => {
      behaviorIndicators = cancer["behavior indicators"];
      externalIndicators = cancer["external indicators"];
      behaviorIndicators.map((indicator) => {
        if (indicator.toLowerCase() === indicatorname) {
          totalResults = totalResults + 1;
        }
      });
      externalIndicators.map((indicator) => {
        if (indicator.toLowerCase() === indicatorname) {
          totalResults = totalResults + 1;
        }
      });
    });

    if (totalResults > 1) {
      message = `${totalResults} results for "${indicatorname.toLowerCase()}" :`;
    } else if (totalResults === 1) {
      message = `1 result for "${indicatorname.toLowerCase()}" :`;
    } else {
      message = `No result for "${indicatorname.toLowerCase()}".`;
    }
    return message;
  };

  const getCancerByIndicator = (cancer, findIndicator) => {
    behaviorIndicators = cancer["behavior indicators"];
    externalIndicators = cancer["external indicators"];

    const allIndicators = behaviorIndicators.concat(externalIndicators);

    return allIndicators.map((indicator, index) => {
      if (indicator.toLowerCase() === indicatorname.toLowerCase()) {
        return (
          <ListItem key={index} w="fit-content">
            <Link
              to={`/search/cancer/${cancer["type"].toLowerCase()}`}
              state={{ dataType: "CancerData", id: cancer["id"] }}
            >
              <Flex direction="row">
                <ChevronRightIcon w={7} h={7} mt="8px"></ChevronRightIcon>
                <Text fontSize="3xl" fontWeight={400}>
                  {Capitalize(cancer["type"])}
                </Text>
              </Flex>
            </Link>
          </ListItem>
        );
      }
    });
  };
  console.log(fetchedCancerList);
  //main
  return !isEmptyArray(fetchedCancerList) ? (
    <Box m="0% 20%">
      <Box>
        <Text
          fontSize="5xl"
          padding="2% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          {renderNumberOfResults()}
        </Text>
      </Box>
      <Box m="0 5% 0 5%">
        <List>
          {fetchedCancerList.map((cancer, index) => {
            return getCancerByIndicator(cancer);
          })}
        </List>
      </Box>
    </Box>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default DetailIndicator;
