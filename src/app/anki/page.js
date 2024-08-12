"use client";
import Script from "next/script";
import { useEffect, useState, useCallback } from "react";

export default function About() {
    const [sql, setSql] = useState(null);
    const createDeck = useCallback(async () => {
        var m = new Model({
            name: "my_own_model",
            id: "1543634829843",
            flds: [
                { name: "Front" },
                { name: "Back" },
                { name: "x0" },
                { name: "x1" },
                { name: "y0" },
                { name: "y1" },
                { name: "Image" },
            ],
            req: [[0, "all", [0]]],
            tmpls: [
                {
                    name: "Card 1",
                    qfmt: "{{type:Front}}",
                    afmt: "{{FrontSide}}\n<hr id=answer>",
                },
            ],
        });

        var d = new Deck(1276438724672, "Test Deck");
        const imageName = "vw_test-1.svg";
        d.addNote(
            m.note([
                "die Schwägerin",
                "die Schwägerin",
                "144",
                "349",
                "75",
                "12",
                "<img src='" + imageName + "' />",
            ])
        );

        var p = new Package();
        p.addDeck(d);

        let blob = await fetch(imageName).then((response) => {
            if (!response.ok) {
                return null;
            }
            return response.blob();
        });
        p.addMedia(blob, imageName);
        p.writeToFile("deck.apkg");
    }, []);

    useEffect(() => {
        if (sql) {
            console.log(sql);
            window.SQL = sql;
            // createDeck();
        }
    }, [sql, createDeck]);

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
        setSql(SQL);
    }, []);

    return (
        <div>
            <Script src="https://cdn.jsdelivr.net/gh/krmanik/genanki-js/dist/genanki.js"></Script>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></Script>
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></Script>
            <Script
                onLoad={initSQL}
                src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-asm.js"
            ></Script>
            test
            <button onClick={createDeck}>Create Deck</button>
        </div>
    );
}
