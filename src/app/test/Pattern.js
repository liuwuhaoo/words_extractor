import { useCallback, useState, useEffect } from "react";
import { useMyContext } from "./DataContext";
import Download from "./Download";

const downloadUrl = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
};

export default function Pattern() {
    const {
        state: { pattern: statePattern, pages, title },
        dispatch,
    } = useMyContext();
    const [pattern, setPattern] = useState(statePattern);

    const handlePatternChange = useCallback((e) => {
        setPattern(e.target.value);
    }, []);

    const searchPatternMatches = useCallback(() => {
        dispatch({ type: "SET_PATTERN", payload: pattern });
        dispatch({ type: "SEARCH_PATTERN_MATCHES" });
    }, [dispatch, pattern]);

    useEffect(() => {
        console.log("searchPatternMatches");
        setTimeout(() => {
            searchPatternMatches();
        }, 1500);
    }, [searchPatternMatches]);

    const handleDownloadJson = useCallback(() => {
        const searchData = {};
        for (let i = 0; i < Object.keys(pages).length; i++) {
            searchData[i] = pages[i].searchData;
        }
        const searchDataStr = JSON.stringify(searchData);
        const blob = new Blob([searchDataStr], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const name = title ? title + ".json" : "search-data.json";
        downloadUrl(url, name);
    }, [pages, title]);

    return (
        <div className="flex justify-center items-center p-4">
            <div className="flex w-full">
                <input
                    type="text"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter text"
                    value={pattern}
                    onChange={handlePatternChange}
                />
                <button
                    className="px-4 ml-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={searchPatternMatches}
                >
                    Search Pattern
                </button>
                <button
                    className="px-4 ml-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleDownloadJson}
                >
                    Download(json)
                </button>
                <Download pages={pages} />
            </div>
        </div>
    );
}
