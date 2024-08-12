"use client";
import Script from "next/script";
import domtoimage from "dom-to-image";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const frontSide = `
<style>.card{font-family:arial;font-size:20px;text-align:center;color:#000;background-color:#fff}#content{position:relative}#container{display:flex;align-items:center}@keyframes fadeOut{0%{background-color:red}100%{background-color:transparent}}.fading{animation:fadeOut 1s forwards!important}</style><div id=container><div id=content>{{Image}}</div><div>{{type:Back}}</div></div>
<script>
function getJsonFromSvg(filename) {
    return fetch(filename)
        .then(response => {
            if (!response.ok) {
                console.log("Error fetching SVG file:", response.statusText);
            }
            return response.text();
        })
        .then(svgContent => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

            const metadataElement = svgDoc.querySelector('metadata json');
            if (metadataElement) {
                const encodedJson = metadataElement.textContent.trim();
                const jsonString = atob(encodedJson);
                return JSON.parse(jsonString);
            } else {
                throw new Error('No JSON data found in SVG file');
            }
        });
}

var Width, Height

function createMasks(searchData) {
    const masks = [];
    for (const i in searchData) {
        for (const j in searchData[i]) {
            const data = searchData[i][j];
            const mask = document.createElement("span");
            mask.style.left = data.x / Width * 100 + "%";
            mask.style.top = data.y / Height * 100 + "%";
            mask.style.width = data.w / Width * 100 + "%";
            mask.style.height = data.h / Height * 100 + "%";
            mask.style.position = "absolute";
            mask.dataset.text = i;
            if (i == "{{Back}}") {
                mask.style.backgroundColor = "red";
                mask.style.border = "1px solid green";
                mask.id = "current_mask";
                mask.classList.add("current_mask");
            } else {
                mask.style.backgroundColor = "white";
                mask.style.border = "1px solid black";
            }
            masks.push(mask);
        }

    }
    return masks;
}


getJsonFromSvg("{{Deck}}" + "_image_" + "{{Page}}" + "_mask.svg")
    .then(res => {
        const container = document.getElementById("content");
        // container.style.height = "100vh";
        container.style.aspectRatio = res.size.width / res.size.height;
        Width = res.size.width;
        Height = res.size.height;
        const masks = createMasks(res.searchData);
        const content = document.getElementById("content");
        masks.forEach((mask) => {
            content.appendChild(mask);
        });
    });
</script>
`;

const backSide = `
{{FrontSide}}<hr id=answer><script>setTimeout(() => {
	masks = document.getElementsByClassName("current_mask");
  for (let i = 0; i < masks.length; i++) {
		masks[i].classList.add("fading");
	}
}, 100);</script>
`;

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

function saveJsonAsSvg(jsonData, fileName = "data.svg") {
    // Convert JSON to string
    const jsonString = JSON.stringify(jsonData);

    // Encode the JSON string to base64
    const encodedJson = btoa(jsonString);

    // Create a minimal SVG with embedded JSON
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
        <metadata>
            <json type="application/json">
                ${encodedJson}
            </json>
        </metadata>
    </svg>`;

    // Create a Blob with the SVG content
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    return blob;
}

export default function About({ pages }) {
    const [sql, setSql] = useState(null);
    const [deckName, setDeckName] = useState("");

    const initSQL = useCallback(async () => {
        if (!window.initSqlJs) {
            console.log("initSqlJs not found");
            return;
        }
        const initSqlJs = window.initSqlJs;
        const SQL = await initSqlJs({
            locateFile: (file) =>
                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`,
        });
        window.SQL = SQL;
        setSql(SQL);
    }, []);

    const handleDownloadAnki = useCallback(async () => {
        if (deckName === "") {
            alert("Please enter the deck name");
            return;
        }
        const images = document.getElementsByClassName("page-canvas");
        const imgBlobs = await Promise.all(
            Array.prototype.map.call(images, async (image) => {
                return await domtoSvgBlob(image);
            })
        );

        const m = new Model({
            name: deckName + "_Model",
            id: "1543634829843",
            flds: [
                { name: "Front" },
                { name: "Back" },
                { name: "x0" },
                { name: "x1" },
                { name: "y0" },
                { name: "y1" },
                { name: "Image" },
                { name: "Mask" },
                { name: "Page" },
            ],
            req: [[0, "all", [0]]],
            tmpls: [
                {
                    name: "Card 1",
                    qfmt: frontSide,
                    afmt: backSide,
                },
            ],
        });

        const d = new Deck(1276438724672, deckName);
        const p = new Package();

        for (const i in pages) {
            const page = pages[i];
            const searchData = page.searchData;
            for (const word in searchData) {
                const bbox = getCoveringRectangle(searchData[word]);
                d.addNote(
                    m.note([
                        word,
                        word,
                        bbox.x,
                        bbox.y,
                        bbox.w,
                        bbox.h,
                        `<img src="${deckName}_image_${i}.svg" />`,
                        `<img src="${deckName}_image_${i}_mask.svg" />`,
                        i,
                    ])
                );
            }
        }

        p.addDeck(d);
        for (const i in imgBlobs) {
            const data = {
                size: pages[i].size,
                searchData: pages[i].searchData,
            };
            p.addMedia(imgBlobs[i], `${deckName}_image_${i}.svg`);
            p.addMedia(
                saveJsonAsSvg(data, `${deckName}_image_${i}_mask.svg`),
                `${deckName}_image_${i}_mask.svg`
            );
        }
        p.writeToFile(`${deckName}.apkg`);
    }, [pages, deckName]);

    return (
        <>
            <Script src="https://cdn.jsdelivr.net/gh/krmanik/genanki-js/dist/genanki.js"></Script>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></Script>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></Script>
            <Script
                onLoad={initSQL}
                src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-asm.js"
            ></Script>
            <button
                className="px-4 ml-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleDownloadAnki}
            >
                Download(Anki)
            </button>
            <input
                className="flex-grow px-4 ml-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="the deck name"
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
            />
        </>
    );
}
