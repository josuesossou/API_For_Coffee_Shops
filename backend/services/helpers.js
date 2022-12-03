import Init from "./init.js";
import { randomUUID } from 'crypto';
import { clean } from "./actions.js";

export const checkInitStatus = () => Init.inited
export const delay = (ms) => new Promise(res => setTimeout(res, ms))
export const setS3GlobalName = () => {
    const genUUID = randomUUID().toLocaleLowerCase()
    Init.bucketName = 'coffee-app-' + genUUID
}
export const cleanServicesBeforeExist = async () => {
    if (Init.inited && !Init.servicesCleaned) {
        await clean()
    }
}