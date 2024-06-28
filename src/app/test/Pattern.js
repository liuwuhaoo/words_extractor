import { useCallback, useState } from "react";
import domtoimage from "dom-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import FileSaver from "file-saver";
import { useMyContext } from "./DataContext";

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

    const handleDownloadJson = useCallback(
        (type) => {
            const searchData = {};
            for (let i = 0; i < Object.keys(pages).length; i++) {
                searchData[i] = pages[i].searchData;
            }
            const searchDataStr = JSON.stringify(searchData);
            const blob = new Blob([searchDataStr], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const name = title ? title + ".json" : "search-data.json";
            downloadUrl(url, name);
        },
        [pages, title]
    );

    const handleDownloadAnki = useCallback(async () => {
        // const images = document.getElementsByClassName("page-canvas");
        // const imageUrl = await domtoimage.toSvg(images[0]);
        // console.log(imageUrl);
        // const imageBlob = new Blob([imageUrl], { type: "image/svg+xml;charset=utf-8" });
        // // downloadUrl(imageUrl, "anki.svg");
        // // saveAs(imageUrl, "anki.svg");
        // // window.saveAs(imageUrl, "anki.svg");

        // // const covers = document.getElementsByClassName("page-cover");
        // const zip = new JSZip();
        // zip.file("anki.svg", imageUrl, { binary: true });
        // const content = await zip.generateAsync({ type: "blob" });
        // saveAs(content, title);

        // downloadUrl(
        //     URL.createObjectURL(
        //         await zip.generateAsync({ type: "blob" }),
        //         "anki.zip"
        //     )
        // );

        // saveAs(imageBlob, "anki.svg");
        // downloadUrl(imageUrl, "anki.svg");
        // const zip = new JSZip();
        // for (let i = 0; i < images.length; i++) {
        //     const imageUrl = await domtoimage.toSvg(images[i]);
        //     const imageBlob = new Blob([imageUrl], {type: 'image/svg+xml;charset=utf-8'});
        //     const coverUrl = await domtoimage.toSvg(covers[i]);
        //     const coverBlob = new Blob([coverUrl], {type: 'image/svg+xml;charset=utf-8'});
        //     zip.file(`page-${i}.svg`, imageBlob);
        //     zip.file(`cover-${i}.svg`, coverBlob);
        // }
        // const content = await zip.generateAsync({ type: "blob" });
        // downloadUrl(URL.createObjectURL(content), "anki.zip");
        // saveAs(content, title);
        // const url = await domtoimage.toSvg(covers[0]);
        // downloadUrl(url, "anki.svg");
    }, []);

    return (
        <div className="flex justify-center items-center p-4">
            <div className="flex w-full max-w-md">
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
                <button
                    className="px-4 ml-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleDownloadAnki}
                >
                    Download(Anki)
                </button>
            </div>
        </div>
    );
}
