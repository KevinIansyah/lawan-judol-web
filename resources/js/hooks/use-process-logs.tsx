import { useState } from 'react';

export interface ProcessLog {
    id: string;
    status: 'processing' | 'success' | 'error';
    message: string;
}

export const useProcessLogs = () => {
    const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const addLogEntry = (id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) => [...prev, { id, status, message }]);
    };

    const updateLogEntry = (id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) => prev.map((log) => (log.id === id ? { ...log, status, message } : log)));
    };

    const resetLogs = () => {
        setProcessLogs([]);
        setSuccessCount(0);
        setErrorCount(0);
        setFinished(false);
    };

    return {
        processLogs,
        successCount,
        errorCount,
        finished,
        setSuccessCount,
        setErrorCount,
        setFinished,
        addLogEntry,
        updateLogEntry,
        resetLogs,
    };
};
