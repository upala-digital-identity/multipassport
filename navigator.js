import {html, useMemo, toChildArray, cloneElement, useCallback, createContext, useContext, useEffect} from '/lib/preact.js';



function regexparam (str, loose) {
    // https://github.com/lukeed/regexparam

	if (str instanceof RegExp) return { keys:false, pattern:str };
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
	};
}

function exec(path, result) {
    let i=0, out={};
    let matches = result.pattern.exec(path);
    while (i < result.keys.length) {
      out[ result.keys[i] ] = matches[++i] || null;
    }
    return out;
  }


const Navigation = createContext({});

export
const useNavigation = () => useContext(Navigation);

function parseUrl() {
    const res = {};
    const parts = location.pathname.split("/");
    for (let i = 1; i < parts.length; ++i) {
        if (parts[i] === 'projects')
            res.projectId = Number(parts[i+1]);
        else if (parts[i] === 'boards')
            res.boardId = Number(parts[i+1]);
        else if (parts[i] === 'tracks')
            res.trackId = Number(parts[i+1]);
        else if (parts[i] === 'tasks')
            res.taskId = Number(parts[i+1]);
    }
    return res;
}


export
function Navigator({children}) {
    const value = useMemo(() => ({
        push: (url) => {history.pushState({date: Date.now()}, null, url); this.setState(url)},
        replace: (url) => {history.replaceState({date: Date.now()}, null, url); this.setState(url)},
        back: () => {history.back(); this.setState({url: location.pathname})},
        pathItems: parseUrl()
    }));

    const onpopstate = useCallback(
        (e) => {
            this.setState({url: location.pathname});
            return false;
        },
    );
    const interceptLinkClick = useCallback(
        (e) => {
            if (e.target.nodeName === 'A' && e.target.href && e.target.href.startsWith(location.origin)) {
                e.preventDefault();
                value.push(e.target.href);
            }
        }
    )

    useEffect(() => {
        window.onpopstate = onpopstate;
        document.onclick = interceptLinkClick;
        return () =>  {
            window.onpopstate = null;
            document.onclick = null;
        }
    });

    return html`
        <${Navigation.Provider} value=${value}>
            ${children}
        </>
    `;
}

export
function Route({path, children}) {
    const regex = useMemo(() => regexparam(path), [path]);
    if (regex.pattern.test(location.pathname)) {
        const params = exec(location.pathname, regex);
        return toChildArray(children).map(c => cloneElement(c, {params}))
    }
}

export
function Router({children}) {
    const nav = useNavigation();

    for (const c of toChildArray(children)) {
        const regex = regexparam(c.props['if-match-url']);
        if (regex.pattern.test(location.pathname)) {
            const routeParams = exec(location.pathname, regex);
            return cloneElement(c, {routeParams});
        }
    }

    return null;
}
