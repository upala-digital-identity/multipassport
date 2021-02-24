import { html, useState, useEffect, createRef, createContext, useContext } from '/lib/preact.js';
import { useNavigation } from '/navigator.js';

export
const modal = createRef();

const modalContext = createContext();

export
const useModal = () => useContext(modalContext);

export
function Modal({children, url, backUrl}) {
    const nav = useNavigation();
    const [state, setState] = useState({content: children, url, backUrl});

    this.open = (content, url, backUrl) => {
        setState({content, url, backUrl});
    }

    this.close = () => {
        if (state.backUrl)
            nav.replace(state.backUrl);
        setState({});
    }

    if (state.content) {
        if (state.url)
            nav.push(state.url);
        return html`
            <div class='modal-background gentle-flex-center' onclick=${this.close}>
                <div class='modal' onclick=${(e) => e.stopPropagation()}>
                    <${modalContext.Provider} value=${this}>
                        ${children || state.content}
                    </>
                </div>
            </div>
        `;
    }
    return null;
}