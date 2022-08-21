import React, { useState, useEffect, useContext } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Flex,
  Select,
  Button,
} from "@chakra-ui/react";
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
import { appointmentInputs } from "../../../../commons/FormSource";
import { isEmptyArray } from "formik";
import SpinnerComponent from "../../../../commons/Spinner";

const AddAppointment = () => {
  let properties = {
    rooms: ["", 217, 212, 222],
    floors: ["", 1, 2, 3, 4, 5],
    time: { start: "8:00:00", end: "18:00:00" },
  };

  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [room, setRoom] = useState("");
  const [floor, setFloor] = useState("");
  const [time, setTime] = useState("");
  const [cancer, setCancer] = useState("");
  const [note, setNote] = useState("");
  const location = useLocation();
  const { name, pid, id, boxTitle } = location.state;

  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [currentPatient, setCurrentPatient] = useState({});
  const [allPatients, setAllPatients] = useState([]);
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
          ["doctor name"]: userData["name"],
          ["doctor id"]: userData["id"],
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
        currentPatient["appointments"] === undefined ||
        isEmptyArray(currentPatient["appointments"])
      ) {
        await setDoc(doc(db, "patients", currentPatient["id"]), {
          ...currentPatient,
          appointments: [{ ...data }],
        });

        navigate(`/search-patient/id=${pid}/check-history/appointments`, {
          state: { boxTitle: boxTitle, name: name, pid: pid },
        });
      } else {
        await currentPatient["appointments"].map((appointment) => {
          if (
            appointment["date"] === data["date"] &&
            appointment["time"] === data["time"]
          ) {
            alert("This appointment is already existed in database.");
          } else {
            setDoc(doc(db, "patients", currentPatient["id"]), {
              ...currentPatient,
              appointments: [...currentPatient["appointments"], { ...data }],
            });
            navigate(`/search-patient/id=${pid}/check-history/appointment`, {
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
      case "floor":
        setData({ ...data, [id]: +value });
        break;
      case "room":
        setData({ ...data, [id]: +value });
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
      !isInThePast(date, "date") &&
      !isError(title, "title") &&
      !isError(room, "room") &&
      !isError(floor, "floor") &&
      !isError(time, "time") &&
      !isNotInWorkingTime(time, "time") &&
      !isError(cancer, "cancer")
    );
  };

  const isNotInWorkingTime = (value, key) => {
    if (key === "time") {
      return (
        Date.parse(`01/01/2011 ${value}`) <
          Date.parse(`01/01/2011 ${properties.time.start}`) ||
        Date.parse(`01/01/2011 ${properties.time.end}`) <
          Date.parse(`01/01/2011 ${value}`)
      );
    } else {
      return false;
    }
  };

  const isInThePast = (value, key) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;

    if (isDate(value) && key === "date") {
      return y < x;
    } else {
      return false;
    }
  };

  const isDate = (date) => {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  };

  const isError = (value, attribute) => {
    switch (attribute) {
      case "name":
        return false;
      case "doctor name":
        return false;
      case "doctor id":
        return false;
      case "title":
        if (value === "") {
          return true;
        }
        return false;

      case "date":
        if (value === "") {
          return true;
        }
        return false;

      case "room":
        if (value === "") {
          return true;
        }
        return false;

      case "floor":
        if (value === "") {
          return true;
        }
        return false;

      case "time":
        if (value === "") {
          return true;
        }
        return false;

      case "cancer":
        if (value === "") {
          return true;
        }
        return false;

      case "note":
        return false;

      default:
        return null;
    }
  };
  const findValue = (key) => {
    switch (key) {
      case "name":
        return name;
      case "doctor name":
        return fetchedList["name"];
      case "doctor id":
        return fetchedList["id"];
      case "title":
        return title;
      case "date":
        return date;
      case "floor":
        return floor;
      case "room":
        return room;
      case "time":
        return time;
      case "cancer":
        return cancer;
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
      case "doctor name":
        break;
      case "doctor id":
        break;
      case "title":
        setTitle(value);
        break;
      case "date":
        setDate(value);
        break;
      case "floor":
        setFloor(+value);
        break;
      case "room":
        setRoom(+value);
        break;
      case "time":
        setTime(value);
        break;
      case "cancer":
        setCancer(value);
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
          New appointment
        </Text>

        <Flex
          direction="column"
          m="0 5% 0 5%"
          shadow="md"
          borderWidth="1px"
          p={3}
        >
          {appointmentInputs.map((input) => {
            return input["formType"] === "input" ? (
              <FormControl
                id={input["id"]}
                key={input["id"]}
                isInvalid={
                  isError(findValue(input["id"]), input["id"]) ||
                  isInThePast(findValue(input["id"]), input["id"]) ||
                  isNotInWorkingTime(findValue(input["id"]), input["id"])
                }
                mt="10px"
              >
                <FormLabel>{input["label"]}</FormLabel>
                <Input
                  readOnly={
                    input["id"] === "name" ||
                    input["id"] === "doctor name" ||
                    input["id"] === "doctor id"
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

                {isError(findValue(input["id"]), input["id"]) ? (
                  <FormErrorMessage>{input["noInputMessage"]}</FormErrorMessage>
                ) : isNotInWorkingTime(findValue(input["id"]), input["id"]) ? (
                  <FormErrorMessage>
                    {input["inWrongTimeMessage"]}
                  </FormErrorMessage>
                ) : isInThePast(findValue(input["id"]), input["id"]) ? (
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
            id="updateBtn"
            w="100%"
            type="submit"
            borderWidth="1px"
            shadow="md"
            color="black"
            colorScheme={checkAllValid() ? "teal" : "whiteAlpha"}
            _focus={{ shadow: "" }}
            fontWeight="md"
            mt="20px"
            onClick={() => {
              handleAdd(event);
            }}
            style={!checkAllValid() ? { pointerEvents: "none" } : null}
          >
            Add
          </Button>
        </Flex>
      </Box>
      <Box minW="18%"></Box>
    </Flex>
  ) : (
    <SpinnerComponent></SpinnerComponent>
  );
};

export default AddAppointment;
