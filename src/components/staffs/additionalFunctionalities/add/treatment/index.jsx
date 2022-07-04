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
import { treatmentInputs } from "../../../../commons/FormSource";
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../../../commons/Spinner";

const AddTreatment = () => {
  let properties = {
    length: ["day(s)", "week(s)", "month(s)", "year(s)"],
    treatments: [
      "",
      "Surgery",
      "Chemotherapy",
      "Radiation therapy",
      "Bone marrow transplant",
      "Immunotherapy",
      "Hormone therapy",
      "Targeted drug therapy",
      "Cryoabilation",
      "Radiofrequency ablation",
    ],
  };

  const [date, setDate] = useState("");
  const [length, setLength] = useState("");
  const [cancer, setCancer] = useState("");
  const [treatment, setTreatment] = useState("");
  const [duration, setDuration] = useState("" + length);
  const [note, setNote] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { name, id, pid, boxTitle } = location.state;
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState({});
  const [fetchedList, setFetchedList] = useState([]);

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
        currentPatient["treatments"] === undefined ||
        isEmptyArray(currentPatient["treatments"])
      ) {
        await setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          treatments: [{ ...data }],
        });

        navigate(`/search-patient/id=${pid}/check-history/treatment`, {
          state: { boxTitle: boxTitle, name: name, pid: pid },
        });
      } else {
        await currentPatient["treatments"].map((treatment) => {
          if (deepEqual(treatment, data)) {
            alert("This treatment is already existed in database.");
          } else {
            setDoc(doc(db, "patients", currentPatient["id"]), {
              ...currentPatient,
              treatments: [...currentPatient["treatments"], { ...data }],
            });
            navigate(`/search-patient/id=${pid}/check-history/treatment`, {
              state: { boxTitle: boxTitle, name: name, pid: pid },
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    switch (id) {
      case "length":
        setData({ ...data, duration: `${duration} ${value}` });
        break;
      case "duration":
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
      !isInFuture(date) &&
      !isError(cancer, "cancer") &&
      !isError(treatment, "treatment") &&
      !isError(duration, "duration")
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
      case "patient name":
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

      case "treatment":
        if (value === "") {
          return true;
        }
        return false;

      case "length":
        if (value === "") {
          return true;
        }
        return false;

      case "duration":
        if (value === "" || value < 0) {
          return true;
        }
        return false;
    }
  };
  const findValue = (key) => {
    switch (key) {
      case "patient name":
        return name;
      case "creator name":
        return fetchedList["name"];
      case "creator id":
        return fetchedList["id"];
      case "length":
        return length;
      case "date":
        return date;
      case "treatment":
        return treatment;
      case "duration":
        return duration;
      case "note":
        return note;
      default:
        return null;
    }
  };
  const handleSet = (value, key) => {
    switch (key) {
      case "patient name":
        break;
      case "creator name":
        break;
      case "creator id":
        break;
      case "length":
        setLength(value);
        break;
      case "date":
        setDate(value);
        break;
      case "treatment":
        setTreatment(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "note":
        setNote(value);
        break;
      default:
        break;
    }
  };
  return fetchedList["role"] !== undefined ? (
    <Flex direction="row" minH="78vh" w="100%" p="0 12% 5% 12%" h="max-content">
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
          Add Treatment
        </Text>

        <Flex
          direction="column"
          m="0 5% 0 5%"
          shadow="md"
          borderWidth="1px"
          p={3}
        >
          {treatmentInputs.map((input) => {
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
                <InputGroup>
                  <Input
                    readOnly={
                      input["id"] === "patient name" ||
                      input["id"] === "creator name" ||
                      input["id"] === "creator id"
                    }
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
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
                  {input["id"] === "duration" ? (
                    <InputRightAddon>
                      <Select
                        id="length"
                        onChange={(e) => {
                          handleSet(e.target.value, "length");
                          handleInput(event);
                        }}
                      >
                        {properties["length"].map((attribute) => {
                          return <option key={attribute}>{attribute}</option>;
                        })}
                      </Select>
                    </InputRightAddon>
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

export default AddTreatment;
