import React, { Component } from "react";
import { Spinner, Box } from "@chakra-ui/react";

const SpinnerComponent = () => {
  return (
    <Box
      margin="auto"
      w="100%"
      align="center"
      top="50%"
      position="relative"
      transform="translateY(500%)"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Box>
  );
};
export default SpinnerComponent;
