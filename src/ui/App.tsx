// import logo from './logo.svg';
import "./App.scss";
import { useEffect, useState } from "react";
import { USER_CANCEL } from "../bridge/event";
import Pc from "./pc/auth";
import Mobile from "./mobile/auth";
import {
  reisterUI,
  eventMap,
  failedMap,
  endEvent,
  updateLock,
  updateEvent,
} from "../bridge/index";

function App() {
  const [events, setEvents] = useState([]);
  const [failedEvents, setFailedEvents] = useState([]);
  const [inited, setInited] = useState(false);
  useEffect(() => {
    updateLock(false);
  }, [events]);
  function loginFinished() {
    eventMap.clear()
    failedMap.clear()
    updateEvents()
  }
  function backToNode() {
    // @ts-ignore
    const app = document.getElementById("runtime-root");
    // @ts-ignore
    app.style.zIndex = 0;
    // @ts-ignore
    app.style.opacity = 0;
    // @ts-ignore
    document.getElementById("freelog-plugin-container").style.zIndex = 1;
    setInited(false);
  }
  function showUI() {
    // document.body.appendChild = document.body.appendChild.bind(
    //   document.getElementById("runtime-root")
    // );
    // document.body.removeChild = document.body.removeChild.bind(
    //   document.getElementById("runtime-root")
    // );
    // @ts-ignore
    const app = document.getElementById("runtime-root");
    // @ts-ignore
    app.style.zIndex = 1;
    // @ts-ignore
    app.style.opacity = 1;
    // @ts-ignore
    document.getElementById("freelog-plugin-container").style.zIndex = 0;
  }
  // 遍历顺序是否永远一致
  function updateEvents(event?: any) {
    const eventMap = updateEvent(event)
    updateLock(true);
    const arr: any = [];
    eventMap.forEach((val, key) => {
      arr.push(val);
    });
    const arr2: any = [];
    failedMap.forEach((val) => {
      arr2.push(val);
    });
    setFailedEvents(arr2);
    setEvents(arr);
    if (!arr.length) {
      backToNode();
    } else {
      showUI();
      setInited(true);
    }
  }
  function UI() {
    updateEvents();
  }
  function updateUI() {
    updateEvents();
  }

  function contractFinished(eventId: any, type: number, data?: any) {
    if (type === USER_CANCEL && !eventId) {
      endEvent(eventId, type, data);
      // TODO 通知所有 用户取消了
      backToNode();
      return;
    }
    endEvent(eventId, type, data);
  }
  reisterUI(UI, updateUI);
  return (
    <div id="freelog-app" className="w-100x h-100x over-h">
      {inited ? (
        !window.isMobile ? <Pc events={events} contractFinished={contractFinished} updateEvents={updateEvents} loginFinished={loginFinished}></Pc> :
         <Mobile events={events}  contractFinished={contractFinished} updateEvents={updateEvents} loginFinished={loginFinished}></Mobile>
      ) : (
        null
      )}
    </div>
  );
}

export default App;
