import ReactDOM from 'react-dom/client'
import App from "./App";

async function renderRoot() {
    const node = document.getElementById("main");
    if (node) {
        const root = ReactDOM.createRoot(node);
        const element = <App />;
        root.render(element);
    } else {
        console.error("error: element with id 'main' not found")
    }
}

renderRoot().then(() => {
    console.log("root")
})