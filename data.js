import { html, useState, useContext, createContext, useEffect, useCallback } from '/lib/preact.js';
import { useNavigation } from '/navigator.js';
import {Web3Modal} from '/web3modal.js';



const dataContext = createContext();
export
const useData = () => useContext(dataContext);

export
function shortenAddress(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let REGISTERED_USER = true;

async function getUpalaInfo(wallet) {
    if (!REGISTERED_USER)
        return null;

    return {
        upalaId: 123456,
        groups: [
            {id: "0x249bdb4499bd7c683664C149276C1D86108E2137", title: "BladerunnerDAO", score: 100},
            {id: "0x75b2c6ac74bbaa5de5b3ab273b7ab2d7a74f8e1a", title: "Olde Github ", score: 50},
            {id: "0x0e103926416D4b06C2F4FB3931Cf8D36a1Ca20D6", score: 1}
        ],
        addresses: [
            "0x50f461F471e7dCe973e27f0e319eBe868135D764",
            "0x401F6c983eA34274ec46f84D70b31C151321188b",
            "0xe95C4707Ecf588dfd8ab3b253e00f45339aC3054"
        ]
    }
}

const groupInfos = {
    "0x249bdb4499bd7c683664C149276C1D86108E2137": {
        description: "Score aggregator, that monitors your score accross multiple identity systems - group details"
    }
}

let actionNum = 0;
let runningActions = new Set();

export
function DataProvider({children}) {
    const nav = useNavigation();
    const [wallet, setWallet] = useState(null);
    const [upalaInfo, setUpalaInfo] = useState(null);
    const [running, setRunning] = useState(false);

    const startAction = useCallback(() => {
        let aid = ++actionNum;
        runningActions.add(aid);
        setRunning(true);
        return aid;
    });
    const finishAction = useCallback((aid) => {
        runningActions.delete(aid);
        setRunning(runningActions.size > 0);
    });

    const connectWallet = async () => {
        let aid = startAction();
        let res;
        try {
            await timeout(1000);
            res = await Web3Modal.connect();
        }
        finally {
            finishAction(aid);
        }

        if (res) {
            setWallet(res);
            aid = startAction();
            try {
                const info = await getUpalaInfo(res);
                setUpalaInfo(info);
            }
            finally {
                finishAction(aid);
            }
        }
    };

    const disconnect = async () => {
        const aid = startAction();
        try {
            await Web3Modal.disconnect(wallet.provider);
            setWallet(null);
        }
        finally {
            finishAction(aid);
        }
    }

    const registerUser = async () => {
        let aid = startAction();
        try {
            REGISTERED_USER = true;
            const info = await getUpalaInfo(wallet);
            setUpalaInfo(info);
        }
        finally {
            finishAction(aid);
        }
    }

    const fetchGroupInfo = async (id) => {
        let aid = startAction();
        try {
            await timeout(1000);
            return groupInfos[id];
        }
        finally {
            finishAction(aid);
        }
    }

    const item = nav.pathItems;

    return html`
        <${dataContext.Provider} value=${
            {
                wallet,
                connectWallet,
                disconnect,
                upalaInfo,
                registerUser,
                fetchGroupInfo,
                running
            }
        }>
            ${children}
        </>
    `
}