import { html, render, useState, useContext, useEffect, useRef, useMemo, useCallback } from '/lib/preact.js';
import {Router, Navigator, useNavigation} from '/navigator.js';
import {Modal, modal} from '/Modal.js';
import {DataProvider, useData, shortenAddress} from '/data.js';


function Header({wallet}) {
    const appData = useData();

    const onclick = () => {
        modal.current.open(html`
            <div class='content-centered'>
                Disconnect wallet?
                <div>
                    <button onclick=${() => {appData.disconnect(); modal.current.close()}}>Yes</button>
                    <button onclick=${modal.current.close}>No</button>
                </div>
            </div>
        `)
    }

    return html`
        <header>
            <img class=logo src='/upala_logo.png' />
            ${wallet ? html`<button class='wallet' onclick=${onclick}>${shortenAddress(wallet.address)}</button>` : null}
        </header>
    `
}

function ExplodeButton({groupId}) {
    const nav = useNavigation();
    const [timer, setTimer] = useState(null);
    const start = useCallback(() => {
        setTimer(setTimeout(() => nav.push(`/group/${groupId}/explode`), 2000));
    });
    const stop = useCallback(() => {
        clearTimeout(timer);
        setTimer(null);
    })

    return html`
        <button class='explode ${timer ? 'active' : ''}'
            onmousedown=${start} ontouchstart=${start}
            onmouseup=${stop} onmouseleave=${stop} ontouchend=${stop}
        >
            Hold 10 sec to proceed to explosion
        </button>
    `
}


function Group({routeParams}) {
    const nav = useNavigation();
    const appData = useData();
    const initialInfo = appData.upalaInfo && appData.upalaInfo.groups[appData.upalaInfo.groups.findIndex(g => g.id === routeParams.groupId)];
    const [info, setInfo] = useState(initialInfo);

    useEffect(() => {
        const run = async () => {
            const extInfo = await appData.fetchGroupInfo(routeParams.groupId);
            setInfo({...info, ...extInfo});
        }
        run();
    }, [routeParams.groupId]);

    return html`
        <div id=group-form class='content-centered'>
            <div id='title'>${info.title || shortenAddress(info.id)}</div>
            <button>Visit group HQ</button>
            <div class='content-centered'>
                <div>Your score is</div>
                <div id='score'>\$${info.score}</div>
            </div>
            <div id='description'>${info.description}</div>
            <button>Join (if available)</button>
            <${ExplodeButton} groupId=${info.id}/>
            <button class='back' onclick=${nav.back}>← Back</button>
        </div>
    `
}

function Explode({routeParams}) {
    const nav = useNavigation();
    const appData = useData();
    const initialInfo = appData.upalaInfo && appData.upalaInfo.groups[appData.upalaInfo.groups.findIndex(g => g.id === routeParams.groupId)];
    const [info, setInfo] = useState(initialInfo);
    const pattern = 'EXPLODE';
    const [input, setInput] = useState('')
    const inputRef = useRef();

    useEffect(() => {
        const run = async () => {
            const extInfo = await appData.fetchGroupInfo(routeParams.groupId);
            setInfo({...info, ...extInfo});
        }
        run();
    }, [routeParams.groupId]);

    const oninput = useCallback((e) => {
        e.preventDefault();
        const char = e.data && e.data.toUpperCase();
        if (pattern[input.length] === char)
            setInput(input + char);
    });

    if (inputRef.current)
        inputRef.current.focus();

    return html`
        <div id=explode-form class='content-centered'>
            <div id='title'>${info.title || shortenAddress(info.id)}</div>
            <div class='content-centered'>
                <div>Your score is</div>
                <div id='score'>\$${info.score}</div>
            </div>
            <div id=description>
                You are about to explode in ${info.title} group (and everywhre in the Upala system).
                You’ll get \$${info.score}.
                BUT you are stealing from your friends.
                Type EXPLODE to make it irreversible.
            </div>
            <div>also explode in all groups</div>
            <input ref=${inputRef} id=explode-input oninput=${oninput} onblur=${(e) => setTimeout(() =>  inputRef.current && inputRef.current.focus(), 1)} tabindex=0 style='opacity:0' />
            <div id=chars>
                ${[...input].map(c => html`<span>${c}</span>`)}
                ${[...(new Array(pattern.length-input.length))].map(c => html`<span>–</span>`)}
            </div>
            <button disabled=${input!=pattern}>Bye, bye</button>
            <button class='back' onclick=${nav.back}>← Back</button>
        </div>
    `
}


function Address({groupId}) {
    return null
}

function Dashboard({upalaInfo}) {
    return html`
        <div id='user-id'>Your ID: <span>${upalaInfo.upalaId}</span></div>
        <div id=scores class='content-centered'>
            <span style='font-weight: bold'>Your scores</span>
            <span style='color: #A2A2A2'>See group details</span>
            ${(upalaInfo.groups || []).map(g => html`<a href='/group/${g.id}'>${g.title || shortenAddress(g.id)} - \$${g.score}</a>`)}
        </div>
        <div id=addresses class='content-centered'>
            <span style='font-weight: bold'>Your addresses</span>
            <span style='color: #A2A2A2'>Use these addresses with DApps requiring Upala ID</span>
            ${(upalaInfo.addresses || []).map(a => html`<a href='/address/${a}'>${shortenAddress(a)}</a>`)}
        </div>
        <button>Approve new</button>
    `
}




function Main() {
    const appData = useData();

    return html`
        <${Header} wallet=${appData.wallet}/>
        <main>
            <${Modal} ref=${modal} />
            <div id=content class='content-centered'>
            ${appData.running ? html`<div class='spinner'></div>` : null}
            ${
                !appData.wallet ? html`
                        <div class='main-message'>Wallet is not connected</div>
                        <button onclick=${appData.connectWallet}>Connect wallet</button>
                    `
                :
                !appData.upalaInfo ? html`
                        <div class='main-message'>Seems like you don’t have a Upala ID yet. Create one — join the resistance.</div>
                        <button onclick=${appData.registerUser}>Create ID</button>
                    `
                :
                html`<${Router}>
                    <${Explode} if-match-url='/group/:groupId/explode' />
                    <${Group} if-match-url='/group/:groupId' />
                    <${Address} if-match-url='/address/:addressId' />
                    <${Dashboard} if-match-url='/' upalaInfo=${appData.upalaInfo} />
                </>`
            }
            </div>
        </main>
        <footer>
            <a>About</a>
            <a>Docs</a>
            <a>Code</a>
        </footer>
    `
}

export
function renderApp() {
    return html`
        <${Navigator}>
        <${DataProvider}>
            <${Main} />
        </>
        </>
    `;
}
