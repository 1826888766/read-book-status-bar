import biquge from "./biquge"
import { Dirvers } from "../interface/dirvers"
interface StringArray {
    [index: string]: Dirvers;   //索引签名
  }
let json:StringArray = {
    'biquge':biquge
}
export default json
