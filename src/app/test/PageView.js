import React, { useState, useEffect, useRef, useMemo } from "react";
import TextLayer from "./TextLayer";
import { useMyContext, usePage } from "./DataContext";

const computeSize = (size, zoom) => (((size * zoom) / 72) | 0) + "px";

const PageView = ({ pageNumber }) => {
    const { state: {zoom} } = useMyContext();
    const { page: { size, textData, imageData } = {}, isLoading } =
        usePage(pageNumber);

    console.log(zoom, imageData, textData)

    // const [size, setSize] = useState(null);
    // const [textData, setTextData] = useState(null);
    // const [searchData, setSearchData] = useState(null);
    // const [imageData, setImageData] = useState(null);

    const rootNodeRef = useRef(null);
    const canvasNodeRef = useRef(null);
    const canvasCtxRef = useRef(null);
    const textNodeRef = useRef(null);
    const searchNodeRef = useRef(null);

    // useEffect(() => {
    //     async function drawPage() {
    //         const imageData = await worker.drawPageAsPixmap(
    //             doc,
    //             pageNumber,
    //             zoom * devicePixelRatio
    //         );
    //         setImageData(imageData);
    //     }
    //     if (worker) {
    //         drawPage();
    //     }
    // }, [doc, pageNumber, zoom, worker]);

    useEffect(() => {
        if (!imageData) {
            return;
        }
        canvasNodeRef.current.width = imageData.width;
        canvasNodeRef.current.height = imageData.height;
        canvasCtxRef.current.putImageData(imageData, 0, 0);
    }, [imageData]);

    // useEffect(() => {
    //     async function searchNeedle() {
    //         if (!needle) {
    //             return;
    //         }
    //         const searchData = await worker.search(doc, pageNumber, needle);
    //         setSearchData(searchData);
    //     }
    //     searchNeedle();
    // }, [needle, doc, pageNumber, worker]);

    useEffect(() => {
        canvasCtxRef.current = canvasNodeRef.current.getContext("2d");
    }, [pageNumber]);

    // const highlightElements = useMemo(() => {
    //     if (!searchData || !needle) return null;
    //     const scale = zoom / 72;
    //     return searchData.map((bbox, index) => (
    //         <div
    //             key={index}
    //             style={{
    //                 position: "absolute",
    //                 left: `${bbox.x * scale}px`,
    //                 top: `${bbox.y * scale}px`,
    //                 width: `${bbox.w * scale}px`,
    //                 height: `${bbox.h * scale}px`,
    //                 backgroundColor: "rgba(255, 255, 0, 0.3)", // Example highlight color
    //                 pointerEvents: "none", // Allows clicking through the highlight
    //             }}
    //         />
    //     ));
    // }, [searchData, zoom, needle]);

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
            <TextLayer
                // worker={worker}
                // doc={doc}
                // pageNumber={pageNumber}
                textData={textData}
                zoom={zoom}
            />
            {/* <div ref={searchNodeRef}>{highlightElements}</div> */}
        </div>
    );
};

export default PageView;
