import React, { useState, useEffect, useRef } from "react";
import PageView from "./PageView";

// workerWrapper.js
export function createWorker() {
    const worker = new Worker("/worker.js", { type: "module" });
    const callbacks = new Map();
    let idCounter = 0;

    worker.onmessage = (event) => {
        const [type, id, data] = event.data;
        if (type === "INIT") {
            console.log("Worker initialized with methods:", data);
        } else if (type === "RESULT" || type === "ERROR") {
            const callback = callbacks.get(id);
            if (callback) {
                callback(
                    type === "RESULT" ? null : data,
                    type === "RESULT" ? data : null
                );
                callbacks.delete(id);
            }
        }
    };

    const workerApi = {};

    worker.postMessage(["INIT", 0, null]);

    return {
        call: (method, ...args) => {
            return new Promise((resolve, reject) => {
                const id = idCounter++;
                callbacks.set(id, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                worker.postMessage([method, id, args]);
            });
        },
        terminate: () => worker.terminate(),
    };
}

const openDocumentFromBuffer = async (buffer, magic, title, worker) => {
    currentDoc = await worker.openDocumentFromBuffer(buffer, magic);
    setCurrentDoc(currentDoc);

    document.title = (await worker.documentTitle(currentDoc)) || title;
    setTitle(document.title);

    var pageCount = await worker.countPages(currentDoc);
    setPageCount(pageCount);

    // Use second page as default page size (the cover page is often differently sized)
    var pageSize = await worker.getPageSize(currentDoc, page_count > 1 ? 1 : 0);
    setPageSize(pageSize);

    pageList = [];
    for (let i = 0; i < page_count; ++i)
        pageList[i] = new PageView(currentDoc, i, pageSize, current_zoom);

    for (let page of pageList) {
        document.getElementById("pages").appendChild(page.rootNode);
        page_observer.observe(page.rootNode);
    }

    var outline = await worker.documentOutline(currentDoc);
    if (outline) {
        build_outline(document.getElementById("outline"), outline);
        show_outline_panel();
    } else {
        hide_outline_panel();
    }

    clear_message();

    current_search_needle = "";
    current_search_page = 0;
};

export default function Pages(path) {
    const messageRef = useRef(null);
    const [worker, setWorker] = useState(null);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [title, setTitle] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(null);
    const [pageList, setPageList] = useState([]);
    const [zoom, setZoom] = useState(96);

    const pageViews = pageList.map((page, index) => {
        return (
            <PageView
                key={index}
                doc={currentDoc}
                number={index}
                size={pageSize}
                zoom={zoom}
            />
        );
    });

    useEffect(() => {
        const open_document_from_url = async (path) => {
            try {
                show_message("Loading " + path);
                let response = await fetch(path);
                if (!response.ok) throw new Error("Could not fetch document.");
                // const buffer = await response.arrayBuffer();
                console.log("calling openDocumentFromBuffer")
                worker
                    .call("openDocumentFromBuffer",  await response.arrayBuffer(), "pdf")
                    .then((docId) => {
                        console.log("openDocumentFromBuffer returned docId: ", docId)
                        setCurrentDoc(docId);
                    });

               
            } catch (error) {
                show_message(error.name + ": " + error.message);
                console.error(error);
            }
        };
        if (worker) {
            console.log("calling open_document_from_url")
            open_document_from_url("test.pdf");
        }
        return () => {};
    }, [worker]);

    useEffect(() => {
        if (worker && currentDoc) {
            worker.call("documentTitle", currentDoc).then((title) => {
                document.title = title || document.title;
            });
        }
    }, [currentDoc, worker]);

    useEffect(() => {
        const newWorker = createWorker();
        setWorker(newWorker);
        return () => {
            console.log("Terminating worker...");
            if (newWorker) {
                newWorker.terminate();
            }
        };
    }, []);

    const show_message = (msg) => {
        if (messageRef.current) {
            messageRef.current.textContent = msg;
        }
    };

    return (
        <div>
            <div ref={messageRef}>Loading MuPDF.js...</div>
            <div id="pages">{pageViews}</div>
            <main id="page-panel"></main>
            <footer id="search-panel" style={{ display: "none" }}>
                <input
                    id="search-input"
                    type="search"
                    size="40"
                    placeholder="Search..."
                />
                <div id="search-status"></div>
            </footer>
            {/* {isShown && <Script src="viewer.js" onLoad={onViewerLoad} />} */}
        </div>
    );
}
