/* @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { freelogAuth } from "freelog-runtime-core";

interface policyTipProps {
  currentExhibit: any;
  children?: any;
}
export default function PolicyTip({ currentExhibit }: policyTipProps) {
  const exhibitId = currentExhibit.exhibitId;
  const nodeName = freelogAuth.nodeInfo.nodeName;
  return (
    <>
      {currentExhibit._contracts.length > currentExhibit.contracts.length && (
        <div className="flex-row mt-10 ">
          <div className="fs-14 fc-less">查看已终止的合约请移至</div>
          <div
            onClick={() => {
              if (window.baseURL.indexOf("testfreelog") > -1) {
                window.open(
                  `https://user.testfreelog.com/logged/contract?exhibitId=${exhibitId}&nodeName=${nodeName}&status=terminated`
                );
                return;
              }
              window.open(
                `https://user.freelog.com/logged/contract?exhibitId=${exhibitId}&nodeName=${nodeName}&status=terminated`
              );
            }}
            className="ml-10 fs-14 fc-blue cur-pointer link"
          >
            合约管理
          </div>
        </div>
      )}
      {currentExhibit.policiesActive.some((item: any) => !item.contracted) ? (
        <div
          css={css`
            font-size: 12px;
            font-weight: 600;
            color: #7a869a;
          `}
          className="flex-1  mt-20 "
        >
          可签约的策略
        </div>
      ) : null}
    </>
  );
}
