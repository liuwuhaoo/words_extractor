"use client";

import { DataProvider } from "./DataContext";
import Pages from "./Pages";

export default function About() {
    return (
        <div className="flex justify-center flex-col">
            <DataProvider>
                <Pages />
            </DataProvider>
        </div>
    );
}
