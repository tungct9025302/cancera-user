import React, { Component, useState, useContext } from "react";
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
  Spinner,
} from "@chakra-ui/react";
import { BiPlusMedical } from "react-icons/bi";
import {
  viewProfileInputsForUsers,
  viewProfileInputsForPatients,
} from "../../FormSource";

import { AuthContext } from "../../../context/AuthContext";
import { signOut, updatePassword } from "firebase/auth";
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
import { useNavigate } from "react-router-dom";
import SpinnerComponent from "../../Spinner";

const RenderViewProfile = ({
  cancelRef,
  onOpen,
  onClose,
  isOpen,
  dispatch,
  fetchedList,
}) => {
  const navigate = useNavigate();
  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const findValue = (key) => {
    switch (key) {
      case "username":
        return fetchedList["username"];
      case "name":
        return fetchedList["name"];
      case "date of birth":
        return fetchedList["date of birth"];
      case "gender":
        return Capitalize(fetchedList["gender"]);
      case "phone number":
        return fetchedList["phone number"];
      case "career":
        if (fetchedList["role"] === "patient") {
          return Capitalize(fetchedList["career"]);
        } else {
          return Capitalize(fetchedList["role"]);
        }
      case "cancer":
        return fetchedList["cancer"];
      case "last login":
        if (fetchedList["last login"] !== null) {
          return fetchedList["last login"].toDate();
        } else {
          return "";
        }
      case "department":
        return fetchedList["department"];

      default:
        return null;
    }
  };

  const handleLogin = async (e) => {
    // setTimeout(() => setLoadingData(true), 1);

    if (oldPassword === password) {
      await updatePassword(currentUser, newPassword)
        .then(() => {
          alert("Password changed successfuly!");
          setPassword(newPassword);
          onClose();
        })
        .catch((error) => {
          alert("ERROR 404. The server went down!");
        });
    } else {
      setError(true);
    }
  };

  const handleLogout = (e) => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        const user = null;
        if (!remember) {
          setUsername("");
          setPassword("");
        }
        setRole("guest");
        setLogged(false);
        dispatch({ type: "LOGIN", payload: user });
        navigate("/");
        onClose();
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const renderSmallSpinner = () => {
    return (
      <Box
        margin="auto"
        w="100%"
        align="center"
        top="50% "
        position="relative"
        transform="translateY(-50%)"
      >
        <Spinner
          thickness="3px"
          speed="0.65s"
          // emptyColor="gray.300"
          color="white.500"
          size="md"
          mb="4px"
        />
      </Box>
    );
  };

  return (
    <AlertDialog
      size="2xl"
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={() => {
        onClose();
      }}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>
          <Stack align="center" borderBottom="2px">
            <Heading fontSize={"3xl"} align="center" pt="5px">
              My profile
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
            w="rem"
          >
            <Stack spacing={1}>
              {fetchedList["role"] === "patient"
                ? viewProfileInputsForPatients.map((input) => {
                    return (
                      <FormControl id={input["id"]} key={input["id"]}>
                        <FormLabel>{Capitalize(input["label"])}</FormLabel>
                        <Input
                          readOnly={true}
                          type={input["type"]}
                          value={findValue(input["id"])}
                          bgColor="gray.200"
                          borderWidth="1px"
                          borderColor="gray.300"
                        />
                      </FormControl>
                    );
                  })
                : viewProfileInputsForUsers.map((input) => {
                    return (
                      <FormControl id={input["id"]} key={input["id"]}>
                        <FormLabel>{Capitalize(input["label"])}</FormLabel>
                        <Input
                          readOnly={true}
                          type={input["type"]}
                          value={findValue(input["id"])}
                          bgColor="gray.200"
                          borderWidth="1px"
                          borderColor="gray.300"
                        />
                      </FormControl>
                    );
                  })}

              <Stack spacing={4}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Text></Text>

                  {/* <Box
                      textDecoration="underline"
                      cursor="pointer"
                      // onClick={() => {
                      //   setCreate(true);
                      // }}
                      textColor="gray"
                    >
                      Create an account
                    </Box> */}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </AlertDialogBody>
        <AlertDialogFooter justifyContent="flex-start"></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default RenderViewProfile;
