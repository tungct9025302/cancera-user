import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Flex,
  Text,
  VStack,
  Popover,
  PopoverTrigger,
  Button,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverFooter,
} from "@chakra-ui/react";

import background from "../../../pictures/dialogbox_background.jpg";

const DialogBox = (props) => {
  const [id, setId] = useState();
  const [boxTitle, setType] = useState();
  const navigate = useNavigate();
  const userDialogBoxTitles = [
    "appointments",
    "general examinations",
    "treatments",
  ];
  const adminDialogBoxTitles = ["set role", "check requests"];

  useEffect(() => {
    if (props.pid !== undefined) {
      setId(props.pid);
    }
  }, []);

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const Dialog = ({ boxTitle }) => {
    const initialFocusRef = React.useRef();

    switch (props.role) {
      case "patient":
        return (
          <Button
            display="block"
            m="1rem"
            shadow="md"
            bgColor={boxTitle === props.boxTitle ? "cyan.300" : "none"}
            borderWidth="2px"
            borderColor="#9db5fa"
            wordBreak="break-word"
            minW="180px"
            onClick={() => {
              setType(boxTitle);

              switch (boxTitle) {
                case "appointments":
                  navigate(`/view/my-appointments`, {
                    state: { boxTitle: boxTitle },
                  });

                  break;
                case "general examinations":
                  navigate(`/view/my-general-examinations`, {
                    state: { boxTitle: boxTitle },
                  });

                  break;
                case "treatments":
                  navigate(`/view/my-treatments`, {
                    state: { boxTitle: boxTitle },
                  });

                  break;
                default:
                  break;
              }
            }}
          >
            {boxTitle.toUpperCase()}
          </Button>
        );

      default:
        return (
          <Popover
            isLazy="true"
            initialFocusRef={initialFocusRef}
            placement="bottom"
          >
            <PopoverTrigger>
              <Button
                display="block"
                m="1rem"
                shadow="md"
                bgColor={boxTitle === props.boxTitle ? "cyan.300" : "none"}
                borderWidth="2px"
                borderColor="#9db5fa"
                wordBreak="break-word"
                minW="180px"
                onClick={() => {
                  setType(boxTitle);
                }}
              >
                {boxTitle.toUpperCase()}
              </Button>
            </PopoverTrigger>
            <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
              <PopoverHeader pt={4} fontWeight="bold" border="0">
                Please choose action:
              </PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                {boxTitle === "appointments" &&
                props.role === "nurse" ? null : (
                  <Text>
                    If you select add, a new {boxTitle} will be created in the
                    patient's information.
                  </Text>
                )}

                <Text>
                  If you select check history, a list of {boxTitle} will be
                  displayed.
                </Text>
              </PopoverBody>
              <PopoverFooter
                border="0"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pb={4}
              >
                {/* add */}

                {props.pid === undefined && props.role !== "nurse" ? (
                  <Link
                    to={`/search-patient`}
                    state={{
                      boxTitle: boxTitle,
                    }}
                  >
                    <Button colorScheme="green">Add</Button>
                  </Link>
                ) : (boxTitle === "appointments" || boxTitle === undefined) &&
                  props.role === "nurse" ? null : (
                  <Link
                    to={`/search-patient/id=${props.pid}/add/${boxTitle}`}
                    state={{
                      name: props.name,
                      pid: props.pid,
                      boxTitle: boxTitle,
                    }}
                  >
                    <Button colorScheme="green">Add</Button>
                  </Link>
                )}

                {/* Check history */}
                {props.pid === undefined ? (
                  <Link
                    to={`/search-patient`}
                    state={{
                      boxTitle: boxTitle,
                    }}
                  >
                    <Button colorScheme="blue" ref={initialFocusRef}>
                      Check history
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to={`/search-patient/id=${id}/check-history/${boxTitle}`}
                    state={{
                      name: props.name,
                      pid: props.pid,
                      boxTitle: boxTitle,
                    }}
                  >
                    <Button colorScheme="blue" ref={initialFocusRef}>
                      Check history
                    </Button>
                  </Link>
                )}
              </PopoverFooter>
            </PopoverContent>
          </Popover>
        );
    }
  };
  // console.log(props.role, boxTitle);
  const renderTopDialogBox = () => {
    switch (props.role) {
      case "admin":
        return "User setting:";
      case "patient":
        return "Check your :";
      default:
        return "For your patient:";
    }
  };
  return (
    <Flex
      shadow="md"
      borderWidth="2px"
      borderColor="gray.300"
      mt="2rem"
      direction="column"
      w="30%"
      minW="220px"
      minH="74vh"
      backgroundImage={background}
      backgroundPosition="10%"
      backgroundSize="auto"
    >
      <Text
        fontSize="30px"
        fontWeight="600"
        letterSpacing="-.42px"
        color="#0c1d4f"
        p="1rem 0 0 1rem"
      >
        {renderTopDialogBox()}
      </Text>

      <Flex direction="column" spacing={8} align="left">
        {props.role === "admin"
          ? adminDialogBoxTitles.map((name, index) => {
              return <Dialog key={index} boxTitle={name} />;
            })
          : userDialogBoxTitles.map((name, index) => {
              return <Dialog key={index} boxTitle={name} />;
            })}
      </Flex>
    </Flex>
  );
};

export default DialogBox;
