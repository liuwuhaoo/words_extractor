"use client";

import { DataProvider } from "./DataContext";
import SearchPanel from "./SearchPanel";
import Pages from "./Pages";

export default function About() {
    return (
        <div className="flex justify-center h-screen">
            <DataProvider>
                <Pages />
                <SearchPanel />
            </DataProvider>
        </div>
    );
}
