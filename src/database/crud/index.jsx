import React from "react";
import StartFirebase from "../firebaseConfigs";
import { ref, set, get, update, remove, child } from "firebase/database";

export const Crud = () => {
  const [database, setDatabase] = useState(state);
  useEffect(() => {
    // Update the document title using the browser API
    setDatabase({ db: StartFirebase() });
  });

  state = {
    db: "",
    username: "",
    fullname: "",
    phonenumber: "",
    dob: "",
  };
};
