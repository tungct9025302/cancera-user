import React, { useState, useEffect } from "react";

import {
  Box,
  Text,
  Button,
  Collapse,
  Flex,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  List,
  ListItem,
} from "@chakra-ui/react";
import { SearchIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
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
import { async } from "@firebase/util";
import { isEmptyArray, isObject } from "formik";
import SpinnerComponent from "../../commons/Spinner";

const Indicator = () => {
  const [clickedBox, setClickedBox] = useState(0);
  const [clickedAlphabet, setClickedAlphabet] = useState();
  const [sameAlphabet, setSameAlphabet] = useState(false);
  const [fetchedCancerList, setFetchedCancerList] = useState([]);

  let listExistedAlphabet = [];
  let behaviorIndicators;
  let externalIndicators;

  const boxOptions = ["Behavior Indicators", "External Indicators"];
  const alphabets = `abcdefghijklmnopqrstuvwxyz`.split("");

  useEffect(() => {
    fetchData();
    getAlphabetExist();
    return () => {
      setFetchedCancerList([]);
    };
  }, []);

  //database
  const fetchData = async () => {
    let list = {};

    try {
      //get cancer data
      const cancerDocSnap = await getDoc(
        doc(db, "guests", "q6hUkmJo4Nq6Laaqtt5q")
      );
      if (cancerDocSnap.exists()) {
        list = { ...cancerDocSnap.data() };
        setFetchedCancerList(list["cancer data"]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderIndicatorsList = () => {
    return (
      <Box>
        {alphabets.map((alphabet, index) => {
          return (
            <Flex
              key={alphabet}
              direction="column"
              display={
                sameAlphabet === true || listExistedAlphabet.includes(alphabet)
                  ? "block"
                  : alphabet === clickedAlphabet ||
                    clickedAlphabet === undefined
                  ? "block"
                  : "none"
              }
            >
              <Box
                bg="#c5e7e8"
                color="#4a4a4a"
                fontFamily="Source Sans Pro,Verdana,sans-serif"
                fontWeight={400}
                fontSize="1em"
                mb="1.188rem"
                p="0.3rem 0.5rem"
                textTransform="capitalize"
                mt="1rem"
              >
                <Text>{alphabet}</Text>
              </Box>

              <List
                w="100%"
                paddingRight="2rem"
                // display={
                //   listExistedAlphabet.includes(alphabet) ? "block" : "none"
                // }
                display="block"
                listStyleType="disc"
                marginBlockStart="1em"
                marginBlockEnd="1em"
                marginInlineEnd="0px"
                marginInlineStart="0px"
                paddingInlineStart="40px"
                style={{ columnCount: "2" }}
              >
                {renderBehaviorIndicatorsList(alphabet)}
              </List>
            </Flex>
          );
        })}
      </Box>
    );
  };

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderBehaviorIndicatorsList = (alphabet) => {
    let list = [];
    if (isEmptyArray(list) || fetchedCancerList !== undefined) {
      list = fetchedCancerList;
    }

    return list.map((cancer, index) => {
      switch (clickedBox) {
        case 0:
          return (
            <Box key={index}>
              {renderBoxData(
                cancer["behavior indicators"],
                alphabet,
                cancer["name"],
                "behavior indicators"
              )}
            </Box>
          );
        case 1:
          return (
            <Box key={index}>
              {renderBoxData(
                cancer["external indicators"],
                alphabet,
                cancer["name"],
                "external indicators"
              )}
            </Box>
          );
        default:
          return null;
      }
    });
  };
  const renderBoxData = (list, alphabet, name, indicatorType) => {
    return list.map((indicator, index) => {
      return (
        <ListItem
          key={index}
          display={
            indicator.toLowerCase().charAt(0) === alphabet
              ? "inline-block"
              : "none"
          }
          pb="20px"
          w="100%"
          mr="20px"
        >
          <Flex direction="column">
            <Link
              to={`/search/indicator/${indicator.toLowerCase()}`}
              // state={{
              //   dataType: "IndicatorData",
              // }}
            >
              <Text
                color="#034254"
                display="block"
                fontFamily="Source Sans Pro,Verdana,sans-serif"
                fontSize="1.25rem"
                fontWeight={500}
                textDecor="none"
                textTransform="capitalize"
              >
                {indicator}
              </Text>
            </Link>
          </Flex>
        </ListItem>
      );
    });
    // }
  };

  const getAlphabetExist = () => {
    if (!isEmptyArray(fetchedCancerList)) {
      fetchedCancerList.map((cancer, index) => {
        behaviorIndicators = cancer["behavior indicators"];
        externalIndicators = cancer["external indicators"];
        switch (clickedBox) {
          case 0:
            getAlphabetExistForBox(behaviorIndicators);
            break;
          case 1:
            getAlphabetExistForBox(externalIndicators);
            break;
          default:
            null;
        }
      });
    }
  };

  const getAlphabetExistForBox = (data) => {
    data.map((indicator, index) => {
      if (!listExistedAlphabet.includes(indicator.toLowerCase().charAt(0))) {
        listExistedAlphabet.push(indicator.toLowerCase().charAt(0));
      }
    });
  };

  return !isEmptyArray(fetchedCancerList) ? (
    <Flex
      direction="column"
      letterSpacing="-.017069rem"
      maxW="49em"
      ml="auto"
      mr="auto"
      position="relative"
    >
      <Flex
        direction="row"
        margin="0 auto"
        minW="730px"
        position="relative"
        p="5px 0"
        // cursor="pointer"
      >
        <Text fontWeight={400} color="#187aab" fontFamily="Source Sans Pro">
          A-Z Guides
        </Text>
        <ChevronRightIcon pt="5px" w="5" h="5"></ChevronRightIcon>
      </Flex>
      <Box>
        <Text
          fontSize="3rem"
          fontWeight={700}
          lineHeight="1"
          margin="0.67em 0"
          fontFamily="Source Sans Pro,Verdana,sans-serif"
        >
          Indicator A-Z
        </Text>
      </Box>
      <Box>
        <Stack
          direction={["column", "row"]}
          spacing="10px"
          margin="0 1.3rem"
          p="0"
        >
          {boxOptions.map((option, index) => {
            return (
              <Box key={option}>
                <Text
                  color={index === clickedBox ? "black" : "rgba(74,74,74,.74)"}
                  display="inline-block"
                  fontFamily="Roboto Condensed"
                  fontSize="1.25rem"
                  boxShadow="md"
                  lineHeight="1"
                  p="0.625rem 0.9375rem"
                  textAlign="center"
                  bgColor={index === clickedBox ? "#c5e7e8" : "white"}
                  onClick={() => {
                    setClickedBox(index);
                  }}
                  _hover={{
                    color: "#444",
                  }}
                  borderRadius="5px"
                  whiteSpace="nowrap"
                >
                  {option}
                </Text>
              </Box>
            );
          })}
        </Stack>

        <Box
          display="flex"
          flexWrap="wrap"
          mt="-4px"
          mb="1.188rem"
          bgColor="#c5e7e8"
          fontFamily="Source Sans Pro,Verdana,sans-serif"
          p="1.5rem 1.3rem 1.625rem"
          position="relative"
          w="49em"
          h="142px"
        >
          {alphabets.map((alphabet, index) => {
            return (
              <Text
                key={alphabet}
                display="block"
                fontFamily="Source Sans Pro,Verdana,sans-serif"
                fontSize="1.313rem"
                lineHeight="2"
                textDecoration="none"
                textTransform="uppercase"
                cursor="pointer"
                justifyContent="center"
                textAlign="center"
                width="45px"
                height="41px"
                verticalAlign="middle"
                color={
                  alphabet === clickedAlphabet && !sameAlphabet
                    ? "white"
                    : "#1c2833"
                }
                bgColor={
                  alphabet === clickedAlphabet && !sameAlphabet
                    ? "#034254"
                    : "white"
                }
                onClick={() => {
                  if (clickedAlphabet !== alphabet) {
                    setClickedAlphabet(alphabet);
                    setSameAlphabet(false);
                  } else {
                    setSameAlphabet(!sameAlphabet);
                  }
                }}
                m="0 12px 12px 0"
              >
                {alphabet}
              </Text>
            );
          })}
        </Box>
      </Box>
      {renderIndicatorsList()}
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};
export default Indicator;
