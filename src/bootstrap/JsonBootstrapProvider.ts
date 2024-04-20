import { IBootstrapProvider } from "./IBootstrapProvider";
import { deserializeAll } from "../store/serialization";
import { IDataSourceUpdates } from "../store/IDataSourceUpdates";
import { IStoreDataStorage } from "../store/store";
import { isNullOrUndefined } from "../utils/isNullOrUndefined";
import { IFlag } from "../evaluation/data/IFlag";

export class JsonBootstrapProvider implements IBootstrapProvider {
  private dataSet?: IStoreDataStorage;

  constructor(jsonStr: string) {
    let flags = JSON.parse(jsonStr);
    if (!flags) {
      throw new Error("Invalid JSON");
    }

    flags = flags.map((flag: IFlag) => ({...flag, variationOptions: flag.variationOptions || [{id: null, variation: flag.variation}]}));

    const data = deserializeAll(flags);
    this.dataSet = {
      flags: data.flags,
      version: 0
    };
  }

  populate(userKeyId: string, dataSourceUpdates: IDataSourceUpdates, callback?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isNullOrUndefined(this.dataSet)) {
        return resolve();
      }

      const internalCallback = () => {
        resolve();
        callback?.();
      }

      dataSourceUpdates.init(userKeyId, this.dataSet!, internalCallback);
    });
  }
}