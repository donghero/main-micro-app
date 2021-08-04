import { Radio, Input, Space } from 'antd';
import { useState, useEffect } from "react";
import './contract.scss'

interface ItemProps {
  contract: any;
  children?: any;
}
export default function (props: ItemProps) {
  const [value, setValue] = useState(1);
  function onChange(e:any){

  }
  return (
    <div className="contract-card px-20 py-15 mt-15 w-100x">
      <div className="flex-row w-100x">
        <div className="contract-name  text-ellipsis">策略名称</div>
        <div className="policy-button cur-pointer  shrink-0">策略内容</div>
      </div>
      {/* 状态整体 */}
      <div>
        <div className="flex-row">
          <div>授权状态</div>
          <div>当前状态到达时间</div>
        </div>
        <div className="flex-row">
          <div>当前无授权，请选择执行事件</div>
          <div>支付</div>
        </div>
        {/* 可选事件 */}
        <div>
          <div className="flex-row">
            <Radio.Group onChange={onChange} value={value}>
              <div className="flex-column">
                <Radio value={1}>
                  <div className="flex-column">支付10fetch获取授权</div>
                </Radio>
                <Radio value={2}>Option B</Radio>
                <Radio value={3}>Option C</Radio>
                <Radio value={4}>
                  More...
                  {value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}
                </Radio>
              </div>
            </Radio.Group>
          </div>
        </div>
      </div>
    </div>
  );
}
