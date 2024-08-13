import { useMemo } from "react";
import { usePage, useMyContext } from "./DataContext";

export default function HighlightLayer({ pageNumber }) {
    const {
        state: { zoom },
    } = useMyContext();
    const scale = zoom / 72;
    const { page: { searchData } = {} } = usePage(pageNumber);
    const searchItems = useMemo(() => {
        if (!searchData) return null;

        return Object.entries(searchData).flatMap(([key, bboxes]) =>
            bboxes.map((bbox, index) => (
                <div
                    key={`${key}-${index}`}
                    style={{
                        position: "absolute",
                        left: `${bbox.x * scale}px`,
                        top: `${bbox.y * scale}px`,
                        width: `${bbox.w * scale}px`,
                        height: `${bbox.h * scale}px`,
                    }}
                />
            ))
        );
    }, [searchData, scale]);

    return <div className="search page-cover">{searchItems}</div>;
}
