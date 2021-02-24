import W3M from '/lib/web3modal.module.js';
import '/lib/web3.min.js';

class MockProvider {
    constructor (options) {
        const prov = this;
        return new Proxy({}, {
            get(target, name) {
                if (prov[name])
                    return prov[name];
                console.log(name);
            }
          })
    }

    async enable() {
        return true;
    }

    sendAsync(data, callback) {
        let result = null;
        let error = null;
        if (data.method == "eth_accounts") {
            result = {
                "id": data.id,
                "jsonrpc": "2.0",
                "result": ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
            }
        }
        else {
            console.log("UNKNOWN METHOD", data);
            error = "UNKNOWN METHOD";
        }

        try {
            callback(error, result);
        }
        catch (e) {
            console.log(e);
        }
    }
}

const providerOptions = {
    "custom-mock": {
        display: {
          logo: 'data:image/gif;base64,R0lGODlhyADIAMIAAP/yAAoKCgAAAcRiAO0cJAAAAAAAAAAAACH5BAEAAAUALAAAAADIAMgAAAP+WLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru987//AoHBILBqPyKRyyWw6n9CodEqtWq/YrHbL7Xq/4LB4TC6bz+i0es1uu9/wuHxOr9vv+Lx+z+/7/4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5eaTAukCzOrry+3s6sjtAfUB8MP09vjC+vX8wfzdk/dLoL2B6YAZ3EfQ18J/DXs9ROjOobqDBwGSmHj+ENJEjSM42vN4ESPEhCdE1iOZzuTJiiVUBmApwCVFEO3aAdjJs+fOjo8+RuSQU53PowCAOhKK0kPRdEh9Km3EFCbRp1F7TmWkEylIC12zZt26KKzPrxXMij1KVpFanmgpvF3Ls22iuQDiTsBL1y6Yp4AD28yI1evQvUbprvX7JbDjnIMZFo2q1wFfxT9HnnnMuWZkingrN7iMmbGXzo8/g058VDQD0opNZ5F5ELNtw00jwL4tGwtte7eDwz1smbVwpL2v/K53PLjo3baTW1keoPnt58at19VsRqZW4NrPEi8AXbj02SUjf2cevifa8sHP+04/eH319sNzv86OP/P+ys302WRffzu9x19/8m2BWkvg9WcgVMepBseCnrHn4Hjw2WfThAvWRuCDAjQn4RsUenihfgtkuF1kgJiIn2xmDSDjAPYx4mJ7MBo3I40rzrTIjeHlCOFOO9b4Y4MvcqebjjMaqYiLoR2YlJIQtLPjlTMmqAeUUuIlpABYYqllHlwOKZ6ZTi6ZTphXjolHmSHiFidbVD5gJZtZ1mnIQQT0ScBtfv7ZI4V3iqlnIXz6CaiigxK6Zphu3pFon4tS2qijbEZqx6SCYhaofY4+auh/jgCpXZE8oSqWpn2Yap2qAMAaFat8uNocrLIid6iNSLaHa5OL7fqIarf9KmNfwpaK+lmxwBLZ7FjJNkKsbcbyuGq0vKpH7bO50klqJ7YSmCYn4Yrrn4+elGsurYeoKy67e/ZqrrfogivvvONu4i6B8CJ6L77nguKigD0O7FK+mhhskoZIEhzwJwpjxLCFUy7co8ANH1xwxhY/LIpdIB/qmr6Hhvztfih+XPLKJ6c4HsYtK2ByvShb9UQCADs=',
          name: "Mock Provider",
          description: "Connect to the mocked provider account"
        },
        package: MockProvider,
        options: {
          apiKey: "DUMMY"
        },
        connector: async (MockProvider, options) => {
            const provider = new MockProvider(options);
            await provider.enable()
            return provider;
        }
    }
}

function promisify(fun, ...params) {
    return new Promise((resolve, reject) => {
      fun(...params, (err, data) => {
        if (err !== null) reject(err);
        else resolve(data);
      });
    });
  }


const web3Modal = new W3M.Web3Modal({
    cacheProvider: true,
    providerOptions,
    disableInjectedProvider: false,
});

async function connect() {
    try {
        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);
        const accounts = await promisify(web3.eth.getAccounts);
        return {provider: provider, web3: web3, address: accounts[0]};
    } catch(e) {
        console.log("Could not get a wallet connection", e);
        return;
    }
}

async function disconnect(provider) {
    if (provider.close) {
      await provider.close();
    }
    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
}

export
const Web3Modal = {
    connect,
    disconnect
};