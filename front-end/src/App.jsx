import { useRoutes } from 'react-router-dom';
import routes from './route';
import './App.css';
import { restoreApiSite } from './utils/config/severSwitch';
function App() {
 const routing = useRoutes(routes);
   return routing;
}
restoreApiSite();
export default App
