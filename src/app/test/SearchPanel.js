import { useMemo, useCallback } from "react";
import { usePage, useMyContext } from "./DataContext";

export default function DataContext() {
    const {
        state: { currentPage, pattern },
        dispatch,
    } = useMyContext();
    const { page: { searchData, textData: { blocks } = {} } = {} } =
        usePage(currentPage);

    const handleRemoveSearch = useCallback(
        (text) => {
            dispatch({
                type: "REMOVE_SEARCH",
                payload: { pageNumber: currentPage, text },
            });
            console.log("removing search", text);
        },
        [currentPage, dispatch]
    );

    const searchItems = useMemo(() => {
        if (!searchData) return null;
        return Object.keys(searchData).map((text, index) => (
            <div
                key={index + text}
                className="flex items-center justify-between p-2 m-2 rounded-lg shadow-md bg-white"
            >
                <div className="mr-2">{text}</div>
                <button
                    onClick={() => handleRemoveSearch(text)}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none border border-gray-300 rounded-lg shadow-md hover:shadow-lg"
                >
                    x
                </button>
            </div>
        ));
    }, [searchData, handleRemoveSearch]);

    const handlePatternChange = useCallback(() => {
        let regex;

        try {
            regex = new RegExp(pattern);
        } catch (e) {
            console.error("Invalid regex:", e);
            return null;
        }

        const patternSearch = {};
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.type !== "text") return;
            for (let j = 0; j < blocks[i].lines.length; j++) {
                const line = block.lines[j];
                if (line.text.includes("Trimester")) {
                    console.log(line.text)
                }
                if (regex.test(line.text.trim())) {
                    patternSearch[line.text.trim()] = [line.bbox];
                }
            }
        }

        if (Object.keys(patternSearch).length > 0) {
            dispatch({
                type: "UPDATE_SEARCH_GROUP",
                payload: { pageNumber: currentPage, patternSearch },
            });
        }
    }, [blocks, currentPage, dispatch, pattern]);

    return (
        <div className="flex-col flex">
            <div className="flex m-2">
                <input
                    type="text"
                    className="flex-grow px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter text here"
                    value={pattern}
                    onChange={() => {}}
                />
                <button
                    className="ml-2 px-4 py-2 text-white bg-blue-500 border border-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                    onClick={handlePatternChange}
                >
                    Add Matches
                </button>
            </div>

            <div className="overflow-y-scroll">{searchItems}</div>
        </div>
    );
}
