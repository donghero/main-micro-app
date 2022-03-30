import { useState, useEffect } from "react";
import Pay from "../event/pay";
import "./contract.scss";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
// import PolicyGraph from "../policy/_components/policyGraph";
import PolicyCode from "../policy/_components/policyCode";
import PolicyContent from "../policy/_components/policyContent";
import { Tabs, Badge, Button, Toast } from "antd-mobile";
import frequest from "@/services/handler";
import contract from "@/services/api/modules/contract";
var moment = require("moment");
/**
 * 事件执行后：分情况，如果是获得授权的事件，那就是---获得授权后
 */
interface ItemProps {
  policy: any;
  contract: any;
  children?: any;
  paymentFinish: any;
  setModalType: any;
  [propName: string]: any;
}
const tabs = [
  { title: <Badge>合约流转记录</Badge> },
  { title: <Badge>策略内容</Badge> },
  { title: <Badge>状态机视图</Badge> },
  { title: <Badge>策略代码</Badge> },
];
export default function Contract(props: ItemProps) {
  const [eventIndex, setEventIndex] = useState(-1);
  const [unfold, setUnFold] = useState(false);
  const [records, setRecords] = useState<any>([]);
  const [totalItem, setTotalItem] = useState<any>(-1);
  const [argsMap, setArgsMap] = useState<Map<any, any>>(new Map());
  const [authClass, setAuthClass] = useState("bg-auth-none");
  const [authStatus, setAuthStatus] = useState("未授权");
  const [currentStatus, setCurrentStatus] = useState<any>({
    tec: 0,
    eventTranslateInfos: [{ origin: { args: { amount: "" } } }],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    const argsMap = new Map();
    props.contract.fsmDeclarations.envArgs?.forEach((item: any) => {
      argsMap.set(item.name, item);
    });
    setArgsMap(argsMap);
    let authClass = "bg-auth-end";
    let authStatus = "已终止";
    if (props.contract.status !== 1) {
      authStatus = "未授权";
      authClass = "bg-auth-none";
      if ([2, 3].includes(props.contract.authStatus) && window.isTest) {
        authStatus = "已授权";
        authClass = "bg-auth";
      } else if ([1, 3].includes(props.contract.authStatus)) {
        authStatus = "已授权";
        authClass = "bg-auth";
      }
    }
    setAuthStatus(authStatus);
    setAuthClass(authClass);
    props.contract.policyInfo.translateInfo.fsmInfos.some((item: any) => {
      if (item.stateInfo.origin === props.contract.fsmCurrentState) {
        let tec = 0; // TransactionEventCount
        let currentContent = { ...item };
        currentContent.eventTranslateInfos.forEach((event: any) => {
          if (event.origin.name === "TransactionEvent") tec++;
          props.contract.policyInfo.translateInfo.fsmInfos.some(
            (state: any) => {
              if (state.stateInfo.origin === event.origin.toState) {
                const stateInfo =
                  props.contract.policyInfo.fsmDescriptionInfo[
                    event.origin.toState
                  ];
                stateInfo.commonAuth = window.isTest
                  ? stateInfo.isTestAuth
                  : stateInfo.isAuth;
                event.nextState = {
                  ...state,
                  ...stateInfo,
                };
                return true;
              }
            }
          );
        });
        const stateInfo =
          props.contract.policyInfo.fsmDescriptionInfo[
            props.contract.fsmCurrentState
          ];
        stateInfo.commonAuth = window.isTest
          ? stateInfo.isTestAuth
          : stateInfo.isAuth;
        const currentSatus = {
          tec,
          status: props.contract.fsmCurrentState,
          ...currentContent,
          ...stateInfo,
        };
        console.log(currentSatus);
        // @ts-ignore
        setCurrentStatus(currentSatus);
        return true;
      }
    });
    getRecords(true);
  }, [props.contract]);
  async function getRecords(init?: boolean) {
    if (records.length >= totalItem && totalItem > -1) {
      !init && setUnFold(true);
      return;
    }

    /**
     * contractId: "6141c41dcef4d5002ed4dcc5"
     * createDate: "2021-09-17T07:55:00.886Z"
     * eventId: "47a53396dcc9403a969c72e267b31e63"
     * fromState: "initial"
     * toState: "a"
     *
     * 数据整合差异：使用同样数据，需要注意避免发生冲突
     *   1.找到执行了哪个事件并标记
     *   2.授权状态需要在内部判断出来
     */
    const res = await frequest(
      contract.getTransitionRecords,
      [props.contract.contractId],
      {
        skip: records.length,
        limit: 25,
        isTranslate: 1,
      }
    );
    if (res.data.errCode !== 0) {
      Toast.show({
        icon: "fail",
        content: res.data.msg,
        duration: 2000,
      });
      return;
    }
    let recordsArr: any = [];

    res.data.data.dataList.forEach((record: any) => {
      record.commonAuth = window.isTest
        ? [2, 3].includes(record.serviceStates)
        : [1, 3].includes(record.serviceStates);
      let authStatus = "未授权";
      let authClass = "bg-auth-none";
      if (record.commonAuth) {
        authStatus = "已授权";
        authClass = "bg-auth";
      }
      recordsArr.push({
        ...record,
        authClass,
        authStatus,
      });
    });
    console.log(recordsArr);
    setTotalItem(res.data.data.totalItem);
    setRecords([...records, ...recordsArr]);
    !init && setUnFold(true);
  }
  function onChange(e: any) {
    setEventIndex(parseInt(e.target.value));
  }
  function payEvent(index?: number) {
    typeof index != "undefined" && setEventIndex(index);
    setIsModalVisible(true);
  }
  function paymentFinish(status: number) {
    if (status === 2) {
      setIsModalVisible(false);
      setTimeout(() => {
        props.paymentFinish();
      }, 10);
      return;
    }
    props.paymentFinish();
  }
  return (
    <div className="flex-column brs-10 b-1 mx-10 mt-15 pb-12 contract-card">
      {eventIndex > -1 && isModalVisible && (
        <Pay
          contractId={props.contract.contractId}
          subjectName={props.contract.subjectName}
          setModalType={props.setModalType}
          contractName={props.contract.contractName}
          paymentFinish={paymentFinish}
          // @ts-ignore
          receiver={
            argsMap.get(
              // @ts-ignore
              currentStatus.eventTranslateInfos[eventIndex].origin.args.account
            ).ownerName
          }
          // @ts-ignore
          eventId={currentStatus.eventTranslateInfos[eventIndex].origin.eventId}
          // @ts-ignore
          transactionAmount={
            currentStatus.eventTranslateInfos[eventIndex].origin.args.amount
          }
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
        ></Pay>
      )}
      <div className="flex-row  p-15">
        <div className="flex-1 text-ellipsis fc-main fs-16 fw-bold lh-33">
          {props.contract.contractName}
        </div>
        {/* <div className="policy-button cur-pointer  shrink-0 select-none">策略内容</div> */}
      </div>
      <Tabs defaultActiveKey="contract">
        <Tabs.Tab title="合约流转记录" key="contract">
          <div className="">
            {/* 状态整体 */}
            <div className="status-card p-15 ">
              <div className="flex-row">
                <div
                  className={"auth-status text-center select-none " + authClass}
                >
                  {authStatus}
                </div>
                <div className="auth-time">
                  {moment(props.contract.updateDate).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </div>
              </div>
              <div className="flex-row pt-15 pb-5 space-between align-center">
                <div className="contract-tip flex-column">
                  <div>{records[0] && records[0].stateInfoStr}</div>
                  <div className="mt-5">{currentStatus.tec > 1 &&
                    records[0] &&
                    records[0].eventSelectStr}</div>
                </div>
                {currentStatus.tec > 1 && (
                  <Button
                    color="primary"
                    size="small"
                    className="fs-14 shrink-0"
                    disabled={eventIndex === -1}
                    onClick={() => {
                      payEvent();
                    }}
                  >
                    支付
                  </Button>
                )}
              </div>
              {/* 可选事件 */}
              <div>
                <div className="flex-column">
                  {
                    // @ts-ignore
                    currentStatus.eventTranslateInfos &&
                      // @ts-ignore
                      currentStatus.eventTranslateInfos.map(
                        (event: any, index: number) => {
                          // origin.eventId  name
                          return (
                            <div
                              className={
                                "event-card flex-row " +
                                (currentStatus.tec === 1 ||
                                event.origin.name !== "TransactionEvent"
                                  ? "event-card-one "
                                  : " p-10 event-card-more  mt-10 ") +
                                (index !== eventIndex || currentStatus.tec === 1
                                  ? ""
                                  : "event-selected")
                              }
                              key={index}
                            >
                              <input
                                // @ts-ignore
                                className={
                                  currentStatus.tec === 1 ? "mt-8" : "mt-4"
                                }
                                type="radio"
                                checked={index === eventIndex}
                                onChange={onChange}
                                id={event.origin.eventId}
                                name={props.contract.contractId}
                                value={index}
                                disabled={
                                  event.origin.name !== "TransactionEvent"
                                }
                              />
                              <label htmlFor={event.origin.eventId}>
                                <div className="flex-row event  align-center  ">
                                  <div className="mx-10 flex-row align-center pe-none ">
                                    <span
                                      className={event.content ? "mr-10 " : ""}
                                    >
                                      {event.content}
                                    </span>
                                    <span className="auth shrink-0">
                                      {event.nextState && event.nextState.isAuth
                                        ? "获得授权"
                                        : ""}
                                    </span>
                                  </div>
                                  {
                                    // @ts-ignore
                                    currentStatus.tec === 1 &&
                                      event.origin.name ===
                                        "TransactionEvent" && (
                                        <Button
                                          color="primary"
                                          size="small"
                                          // disabled={index !== eventIndex}
                                          className="fs-12  shrink-0 "
                                          onClick={() => {
                                            payEvent(index);
                                          }}
                                        >
                                          支付
                                        </Button>
                                      )
                                  }
                                </div>
                                {/* 执行完成后下一个状态的所有事件 */}
                                <div className="flex-column event-next pt-5 ml-12 pe-none">
                                  {/** 事件执行后：分情况，如果是获得授权的事件，那就是---获得授权后
                                   * event.origin.toState
                                   */}
                                  <div className="event-next">
                                    {event.nextState && event.nextState.isAuth
                                      ? "获得授权后"
                                      : "执行成功后:"}
                                  </div>
                                  {event.nextState &&
                                    event.nextState.eventTranslateInfos.map(
                                      (nextEvent: any, index: number) => {
                                        return (
                                          <div
                                            key={index}
                                            className="flex-row align-center"
                                          >
                                            <div className="event-dot mr-5"></div>
                                            <span>{nextEvent.content}</span>
                                          </div>
                                        );
                                      }
                                    )}
                                </div>
                              </label>
                            </div>
                          );
                        }
                      )
                  }
                </div>
              </div>
              {/* 流转记录 */}
              {unfold &&
                records.slice(1).map((item: any, index: number) => {
                  return (
                    <div
                      className="status-card  mt-15 contract-records"
                      key={index}
                    >
                      <div className="flex-row">
                        <div
                          className={
                            "auth-status text-center select-none " +
                            item.authClass
                          }
                        >
                          {item.authStatus}
                        </div>
                        <div className="auth-time">
                          {moment(item.time).format("YYYY-MM-DD HH:mm:ss")}
                        </div>
                      </div>
                      <div className="flex-row py-10 space-between align-center">
                        <div>{item.stateInfoStr}</div>
                      </div>
                    </div>
                  );
                })}
              {totalItem > 1 && (
                <div className="fluent-record text-align-center cur-pointer select-none mt-20">
                  {!unfold ? (
                    <div
                      onClick={(e) => {
                        getRecords();
                      }}
                    >
                      {" "}
                      展开完整流转记录
                      <DownOutlined />
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
              )}
            </div>
            <div className="contract-code pt-12">
              <div>合同编号： {props.contract.contractId}</div>
              <div>
                签约时间：
                {moment(props.contract.updateDate).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
          </div>
        </Tabs.Tab>
        <Tabs.Tab title="策略内容" key="policy">
          <div className="">
            <PolicyContent
              translateInfo={props.policy.translateInfo}
            ></PolicyContent>
          </div>
        </Tabs.Tab>
        {/* <Tabs.Tab title="状态机视图" key="statusDAG">
          <div className="">
            <PolicyGraph policy={props.policy}></PolicyGraph>
          </div>
        </Tabs.Tab> */}
        <Tabs.Tab title="策略代码" key="policyCode">
          <div className="">
            <PolicyCode policyText={props.policy.policyText}></PolicyCode>
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
}
