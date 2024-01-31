// @ts-ignore
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    root.render(<App />);
  };
  window.__WUJIE_UNMOUNT = () => {
    root.unmount();
  };
} else {
  root.render(<App />);
}
// setTimeout(()=>{run();},0)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
