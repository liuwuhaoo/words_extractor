import React, { useState, useEffect, useRef, useMemo } from "react";
import PageView from "./PageView";
import useWorker from "./useWorker.js";
import {usePageCount} from "./DataContext.js";

export default function Pages(path) {
    const messageRef = useRef(null);

    // const worker = useWorker("/worker.js");
    // const [currentDoc, setCurrentDoc] = useState(null);
    // // const [pageCount, setPageCount] = useState(0);
    // const [pageSize, setPageSize] = useState(null);
    // const [pageList, setPageList] = useState([]);
    // const [zoom, setZoom] = useState(96);
    const { pageCount, isLoading } = usePageCount();

    const pageList = useMemo(() => {
        return Array.from({ length: pageCount });
    }, [pageCount])

    const showMessage = (msg) => {
        if (messageRef.current) {
            messageRef.current.textContent = msg;
        }
    };

    const clearMessage = () => {
        showMessage("");
    }

    if (isLoading) {
        showMessage("Loading..."); 
    } else {
        clearMessage();
    }

    const pageViews = pageList.map((page, index) => {
        return (
            <PageView
                key={index}
                pageNumber={index}
                zoom={96}
            />
        );
    });

    // useEffect(() => {
    //     const open_document_from_url = async (path) => {
    //         try {
    //             showMessage("Loading " + path);
    //             let response = await fetch(path);
    //             if (!response.ok) throw new Error("Could not fetch document.");
    //             // const buffer = await response.arrayBuffer();
    //             console.log("calling openDocumentFromBuffer");
    //             worker.openDocumentFromBuffer(await response.arrayBuffer(), "pdf").then((docId) => {
    //                 console.log("openDocumentFromBuffer returned docId: ", docId);
    //                 setCurrentDoc(docId);
    //             });
    //         } catch (error) {
    //             showMessage(error.name + ": " + error.message);
    //             console.error(error);
    //         }
    //     };
    //     if (worker) {
    //         setTimeout(() => {
    //             open_document_from_url("test.pdf");
    //         }, 1000);
    //     }
    //     return () => {};
    // }, [worker]);

    // useEffect(() => {
    //     if (worker && currentDoc) {
    //         worker.documentTitle(currentDoc).then((title) => {
    //             document.title = title || document.title;
    //         });
    //     }
    // }, [currentDoc, worker]);

    // useEffect(() => {
    //     if (worker && currentDoc) {
    //         worker.countPages(currentDoc).then((count) => {
    //             setPageCount(count);
    //             setPageList(Array.from({ length: count }));
    //         });
    //     }
    // }, [currentDoc, worker]);

    return (
        <div>
            <div ref={messageRef}>Loading MuPDF.js...</div>
            <div id="pages">{pageViews}</div>
            {/* <main id="page-panel"></main>
            <footer id="search-panel" style={{ display: "none" }}>
                <input
                    id="search-input"
                    type="search"
                    size="40"
                    placeholder="Search..."
                />
                <div id="search-status"></div>
            </footer> */}
            {/* {isShown && <Script src="viewer.js" onLoad={onViewerLoad} />} */}
        </div>
    );
}
