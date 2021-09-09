
import { placeHolder } from "../../base";

export type User = {
  login: any;
  loginOut: any;
  getCurrent: any;
  getAccount:any;
  getAuthCode: any;
  postRegister:any
};

const user:User = {
  login: {
    url: `passport/login`,
    method: "post",
    dataModel: {
      loginName: "string",
      password: "string",
      isRemember: "string",
      returnUrl: "string",
      jwtType: "string",
    },
  },
  loginOut: {
    url: `passport/logout`,
    method: "post",
    params: {
      returnUrl: "string",
    },
  },
  getCurrent: {
    url: `users/current`,
    method: "get",
  },
  getAccount:{
    url: `accounts/individualAccounts/${placeHolder}`,
    method: "get",
  },
  postRegister:{
    url: `users`,
    method: "post",
    dataModel: {
      loginName: "string",
      password: "string",
      username: "string",
      authCode: "string",
    }
  },
  getAuthCode:{
    url: `messages/send`,
    method: "post",
    dataModel: {
      loginName: "string",
      authCodeType: "string",
    }
  }
};

 

export default user;
