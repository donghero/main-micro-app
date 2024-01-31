import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'




const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
console.log(window.__POWERED_BY_WUJIE__, 9999)
if (window.__POWERED_BY_WUJIE__) {
  debugger
  root.render(<App />)
  // window.__WUJIE_MOUNT = () => {
  //   root.render(<App />);
  // };
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
