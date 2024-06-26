import { useMemo, useEffect, useState } from "react";

export default function TextLayer({ zoom, textData }) {
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
    return <svg className="text">{textElements}</svg>;
}
