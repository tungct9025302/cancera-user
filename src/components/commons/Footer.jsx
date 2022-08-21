import React, { useState } from "react";
import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { colorConfigs } from "../../configs";
import FooterBackground from "../.././pictures/modern-blue-background.jpg";
import { AiOutlineHome, AiOutlineCopyrightCircle } from "react-icons/ai";
import { BiMap } from "react-icons/bi";
import { MdSupportAgent, MdOutlineEmail } from "react-icons/md";
import { GiRotaryPhone } from "react-icons/gi";
import { HiOutlineMail } from "react-icons/hi";
const { primaryColor, secondaryColor } = colorConfigs;

const Footer = () => {
  const attributes = [
    { title: "Home", icon: AiOutlineHome },
    { title: "Address", icon: BiMap },
    { title: "Contact", icon: HiOutlineMail },
  ];
  const properties = {
    office_number: "(08) 3894xxxx",
    support_service: "(08) 3894xxxx",
    email: "cancera@gmail.com",
    address:
      "3xx Nguyen Van Nghi, Ward 7, Go Vap District, Ho Chi Minh city, Vietnam",
  };

  const navigate = useNavigate();
  const [clickedTitle, setClickedTitle] = useState("Home");

  const handleClick = (title, index) => {
    switch (title) {
      case "Home":
        setClickedTitle("Home");
        // navigate("/home");
        break;
      case "Address":
        setClickedTitle("Address");
        break;
      case "Contact":
        setClickedTitle("Contact");
        break;
      default:
        break;
    }
  };

  const renderByClickedTitle = () => {
    switch (clickedTitle) {
      case "Home":
        return (
          <Box align="center" textColor="white">
            <Flex align="center" justifyContent="center">
              <Icon as={AiOutlineCopyrightCircle} w={5} h={5} pr="5px"></Icon>
              <Text>Developed by Thinh Huynh Quang Phuoc</Text>
            </Flex>
            <Text>Supervisors: Tran Hong Ngoc, Dalila Kessira</Text>
          </Box>
        );
      case "Address":
        return (
          <Box align="center" textColor="white">
            <Box>
              <Text>Address: {properties["address"]}</Text>
            </Box>
          </Box>
        );
      case "Contact":
        return (
          <Box align="center" textColor="white">
            <Flex align="center" justifyContent="center">
              <Icon as={GiRotaryPhone} w={6} h={6} pr="5px"></Icon>
              <Text>Office number: {properties["office_number"]}</Text>
            </Flex>
            <Flex align="center" justifyContent="center">
              <Icon as={MdSupportAgent} w={5} h={5} pr="5px"></Icon>
              <Text>Support service: {properties["support_service"]}</Text>
            </Flex>
            <Flex align="center" justifyContent="center">
              <Icon as={MdOutlineEmail} w={5} h={5} pr="5px"></Icon>
              <Text>Email: {properties["email"]}</Text>
            </Flex>
          </Box>
        );
      default:
        return null;
    }
  };
  return (
    <Box
      h="20vh"
      position="relative"
      bottom="0"
      bgImage={FooterBackground}
      backgroundSize="auto"
      backgroundRepeat="round"
    >
      <Box position="relative" top="0" bg={secondaryColor} mb="2rem">
        <Box w="50% " m="auto">
          <HStack spacing={8} h="50px" m="auto" w="40%">
            {attributes.map((attribute, index) => {
              return (
                <Flex
                  key={index}
                  alignSelf="center"
                  cursor="pointer"
                  onClick={() => {
                    handleClick(attribute["title"]);
                  }}
                >
                  <Icon
                    as={attribute["icon"]}
                    w={5}
                    h={5}
                    color="white"
                    mr="5px"
                  />
                  <Text color="white" mr="50px">
                    {attribute["title"]}
                  </Text>
                  {index + 1 !== attributes.length ? (
                    <Box borderLeft="1px solid white"></Box>
                  ) : null}
                </Flex>
              );
            })}
          </HStack>
        </Box>
      </Box>
      {renderByClickedTitle()}
    </Box>
  );
};

export default Footer;
