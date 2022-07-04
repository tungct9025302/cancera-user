import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Icon,
  Box,
  Flex,
  Input,
  Text,
  InputGroup,
  InputLeftElement,
  List,
  Stack,
  Image,
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { BsSearch } from "react-icons/bs";
import { ListItem } from "@chakra-ui/react";

import SearchBar from "../../commons/SearchBar";
import GuestBackground from "../../../pictures/treatmentbg.png";
import firstIcon from "../../../pictures/first_icon.jpg";
import secondIcon from "../../../pictures/second_icon.png";
import thirdIcon from "../../../pictures/third_icon.png";
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

const Treatment = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");
  const [clickedAlphabet, setClickedAlphabet] = useState();
  const [sameAlphabet, setSameAlphabet] = useState(false);
  const [lastClickedAlphabet, setLastClickedAlphabet] = useState();
  const [fetchedTreatmentList, setFetchedTreatmentList] = useState([]);
  const [expand, setExpand] = useState(false);
  const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");

  useEffect(() => {
    fetchData();

    // return () => {
    //   setFetchedCancerList([]);
    // };
  }, []);

  //database
  const fetchData = async () => {
    let list = {};

    try {
      //get cancer data
      const treatmentDocSnap = await getDoc(
        doc(db, "guests", "q6hUkmJo4Nq6Laaqtt5q")
      );
      if (treatmentDocSnap.exists()) {
        list = { ...treatmentDocSnap.data() };
        setFetchedTreatmentList(list["treatment data"]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);
    const newFilter = fetchedTreatmentList.filter((value) => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase());
    });

    if (searchWord === "") {
      setFilteredData([]);
    } else {
      setFilteredData(newFilter);
    }
  };

  const renderTopTreatmentsList = () => {
    return fetchedTreatmentList.map((treatment, index) => {
      return (
        <ListItem
          key={index}
          display="inline-block"
          pb="25px"
          w="100%"
          mr="20px"
        >
          <Flex direction="column">
            <Link to={`/search/treatment/${treatment.name.toLowerCase()}`}>
              <Text
                color="#034254"
                display="block"
                fontFamily="Source Sans Pro,Verdana,sans-serif"
                fontSize="1.25rem"
                fontWeight={500}
                lineHeight="1.25rem"
                textDecor="none"
                textTransform="capitalize"
              >
                {treatment.name}
              </Text>
            </Link>

            <Text
              color="#626262"
              fontFamily="Source Sans Pro,Verdana,sans-serif"
              fontSize="15px"
              textDecor="underline"
            >
              {treatment["treatment type"]}
            </Text>
          </Flex>
        </ListItem>
      );
    });
  };

  const renderTreatmentByAlphabet = (alphabet) => {
    return fetchedTreatmentList.map((treatment, index) => {
      return (
        <ListItem
          key={index}
          display={
            treatment["name"].charAt(0).toLowerCase() === alphabet
              ? "inline-block"
              : "none"
          }
          pb="20px"
          w="100%"
          mr="20px"
        >
          <Flex direction="column">
            <Link
              to={`/search/treatment/${treatment["name"].toLowerCase()}`}
              state={{ dataType: "TreatmentData", id: treatment["id"] }}
            >
              <Text
                color="#034254"
                display="block"
                fontFamily="Source Sans Pro,Verdana,sans-serif"
                fontSize="1.25rem"
                fontWeight={500}
                lineHeight="1.25rem"
                textDecor="none"
                textTransform="capitalize"
                textAlign="left"
              >
                {treatment["name"]}
              </Text>
            </Link>
          </Flex>
        </ListItem>
      );
    });
  };

  const renderToolTip = (type) => {
    switch (type) {
      case "primary":
        return "Primary treatment is to completely remove the cancer from your body or kill all the cancer cells.";
      case "adjuvant":
        return "Adjuvant treatment given after the primary treatment to lower the risk that the cancer will come back.";
      case "palliative":
        return "Palliative treatment is to relieve symptoms and improve your quality of life.";
      default:
        return null;
    }
  };

  return !isEmptyArray(fetchedTreatmentList) ? (
    <Flex direction="column" letterSpacing="-.017069rem">
      <Box margin="0 auto" minW="730px" position="relative" p="5px 0">
        <Text
          fontWeight={400}
          color="#187aab"
          cursor="pointer"
          fontFamily="Source Sans Pro"
        >
          Treatment & Duration
        </Text>
      </Box>
      <Box align="center">
        <Box
          width="100%"
          p="15px 0 65px 0"
          backgroundImage={GuestBackground}
          backgroundPosition="50%"
          color="white"
          backgroundSize="cover"
        >
          <Text
            fontWeight={700}
            textTransform="capitalize"
            fontSize="3.3125rem"
            p="1% 0 0 0"
            fontFamily="Source Sans Pro,Verdana,sans-serif"
          >
            Treatment & Duration
          </Text>
          <Text
            fontSize="20px"
            fontWeight={400}
            fontFamily="Source Sans Pro,Verdana,sans-serif"
          >
            Trusted source for cancer treatments
          </Text>
        </Box>
        <Box
          maxW="734px"
          marginTop="-50px"
          width="100%"
          boxShadow="0 2px 4px 0"
          borderRadius="7px"
          bgColor="#dcf3f7"
          align="left"
        >
          <Box p="16px">
            <SearchBar
              setFilteredData={setFilteredData}
              wordEntered={wordEntered}
              filteredData={filteredData}
              width="37%"
              handleFilter={handleFilter}
              setWordEntered={setWordEntered}
              placeholder="Find a treatment type"
              data={fetchedTreatmentList}
              type="treatment"
            ></SearchBar>

            <Box mt="1rem">
              <Box
                display="flex"
                flexDirection="row"
                onClick={() => {
                  setExpand(!expand);
                  if (expand === false) {
                    setClickedAlphabet(lastClickedAlphabet);
                  } else {
                    setLastClickedAlphabet(clickedAlphabet);
                    setClickedAlphabet(undefined);
                  }
                }}
              >
                <Text
                  fontFamily="Source Sans Pro,Verdana,sans-serif"
                  fontSize="20px"
                  fontWeight={400}
                  lineHeight="normal"
                  letterSpacing="normal"
                  color="#034254 "
                  cursor="pointer"
                >
                  Search Treatments by Letter
                </Text>
                {expand ? (
                  <ChevronUpIcon w="7" h="7" cursor="pointer"></ChevronUpIcon>
                ) : (
                  <ChevronDownIcon
                    w="7"
                    h="7"
                    cursor="pointer"
                  ></ChevronDownIcon>
                )}
              </Box>

              <Box
                display={expand ? "flex" : "none"}
                flexWrap="wrap"
                width="100%"
              >
                {alphabets.map((alphabet, index) => {
                  return (
                    <Text
                      key={index}
                      display="block"
                      fontFamily="Source Sans Pro,Verdana,sans-serif"
                      fontSize="1.25rem"
                      height="34px"
                      lineHeight="1.5"
                      textDecoration="none"
                      textTransform="uppercase"
                      cursor="pointer"
                      textAlign="center"
                      width="34px"
                      verticalAlign="middle"
                      borderRadius="5.1px"
                      color={alphabet === clickedAlphabet ? "white" : "#1c2833"}
                      bgColor={
                        alphabet === clickedAlphabet ? "#034254" : "white"
                      }
                      onClick={() => {
                        setClickedAlphabet(alphabet);
                      }}
                      m="5px"
                    >
                      {alphabet}
                    </Text>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          direction="column"
          letterSpacing="-.017069rem"
          maxW="54em"
          ml="auto"
          mr="auto"
          position="relative"
        >
          {alphabets.map((alphabet, index) => {
            return (
              <Flex
                key={alphabet}
                direction="column"
                display={
                  sameAlphabet === true
                    ? "block"
                    : alphabet === clickedAlphabet
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
                  mt="1.5rem"
                >
                  <Text textAlign="left">{alphabet}</Text>
                </Box>

                <List
                  w="100%"
                  paddingRight="2rem"
                  display="block"
                  listStyleType="disc"
                  marginBlockStart="1em"
                  marginBlockEnd="1em"
                  marginInlineEnd="0px"
                  marginInlineStart="0px"
                  paddingInlineStart="40px"
                  style={{ columnCount: "2" }}
                >
                  {renderTreatmentByAlphabet(alphabet)}
                </List>
              </Flex>
            );
          })}
        </Box>
      </Box>

      <Flex display="block" position="relative" flexDirection="row">
        <Flex
          maxW="68em"
          ml="auto"
          mr="auto"
          position="relative"
          direction="column"
        >
          <Stack direction={["column", "row"]} spacing="20px" p="50px 0">
            <Tooltip label={renderToolTip("primary")} aria-label="A tooltip">
              <Flex
                direction="row"
                textDecor="none"
                w="166px"
                display="inline-block"
                textAlign="center"
                p="10px 0"
                ml="2rem"
              >
                <Image w="177px" h="116px" src={firstIcon}></Image>
                <Text
                  display="inline-block"
                  maxW="150px"
                  objectFit="contain"
                  fontFamily="Source Sans Pro,Verdana,sans-serif"
                  fontSize="19px"
                  fontWeight={600}
                  lineHeight="normal"
                  letterSpacing="-.42px"
                  textAlign="center"
                  color="#034254"
                >
                  Primary Treatment
                </Text>
              </Flex>
            </Tooltip>
            <Tooltip label={renderToolTip("adjuvant")} aria-label="A tooltip">
              <Flex
                direction="row"
                textDecor="none"
                w="166px"
                display="inline-block"
                textAlign="center"
                p="10px 0"
                ml="2rem"
                align="center"
              >
                <Image src={secondIcon} w="120px" h="116px" ml="20px"></Image>
                <Text
                  display="inline-block"
                  maxW="150px"
                  objectFit="contain"
                  fontFamily="Source Sans Pro,Verdana,sans-serif"
                  fontSize="19px"
                  fontWeight={600}
                  lineHeight="normal"
                  letterSpacing="-.42px"
                  textAlign="center"
                  color="#034254"
                >
                  Adjuvant Treatment
                </Text>
              </Flex>
            </Tooltip>
            <Tooltip label={renderToolTip("palliative")} aria-label="A tooltip">
              <Flex
                direction="row"
                textDecor="none"
                w="166px"
                display="inline-block"
                textAlign="center"
                p="10px 0"
                ml="2rem"
              >
                <Image w="120px" h="116px" ml="20px" src={thirdIcon}></Image>
                <Text
                  display="inline-block"
                  maxW="150px"
                  objectFit="contain"
                  fontFamily="Source Sans Pro,Verdana,sans-serif"
                  fontSize="19px"
                  fontWeight={600}
                  lineHeight="normal"
                  letterSpacing="-.42px"
                  textAlign="center"
                  color="#034254"
                >
                  Palliative Treatment
                </Text>
              </Flex>
            </Tooltip>
          </Stack>
          <Flex
            bgColor="#f2f3f4"
            borderRadius="7px"
            ml="1.5rem"
            direction="column"
          >
            <Box pb="3px" pt="26px" mt="30px" mb="25px">
              <Text
                color="#1c2833"
                fontSize="24px"
                fontWeight={700}
                textAlign="center"
              >
                All types of Treatments
              </Text>
              <Box pb="20px">
                <List
                  w="100%"
                  paddingRight="2rem"
                  display="block"
                  listStyleType="disc"
                  marginBlockStart="1em"
                  marginBlockEnd="1em"
                  marginInlineEnd="0px"
                  marginInlineStart="0px"
                  paddingInlineStart="40px"
                  style={{ columnCount: "3" }}
                >
                  {renderTopTreatmentsList()}
                </List>
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  ) : (
    <SpinnerComponent />
  );
};

export default Treatment;
