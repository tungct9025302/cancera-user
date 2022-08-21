import React, { useState, useContext, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
  Flex,
  SimpleGrid,
  GridItem,
  Heading,
  useColorModeValue,
  chakra,
  Stack,
  Select,
  Button,
  InputRightAddon,
  InputGroup,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { connect } from "react-redux";

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
import { generalExaminationInputs } from "../../../../commons/FormSource";
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../../../commons/Spinner";

const AddGeneralExamination = () => {
  const [date, setDate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [bloodConcentration, setBloodConcentration] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [bloodTest, setBloodTest] = useState("");
  const [marrowTest, setMarrowTest] = useState("");
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [currentPatient, setCurrentPatient] = useState({});
  const [fetchedList, setFetchedList] = useState([]);
  const [allPatients, setAllPatients] = useState([]);

  const { name, id, pid, boxTitle } = location.state;

  useEffect(() => {
    fetchData();
    return () => {
      setCurrentPatient({});
      setFetchedList([]);
      setAllPatients([]);
      setData({});
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
        setFetchedList(userData);
        setData({
          ["creator name"]: userData["name"],
          ["creator id"]: userData["id"],
        });
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

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      if (
        currentPatient["general examinations"] === undefined ||
        isEmptyArray(currentPatient["general examinations"])
      ) {
        await setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          ["general examinations"]: [{ ...data }],
        });

        navigate(
          `/search-patient/id=${pid}/check-history/general examination`,
          {
            state: { boxTitle: boxTitle, name: name, pid: pid },
          }
        );
      } else {
        await currentPatient["general examinations"].map(
          (general_examination) => {
            if (deepEqual(general_examination, data)) {
              alert("This general examination is already existed in database.");
            } else {
              setDoc(doc(db, "patients", currentPatient["id"]), {
                ...currentPatient,
                ["general examinations"]: [
                  ...currentPatient["general examinations"],
                  { ...data },
                ],
              });
              navigate(
                `/search-patient/id=${pid}/check-history/general examination`,
                {
                  state: { boxTitle: boxTitle, name: name, pid: pid },
                }
              );
            }
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    switch (id) {
      case "blood pressure":
        setData({ ...data, [id]: value + "mmHg" });
        break;
      case "blood concentration":
        setData({ ...data, [id]: value + "g/dL" });
        break;
      case "blood glucose":
        setData({ ...data, [id]: value + "mg/dL" });
        break;
      case "heart rate":
        setData({ ...data, [id]: value + "bpm" });
        break;
      default:
        setData({ ...data, [id]: value });
        break;
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

  const checkAllValid = () => {
    return (
      !isError(date, "date") &&
      !isInFuture(date, "date") &&
      !isError(bloodPressure, "blood pressure") &&
      !isError(bloodConcentration, "blood concentration") &&
      !isError(heartRate, "heart rate") &&
      !isError(bloodGlucose, "blood glucose")
    );
  };

  const isDate = (date) => {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  };

  const isInFuture = (value, key) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;

    if (isDate(value) && key === "date") {
      return x < y;
    } else {
      return false;
    }
  };

  const isError = (value, attribute) => {
    switch (attribute) {
      case "name":
        return false;
      case "creator name":
        return false;
      case "creator id":
        return false;

      case "date":
        if (value === "") {
          return true;
        }
        return false;

      case "blood pressure":
        if (value === "" || value < 0) {
          return true;
        }
        return false;

      case "blood concentration":
        if (value === "" || value < 0) {
          return true;
        }
        return false;

      case "blood glucose":
        if (value === "" || value < 0) {
          return true;
        }
        return false;

      case "heart rate":
        if (value === "" || value < 0) {
          return true;
        }
        return false;

      default:
        return null;
    }
  };
  const findValue = (key) => {
    switch (key) {
      case "name":
        return name;
      case "creator name":
        return fetchedList["name"];
      case "creator id":
        return fetchedList["id"];
      case "date":
        return date;
      case "blood pressure":
        return bloodPressure;
      case "blood concentration":
        return bloodConcentration;
      case "blood glucose":
        return bloodGlucose;
      case "heart rate":
        return heartRate;
      case "note":
        return note;
      default:
        return null;
    }
  };
  const handleSet = (value, key) => {
    switch (key) {
      case "name":
        break;
      case "creator name":
        break;
      case "creator id":
        break;
      case "date":
        setDate(value);
        break;
      case "blood pressure":
        setBloodPressure(value);
        break;
      case "blood concentration":
        setBloodConcentration(value);
        break;
      case "blood glucose":
        setBloodGlucose(value);
        break;
      case "heart rate":
        setHeartRate(value);
        break;
      case "note":
        setNote(value);
        break;
      default:
        break;
    }
  };
  return fetchedList["role"] !== undefined ? (
    <Flex direction="row" minH="78vh" w="100%" p="0 12% 0% 12%" h="max-content">
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
          Add General Examination
        </Text>

        <Flex
          direction="column"
          m="0 5% 0 5%"
          shadow="md"
          borderWidth="1px"
          p={3}
        >
          {generalExaminationInputs.map((input) => {
            return input["formType"] === "input" ? (
              <FormControl
                id={input["id"]}
                key={input["id"]}
                isInvalid={
                  isError(findValue(input["id"]), input["id"]) ||
                  isInFuture(findValue(input["id"]), input["id"])
                }
                mt="10px"
              >
                <FormLabel>{input["label"]}</FormLabel>
                <InputGroup size="md">
                  <Input
                    readOnly={
                      input["id"] === "name" ||
                      input["id"] === "creator name" ||
                      input["id"] === "creator id"
                    }
                    type={input["type"]}
                    value={findValue(input["id"])}
                    onChange={(e) => {
                      handleSet(e.target.value, input["id"]);
                      handleInput(event);
                    }}
                    _placeholder={{
                      fontSize: "15px",
                    }}
                    placeholder={input["placeholder"]}
                  />
                  {input["id"] === "blood pressure" ||
                  input["id"] === "blood concentration" ||
                  input["id"] === "blood glucose" ||
                  input["id"] === "heart rate" ? (
                    <InputRightAddon children={input["rightAddon"]} />
                  ) : null}
                </InputGroup>

                {isError(findValue(input["id"]), input["id"]) ? (
                  <FormErrorMessage>{input["noInputMessage"]}</FormErrorMessage>
                ) : isInFuture(findValue(input["id"]), input["id"]) ? (
                  <FormErrorMessage>
                    {input["inWrongTimeMessage"]}
                  </FormErrorMessage>
                ) : null}
              </FormControl>
            ) : (
              <FormControl
                id={input["id"]}
                key={input["id"]}
                isInvalid={isError(findValue(input["id"]), input["id"])}
                mt="10px"
              >
                <FormLabel>{input["label"]}</FormLabel>
                <Select
                  placeholder={input["placeholder"]}
                  onChange={(e) => {
                    handleSet(e.target.value, input["id"]);
                    handleInput(event);
                  }}
                >
                  {properties[`${input["id"]}s`].map((attribute) => {
                    return <option key={attribute}>{attribute}</option>;
                  })}
                </Select>
                {isError(findValue(input["id"]), input["id"]) ? (
                  <FormErrorMessage>{input["noInputMessage"]}</FormErrorMessage>
                ) : null}
              </FormControl>
            );
          })}

          <Button
            w="100%"
            type="submit"
            borderWidth="1px"
            shadow="md"
            color="black"
            onClick={() => {
              handleAdd(event);
            }}
            colorScheme={checkAllValid() ? "teal" : "whiteAlpha"}
            _focus={{ shadow: "" }}
            fontWeight="md"
            mt="20px"
            style={!checkAllValid() ? { pointerEvents: "none" } : null}
          >
            Save
          </Button>
        </Flex>
      </Box>
      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default AddGeneralExamination;
