import { useCallback, useState, useEffect } from "react";
import domtoimage from "dom-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useMyContext } from "./DataContext";

const downloadUrl = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
};

const domtoSvgBlob = async (element) => {
    const dataUrl = await domtoimage.toSvg(element);
    const response = await fetch(dataUrl);
    const svgBlob = await response.blob();
    return svgBlob;
};

function getCoveringRectangle(bboxes) {
    if (bboxes.length === 0) {
        return null;
    }

    // Initialize min and max values
    let minX = Infinity,
        minY = Infinity;
    let maxX = -Infinity,
        maxY = -Infinity;

    // Iterate through each bounding box
    bboxes.forEach(({ x, y, w, h }) => {
        // Calculate the right and bottom edges of the bbox
        const right = x + w;
        const bottom = y + h;

        // Update min and max values
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (right > maxX) maxX = right;
        if (bottom > maxY) maxY = bottom;
    });

    // Calculate the width and height of the covering rectangle
    const coveringWidth = maxX - minX;
    const coveringHeight = maxY - minY;

    // Return the covering rectangle
    return { x: minX, y: minY, w: coveringWidth, h: coveringHeight };
}

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

    const handleDownloadAnki = useCallback(async () => {
        const images = document.getElementsByClassName("page-canvas");
        const imgBlobs = await Promise.all(
            Array.prototype.map.call(images, async (image) => {
                return await domtoSvgBlob(image);
            })
        );
        const covers = document.getElementsByClassName("page-cover");
        const coverBlobs = await Promise.all(
            Array.prototype.map.call(covers, async (cover) => {
                return await domtoSvgBlob(cover);
            })
        );
        // Create a new zip instance
        const zip = new JSZip();
        // Add the SVG file to the zip
        for (let i = 0; i < imgBlobs.length; i++) {
            zip.file(`image-${i}.svg`, imgBlobs[i]);
            zip.file(`cover-${i}.svg`, coverBlobs[i]);
        }

        let csvStr = "";
        for (const i in pages) {
            const page = pages[i];
            const searchData = page.searchData;
            for (const word in searchData) {
                const bbox = getCoveringRectangle(searchData[word]);
                csvStr += `${word},${word},${i},${bbox.x},${bbox.y},${bbox.w},${bbox.h}\n`;
            }
        }
        zip.file("data.csv", csvStr);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        // Use file-saver to save the zip file
        saveAs(zipBlob, "image.zip");
    }, [pages]);
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
