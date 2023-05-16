import Init from "./init.js";
import { randomUUID } from 'crypto';
import { clean } from "./actions.js";

export const checkInitStatus = () => Init.inited
export const delay = (ms) => new Promise(res => setTimeout(res, ms))
export const setS3GlobalName = () => {
    const genUUID = 'Yellowtail-proj'
    Init.bucketName = 'app-bucket-' + genUUID
}
export const setSQSName = () => {
    const genUUID = randomUUID().toLocaleLowerCase()
    Init.sqsName = 'app-sqs-' + genUUID
}
export const cleanServicesBeforeExist = async () => {
    if (Init.inited && !Init.servicesCleaned) {
        await clean()
    }
}