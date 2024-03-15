
import { Handle } from "../models/handle";
import { User } from "../models/user";

export class HandleUtils {
  static getHandle(userValue: User): Handle {
    if (userValue != null) {
      let handle = new Handle();
      handle.accountId = userValue.id;
      handle.token = userValue.token;
      return handle;
    } else {
      return null;
    }
  }
}
