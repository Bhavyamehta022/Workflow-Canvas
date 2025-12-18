import ReactDOM from "react-dom/client";
import {Workflow} from "./components/workflow.js";
const App =()=>{
    return (
        <div>
            <Workflow/>
        </div>
    )
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
