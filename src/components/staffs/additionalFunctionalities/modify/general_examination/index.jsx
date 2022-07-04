import React, { useState, useEffect, useContext } from "react";

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

import { isEmptyArray } from "formik";
import DialogBox from "../../../../commons/DialogBox";

import { auth, db } from "../../../../../database/firebaseConfigs";
import { AuthContext } from "../../../../context/AuthContext";
import { generalExaminationInputs } from "../../../../commons/FormSource";

const ModifyGeneralExamination = () => {
  let properties = {};
  const navigate = useNavigate();
  const location = useLocation();
  const { name, id, pid, boxTitle } = location.state;

  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const [data, setData] = useState({});
  const { currentUser } = useContext(AuthContext);

  const [date, setDate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [bloodConcentration, setBloodConcentration] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [note, setNote] = useState("");

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
      //get all patients
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
            patientData["allPatients"][i]["general examinations"].map(
              (generalExamination, index) => {
                // let note =
                //   generalExamination["note"] !== undefined
                //     ? generalExamination["note"]
                //     : "";

                if (id === index) {
                  setDisplayInfo(generalExamination);
                  setInitializeData(generalExamination);
                  setData({
                    date: generalExamination["date"],
                    ["blood pressure"]: generalExamination["blood pressure"],
                    ["blood glucose"]: generalExamination["blood glucose"],
                    ["blood concentration"]:
                      generalExamination["blood concentration"],
                    ["heart rate"]: generalExamination["heart rate"],
                    note: generalExamination["note"],
                  });
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

  const setInitializeData = (generalExamination) => {
    let list = {};
    if (generalExamination["date"] !== undefined) {
      list = { ...list, date: generalExamination["date"] };
    }
    if (generalExamination["blood pressure"] !== undefined) {
      list = {
        ...list,
        ["blood pressure"]: generalExamination["blood pressure"],
      };
    }
    if (generalExamination["blood glucose"] !== undefined) {
      list = {
        ...list,
        ["blood glucose"]: generalExamination["blood glucose"],
      };
    }
    if (generalExamination["blood concentration"] !== undefined) {
      list = {
        ...list,
        ["blood concentration"]: generalExamination["blood concentration"],
      };
    }
    if (generalExamination["heart rate"] !== undefined) {
      list = {
        ...list,
        ["heart rate"]: generalExamination["heart rate"],
      };
    }
    if (generalExamination["note"] !== undefined) {
      list = {
        ...list,
        ["note"]: generalExamination["note"],
      };
    }
    setData(list);
  };

  const setDisplayInfo = (data) => {
    setDate(data["date"]);
    setBloodGlucose(data["blood glucose"].match(/\d/g).join(""));
    setBloodConcentration(data["blood concentration"].match(/\d/g).join(""));
    setBloodPressure(data["blood pressure"].match(/[\d/]/g).join(""));
    setHeartRate(data["heart rate"].match(/\d/g).join(""));

    if (data["note"] !== undefined) {
      setNote(data["note"]);
    } else {
      data["note"] = "";
      setNote(data["note"]);
    }
  };

  const handleModify = async (e) => {
    e.preventDefault();

    let newAllPatients = [];

    allPatients.map((patient) => {
      if (patient["pid"] === pid) {
        if (
          patient["general examinations"] !== undefined ||
          !isEmptyArray(patient["general examinations"])
        ) {
          let newGeneralExaminations = [];
          patient["general examinations"].map((generalExamination, index) => {
            if (index === id) {
              generalExamination = { ...data };
            }
            newGeneralExaminations.push(generalExamination);
          });

          patient = {
            ...patient,
            ["general examinations"]: newGeneralExaminations,
          };
        }
      }
      newAllPatients.push(patient);
    });

    try {
      if (
        currentPatient["general examinations"] !== undefined &&
        !isEmptyArray(currentPatient["general examinations"])
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
        alert("This general examination record is no longer existed.");
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
      case "patient name":
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
      case "patient name":
        return name;
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
      case "patient name":
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
          {name}
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
                    readOnly={input["id"] === "patient name"}
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
              handleModify(event);
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
  );
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     modifyPatientGeneralExaminationById: (
//       pid,
//       generalExaminationID,
//       modifiedData
//     ) =>
//       dispatch(
//         modifyPatientGeneralExaminationById(
//           pid,
//           generalExaminationID,
//           modifiedData
//         )
//       ),
//   };
// };
export default ModifyGeneralExamination;
