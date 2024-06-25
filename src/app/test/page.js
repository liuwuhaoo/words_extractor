"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Pages from "./Pages";

export default function About() {
    const [isShown, setIsShown] = useState(false);
    useEffect(() => {
        setIsShown(true);
    }, []);

    const onViewerLoad = () => {
      setTimeout(() => {
        open_document_from_url("test.pdf");
      }, 500);
    };

    return (
        // <div>
        //     <main id="page-panel">
        //         <div id="message">Loading MuPDF.js...</div>
        //         <div id="pages"></div>
        //     </main>
        //     <footer id="search-panel" style={{ display: "none" }}>
        //         <input
        //             id="search-input"
        //             type="search"
        //             size="40"
        //             placeholder="Search..."
        //         />
        //         <div id="search-status"></div>
        //     </footer>
        //     {isShown && <Script src="viewer.js" onLoad={onViewerLoad} />}
        // </div>
        <Pages />
    );
}
