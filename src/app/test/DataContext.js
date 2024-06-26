import { createContext, useReducer, useContext, useCallback, useState, useEffect, useMemo } from "react";
import useWorker from "./useWorker.js";

const initialState = {
    docId: 0,
    title: "",
    pageCount: 0,
    pages: {},
    worker: null,
    zoom: 96,
};

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_PAGE_COUNT":
            return { ...state, pageCount: action.payload.pageCount }; 
        case "UPDATE_DOC_ID":
            return { ...state, docId: action.payload.docId };
        case "UPDATE_PAGE":
            return { ...state, pages: { ...state.pages, [action.payload.pageNumber]: action.payload.pageInfo }};
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

const path = "test.pdf";

function useDocId() {
    const {state, worker, dispatch} = useMyContext();
    const [isLoading, setIsLoading] = useState(false);
    const open_document_from_url = useCallback(async () => {
        try {
            setIsLoading(true);
            let response = await fetch(path);
            if (!response.ok) throw new Error("Could not fetch document.");
            worker.openDocumentFromBuffer(await response.arrayBuffer(), "pdf").then((docId) => {
                console.log("openDocumentFromBuffer returned docId: ", docId);
                dispatch({ type: "UPDATE_DOC_ID", payload: { docId } });
                setIsLoading(false);
            });
        } catch (error) {
            show_message(error.name + ": " + error.message);
            console.error(error);
        }
    }, [worker, dispatch]); 

    useEffect(() => {
        if (worker && state.docId === 0) {
            open_document_from_url("test.pdf");
        }
        return () => {};
    }, [worker, open_document_from_url, state.docId]);

    return {docId: state.docId, isLoading};
}

export function usePageCount() {
    const { state, dispatch, worker } = useMyContext();
    const [isLoading, setIsLoading] = useState(false);

    const {docId, isLoading: docLoading} = useDocId();

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

    return {pageCount: state.pageCount, isLoading};
}

export function usePage(pageNumber) {
    const { state, worker, dispatch } = useMyContext();
    const [isLoading, setIsLoading] = useState(false);

    const fetchPage = useCallback(async () => {
        if (!worker) return;
        setIsLoading(true);
        const pageInfo = await worker.getPage(state.docId, pageNumber, state.zoom * devicePixelRatio);
        dispatch({ type: "UPDATE_PAGE", payload: { pageNumber, pageInfo}});
        setIsLoading(false);
    }, [worker, state.docId, pageNumber, dispatch, state.zoom]);

    useEffect(() => {
        if (!state.pages[pageNumber] && !isLoading) {
            fetchPage();
        }
    }, [fetchPage, isLoading, pageNumber, state.pages]);

    return {page: state.pages[pageNumber], isLoading};
}