import { useState, useEffect } from "react";

export default function useWorker(workerUrl) {
    const [worker, setWorker] = useState(null);

    useEffect(() => {
        const newWorker = new Worker(workerUrl, { type: "module" });
        let promiseId = 1;
        const promiseMap = new Map();

        const wrap =
            (name) =>
            (...args) => {
                return new Promise((resolve, reject) => {
                    const id = promiseId++;
                    promiseMap.set(id, { resolve, reject });
                    if (args[0] instanceof ArrayBuffer) {
                        newWorker.postMessage([name, id, args], [args[0]]);
                    } else {
                        newWorker.postMessage([name, id, args]);
                    }
                });
            };

        newWorker.onmessage = (event) => {
            const [type, id, result] = event.data;
            let error;

            switch (type) {
                case "INIT":
					console.log("Worker initialized with methods:", result);
                    for (let method of result) {
                        newWorker[method] = wrap(method);
                    }
                    setWorker(newWorker);
                    break;

                case "RESULT":
                    promiseMap.get(id).resolve(result);
                    promiseMap.delete(id);
                    break;

                case "ERROR":
                    error = new Error(result.message);
                    error.name = result.name;
                    error.stack = result.stack;
                    promiseMap.get(id).reject(error);
                    promiseMap.delete(id);
                    break;

                default:
                    error = new Error(`Invalid message: ${type}`);
                    promiseMap.get(id).reject(error);
                    break;
            }
        };

        return () => {
            newWorker.terminate();
        };
    }, [workerUrl]);

    return worker;
}
