import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useMyContext, usePage } from "./DataContext";
import ReactDOM from "react-dom";

function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {
        // IE?
        document.selection.empty();
    }
}

export default function TextLayer({ pageNumber }) {
    const [menuPosition, setMenuPosition] = useState(null);
    const menuRef = useRef(null);

    const {
        worker,
        state: { zoom, docId },
        dispatch,
    } = useMyContext();
    const { page: { textData } = {} } = usePage(pageNumber);

    const handleSelection = useCallback(async () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (!text) {
            setMenuPosition(null);
            return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
    }, []);

    const handleSave = useCallback(
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            const selection = window.getSelection();
            const text = selection.toString().replaceAll('-\n', '').replaceAll('\n', ' ');
            const res = await worker.search(docId, pageNumber, text);
            dispatch({
                type: "UPDATE_SEARCH",
                payload: { pageNumber, text, res },
            });
            clearSelection();
            setMenuPosition(null);
        },
        [docId, pageNumber, worker, dispatch]
    );

    const removeMenu = useCallback(
        (e) => {
            e.stopPropagation();
            if (!menuPosition) return;
            setMenuPosition(null);
            clearSelection();
        },
        [menuPosition]
    );

    useEffect(() => {
        document.addEventListener("mousedown", removeMenu);
        document.addEventListener("keydown", removeMenu);
        return () => {
            document.removeEventListener("mousedown", removeMenu);
            document.removeEventListener("keydown", removeMenu);
        };
    }, [removeMenu]);

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

    return (
        <>
            <svg className="text" onMouseUp={handleSelection}>
                {textElements}
            </svg>
            {menuPosition &&
                ReactDOM.createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "absolute",
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                            background: "white",
                            border: "1px solid black",
                            padding: "2px",
                        }}
                    >
                        <button onMouseDown={handleSave}>Save</button>
                    </div>,
                    document.body
                )}
        </>
    );
}