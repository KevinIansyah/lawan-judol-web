import { useState } from 'react';

export interface ProcessLog {
    comment_id: string;
    status: 'processing' | 'success' | 'error';
    message: string;
}

export const useProcessLogs = () => {
    const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const addLogEntry = (comment_id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) => [...prev, { comment_id, status, message }]);
    };

    const updateLogEntry = (comment_id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) => prev.map((log) => (log.comment_id === comment_id ? { ...log, status, message } : log)));
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
