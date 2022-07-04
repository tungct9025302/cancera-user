import React, { useState } from "react";

import { Box, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useLocation } from "react-router-dom";
// import { BsSearch } from "react-icons/bs";

import SearchBar from "../../commons/SearchBar";

const Search = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");

  const handleFilter = (event) => {
    const searchWord = event.target.value;
    setWordEntered(searchWord);
    const newFilter = CancerData.filter((value) => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase());
    });

    if (searchWord === "") {
      setFilteredData([]);
    } else {
      setFilteredData(newFilter);
    }
  };

  return (
    <Box>
      <Box p="5% 10%">
        <Text fontSize="5xl" mb="2%">
          Search for a cancer:
        </Text>
        <Box>
          <SearchBar
            setFilteredData={setFilteredData}
            wordEntered={wordEntered}
            filteredData={filteredData}
            handleFilter={handleFilter}
            setWordEntered={setWordEntered}
            placeholder="Enter a Cancer name to search..."
            data={CancerData}
            type="CancerData"
          ></SearchBar>
        </Box>
      </Box>
    </Box>
  );
};

export default Search;
