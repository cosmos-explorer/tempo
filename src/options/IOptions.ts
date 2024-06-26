import { ILogger } from "../logging/ILogger";
import { IDataSynchronizer } from "../data-sync/IDataSynchronizer";
import { IClientContext } from "./IClientContext";
import { IDataSourceUpdates } from "../store/IDataSourceUpdates";
import { VoidFunction } from "../utils/VoidFunction";
import { IStore } from "../platform/IStore";
import { DataSyncModeEnum } from "../data-sync/DataSyncMode";
import { IUser } from "./IUser";
import { IFlagBase } from "../evaluation";

export interface IOptions {
  /**
   * The user for whom you are evaluating feature flags.
   */
  user?: IUser;

  /**
   * How long the client constructor will block awaiting a successful connection to FeatBit, in milliseconds.
   *
   * Defaults to 5000 milliseconds.
   */
  startWaitTime?: number;

  /**
   * The SDK key for your FeatBit environment.
   */
  sdkKey?: string;

  /**
   * The mode to sync flag end segment data with the FeatBit server. See {@link DataSyncModeEnum} for possible values.
   *
   * Defaults to {@link DataSyncModeEnum.STREAMING}.
   */
  dataSyncMode?: DataSyncModeEnum;

  /**
   * The base URI of the data-sync service, mandatory if the {@link dataSyncMode} is set to {@link DataSyncModeEnum.STREAMING}.
   */
  streamingUri?: string;

  /**
   * The base URI of the polling service, mandatory if the {@link dataSyncMode} option is set to {@link DataSyncModeEnum.POLLING}.
   */
  pollingUri?: string;

  /**
   * The base URI of the event service
   */
  eventsUri?: string;

  /**
   * Whether this client is offline. If true, no calls to FeatBit will be made.
   *
   * Defaults to false
   */
  offline?: boolean;

  /**
   * The time between polling requests, in milliseconds. Ignored in data-sync mode.
   *
   * Defaults to 30 000 milliseconds.
   */
  pollingInterval?: number;

  /**
   * The interval in between flushes of events queue, in milliseconds.
   *
   * The default value is 2 000 milliseconds.
   */
  flushInterval?: number;

  /**
   * The max number of events in the events queue.
   * defaults to 10 000
   */
  maxEventsInQueue?: number;

  /**
   * Configures a logger for warnings and errors generated by the SDK.
   *
   * The logger can be any object that conforms to the {@link ILogger} interface.
   * For a simple implementation that lets you filter by log level, see
   * {@link BasicLogger}. You can also use an instance of `winston.Logger` from
   * the Winston logging package.
   *
   * If you do not set this property, the SDK uses {@link BasicLogger} with a
   * minimum level of `info`.
   */
  logger?: ILogger;

  /**
   * The interval in between sending WebSocket ping messages to evaluation server, in milliseconds.

   * Defaults to 18 000 milliseconds.
   */
  webSocketPingInterval?: number;

  /**
   * The flags to bootstrap the client, which should be the string representation of type {@link IFlagBase[]}.
   */
  bootstrap?: IFlagBase[];

  /**
   * The store to use for caching feature flag data.
   *
   * Defaults to {@link InMemoryStore}.
   */
  store?: IStore | ((options: IOptions) => IStore);

  /**
   * A component that obtains feature flag data and puts it in the store.
   *
   * Defaults to {@link WebSocketDataSynchronizer}.
   */
  dataSynchronizer?:
    | object
    | ((
    clientContext: IClientContext,
    store: IStore,
    dataSourceUpdates: IDataSourceUpdates,
    initSuccessHandler: VoidFunction,
    errorHandler?: (e: Error) => void,
  ) => IDataSynchronizer);
}