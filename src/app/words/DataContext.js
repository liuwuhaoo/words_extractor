import {
    createContext,
    useReducer,
    useContext,
    useCallback,
    useState,
    useEffect,
    useMemo,
} from "react";
import useWorker from "./useWorker.js";

const initialState = {
    docId: 0,
    title: "",
    pageCount: 0,
    currentPage: 0,
    pages: {},
    worker: null,
    zoom: 96,
    pattern: /^(der|die|das|dem|den)[\s\xA0]([a-zA-ZäöüßÄÖÜ]+)$/,
};

function reducer(state, action) {
    const { type, payload } = action;
    switch (type) {
        case 'UPLOAD_FILE':
            return { ...state, title: payload.title, arrayBuffer: payload.arrayBuffer };     
        case "SET_PATTERN":
            return { ...state, pattern: payload };
        case "UPDATE_PAGE_COUNT":
            return { ...state, pageCount: payload.pageCount };
        case "UPDATE_DOC_ID":
            return { ...state, docId: payload.docId };
        case "UPDATE_PAGE":
            return {
                ...state,
                pages: {
                    ...state.pages,
                    [payload.pageNumber]: {
                        ...state.pages[payload.pageNumber],
                        ...payload.pageInfo,
                    },
                },
            };
        case "UPDATE_SEARCH": {
            const { pageNumber, text, res } = payload;
            const searchData = state.pages[pageNumber].searchData || [];
            return {
                ...state,
                pages: {
                    ...state.pages,
                    [pageNumber]: {
                        ...state.pages[pageNumber],
                        searchData: { ...searchData, [text]: res },
                    },
                },
            };
        }
        case "REMOVE_SEARCH": {
            const { pageNumber, text } = payload;
            const searchData = state.pages[pageNumber].searchData || [];
            return {
                ...state,
                pages: {
                    ...state.pages,
                    [pageNumber]: {
                        ...state.pages[pageNumber],
                        searchData: Object.keys(searchData).reduce(
                            (acc, key) => {
                                if (key !== text) {
                                    acc[key] = searchData[key];
                                }
                                return acc;
                            },
                            {}
                        ),
                    },
                },
            };
        }
        case "UPDATE_SEARCH_GROUP": {
            const { pageNumber, patternSearch } = payload;
            const searchData = state.pages[pageNumber].searchData || [];
            return {
                ...state,
                pages: {
                    ...state.pages,
                    [pageNumber]: {
                        ...state.pages[pageNumber],
                        searchData: {
                            ...searchData,
                            ...patternSearch,
                        },
                    },
                },
            };
        }
        case "SEARCH_PATTERN_MATCHES": {
            const { pattern, pages } = state;
            let regex;

            try {
                regex = new RegExp(pattern);
            } catch (e) {
                console.error("Invalid regex:", e);
                return state;
            }

            for (let i = 0; i < Object.keys(pages).length; i++) {
                const page = pages[i];
                const searchData = {};
                const {textData: {blocks} = {}} = page;
                for (let j = 0; j < blocks.length; j++) {
                    const lines = blocks[j].lines;
                    for (let k = 0; k < lines.length; k++) {
                        const line = lines[k];
                        if (regex.test(line.text.trim())) {
                            searchData[line.text.trim()] = [line.bbox];
                        }
                    }
                }
                page.searchData = searchData;
            }
            return { ...state, pages };
        }
        default:
            return state;
    }
}

const MyContext = createContext(initialState);

export function DataProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const worker = useWorker("/worker.js");

    const contextValue = useMemo(() => {
        return { state, dispatch, worker };
    }, [state, dispatch, worker]);

    return (
        <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
    );
}

export function useMyContext() {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error("useMyContext must be used within a MyProvider");
    }
    return context;
}

function useDocId() {
    const { state } = useMyContext();
    return { docId: state.docId };
}

export function usePageCount() {
    const { state, dispatch, worker } = useMyContext();
    const [isLoading, setIsLoading] = useState(false);

    const { docId, isLoading: docLoading } = useDocId();

    const fetchPageCount = useCallback(async () => {
        if (!worker) return;
        setIsLoading(true);
        const pageCount = await worker.countPages(docId);
        dispatch({ type: "UPDATE_PAGE_COUNT", payload: { pageCount } });
        setIsLoading(false);
    }, [worker, dispatch, docId]);

    useEffect(() => {
        if (state.pageCount === 0 && !isLoading && docId !== 0) {
            fetchPageCount();
        }
    }, [fetchPageCount, state.pageCount, isLoading, docId]);

    return { pageCount: state.pageCount, isLoading };
}

export function usePage(pageNumber) {
    const { state, worker, dispatch } = useMyContext();
    const [isLoading, setIsLoading] = useState(false);

    const fetchPage = useCallback(async () => {
        if (!worker) return;
        setIsLoading(true);
        const pageInfo = await worker.getPage(
            state.docId,
            pageNumber,
            state.zoom * devicePixelRatio
        );
        dispatch({ type: "UPDATE_PAGE", payload: { pageNumber, pageInfo } });
        setIsLoading(false);
    }, [worker, state.docId, pageNumber, dispatch, state.zoom]);

    useEffect(() => {
        if (!state.pages[pageNumber] && !isLoading && state.docId !== 0) {
            fetchPage();
        }
    }, [fetchPage, isLoading, pageNumber, state.pages, state.docId]);

    return { page: state.pages[pageNumber], isLoading };
}

export function useAllPages() {
    const { state: {docId, pageCount, pages}, worker, dispatch } = useMyContext();
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllPages = useCallback(async () => {
        if (!worker) return;
        setIsLoading(true);
        for (let i = 0; i < state.pageCount; i++) {
            if (pages[i]) continue;
            const pageInfo = await worker.getPage(
                state.docId,
                i,
                state.zoom * devicePixelRatio
            );
            dispatch({ type: "UPDATE_PAGE", payload: { pageNumber: i, pageInfo } });
        }
        setIsLoading(false);
    }, [pages, worker, dispatch]);

    useEffect(() => {
        if (pageCount > 0 && !isLoading && docId !== 0) {
            fetchAllPages();
        }
    }, [fetchAllPages, isLoading, pageCount, docId]);

    return { pages: pages, isLoading };
}
