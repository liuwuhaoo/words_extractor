import React, { useRef, useMemo } from "react";
import PageView from "./PageView";
import { usePageCount } from "./DataContext.js";
import Pattern from "./Pattern";

export default function Pages(path) {
    const messageRef = useRef(null);

    const { pageCount, isLoading } = usePageCount();

    const pageList = useMemo(() => {
        return Array.from({ length: pageCount });
    }, [pageCount]);

    const showMessage = (msg) => {
        if (messageRef.current) {
            messageRef.current.textContent = msg;
        }
    };

    const clearMessage = () => {
        showMessage("");
    };

    if (isLoading) {
        showMessage("Loading...");
    } else {
        clearMessage();
    }

    const pageViews = pageList.map((page, index) => {
        return <PageView key={index} pageNumber={index} zoom={96} />;
    });

    return (
        <div>
            <Pattern />
            <div ref={messageRef}>Loading MuPDF.js...</div>
            <div id="pages">{pageViews}</div>
        </div>
    );
}
