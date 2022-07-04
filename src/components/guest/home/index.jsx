import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { AuthContext } from "../../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const RequireAuth = ({ children }) => {
    return currentUser ? children : navigate("/");
  };
  return <Box p="5% 20%">This is home page</Box>;
};

export default Home;
