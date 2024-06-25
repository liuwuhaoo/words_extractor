import React, { useState, useEffect, useRef, useMemo } from "react";

const computeSize = (size, zoom) => (((size * zoom) / 72) | 0) + "px";

const PageView = ({ doc, number, zoom, worker, needle}) => {
    const [size, setSize] = useState(null);
    const [textData, setTextData] = useState(null);
    const [searchData, setSearchData] = useState(null);

    const rootNodeRef = useRef(null);
    const canvasNodeRef = useRef(null);
    const canvasCtxRef = useRef(null);
    const textNodeRef = useRef(null);
    const searchNodeRef = useRef(null);

    useEffect(() => {
        async function loadPage() {
            const size = await worker.getPageSize(doc, number);
            setSize(size);
            const textData = await worker.getPageText(doc, number);
            setTextData(textData);
        }
        loadPage();
    }, [doc, number, worker]);

    useEffect(() => {
        async function drawPage() {
            const imageData = await worker.drawPageAsPixmap(
                doc,
                number,
                zoom * devicePixelRatio
            );
            canvasCtxRef.current.putImageData(imageData, 0, 0);
        }

        drawPage();
    }, [doc, number, zoom, worker]);

    useEffect(() => {
        async function searchNeedle() {
            if (!needle) {
                return;
            }
            const searchData = await worker.search(doc, number, needle);
            setSearchData(searchData);
        }
        searchNeedle();
    }, [needle, doc, number, worker]);

    useEffect(() => {
        canvasCtxRef.current = canvasNodeRef.current.getContext("2d");
    }, [number]);

    const textElements = useMemo(() => {
        if (!textData || !textData.blocks) {
            return [];
        }
        const scale = zoom / 72;
        return textData.blocks.flatMap((block, blockIndex) => {
            if (block.type !== "text") return [];

            return block.lines.map((line, lineIndex) => (
                <text
                    key={`${blockIndex}-${lineIndex}`}
                    x={`${line.bbox.x * scale}px`}
                    y={`${line.y * scale}px`}
                    style={{
                        fontSize: `${line.font.size * scale}px`,
                        fontFamily: line.font.family,
                        fontWeight: line.font.weight,
                        fontStyle: line.font.style,
                    }}
                    textLength={`${line.bbox.w * scale}px`}
                    lengthAdjust="spacingAndGlyphs"
                >
                    {line.text}
                </text>
            ));
        });
    }, [textData, zoom]);

    const highlightElements = useMemo(() => {
        if (!searchData || !needle) return null;
        const scale = zoom / 72;
        return searchData.map((bbox, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${bbox.x * scale}px`,
              top: `${bbox.y * scale}px`,
              width: `${bbox.w * scale}px`,
              height: `${bbox.h * scale}px`,
              backgroundColor: 'rgba(255, 255, 0, 0.3)', // Example highlight color
              pointerEvents: 'none', // Allows clicking through the highlight
            }}
          />
        ));
      }, [searchData, zoom, needle]);
    

    return (
        <div
            ref={rootNodeRef}
            className="page"
            style={{
                width: computeSize(size.width, zoom),
                height: computeSize(size.height, zoom),
            }}
        >
            <canvas
                ref={canvasNodeRef}
                style={{
                    width: computeSize(size.width, zoom),
                    height: computeSize(size.height, zoom),
                }}
                zoom={zoom}
            />
            <svg ref={textNodeRef} className="text">
                {textElements}
            </svg>
            <div ref={searchNodeRef}>{highlightElements}</div>
        </div>
    );
};

export default PageView;
