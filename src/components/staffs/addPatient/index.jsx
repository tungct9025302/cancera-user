import React, { useEffect, useState, useContext } from "react";

import { useNavigate } from "react-router-dom";
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
  useDisclosure,
} from "@chakra-ui/react";
import { Formik, Form, Field, isEmptyArray } from "formik";
import { StarIcon, EditIcon } from "@chakra-ui/icons";
import InfiniteScroll from "react-infinite-scroll-component";

import DialogBox from "../../commons/DialogBox";

import { addPatientInputs } from "../../commons/FormSource";
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
import { auth, db } from "../../../database/firebaseConfigs";
import { AuthContext } from "../../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import RenderCreateAccount from "../../commons/Account/RenderCreateAccount";

const AddPatient = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const cancelRef = React.useRef();
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [career, setCareer] = useState("");
  const [habits, setHabits] = useState("");
  const [chronicIllness, setChronicIllness] = useState("");
  const [cancer, setCancer] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");
  const [historyOfTreatment, setHistoryOfTreatment] = useState("");
  const [lastGeneralExaminationDate, setLastGeneralExaminationDate] =
    useState("");

  const [allPatients, setAllPatients] = useState([]);
  const [fetchedList, setFetchedList] = useState([]);
  const [data, setData] = useState({});
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  let properties = {
    allTreatments: [
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
    allGenders: ["", "Male", "Female"],
  };

  //database
  const handleAdd = async (e) => {
    try {
      if (
        fetchedList["allPatients"] === undefined ||
        isEmptyArray(fetchedList["allPatients"])
      ) {
        // setData({ ...data, pid: 1 });
        await setDoc(doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy"), {
          ...fetchedList,
          allPatients: [{ ...data, pid: 1 }],
        });
        // navigate("/search-patient");
      } else {
        await fetchedList.allPatients.map((patient) => {
          if (deepEqual(patient, data)) {
            alert("This patient is already existed in database.");
          } else {
            // setData({ ...data, pid: fetchedList.allPatients.length + 1 });
            setDoc(doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy"), {
              ...fetchedList,
              allPatients: [
                ...fetchedList.allPatients,
                { ...data, pid: fetchedList.allPatients.length + 1 },
              ],
            });
            // navigate("/search-patient");
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchData = async () => {
    let list = [];
    try {
      // const querySnapshot = await getDocs(collection(db, "users"));
      // querySnapshot.forEach((doc) => {
      //   list.push({ id: doc.id, ...doc.data() });
      // });
      // setFetchedList(list);
      const allPatientsDocSnap = await getDoc(
        doc(db, "patients", "j1g1lxEY9vBDbk2PrQiy")
      );
      if (allPatientsDocSnap.exists()) {
        list = { ...allPatientsDocSnap.data() };
      }
      setFetchedList(list);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({ ...data, [id]: value });
  };

  //   const location = useLocation();

  //   const { name, id, boxTitle } = location.state;

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
      !isError(patientName, "patient name") &&
      !isInvalidInput(dateOfBirth, "date of birth") &&
      !isInvalidInput(nextAppointment, "next appointment") &&
      !isInvalidInput(
        lastGeneralExaminationDate,
        "last general examination date"
      ) &&
      !isError(phoneNumber, "phone number") &&
      !isError(dateOfBirth, "date of birth") &&
      !isError(gender, "gender") &&
      !isError(career, "career") &&
      !isError(habits, "habits")
    );
  };

  const isError = (value, attribute) => {
    let isnum = /^\d+$/.test(value);
    switch (attribute) {
      case "patient name":
        if (value === "") {
          return true;
        }
        return false;

      case "date of birth":
        if (value === "") {
          return true;
        }
        return false;

      case "phone number":
        if (value.length !== 10 || !isnum) {
          return true;
        }
        return false;

      case "gender":
        if (value === "") {
          return true;
        }
        return false;

      case "career":
        if (value === "") {
          return true;
        }
        return false;

      case "cancer":
        if (value === "") {
          return true;
        }
        return false;
    }
  };

  const isInvalidInput = (value, attribute) => {
    let x = new Date().toISOString().slice(0, 10);
    let y = value;
    switch (attribute) {
      case "patient name":
        return patientName.match(/\d+/g);
      case "last general examination date":
        return y > x;
      case "date of birth":
        return y > x;
      case "next appointment":
        if (value === "") {
          return false;
        } else {
          return y < x;
        }

      default:
        return false;
    }
  };

  const findValue = (key) => {
    switch (key) {
      case "patient name":
        return patientName;
      case "date of birth":
        return dateOfBirth;
      case "gender":
        return gender;
      case "career":
        return career;
      case "cancer":
        return cancer;
      case "phone number":
        return phoneNumber;
      case "habits":
        return habits;
      case "chronic illness":
        return chronicIllness;
      case "history of treatment":
        return historyOfTreatment;
      case "last general examination date":
        return lastGeneralExaminationDate;
      case "next appointment":
        return nextAppointment;
      default:
        return null;
    }
  };
  const handleSet = (value, key) => {
    switch (key) {
      case "patient name":
        setPatientName(value);
        break;
      case "date of birth":
        setDateOfBirth(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "career":
        setCareer(value);
        break;
      case "cancer":
        setCancer(value);
        break;
      case "habits":
        setHabits(value);
        break;
      case "phone number":
        setPhoneNumber(value);
        break;
      case "chronic illness":
        setChronicIllness(value);
        break;
      case "history of treatment":
        setHistoryOfTreatment(value);
        break;
      case "last general examination date":
        setLastGeneralExaminationDate(value);
        break;
      case "next appointment":
        setNextAppointment(value);
        break;
      default:
        return null;
    }
  };

  const renderAlertDialog = (type) => {
    switch (type) {
      case "create":
        return (
          <RenderCreateAccount
            onOpen={onOpen}
            isOpen={isOpen}
            onClose={onClose}
            setData={setData}
            data={data}
          ></RenderCreateAccount>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="row" minH="78vh" w="100%" p="0 12% 5% 12%" h="max-content">
      <DialogBox pid={undefined} />

      <Box minW="600px" w="100%" p="0 2% 0 2%">
        <Text
          fontSize="5xl"
          padding="2% 5% 1% 5%"
          fontFamily="serif"
          fontWeight="550"
        >
          Add Patient
        </Text>

        <Flex
          direction="column"
          m="0 5% 0 5%"
          shadow="md"
          borderWidth="1px"
          p={3}
        >
          {addPatientInputs.map((input) => {
            return input["formType"] === "input" ? (
              <FormControl
                id={input["id"]}
                key={input["id"]}
                isInvalid={
                  isError(findValue(input["id"]), input["id"]) ||
                  // isInTheFuture(findValue(input["id"]), input["id"]) ||
                  // isInThePast(findValue(input["id"]), input["id"]) ||
                  isInvalidInput(findValue(input["id"]), input["id"])
                }
                mt="10px"
              >
                <FormLabel>{input["label"]}</FormLabel>
                <Input
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
                ) : isInvalidInput(findValue(input["id"]), input["id"]) ? (
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
                  {properties["allGenders"].map((attribute) => {
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
            style={!checkAllValid() ? { pointerEvents: "none" } : null}
            colorScheme={checkAllValid() ? "teal" : "whiteAlpha"}
            _focus={{ shadow: "" }}
            fontWeight="md"
            onClick={() => {
              onOpen();
            }}
            mt="20px"
          >
            Create an account for this patient
          </Button>
          {renderAlertDialog("create")}
        </Flex>
      </Box>
      <Box minW="18%"></Box>
    </Flex>
  );
};
export default AddPatient;
