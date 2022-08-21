import React, { useState, useEffect, useContext } from "react";

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
  Menu,
  IconButton,
  MenuList,
  MenuItem,
  MenuButton,
  MenuGroup,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { BiPlusMedical, BiExit } from "react-icons/bi";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchIcon, CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import RenderLogin from "./Account/RenderLogin";

import {
  firstGuestHeaderConfigs,
  secondGuestHeaderConfigs,
  firstDoctorHeaderConfigs,
  secondDoctorHeaderConfigs,
  firstNurseHeaderConfigs,
  secondNurseHeaderConfigs,
  firstPatientHeaderConfigs,
  secondPatientHeaderConfigs,
} from "../../configs";
import { colorConfigs } from "../../configs";
import { loginInputs } from "./FormSource";
import { createInputs } from "./FormSource";

//database
import { AuthContext } from "../context/AuthContext";
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
} from "firebase/firestore";
import { auth, db } from "../../database/firebaseConfigs";
import { async } from "@firebase/util";
import { isEmptyArray } from "formik";
import SpinnerComponent from "./Spinner";
import RenderChangePassword from "./Account/RenderChangePassword";
import RenderViewProfile from "./Account/RenderViewProfile";

// const { primaryColor, primaryHover, secondaryColor } = colorConfigs;

const renderFirstContent = (firstConfigs) => {
  const [clickedIndex, setClickedIndex] = useState("");

  return firstConfigs.map((item, index) => {
    return (
      <Flex direction="row" align="center" key={item.label}>
        <Tooltip
          label="This function is currently not available..."
          aria-label="A tooltip"
        >
          <Link to={item.path}>
            <Box
              onClick={() => setClickedIndex(index)}
              borderLeft=" 1px solid #e8e6e6"
              width="9rem"
              fontSize="0.7em"
              outline="none"
              p="0.5rem 0"
              position="relative"
              border="none"
              color={item.color}
              boxShadow="   4.5px 0px 0px rgba(0, 0, 0, 0),
          12.5px 0px 0px rgba(0, 0, 0, 0),
          30.1px 0px 0px rgba(0, 0, 0, 0),
          100px 0px 0px rgba(0, 0, 0, 0)"
              _after={{
                content: '""',
                left: 0,
                bottom: 0,
                position: "absolute",
                width: "100%",
                height: "0.175rem",
                background: "black",
                transform: "scale(0,1)",
                transition: "transform 0.3s ease",
              }}
              _hover={{
                boxShadow: "none",
                cursor: "pointer",
                _after: {
                  transform: "scale(1,1)",
                },
              }}
            >
              {item.label}
            </Box>
          </Link>
        </Tooltip>
      </Flex>
    );
  });
};

const renderSecondContent = (secondConfigs) => {
  const [clickedIndex, setClickedIndex] = useState("");
  return secondConfigs.map((item, index) => {
    return (
      <Flex direction="row" align="center" key={item.label}>
        <Box
          borderLeft="1px solid gray"
          lineHeight="1"
          height="1.5rem"
          pl="0.5rem"
        ></Box>
        <Link
          to={item.path}
          state={{
            name: undefined,
            id: undefined,
            type: undefined,
            newAppointment: "",
          }}
        >
          <Box
            onClick={() => setClickedIndex(index)}
            borderLeft=" 1px solid #e8e6e6"
            width={item["label"].length < 13 ? "8rem" : "fit-content"}
            fontSize="0.95em"
            p="0.5rem 0"
            fontWeight="700"
            color={item.color}
            outline="none"
            position="relative"
            border="none"
            boxShadow="   4.5px 0px 0px rgba(0, 0, 0, 0),
          12.5px 0px 0px rgba(0, 0, 0, 0),
          30.1px 0px 0px rgba(0, 0, 0, 0),
          100px 0px 0px rgba(0, 0, 0, 0)"
            _after={{
              content: '""',
              left: 0,
              bottom: 0,
              position: "absolute",
              width: "100%",
              height: "0.35rem",
              background: "black",
              transform: index === clickedIndex ? "scale(1,1)" : "scale(0,1)",
              transition: "transform 0.3s ease",
            }}
            _hover={{
              boxShadow: "none",
              cursor: "pointer",

              _after: {
                transform: "scale(1,1)",
              },
            }}
          >
            {item.label}
          </Box>
        </Link>
      </Flex>
    );
  });
};

const chooseFirstConfigsToRender = (role) => {
  switch (role) {
    case "doctor":
      return renderFirstContent(firstDoctorHeaderConfigs);
    case "guest":
      return renderFirstContent(firstGuestHeaderConfigs);
    case "nurse":
      return renderFirstContent(firstNurseHeaderConfigs);
    case "patient":
      return renderFirstContent(firstPatientHeaderConfigs);
    default:
      return null;
  }
};

const chooseSecondConfigsToRender = (role) => {
  switch (role) {
    case "doctor":
      return renderSecondContent(secondDoctorHeaderConfigs);
    case "guest":
      return renderSecondContent(secondGuestHeaderConfigs);
    case "nurse":
      return renderSecondContent(secondNurseHeaderConfigs);
    case "patient":
      return renderSecondContent(secondPatientHeaderConfigs);
    default:
      return null;
  }
};

const Header = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [requestDialogType, setRequestDialogType] = useState(false);
  const [role, setRole] = useState("guest");
  const { dispatch } = useContext(AuthContext);
  const { currentUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [data, setData] = useState({});
  const [fetchedList, setFetchedList] = useState([]);
  const [logged, setLogged] = useState(false);
  const [fetchedCancerList, setFetchedCancerList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [remember, setRemember] = useState(false);
  const [clicked, setClicked] = useState(false);

  const cancelRef = React.useRef();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCancerData();

    if (currentUser !== null) {
      fetchUserData(currentUser);
      setError(false);
      dispatch({ type: "LOGIN", payload: currentUser });
      setLogged(true);
      setLoadingData(false);
    }

    return () => {
      setFetchedCancerList([]);
      setRole("guest");
      setFetchedList([]);
      setName("");
    };
  }, []);

  const fetchCancerData = async () => {
    let list = [];
    try {
      //get cancer data
      const querySnapshot = await getDocs(collection(db, "cancers"));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setFetchedCancerList(list);
    } catch (err) {
      console.log(err);
    }
  };

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

        setRole(userData["role"]);
        if (userData["name"] !== undefined) {
          setName(userData["name"]);
        } else {
          setName(userData["patient name"]);
        }

        setFetchedList(userData);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // const Autospace = (str) => {
  //   return str.replace(/[A-Z]/g, " $&").trim();
  // };

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);
    const newFilter = fetchedCancerList.filter((value) => {
      return value["type"].toLowerCase().includes(searchWord.toLowerCase());
    });

    if (searchWord === "") {
      setFilteredData([]);
    } else {
      setFilteredData(newFilter);
    }
  };

  const clearInput = () => {
    setFilteredData([]);
    setWordEntered("");
  };

  const renderSignInDialog = (type) => {
    switch (type) {
      case "login":
        return (
          <RenderLogin
            cancelRef={cancelRef}
            onOpen={onOpen}
            logged={logged}
            onClose={onClose}
            isOpen={isOpen}
            dispatch={dispatch}
            fetchUserData={fetchUserData}
            setLogged={setLogged}
            setUsername={setUsername}
            username={username}
            setPassword={setPassword}
            password={password}
            setData={setData}
            data={data}
            error={error}
            setError={setError}
            setLoadingData={setLoadingData}
            loadingData={loadingData}
            remember={remember}
            setRemember={setRemember}
            role={role}
            setRole={setRole}
          ></RenderLogin>
        );
      case "log out":
        return (
          <RenderLogin
            cancelRef={cancelRef}
            onOpen={onOpen}
            logged={logged}
            onClose={onClose}
            isOpen={isOpen}
            dispatch={dispatch}
            fetchUserData={fetchUserData}
            setLogged={setLogged}
            setUsername={setUsername}
            username={username}
            setPassword={setPassword}
            password={password}
            setData={setData}
            data={data}
            error={error}
            setError={setError}
            setLoadingData={setLoadingData}
            loadingData={loadingData}
            remember={remember}
            setRemember={setRemember}
            role={role}
            setRole={setRole}
          ></RenderLogin>
        );
      case "change password":
        return (
          <RenderChangePassword
            cancelRef={cancelRef}
            onOpen={onOpen}
            logged={logged}
            onClose={onClose}
            isOpen={isOpen}
            dispatch={dispatch}
            fetchUserData={fetchUserData}
            setLogged={setLogged}
            setUsername={setUsername}
            username={username}
            setPassword={setPassword}
            password={password}
            setData={setData}
            data={data}
            error={error}
            setError={setError}
            setLoadingData={setLoadingData}
            loadingData={loadingData}
            remember={remember}
            setRemember={setRemember}
            role={role}
            setRole={setRole}
          ></RenderChangePassword>
        );
      case "view profile":
        return (
          <RenderViewProfile
            cancelRef={cancelRef}
            onOpen={onOpen}
            logged={logged}
            onClose={onClose}
            isOpen={isOpen}
            fetchedList={fetchedList}
          ></RenderViewProfile>
        );
      default:
        return null;
    }
  };

  return (
    <Flex p="0.5% 16%" shadow="md" minH="10vh" justifyContent="space-evenly">
      {/* left part header */}
      <Box>
        <Link to={"/home"} onClick={() => setClickedIndex(0)}>
          <Flex mr="4rem" align="center" float="left" pt="1.75rem">
            <Box align="center">
              <Text fontSize="3xl" fontWeight={550}>
                Cancera
              </Text>
            </Box>

            <Icon ml={1} w={5} h={5} as={BiPlusMedical} color="red" />
          </Flex>
        </Link>
      </Box>

      {/* middle part header */}
      <Box>
        {!isEmptyArray(fetchedList) ? (
          <Flex direction="column" minW="fit-content">
            <HStack spacing={8} justifyContent="space-evenly">
              {chooseFirstConfigsToRender(role)}
            </HStack>
            <HStack spacing={6} pr="1rem" justifyContent="space-evenly">
              {chooseSecondConfigsToRender(role)}
            </HStack>
          </Flex>
        ) : (
          <Flex direction="column" minW="fit-content">
            <HStack spacing={8} justifyContent="space-evenly">
              {chooseFirstConfigsToRender("guest")}
            </HStack>
            <HStack spacing={6} pr="1rem" justifyContent="space-evenly">
              {chooseSecondConfigsToRender("guest")}
            </HStack>
          </Flex>
        )}
      </Box>
      {/* right part header */}
      <Flex direction="column">
        {logged ? (
          <Flex justifyContent="space-between" mb="5px">
            <Box textColor="black" fontSize="0.875em" p="2px" mr="2px">
              {name !== "" ? `Hello, ${name} !` : "Loading...."}
            </Box>

            <Menu>
              <MenuButton
                bgColor="cyan.200"
                as={IconButton}
                aria-label="Options"
                color="black"
                icon={<HamburgerIcon w={4} h={4} />}
                variant="outline"
                size="xs"
              ></MenuButton>
              <MenuList zIndex="1">
                <MenuGroup title="Profile">
                  <MenuItem
                    onClick={() => {
                      setRequestDialogType("view profile");
                      onOpen();
                    }}
                  >
                    View profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setRequestDialogType("change password");
                      onOpen();
                    }}
                  >
                    Change password
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Help">
                  <Tooltip
                    label="This function is currently not available..."
                    aria-label="A tooltip"
                  >
                    <MenuItem>Docs</MenuItem>
                  </Tooltip>
                  <Tooltip
                    label="This function is currently not available..."
                    aria-label="A tooltip"
                  >
                    <MenuItem>FAQ</MenuItem>
                  </Tooltip>
                </MenuGroup>
                <MenuDivider></MenuDivider>
                <MenuItem
                  bgColor="gray.300"
                  icon={<BiExit />}
                  onClick={() => {
                    setRequestDialogType("log out");
                    onOpen();
                  }}
                >
                  Log out
                </MenuItem>
                {renderSignInDialog(requestDialogType)}
              </MenuList>
            </Menu>

            {/* <Button
                size="xs"
                bgColor="cyan.300"
                borderWidth="1px"
                mr="5px"
                onClick={() => {
                  onOpen();
                }}
              >
                <Icon as={GiHamburgerMenu} w={4} h={4}></Icon>
              </Button>

              {renderSignInDialog()} */}
          </Flex>
        ) : (
          <Flex direction="row" alignSelf="flex-end" pb="0.5rem" align="center">
            {/* <Box
              textDecoration="underline"
              cursor="pointer"
              textColor="gray"
              fontSize="0.875em"
              onClick={() => {
                setCreate(true);
                onOpen();
              }}
            >
              Create an user
            </Box> */}

            <Box pl="1rem">
              <Button
                fontSize="0.875em"
                h="1.5rem"
                bg="#44d4ff"
                fontWeight="500"
                borderWidth="1px"
                borderColor="gray.300"
                onClick={() => {
                  setRequestDialogType("login");
                  onOpen();
                }}
              >
                Login
              </Button>
              {renderSignInDialog(requestDialogType)}
            </Box>
          </Flex>
        )}

        <Box>
          <Box>
            <InputGroup zIndex="0">
              <Input
                h="40px"
                size="lg"
                variant="outline"
                w="20rem"
                bg="#f4f4f4"
                color="#4a4a4a"
                fontSize="1em"
                type="text"
                value={wordEntered}
                borderColor="2px solid black"
                _placeholder={{
                  fontWeight: "bold",
                  color: "gray",
                  fontSize: "0.75em",
                }}
                placeholder="SEARCH A CANCER"
                onChange={handleFilter}
              />
              <InputRightElement
                children={
                  wordEntered.length === 0 ? (
                    <SearchIcon w="5" h="5" color="black.300"></SearchIcon>
                  ) : (
                    <Box cursor="pointer">
                      <CloseIcon
                        w="5"
                        h="5"
                        color="black.300"
                        onClick={clearInput}
                      />
                    </Box>
                  )
                }
              />
            </InputGroup>
          </Box>
          {filteredData.length != 0 && (
            <Box
              p="1%"
              bgColor="white"
              position="absolute"
              overflow="auto"
              overflowY="auto"
              boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
              minW="20rem"
            >
              {filteredData.slice(0, 15).map((value, key) => {
                return (
                  <Box key={key} fontSize="0.875em" fontWeight="500">
                    <Link to={`/search/cancer/${value["type"]}`}>
                      {Capitalize(value["type"])}
                    </Link>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
