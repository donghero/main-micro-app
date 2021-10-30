import { getCurrentUser, getUserInfo, setUserInfo } from './utils'
import {
    reisterUI,
    eventMap,
    failedMap,
    endEvent,
    updateLock,
    updateEvent,
    lowerUI,
    upperUI,
    loginCallback
} from '../../bridge/index'
 
import { SUCCESS, FAILED, USER_CANCEL } from '../../bridge/event'

export const freelogAuth = {
    reisterUI,
    eventMap,
    failedMap,
    endEvent,
    updateLock,
    updateEvent,
    lowerUI,
    upperUI,
    resultType: {
        SUCCESS, FAILED, USER_CANCEL
    },
    loginCallback,  
    setUserInfo,
    getCurrentUser,
    getUserInfo
}