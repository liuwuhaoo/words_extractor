import { useMemo, useCallback } from "react";
import { usePage, useMyContext } from "./DataContext";

export default function SearchPanel({ pageNumber }) {
    const { dispatch } = useMyContext();
    const { page: { searchData, textData: { blocks } = {} } = {} } =
        usePage(pageNumber);

    const handleRemoveSearch = useCallback(
        (text) => {
            dispatch({
                type: "REMOVE_SEARCH",
                payload: { pageNumber: pageNumber, text },
            });
            console.log("removing search", text);
        },
        [pageNumber, dispatch]
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

    return (
        <div className="w-48 overflow-y-scroll bg-gray-100">{searchItems}</div>
    );
}
