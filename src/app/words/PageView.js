import React, { useEffect, useRef, useMemo } from "react";

import { useMyContext, usePage } from "./DataContext";
import HighlightLayer from "./HighlightLayer";
import TextLayer from "./TextLayer";
import SearchPanel from "./SearchPanel";

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
        if (!imageData || !canvasNodeRef.current || !canvasCtxRef.current) {
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
            className="flex justify-center my-8"
            style={
                size && {
                    // width: computeSize(size.width, zoom),
                    height: computeSize(size.height, zoom),
                }
            }
        >
            <div
                ref={rootNodeRef}
                className="page mr-4"
                style={
                    size && {
                        width: computeSize(size.width, zoom),
                        height: computeSize(size.height, zoom),
                    }
                }
            >
                <canvas
                    ref={canvasNodeRef}
                    className="page-canvas"
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
            <SearchPanel pageNumber={pageNumber} />
        </div>
    );
};

export default PageView;
