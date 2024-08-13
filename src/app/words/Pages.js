import React, { useMemo } from "react";
import PageView from "./PageView.js";
import { usePageCount, useMyContext } from "./DataContext.js";
import Pattern from "./Pattern.js";
import Upload from "./Upload.js"

export default function Pages(path) {
    const {
        state: { pages },
    } = useMyContext();

    const {pageCount} = usePageCount();

    const pageList = useMemo(() => {
        return Array.from({ length: pageCount });
    }, [pageCount]);


    const pageViews = pageList.map((page, index) => {
        return <PageView key={index} pageNumber={index} zoom={96} />;
    });

    return (
        <div>
            {pageCount > 0 && pages[pageCount - 1] ? (
                <>
                    <Pattern />
                    <div id="pages">{pageViews}</div>
                </>
            ) : (
                <Upload />
            )}
        </div>
    );
}
