import React, { useRef, useCallback, useEffect, useState } from "react";
import { useMyContext, usePageCount } from "./DataContext";

export default function FileInput() {
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(0);

    const {
        dispatch,
        worker,
        state: { pages, docId, zoom },
    } = useMyContext();

    const handleFileChange = useCallback(
        (e) => {
            const file = (e.target.files || e.dataTransfer.files)[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const buffer = e.target.result;
                dispatch({
                    type: "UPLOAD_FILE",
                    payload: { title: file.name, arrayBuffer: buffer },
                });
                worker.openDocumentFromBuffer(buffer, "pdf").then((docId) => {
                    dispatch({ type: "UPDATE_DOC_ID", payload: { docId } });
                });
            };
            reader.readAsArrayBuffer(file);
        },
        [dispatch, worker]
    );

    const { pageCount } = usePageCount();

    useEffect(() => {
        const fetchAllPages = async () => {
            if (!worker) return;
            setIsLoading(true);
            for (let i = 0; i < pageCount; i++) {
                if (pages[i]) continue;
                setLoadingPage(i);
                const pageInfo = await worker.getPage(
                    docId,
                    i,
                    zoom * devicePixelRatio
                );
                dispatch({
                    type: "UPDATE_PAGE",
                    payload: { pageNumber: i, pageInfo },
                });
            }
            setIsLoading(false);
        };

        fetchAllPages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [worker, dispatch, docId, zoom, pageCount]);

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="w-full h-screen flex flex-col justify-center max-w-md mx-auto">
            {isLoading ? (
                <div>loading: {loadingPage}/{pageCount}</div>
            ) : (
                <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50"
                    onDragOver={handleDragOver}
                    onDrop={handleFileChange}
                    onClick={handleClick}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload
                        </span>{" "}
                        or drag and drop
                    </p>
                </div>
            )}
        </div>
    );
}
