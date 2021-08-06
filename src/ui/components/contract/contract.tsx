import { Radio, Input, Space } from "antd";
import { useState, useEffect } from "react";
import Button from "../_components/button";

import { DownOutlined, UpOutlined } from "@ant-design/icons";
import "./contract.scss";
var moment = require("moment");
/**
 * 事件执行后：分情况，如果是获得授权的事件，那就是---获得授权后
 */
interface ItemProps {
  contract: any;
  children?: any;
}
interface CurrentStatus {
  status: string;
  transitions: Array<any>;
  [propName: string]: any;
}
export default function (props: ItemProps) {
  const [eventId, setEventId] = useState(0);
  const [unfold, setUnFold] = useState(false);
  const [authClass, setAuthClass] = useState("bg-auth-non");
  const [authStatus, setAuthStatus] = useState("未授权");
  const [currentStatus, setCurrentStatus] = useState({});
  useEffect(() => {
    console.log(props.contract);
    setAuthStatus(
      props.contract.status === 1
        ? "已终止"
        : props.contract.authStatus === 128
        ? "未授权"
        : "已授权"
    );
    setAuthClass(
      props.contract.status === 1
        ? "bg-auth-end"
        : props.contract.authStatus === 128
        ? "bg-auth-non"
        : "bg-auth"
    );
    let currentSatus: any;
    props.contract.policyInfo.translateInfo.fsmInfos.some((item: any) => {
      if (item.stateInfo.origin === props.contract.fsmCurrentState) {
        console.log(item);
        let tec = 0; // TransactionEventCount
        item.eventTranslateInfos.forEach((event: any) => {
          if (event.origin.name === "TransactionEvent") tec++;
          props.contract.policyInfo.translateInfo.fsmInfos.some(
            (state: any) => {
              if (state.stateInfo.origin === event.origin.state) {
                console.log(item);
                let tec = 0; // TransactionEventCount
                event.nextState = state;

                // @ts-ignore
                return true;
              }
            }
          );
        });
        const currentSatus = {
          tec,
          status: props.contract.fsmCurrentState,
          ...item,
          ...props.contract.policyInfo.fsmDescriptionInfo[
            props.contract.fsmCurrentState
          ],
        };
        console.log(currentSatus);
        // @ts-ignore
        setCurrentStatus(currentSatus);
        return true;
      }
    });
  }, [props.contract]);
  function onChange(e: any) {
    // console.log(e)
    setEventId(e.target.value);
  }
  function payEvent(e: any) {
    // console.log(e)
  }
  return (
    <div className="contract-card px-20 py-15 mt-15 w-100x">
      <div className="flex-row w-100x">
        <div className="contract-name  text-ellipsis">
          {props.contract.contractName}
        </div>
        <div className="policy-button cur-pointer  shrink-0">策略内容</div>
      </div>
      {/* 状态整体 */}
      <div className="status-card p-15 mt-15">
        <div className="flex-row">
          <div className={"auth-status text-center " + authClass}>
            {authStatus}
          </div>
          <div className="auth-time">
            {moment(props.contract.updateDate).format("YYYY-MM-DD HH:mm")}
          </div>
        </div>
        <div className="flex-row py-10 space-between">
          <div>当前无授权，请选择执行事件</div>

          {
            // @ts-ignore
            currentStatus.tec > 1 && (
              <Button
                className="fs-12"
                disabled={eventId === 0}
                click={payEvent}
              >
                支付
              </Button>
            )
          }
        </div>
        {/* 可选事件 */}
        <div>
          <div className="flex-row">
            <Radio.Group onChange={onChange} value={eventId}>
              <div className="flex-column">
                {
                  // @ts-ignore
                  currentStatus.eventTranslateInfos &&
                    // @ts-ignore
                    currentStatus.eventTranslateInfos.map((event: any) => {
                      // origin.id  name
                      return (
                        <div className="event-card p-10 mt-10 flex-column">
                          <Radio
                            className=""
                            value={event.origin.id}
                            disabled={event.origin.name !== "TransactionEvent"}
                          >
                            <div className="flex-row">
                              <span className="pr-10">{event.content}</span>
                              {
                                // @ts-ignore
                                currentStatus.tec === 1 &&
                                  event.origin.name === "TransactionEvent" && (
                                    <Button
                                      disabled={event.origin.id !== eventId}
                                      className="fs-12"
                                      click={payEvent}
                                    >
                                      支付
                                    </Button>
                                  )
                              }
                            </div>
                          </Radio>
                          {/* 执行完成后下一个状态的所有事件 */}
                          <div className="flex-column event-next pt-10 ml-25">
                            {/** 事件执行后：分情况，如果是获得授权的事件，那就是---获得授权后
                             * event.origin.state
                             */}
                            <div className="event-next">执行成功后:</div>
                            {event.nextState.eventTranslateInfos.map(
                              (nextEvent: any, index: number) => {
                                return (
                                  <div key={index} className="flex-row align-center"><div className="event-dot mr-5"></div><span>{nextEvent.content}</span></div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </Radio.Group>
          </div>
        </div>
        <div className="fluent-record text-align-center cur-pointer select-none mt-20">
          {!unfold ? (
            <div
              onClick={(e) => {
                setUnFold(true);
              }}
            >
              展开流转记录 <DownOutlined />
            </div>
          ) : (
            <div
              onClick={(e) => {
                setUnFold(false);
              }}
            >
              收起流转记录 <UpOutlined />
            </div>
          )}
        </div>
      </div>
      <div className="contract-code pt-12">
        合同编号 {props.contract.contractId} | 签约时间{" "}
        {moment(props.contract.updateDate).format("YYYY-MM-DD HH:mm")}
      </div>
    </div>
  );
}
