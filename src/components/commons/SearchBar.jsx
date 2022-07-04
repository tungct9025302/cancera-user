import React, { useState, useLocation } from "react";

import {
  Icon,
  Box,
  Flex,
  Input,
  Text,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

const SearchBar = ({
  placeholder,
  type,
  wordEntered,
  handleFilter,
  filteredData,
  width,
  setFilteredData,
  setWordEntered,
}) => {
  const clearInput = () => {
    setFilteredData([]);
    setWordEntered("");
  };
  const renderSearchBox = (value) => {
    switch (type) {
      case "treatment":
        return (
          <Link
            to={`/search/treatment/${value["name"].toLowerCase()}`}
            state={{ dataType: type, id: value["id"] }}
          >
            <Text fontSize="1.5em" fontWeight="500">
              {value.name}
            </Text>
          </Link>
        );
      case "patient":
        return (
          <Link
            to={`/search/patient/id=${value["pid"]}`}
            state={{
              dataType: type,
              pid: value["pid"],
            }}
          >
            <Flex direction="row" justifyContent="space-between">
              <Text fontSize="1.5em" fontWeight="500">
                {value["patient name"]}
              </Text>
              <Text fontSize="1.5em" fontWeight="500">
                {value["pid"]}
              </Text>
            </Flex>
          </Link>
        );
      default:
        return null;
    }
  };
  return (
    <Box>
      <Box position="relative">
        <InputGroup>
          <Input
            h="60px"
            size="lg"
            variant="outline"
            fontSize="1.5rem"
            type="text"
            value={wordEntered}
            placeholder={placeholder}
            _placeholder={{
              fontWeight: "400",
              fontcolor: "#606060",
            }}
            onChange={handleFilter}
            bg="white"
          />
          <InputRightElement
            style={{ top: "30%" }}
            children={
              <Box>
                {wordEntered.length === 0 ? (
                  <Box cursor="pointer" pointerEvents="none">
                    <SearchIcon
                      w="7"
                      h="7"
                      color="black.300"
                      m="0 20px 15px 0"
                    />
                  </Box>
                ) : (
                  <Box cursor="pointer">
                    <CloseIcon
                      w="7"
                      h="7"
                      m="0 20px 15px 0"
                      color="black.300"
                      onClick={clearInput}
                    />
                  </Box>
                )}
              </Box>
            }
          />
        </InputGroup>
        {filteredData.length != 0 && (
          <Box
            p="1%"
            bgColor="white"
            position="absolute"
            overflow="auto"
            overflowY="auto"
            boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
            maxH="100px"
            width={width}
            minW="702px"
          >
            {filteredData.slice(0, 15).map((value, key) => {
              return (
                <Box key={key} cursor="pointer">
                  {renderSearchBox(value)}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchBar;
