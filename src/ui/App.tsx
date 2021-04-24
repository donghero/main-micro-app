// import logo from './logo.svg';
import "./App.scss";
import React, { useEffect, useState } from "react";
import { LOGIN, CONTRACT, PAY } from "../bridge/event";
import Login from "./components/login";
import Contract from "./components/contract";
 
import Pay from "./components/pay";

import { reisterUI, eventMap, failedMap, endEvent } from "../bridge/index";
function App() {
  const [events, setEvents] = useState([]);
  const [failedEvents, setFailedEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  // 遍历顺序是否永远一致
  function updateEvents() {
    const arr: any = [];
    let flag = false
    if(currentEvent) flag = true
    eventMap.forEach((val, key) => {
      arr.push(val);
      //@ts-ignore
      if(flag && currentEvent.eventId === key){
        flag = false
      }
    });
    if(flag){
      setCurrentEvent(null)
    }
    if (!arr.length) {
      // @ts-ignore
      const app = document.getElementById("runtime-root")
            // @ts-ignore
      app.style.zIndex = 0;
      // @ts-ignore
      app.style.opacity = 0;
      // @ts-ignore
      document.getElementById("freelog-plugin-container").style.zIndex = 1;
    } else {
      // @ts-ignore
      const app = document.getElementById("runtime-root")
            // @ts-ignore
      app.style.zIndex = 1;
      // @ts-ignore
      app.style.opacity = 1;
      // @ts-ignore
      document.getElementById("freelog-plugin-container").style.zIndex = 0;
    }
    setEvents(arr);
    const arr2: any = [];
    failedMap.forEach((val) => {
      arr2.push(val);
    });
    setFailedEvents(arr2);
    return arr;
  }
  function UI() {
    const arr = updateEvents();
    setCurrentEvent(arr[0] || null);
  }
  function updateUI() {
    const arr = updateEvents();
    !currentEvent && setCurrentEvent(arr[0] || null);
  }
  function eventFinished(type: number, data?: any){
    // @ts-ignore
    endEvent(currentEvent.eventId, type, data)
  }
  reisterUI(UI, updateUI);
  return (
    <div id="freelog-app" className="App flex-row w-100x h-100x over-h bg-white">

      <div className="w-200x h-100x flex-column p-20">
        {events.map((item: any, index) => {
          if(item.event === LOGIN) return ''
          return (
            <div
              key={index}
              onClick={() => {
                setCurrentEvent(item);
              }}
              className={
                " mb-20 p-10 w-310 h-200 flex-column br-middle b-1 space-between"
              }
            >
              <div>{item.presentableId}</div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 h-100x text-center">
        {currentEvent? (() => {
          // @ts-ignore
          if (currentEvent.event === LOGIN) {
            console.log(currentEvent);
            // @ts-ignore
            return <Login presentableData={currentEvent} eventFinished={eventFinished}></Login>;
            // @ts-ignore
          } else if (currentEvent.event === CONTRACT) {
            // @ts-ignore
            return <Contract presentableData={currentEvent}></Contract>;
            // @ts-ignore
          } else if (currentEvent.event === PAY) {
            // @ts-ignore
            return <Pay presentableData={currentEvent}></Pay>;
          }
        })() : ''}
      </div>
    </div>
  );
}

export default App;
