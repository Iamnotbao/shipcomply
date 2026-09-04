import { useRoutes } from "react-router-dom";
import routes from "./route";
import "./App.css";

function App() {
  return useRoutes(routes);
}

export default App;
