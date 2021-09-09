import { SUCCESS, USER_CANCEL } from "../../bridge/event";
import React, { useState, useEffect } from "react";
import { LOGIN } from "../../bridge/event";
import "../../assets/mobile/index.scss";
import "./auth.scss";
import Login from "./user/login";
import Forgot from "./user/forgot";
import Register from "./user/register";

import Contract from "./contract/contract";
import Policy from "./policy/policy";
import frequest from "../../services/handler";
import presentable from "../../services/api/modules/presentable";
import Confirm from "./_components/confirm";
import { setUserInfo } from "../../platform/structure/utils";
import { loginCallback } from "../../platform/structure/event";
import contract from "../../services/api/modules/contract";
import { getCurrentUser } from "../../platform/structure/utils";
import getBestTopology from "./topology/data";
import { Modal, Button, WhiteSpace, WingBlank, Toast } from "antd-mobile";
const alert = Modal.alert;

interface contractProps {
  events: Array<any>;
  contractFinished(eventId: any, type: number, data?: any): any;
  loginFinished: any;
  children?: any;
  updateEvents: any;
}
export default function (props: contractProps) {
  /**
   * 对象形式authDatas：
   *   key: subjectId
   *   value: { policies: {policyId: }, contracts: {contractId: }，}
   * 在合约里面通过策略拿翻译
   * 流程：
   *     未授权过来需要整合数据
  *       widget: caller.name,
          errCode: response.data.errCode,
          authCode: response.data.data.authCode,
          contracts: response.data.data.data.contracts,
          policies: response.data.data.data.policies,
          presentableName,
          presentableId,
          info: response.data,
   *     点击展品：
   *         1.如果有合约则请求合约
   *         2.请求策略
   *     签约：
   *         签约后判断有无授权：
   *             1.授权：直接清除events
   *             2.未授权：更新events对应的数据
   *     执行事件：
   *             
   */
  const [isListVisible, setIsListVisible] = useState(false);
  // 1 登陆  2 注册   3 忘记密码
  const [modalType, setModalType] = useState(0);

  const [contracts, setContracts] = useState([]);
  const events = props.events || [];
  const [currentPresentable, setCurrentPresentable] = useState(events[0]);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Array<any>>([]);
  function closeCurrent() {
    if (events.length === 1) {
      // 如果只有一个，提示确定放弃签约
      alert("提示", "当前展品未获得授权，确定退出？", [
        { text: "取消", onPress: () => {} },
        {
          text: "确定",
          onPress: () => userCancel(),
        },
      ]);
    } else {
      // 否则弹出展品列表
      setIsListVisible(true);
    }
  }
  function paymentFinish() {
    getDetail();
  }
  function loginFinished(type: number, data?: any) {
    setUserInfo(data);
    loginCallback.forEach((func: any) => {
      func && func();
    });
    // TODO 重载插件需要把授权的也一并清除
    setModalType(0);

    props.loginFinished();
  }
  function showPolicy() {}
  async function getDetail(id?: string) {
    setSelectedPolicies([]);
    // userInfo 如果不存在就是未登录
    const userInfo: any = getCurrentUser();
    const con =
      userInfo &&
      (await frequest(contract.getContracts, "", {
        subjectIds: currentPresentable.presentableId,
        subjectType: 2,
        licenseeIdentityType: 3,
        licenseeId: userInfo.userId,
        isLoadPolicyInfo: 1,
        isTranslate: 1,
      }));
    if (!id) {
      const isAuth = con.data.data.some((item: any) => {
        if ((window.isTest && item.authStatus === 2) || item.authStatus === 1) {
          props.contractFinished(currentPresentable.eventId, SUCCESS);
          return true;
        }
      });
      if (!isAuth) {
        props.updateEvents({ ...currentPresentable, contracts: con.data.data });
      }
      return;
    }
    const res = await frequest(
      presentable.getPresentableDetail,
      [id || currentPresentable.presentableId],
      {
        isLoadPolicyInfo: 1,
        isTranslate: 1,
      }
    );
    /**
     * 获取
     */

    res.data.data.policies = res.data.data.policies.filter((i: any) => {
      return i.status === 1;
    });
    res.data.data.policies.forEach((item: any) => {
      const { policyMaps, bestPyramid, betterPyramids, nodesMap } =
        getBestTopology(item.fsmDescriptionInfo);
      item.policyMaps = policyMaps;
      item.bestPyramid = bestPyramid;
      item.betterPyramids = betterPyramids;
      item.nodesMap = nodesMap;
    });
    setPolicies(res.data.data.policies);
    if (con) {
      const contracts = con.data.data.filter((item: any) => {
        if (item.status === 0) {
          res.data.data.policies.some((i: any) => {
            if (item.policyId === i.policyId) {
              item.policyInfo = i;
              i.contracted = true;
              return true;
            }
          });
          return true;
        }
      });
      setContracts(contracts);
    }
  }
  useEffect(() => {
    const isExist = events.some((item: any) => {
      if (item.presentableId === currentPresentable.presentableId) {
        setCurrentPresentable(item);
        return true;
      }
    });
    !isExist && setCurrentPresentable(events[0]);
  }, [props.events]);
  useEffect(() => {
    currentPresentable && getDetail(currentPresentable.presentableId);
  }, [currentPresentable]);

  const userCancel = () => {
    props.contractFinished("", USER_CANCEL);
  };
  function policySelect(policyId: number, checked?: boolean, single?: boolean) {
    if (policyId) {
      if (checked) {
        if (single) {
          setSelectedPolicies([policyId]);
        } else {
          setSelectedPolicies([...selectedPolicies, policyId]);
        }
      } else {
        setSelectedPolicies(
          [...selectedPolicies].filter((item: any) => item !== policyId)
        );
      }
    } else {
      setSelectedPolicies([]);
    }
  }
  function act() {
    if (!getCurrentUser()) {
      setModalType(1);
      return;
    }
  }
  const getAuth = async (id: any) => {
    const subjects: any = [];
    policies.forEach((item: any) => {
      [...selectedPolicies, id].includes(item.policyId) &&
        subjects.push({
          subjectId: currentPresentable.presentableId,
          policyId: item.policyId,
        });
    });
    const userInfo: any = getCurrentUser();
    const res = await frequest(contract.contracts, [], {
      subjects,
      subjectType: 2,
      licenseeId: userInfo.userId + "",
      licenseeIdentityType: 3,
      isWaitInitial: 1,
    });
    if (res.data.isAuth) {
    }
    const isAuth = res.data.data.some((item: any) => {
      if ((window.isTest && item.authStatus === 2) || item.authStatus === 1) {
        Toast.success("获得授权", 2);
        setTimeout(() => {
          props.contractFinished(currentPresentable.eventId, SUCCESS);
        }, 2000);
        return true;
      }
    });
    if (!isAuth) {
      Toast.success("签约成功", 2);
      setTimeout(() => {
        props.updateEvents({ ...currentPresentable, contracts: res.data.data });
      }, 2000);
    }
  };
  return (
    <div id="runtime-mobile" className="w-100x h-100x over-h">
      {modalType === 1 ? (
        <Login loginFinished={loginFinished} visible={modalType === 1} setModalType={setModalType}/>
      ) : modalType === 0 ? (
        <Register visible={modalType === 0} setModalType={setModalType}/>
      ) : modalType === 3 ? (
        <Forgot visible={modalType === 3} setModalType={setModalType}/>
      ) : null}
      <Modal
        popup
        visible={isListVisible}
        maskClosable={false}
        animationType="slide"
        wrapClassName="presentable-list"
      >
        <div className="flex-row space-between px-15 py-20 list-title">
          <div className="list-title-name">展品列表</div>
          <div
            className="list-exit"
            onClick={() => {
              alert("提示", "当前还有展品未获得授权，确定退出？", [
                { text: "取消", onPress: () => {} },
                {
                  text: "确定",
                  onPress: () => userCancel(),
                },
              ]);
            }}
          >
            退出
          </div>
        </div>
        {events.length
          ? events.map((item: any, index: number) => {
              if (item.event === LOGIN) return null;
              return (
                <div
                  key={index}
                  onClick={() => {
                    setIsListVisible(false);
                    setCurrentPresentable(item);
                  }}
                  className={
                    (currentPresentable === item
                      ? "presentable-selected "
                      : "") +
                    " px-15 py-15 presentable-item  flex-row space-between algin-center"
                  }
                >
                  <div className="flex-1 flex-column over-h">
                    <div
                      className="presentable-name text-ellipsis flex-1 flex-row align-center"
                      title={item.presentableName}
                    >
                      <span className="text-ellipsis">
                        {item.presentableName}
                      </span>
                    </div>
                    {!item.contracts.length ? null : (
                      <div className="flex-row pt-10">
                        {item.contracts.map((contract: any, index: number) => {
                          return (
                            <div
                              className={
                                "contract-tag flex-row align-center mr-5"
                              }
                              key={index}
                            >
                              <div className="contract-name">
                                {contract.contractName}
                              </div>
                              <div
                                className={
                                  "contract-dot ml-6 " +
                                  (contract.authStatus === 128
                                    ? "bg-auth-none"
                                    : !window.isTest &&
                                      contract.authStatus === 1
                                    ? "bg-auth"
                                    : "bg-auth-none")
                                }
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-center pl-10 fs-24">&gt;</div>
                </div>
              );
            })
          : null}
      </Modal>
      <div className="flex-column w-100x h-100x over-h">
        <div className="flex-column justify-center bb-1">
          <div className="text-center mt-20 fs-16 fc-main fw-bold">签约</div>
          <div
            className="p-absolute fs-16 mt-20 mr-15 rt-0 fc-blue cur-pointer"
            onClick={() => closeCurrent()}
          >
            {events.length === 1 ? "退出" : "关闭"}
          </div>
          <div className="text-center my-20 fs-20 fc-main fw-bold">
            {currentPresentable.presentableName}
          </div>
          {!currentPresentable.contracts.length ? null : (
            <div className="flex-row justify-center mb-15">
              {currentPresentable.contracts.map(
                (contract: any, index: number) => {
                  return (
                    <div
                      className={"contract-tag flex-row align-center mr-5"}
                      key={index}
                    >
                      <div className="contract-name">
                        {contract.contractName}
                      </div>
                      <div
                        className={
                          "contract-dot ml-6 " +
                          (contract.authStatus === 128
                            ? "bg-auth-none"
                            : !window.isTest && contract.authStatus === 1
                            ? "bg-auth"
                            : "bg-auth-none")
                        }
                      ></div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
        <div className="flex-column flex-1 over-h">
          <div className="w-100x h-100x y-auto pb-20">
            {contracts.map((contract: any, index: number) => {
              return (
                <Contract
                  policy={contract.policyInfo}
                  contract={contract}
                  paymentFinish={paymentFinish}
                  key={index}
                ></Contract>
              );
            })}
            {policies.map((policy: any, index: number) => {
              return policy.contracted ? null : (
                <Policy
                  policy={policy}
                  key={index}
                  seq={index}
                  loginFinished={loginFinished}
                  setModalType={setModalType}
                  getAuth={getAuth}
                  policySelect={policySelect}
                  selectType={contracts.length ? true : true}
                ></Policy>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
