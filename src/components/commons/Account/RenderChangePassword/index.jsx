import React, { Component, useState, useContext, useEffect } from "react";
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
import { changePasswordInputs } from "../../FormSource";

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
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../../database/firebaseConfigs";
import { async } from "@firebase/util";
import { isEmptyArray } from "formik";
import { useNavigate } from "react-router-dom";
import SpinnerComponent from "../../Spinner";

const RenderChangePassword = ({
  cancelRef,
  onOpen,
  onClose,
  isOpen,
  dispatch,
  setLogged,
  setPassword,
  setUsername,
  setData,
  data,
  error,
  setError,
  loadingData,
  setRole,
  remember,
}) => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [fetchedList, setFetchedList] = useState([]);
  useEffect(() => {
    fetchUserData(currentUser);

    return () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    };
  }, []);

  //database
  const fetchUserData = async (user) => {
    let userData = [];
    if (user !== undefined) {
      try {
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        const patientDocSnap = await getDoc(doc(db, "patients", user.uid));

        if (userDocSnap.exists()) {
          userData = { ...userDocSnap.data() };
        }

        if (patientDocSnap.exists()) {
          userData = { ...patientDocSnap.data() };
        }

        setFetchedList(userData);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const isInvalidInput = (attribute) => {
    switch (attribute) {
      case "old password":
        if (oldPassword === "") {
          return false;
        }
        return !oldPassword.match(/[a-zA-Z0-9]{6,}/);
      case "new password":
        if (newPassword === "") {
          return false;
        }
        return !newPassword.match(/[a-zA-Z0-9]{6,}/);
      case "confirm new password":
        if (confirmNewPassword === "") {
          return false;
        }
        return newPassword !== confirmNewPassword;

      default:
        return false;
    }
  };
  const checkSameOldPassword = (attribute) => {
    switch (attribute) {
      case "new password":
        if (newPassword === "") {
          return false;
        }
        return newPassword === oldPassword;

      default:
        return false;
    }
  };
  const checkValidLogin = () => {
    return (
      !isInvalidInput("old password") &&
      !isInvalidInput("new password") &&
      !isInvalidInput("confirm new password") &&
      oldPassword !== newPassword &&
      oldPassword !== "" &&
      newPassword !== "" &&
      confirmNewPassword !== ""
    );
  };

  const findValue = (key) => {
    switch (key) {
      case "old password":
        return oldPassword;
      case "new password":
        return newPassword;
      case "confirm new password":
        return confirmNewPassword;
      default:
        return null;
    }
  };
  const handleSet = (value, key) => {
    switch (key) {
      case "old password":
        setOldPassword(value);
        break;
      case "new password":
        setNewPassword(value);
        break;
      case "confirm new password":
        setConfirmNewPassword(value);
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

  const handleLogin = async (e) => {
    // setTimeout(() => setLoadingData(true), 1);
    let password = fetchedList["password"];

    if (oldPassword === password) {
      await updatePassword(auth.currentUser, newPassword)
        .then(() => {
          switch (fetchedList["role"]) {
            case "patient":
              updateDoc(doc(db, "patients", currentUser.uid), {
                password: newPassword,
              }).then(() => {
                window.location.reload();
              });
              break;

            case "nurse":
              updateDoc(doc(db, "users", currentUser.uid), {
                password: newPassword,
              }).then(() => {
                window.location.reload();
              });
              break;

            case "doctor":
              updateDoc(doc(db, "users", currentUser.uid), {
                password: newPassword,
              }).then(() => {
                window.location.reload();
              });
              break;

            default:
              break;
          }

          alert("Password changed successfuly!");
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
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={() => {
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
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
              Change password
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
              {changePasswordInputs.map((input) => {
                return (
                  <FormControl
                    id={input["id"]}
                    key={input["id"]}
                    isInvalid={
                      isInvalidInput(input["id"].toString()) ||
                      checkSameOldPassword(input["id"].toString()) ||
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
                        if (error) {
                          setError(false);
                        }
                        handleSet(e.target.value, input["id"]);
                        // handleInput(event);
                        // fetchUserData();
                      }}
                      _placeholder={{
                        fontSize: "15px",
                      }}
                      placeholder={input["placeholder"]}
                    />
                    {isInvalidInput(input["id"]) ? (
                      <FormErrorMessage>
                        {input["wrongTypeInputMessage"]}
                      </FormErrorMessage>
                    ) : checkSameOldPassword(input["id"]) ? (
                      <FormErrorMessage>
                        {input["sameInputMessage"]}
                      </FormErrorMessage>
                    ) : error ? (
                      <FormErrorMessage>
                        {input["failedLoginMessage"]}
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
                <Button
                  id="confirmBtn"
                  bg={checkValidLogin() ? "blue.400" : "gray.200"}
                  color={checkValidLogin() ? "white" : "black"}
                  _hover={{
                    bg: checkValidLogin() ? "blue.500" : "gray.300",
                  }}
                  type="confirm"
                  style={!checkValidLogin() ? { pointerEvents: "none" } : null}
                  onClick={() => {
                    handleLogin(event);
                  }}
                >
                  {loadingData ? renderSmallSpinner() : "Confirm"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Box>
            <Text fontSize="0.875em" fontStyle="italic">
              If you forgot your password, please contact to the clinic's
              hotline <b>0912345678 </b> for support.
            </Text>
          </Box>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default RenderChangePassword;
