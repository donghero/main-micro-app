import PolicyGraph from "./_components/policyGraph";
import PolicyCode from "./_components/policyCode";
import "./policy.scss";

import PolicyContent from "./_components/policyContent";
import Button from "../_components/button";
import { Checkbox } from "antd";

import { Tabs } from "antd";

const { TabPane } = Tabs;

interface ItemProps {
  policy: any;
  selectType: boolean;
  children?: any;
}
export default function (props: ItemProps) {
  console.log(props.policy);
  function callback(key: any) {
  }
  function onChange(e: any) {
    props.policy.checked = e.target.checked
  }
  return (
    <div className="flex-column policy-card">
      {/* 上：策略名称与操作 */}
      <div className="flex-row space-between px-20 py-15">
        <div className="flex-1 policy-name  text-ellipsis">策略名称，需要做省略</div>
        {props.selectType ? <Button className="fs-13">签约</Button>
       : <Checkbox onChange={onChange}>Checkbox</Checkbox>}
      </div>
      {/* 下：tab */}
      <div className="flex-column px-20">
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="策略内容" key="1">
            <PolicyContent translateInfo={props.policy.translateInfo}></PolicyContent>
          </TabPane>
          <TabPane tab="状态机视图" key="2">
            <PolicyGraph policy={props.policy}></PolicyGraph>
          </TabPane>
          <TabPane tab="策略代码" key="3">
            <PolicyCode policyText={props.policy.policyText}></PolicyCode>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
