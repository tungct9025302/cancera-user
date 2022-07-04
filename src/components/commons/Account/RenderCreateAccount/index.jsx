import React, { Component, useState } from "react";
import {
  Text,
  HStack,
  Box,
  Flex,
  Button,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  useColorModeValue,
  Stack,
  FormControl,
  FormLabel,
  Checkbox,
  Heading,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { BiPlusMedical } from "react-icons/bi";
import { loginInputs } from "../../FormSource";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { auth, db } from "../../../../database/firebaseConfigs";
import { async } from "@firebase/util";
import { isEmptyArray } from "formik";
import { createInputs } from "../../FormSource";
import { useNavigate } from "react-router-dom";

const RenderCreateAccount = ({
  cancelRef,
  onOpen,
  onClose,
  isOpen,
  setData,
  data,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleAdd = async (e, role) => {
    let temporaryDataList = [];
    let listOfId = [];
    let newId = undefined;
    let initId = 1;

    e.preventDefault();
    switch (role) {
      //Add admin
      case "admin":
        try {
          const res = await createUserWithEmailAndPassword(
            auth,
            data.username,
            data.password
          );
          await setDoc(doc(db, "admins", res.user.uid), {
            ...data,
            ["create time"]: serverTimestamp(),
            ["last login"]: "",
            role: role,
          });
          onClose();
          setError(false);
        } catch (err) {
          setError(true);
          console.log(err);
        }
        break;
      //Add patient
      case "patient":
        const patientQuerySnapshot = await getDocs(collection(db, "patients"));
        patientQuerySnapshot.forEach((doc) => {
          temporaryDataList.push({ id: doc.id, ...doc.data() });

          listOfId.push(doc.data()["pid"]);
        });

        while (newId === undefined && initId <= temporaryDataList.length) {
          if (!listOfId.includes(initId) && newId === undefined) {
            newId = initId;
          }
          initId++;
        }
        if (newId === undefined) {
          newId = initId;
        }

        try {
          const res = await createUserWithEmailAndPassword(
            auth,
            data.username,
            data.password
          );
          await setDoc(doc(db, "patients", res.user.uid), {
            ...data,
            ["create time"]: serverTimestamp(),
            ["last login"]: "",
            role: role,
            pid: newId,
          });
          setError(false);
          setUsername("");
          setPassword("");
          setPatientName("");
          onClose();
          navigate(`/search-patient`);
        } catch (err) {
          setError(true);
          console.log(err);
        }
        break;
      //Add users
      default:
        const userQuerySnapshot = await getDocs(collection(db, "users"));
        userQuerySnapshot.forEach((doc) => {
          temporaryDataList.push({ id: doc.id, ...doc.data() });

          listOfId.push(doc.data()["id"]);
        });

        while (newId === undefined && initId <= temporaryDataList.length) {
          if (!listOfId.includes(initId) && newId === undefined) {
            newId = initId;
          }
          initId++;
        }
        if (newId === undefined) {
          newId = initId;
        }

        try {
          const res = await createUserWithEmailAndPassword(
            auth,
            data.username,
            data.password
          );
          await setDoc(doc(db, "users", res.user.uid), {
            ...data,
            ["create time"]: serverTimestamp(),
            ["last login"]: "",
            role: role,
            id: newId,
          });
          onClose();
          setError(false);
        } catch (err) {
          setError(true);
          console.log(err);
        }
        break;
    }
  };

  const isError = (attribute) => {
    switch (attribute) {
      case "username":
        if (username === "") {
          return true;
        }
        return false;
      case "password":
        if (password === "") {
          return true;
        }
        return false;

      default:
        return false;
    }
  };

  const isInvalidInput = (attribute) => {
    switch (attribute) {
      case "username":
        return !username.match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );

      case "password":
        return !password.match(/[a-zA-Z0-9]{6,}/);

      case "patient name":
        return patientName.match(/\d+/g);

      default:
        return false;
    }
  };
  const checkValidLogin = () => {
    return (
      !isError("username") &&
      !isError("password") &&
      !isError("patient name") &&
      !isInvalidInput("patient name") &&
      !isInvalidInput("username") &&
      !isInvalidInput("password")
    );
  };
  const findValue = (key) => {
    switch (key) {
      case "username":
        return username;
      case "password":
        return password;
      case "patient name":
        return patientName;
      default:
        return null;
    }
  };
  const handleSet = (value, key) => {
    switch (key) {
      case "username":
        setUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "patient name":
        setPatientName(value);
        break;
      default:
        null;
    }
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    if (error === true) {
      setError(false);
    }

    setData({ ...data, [id]: value });
  };

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>
          <Stack align="center" borderBottom="2px">
            <Heading fontSize={"3xl"} align="center" pt="5px">
              Create account
            </Heading>
            <Flex align="center" p="10px">
              <Box align="center">
                <Text fontSize="2xl" fontWeight={550}>
                  Cancera
                </Text>
              </Box>

              <Icon ml={1} w={5} h={5} as={BiPlusMedical} color="red" />
            </Flex>
          </Stack>
        </AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            pb="-20px"
            p="0 10px 0 10px"
          >
            <Stack spacing={4}>
              {createInputs.map((input) => {
                return (
                  <FormControl
                    id={input["id"]}
                    key={input["id"]}
                    isInvalid={
                      isError(input["id"].toString()) ||
                      isInvalidInput(input["id"].toString()) ||
                      error
                    }
                  >
                    <FormLabel>{input["label"]}</FormLabel>
                    <Input
                      type={input["type"]}
                      value={findValue(input["id"])}
                      bgColor="gray.200"
                      borderWidth="1px"
                      borderColor="gray.300"
                      onChange={(e) => {
                        handleSet(e.target.value, input["id"]);
                        handleInput(event);
                      }}
                      _placeholder={{
                        fontSize: "15px",
                      }}
                      placeholder={input["placeholderForCreate"]}
                    />
                    {isError(input["id"]) ? (
                      <FormErrorMessage>
                        {input["noInputMessage"]}
                      </FormErrorMessage>
                    ) : isInvalidInput(input["id"]) ? (
                      <FormErrorMessage>
                        {input["wrongTypeInputMessage"]}
                      </FormErrorMessage>
                    ) : error ? (
                      <FormErrorMessage>
                        This email is existed. Try login back or create new
                        account.
                      </FormErrorMessage>
                    ) : null}
                  </FormControl>
                );
              })}

              <Stack spacing={4}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Box></Box>
                  <Box
                    textDecoration="underline"
                    cursor="pointer"
                    textColor="gray"
                  >
                    Forgot your password?
                  </Box>
                </Stack>

                <Button
                  id="createBtn"
                  bg={checkValidLogin() ? "blue.400" : "gray.200"}
                  color={checkValidLogin() ? "white" : "black"}
                  _hover={{
                    bg: checkValidLogin() ? "blue.500" : "gray.300",
                  }}
                  style={!checkValidLogin() ? { pointerEvents: "none" } : null}
                  type="login"
                  onClick={() => {
                    handleAdd(event, "patient");
                  }}
                >
                  Confirm
                </Button>
              </Stack>
            </Stack>
          </Box>
        </AlertDialogBody>
        <AlertDialogFooter align="left">
          <Text fontSize="0.875em" fontStyle="italic">
            After creation, please transfer the account information to your
            patient.
          </Text>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RenderCreateAccount;
