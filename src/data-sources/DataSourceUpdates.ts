import { IDataSourceUpdates } from "../store/IDataSourceUpdates";
import {
  IStoreDataStorage,
  IStoreItem,
  IKeyedStoreItem
} from "../store/store";
import { IStore } from "../platform/IStore";
import { IDataKind } from "../IDataKind";
import NamespacedDataSet from "./NamespacedDataSet";
import DataKinds from "../store/DataKinds";

/**
 * @internal
 */
export default class DataSourceUpdates implements IDataSourceUpdates {

  constructor(
    private readonly store: IStore,
    private readonly hasEventListeners: () => boolean,
    private readonly onChange: (key: string) => void,
  ) {
  }

  init(userKeyId: string, allData: IStoreDataStorage, callback?: () => void): void {
    if (userKeyId !== this.store.user.keyId) {
      callback?.();
      return;
    }

    const checkForChanges = this.hasEventListeners();
    const doInit = (oldData?: IStoreDataStorage) => {
      this.store.init(allData, () => {
        // Defer change events so they execute after the callback.
        Promise.resolve().then(() => {
          if (checkForChanges) {
            const updatedFlags = new NamespacedDataSet<boolean>();
            Object.keys(allData).forEach((namespace) => {
              const oldDataForKind = oldData?.[namespace] || {};
              const newDataForKind = allData[namespace];
              const mergedData = {...oldDataForKind, ...newDataForKind};
              Object.keys(mergedData)
                .filter((key: string) => this.isUpdated(oldDataForKind && oldDataForKind[key], newDataForKind && newDataForKind[key]))
                .reduce((acc, key) => {
                  acc.set(namespace, key, true);
                  return acc;
                }, updatedFlags);
            });
            this.sendChangeEvents(updatedFlags);
          }
        });
        callback?.();
      });
    };

    if (checkForChanges) {
      const [flags, version] = this.store.all(DataKinds.Flags);
      const oldData = {
        flags,
        version
      };
      doInit(oldData);
    } else {
      doInit();
    }
  }

  upsert(userKeyId: string, kind: IDataKind, data: IKeyedStoreItem, callback: () => void): void {
    if (userKeyId !== this.store.user.keyId) {
      callback?.();
      return;
    }

    const {key} = data;
    const checkForChanges = this.hasEventListeners();
    const doUpsert = (oldItem?: IStoreItem) => {
      this.store.upsert(kind, data, () => {
        // Defer change events so they execute after the callback.
        Promise.resolve().then(() => {
          if (checkForChanges) {
            const updatedFlags = new NamespacedDataSet<boolean>();
            if (this.isUpdated(oldItem, data[key])) {
              updatedFlags.set(kind.namespace, key, true);
            }
            this.sendChangeEvents(updatedFlags);
          }
        });

        callback?.();
      });
    };
    if (checkForChanges) {
      const item = this.store.get(kind, key);
      doUpsert(item || undefined);
    } else {
      doUpsert();
    }
  }

  private isUpdated(oldData?: IStoreItem, newData?: IStoreItem): boolean {
    return !oldData || !newData || newData.version > oldData.version
  }

  private sendChangeEvents(dataSet: NamespacedDataSet<boolean>) {
    dataSet.enumerate((namespace, key) => {
      if (namespace === DataKinds.Flags.namespace) {
        this.onChange(key);
      }
    });
  }
}