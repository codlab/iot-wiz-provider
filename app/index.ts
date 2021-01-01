console.log("test");
import Client from "./Client";

const client = new Client({
    defaultSendOptions: {},
    logLevel: "debug",
    logger: {
        'trace': console.trace,
        'debug': console.debug,
        'info': console.info,
        'warn': console.warn,
        'error': console.error,
        'silent': () => {}
    }
});

client.startDiscovery({});
