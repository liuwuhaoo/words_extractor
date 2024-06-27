import React, { useState, useEffect, useRef, useMemo } from "react";

import { useMyContext, usePage } from "./DataContext";
import HighlightLayer from "./HighlightLayer";
import TextLayer from "./TextLayer";

const computeSize = (size, zoom) => (((size * zoom) / 72) | 0) + "px";

const PageView = ({ pageNumber }) => {
    const {
        state: { zoom },
    } = useMyContext();
    const { page: { size, imageData } = {} } = usePage(pageNumber);

    const rootNodeRef = useRef(null);
    const canvasNodeRef = useRef(null);
    const canvasCtxRef = useRef(null);

    useEffect(() => {
        if (!imageData) {
            return;
        }
        canvasNodeRef.current.width = imageData.width;
        canvasNodeRef.current.height = imageData.height;
        canvasCtxRef.current.putImageData(imageData, 0, 0);
    }, [imageData]);

    useEffect(() => {
        canvasCtxRef.current = canvasNodeRef.current.getContext("2d");
    }, [pageNumber]);

    return (
        <div
            ref={rootNodeRef}
            className="page"
            style={
                size && {
                    width: computeSize(size.width, zoom),
                    height: computeSize(size.height, zoom),
                }
            }
        >
            <canvas
                ref={canvasNodeRef}
                style={
                    size && {
                        width: computeSize(size.width, zoom),
                        height: computeSize(size.height, zoom),
                    }
                }
                zoom={zoom}
            />
            <TextLayer pageNumber={pageNumber} />
            <HighlightLayer pageNumber={pageNumber} />
        </div>
    );
};

export default PageView;
