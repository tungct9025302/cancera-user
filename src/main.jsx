import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";

import App from "./components/App";

import { AuthContextProvider } from "./components/context/AuthContext";

// //paste this into component need to update state then use setPatient(data->data need to update)
// import { setPatient } from "./reducers/actions";

const theme = extendTheme({
  fonts: {
    heading: "Heading Font Name, sans-serif",
    body: "Body Font Name, sans-serif",
  },
});

ReactDOM.render(
  <React.Fragment>
    <ChakraProvider theme={theme}>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </ChakraProvider>
  </React.Fragment>,
  document.getElementById("root")
);
