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

const ModifyTreatment = () => {
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [length, setLength] = useState("");
  const [treatment, setTreatment] = useState("");
  const [note, setNote] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { name, id, pid, boxTitle } = location.state;
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [currentPatient, setCurrentPatient] = useState({});
  const [fetchedList, setFetchedList] = useState([]);
  const [allPatients, setAllPatients] = useState([]);

  let properties = {
    length: ["", "day(s)", "week(s)", "month(s)", "year(s)"],
    treatments: [
      "",
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
    let patientData,
      userData = [];
    try {
      const allPatientsDocSnap = await getDoc(
        doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy")
      );
      if (allPatientsDocSnap.exists()) {
        patientData = { ...allPatientsDocSnap.data() };
        setAllPatients(patientData["allPatients"]);
      }

      //get user data
      const userDocSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        userData = { ...userDocSnap.data() };
        setFetchedList(userData);
      }

      //set current patient
      if (!isEmptyArray(patientData)) {
        for (let i = 0; i < patientData["allPatients"].length; i++) {
          if (
            (pid === patientData["allPatients"][i].pid && pid !== undefined) ||
            patientData["allPatients"][i].pid === pid
          ) {
            setCurrentPatient(patientData["allPatients"][i]);
          }
        }
      }

      if (!isEmptyArray(patientData["allPatients"])) {
        for (let i = 0; i < patientData["allPatients"].length; i++) {
          if (pid === patientData["allPatients"][i].pid && pid !== undefined) {
            setCurrentPatient(patientData["allPatients"][i]);
            patientData["allPatients"][i]["treatments"].map(
              (treatment, index) => {
                if (id === index) {
                  setDisplayInfo(treatment);
                  setInitializeData(treatment);
                }
              }
            );
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
      list = { ...list, treatment: treatment["treatment"] };
    }
    if (treatment["note"] !== undefined) {
      list = { ...list, note: treatment["note"] };
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
        case "treatment":
          setTreatment(data["treatment"]);
          break;
        case "note":
          if (data["note"] !== undefined) {
            setNote(data["note"]);
            break;
          } else {
            data["note"] = "";
            setNote(data["note"]);
            break;
          }

        default:
          break;
      }
    });
  };

  const handleModify = async (e) => {
    e.preventDefault();

    let newAllPatients = [];

    allPatients.map((patient) => {
      if (patient["pid"] === pid) {
        if (
          patient["treatments"] !== undefined ||
          !isEmptyArray(patient["treatments"])
        ) {
          let newTreatments = [];

          patient["treatments"].map((treatment, index) => {
            if (index === id) {
              treatment = { ...data };
            }
            newTreatments.push(treatment);
          });

          patient = {
            ...patient,
            treatments: newTreatments,
          };
        }
      }
      newAllPatients.push(patient);
    });

    try {
      if (
        currentPatient["treatments"] !== undefined &&
        !isEmptyArray(currentPatient["treatments"])
      ) {
        await setDoc(doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy"), {
          allPatients: newAllPatients,
        });
        navigate(
          `/search-patient/id=${pid}/check-history/general examination`,
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

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    switch (id) {
      case "date":
        setData({ ...data, [id]: value });
        break;
      case "treatment":
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
      !isError(treatment, "treatment") &&
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
        if (value === "" || value < 0 || length === "") {
          return true;
        }
        return false;
    }
  };

  const findValue = (key) => {
    switch (key) {
      case "patient name":
        return name;
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
  return (
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
                    readOnly={input["id"] === "patient name"}
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
  );
};
const mapDispatchToProps = (dispatch) => {
  return {
    modifyPatientTreatmentById: (pid, treatmentID, modifiedData) =>
      dispatch(modifyPatientTreatmentById(pid, treatmentID, modifiedData)),
  };
};
export default connect(null, mapDispatchToProps)(ModifyTreatment);
