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
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import InfiniteScroll from "react-infinite-scroll-component";

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

const ModifyTreatment = () => {
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [length, setLength] = useState("");
  const [treatmentType, setTreatmentType] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { name, id, pid, boxTitle } = location.state;
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [currentPatient, setCurrentPatient] = useState({});
  const [fetchedList, setFetchedList] = useState([]);
  const [allPatients, setAllPatients] = useState([]);

  let properties = {
    length: ["day(s)", "week(s)", "month(s)", "year(s)"],
    ["treatment types"]: [
      "Surgery",
      "Chemotherapy",
      "Radiation therapy",
      "Bone marrow transplant",
      "Immunotherapy",
      "Hormone therapy",
      "Targeted drug therapy",
      "Cryoablation",
      "Radiofrequency ablation",
    ],
  };
  useEffect(() => {
    fetchData();
    return () => {
      setCurrentPatient({});
      setFetchedList([]);
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

      if (!isEmptyArray(patientsData)) {
        for (let i = 0; i < patientsData.length; i++) {
          if (pid === patientsData[i]["pid"] && pid !== undefined) {
            setCurrentPatient(patientsData[i]);
            patientsData[i]["treatments"].map((treatment, index) => {
              if (id === index) {
                setDisplayInfo(treatment);
                setInitializeData(treatment);
                setData({
                  ["creator name"]: userData["name"],
                  ["creator id"]: userData["id"],
                  date: treatment["date"],
                  duration: treatment["duration"],
                  ["treatment type"]: treatment["treatment type"],
                });
              }
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const setInitializeData = (treatment) => {
    let list = {};
    if (treatment["date"] !== undefined) {
      list = { ...list, date: treatment["date"] };
    }
    if (treatment["duration"] !== undefined) {
      list = { ...list, duration: treatment["duration"] };
    }
    if (treatment["treatment"] !== undefined) {
      list = { ...list, ["treatment type"]: treatment["treatment type"] };
    }

    setData(list);
  };

  const setDisplayInfo = (data) => {
    Object.keys(data).map((attribute) => {
      switch (attribute) {
        case "date":
          setDate(data["date"]);
          break;
        case "duration":
          setLength(data["duration"].replace(/[^A-Za-z()]/g, ""));
          setDuration(data["duration"].match(/\d/g).join(""));
          break;
        case "treatment type":
          setTreatmentType(data["treatment type"]);
          break;
        default:
          break;
      }
    });
  };

  const handleModify = async (e) => {
    e.preventDefault();

    let newTreatments = [];
    if (
      currentPatient["treatments"] !== undefined ||
      !isEmptyArray(currentPatient["treatments"])
    ) {
      currentPatient["treatments"].map((treatment, index) => {
        if (index === id) {
          treatment = { ...data };
        }
        newTreatments.push(treatment);
      });
    }

    try {
      if (
        currentPatient["treatments"] !== undefined &&
        !isEmptyArray(currentPatient["treatments"])
      ) {
        await updateDoc(doc(db, "patients", currentPatient["id"]), {
          treatments: newTreatments,
        });

        navigate(
          `/search-patient/id=${pid}/check-history/general-examinations`,
          {
            state: { boxTitle: boxTitle, name: name, pid: pid },
          }
        );
      } else {
        alert("This treatment record is no longer existed.");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log(data);
  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    switch (id) {
      case "date":
        setData({ ...data, [id]: value });
        break;
      case "type":
        setData({ ...data, [id]: value });
        break;
      case "length":
        setData({ ...data, duration: `${duration} ${value}` });
        break;
      case "duration":
        setData({ ...data, duration: `${value} ${length}` });
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
      !isError(treatmentType, "treatment type") &&
      !isError(duration, "duration") &&
      !isError(length, "length")
    );
  };

  const isInFuture = (value, key) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;

    const isDate = (date) => {
      return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
    };

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

      case "treatment type":
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
        if (value === "" || value < 0 || length === "") {
          return true;
        }
        return false;
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
      case "length":
        return length;
      case "date":
        return date;
      case "treatment type":
        return treatmentType;
      case "duration":
        return duration;

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
      case "length":
        setLength(value);
        break;
      case "date":
        setDate(value);
        break;
      case "treatment type":
        setTreatmentType(value);
        break;
      case "duration":
        setDuration(value);
        break;

      default:
        break;
    }
  };
  return fetchedList["name"] !== undefined ? (
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
          Modify treatment ID: {id}
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
                      input["id"] === "name" ||
                      input["id"] === "creator id" ||
                      input["id"] === "creator name"
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
                        value={length}
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
                  value={findValue(input["id"])}
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
            colorScheme={checkAllValid() ? "teal" : "whiteAlpha"}
            _focus={{ shadow: "" }}
            onClick={() => {
              handleModify(event);
            }}
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
export default ModifyTreatment;
