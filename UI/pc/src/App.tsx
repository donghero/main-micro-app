// import logo from './logo.svg';
import "./App.scss";

import { useEffect, useState } from "react";
import Pc from "./views/auth";
import frequest from "@/services/handler";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import user from "@/services/api/modules/user";
const {
  reisterUI,
  eventMap,
  failedMap,
  endEvent,
  updateLock,
  updateEvent,
  lowerUI,
  upperUI,
} = window.freelogAuth;
const { SUCCESS, USER_CANCEL } = window.freelogAuth.resultType;

function App() {
  const [events, setEvents] = useState([]);
  const [inited, setInited] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    updateLock(false);
  }, [events]);
  function loginFinished(type: any) {
    if (type === SUCCESS) {
      setIsLogin(false);
      eventMap.clear();
      failedMap.clear();
      updateEvents();
    } else if (type === USER_CANCEL && !inited) {
      lowerUI();
    }
  }

  // 遍历顺序是否永远一致
  function updateEvents(event?: any) {
    setInited(false);
    const eventMap = updateEvent(event);
    updateLock(true);
    const arr: any = [];
    eventMap.forEach((val: any) => {
      arr.push(val);
    });
    const arr2: any = [];
    failedMap.forEach((val: any) => {
      arr2.push(val);
    });
    setEvents(arr);
    if (!arr.length) {
      lowerUI();
    } else {
      upperUI();
      setInited(true);
    }
  }
  function UI() {
    updateEvents();
  }
  function updateUI() {
    updateEvents();
  }
  function login() {
    upperUI();
    setIsLogin(true);
  }

  function contractFinished(eventId: any, type: number, data?: any) {
    if (type === USER_CANCEL && !eventId) {
      endEvent(eventId, type, data);
      // TODO 通知所有 用户取消了
      lowerUI();
      return;
    }
    endEvent(eventId, type, data);
  }

  function longinOut() {
    upperUI();
    Modal.confirm({
      title: "确认退出登录？",
      icon: <ExclamationCircleOutlined />,
      content: "退出后页面会被刷新",
      okText: "确认",
      cancelText: "取消",
      style: {
        top: "30%",
      },
      onOk: async () => {
        await frequest(user.loginOut, "", "").then((res: any) => {
          if (res.data.errCode === 0) {
            window.freelogAuth.reload();
          }
        });
      },
      onCancel: () => {
        lowerUI();
      },
    });
  }
  reisterUI(UI, updateUI, login, longinOut);
  return (
    <div id="freelog-app" className="w-100x h-100x ">
      {inited || isLogin ? (
        <Pc
          events={events}
          isAuths={inited}
          isLogin={isLogin}
          contractFinished={contractFinished}
          updateEvents={updateEvents}
          loginFinished={loginFinished}
        ></Pc>
      ) : null}
    </div>
  );
}

export default App;
