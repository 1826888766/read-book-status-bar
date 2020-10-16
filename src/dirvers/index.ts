import biquge from "./biquge";
import qidian from "./qidian";
import zongheng from "./zongheng";


import { Dirvers } from "../interface/dirvers";
interface StringArray {
    [index: string]: Dirvers;   //索引签名
  }
let json:StringArray = {
    'biquge':biquge,
    'qidian':qidian,
    'zongheng':zongheng
};
export default json;
