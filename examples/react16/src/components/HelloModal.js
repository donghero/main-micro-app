import React, { useState } from 'react';
import { Button, Modal } from 'antd';

export default function () {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button onClick={() => {
        console.log('reload')
        window.location.reload();
        //setVisible(true);
      }}>CLICK ME</Button>
      <Modal visible={visible} onOk={() => setVisible(false)} onCancel={() => setVisible(false)} title="freelog">
        Probably the most complete micro-frontends solution you ever met
      </Modal>
    </>
  );
}
