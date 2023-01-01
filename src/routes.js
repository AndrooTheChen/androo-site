import {
    BrowserRouter as Router,
    Route,
} from "react-router-dom";
import App from './App';

function AppRoutes() {
    <Router>
        <Route path="/" exact component={App} />
    </Router>
}

export default AppRoutes;