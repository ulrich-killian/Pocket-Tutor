import { useState, useEffect, useCallback, useRef } from 'react';

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

interface DocumentStatusState {
  [documentId: string]: DocumentStatus;
}

interface UseDocumentStatusOptions {
  pollingInterval?: number;
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
}

export function useDocumentStatus(options: UseDocumentStatusOptions = {}) {
  const { onStatusChange } = options;
  const [statuses, setStatuses] = useState<DocumentStatusState>({});
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const processingDocsRef = useRef<Set<string>>(new Set());

  const setStatus = useCallback(
    (documentId: string, status: DocumentStatus) => {
      setStatuses((prev) => {
        if (prev[documentId] !== status) {
          onStatusChange?.(documentId, status);
        }
        return { ...prev, [documentId]: status };
      });

      if (status === 'processing' || status === 'uploading') {
        processingDocsRef.current.add(documentId);
      } else {
        processingDocsRef.current.delete(documentId);
      }
    },
    [onStatusChange],
  );

  const getStatus = useCallback(
    (documentId: string): DocumentStatus => {
      return statuses[documentId] || 'ready';
    },
    [statuses],
  );

  const startUpload = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'uploading');
    },
    [setStatus],
  );

  const startProcessing = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'processing');
    },
    [setStatus],
  );

  const markReady = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'ready');
    },
    [setStatus],
  );

  const markError = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'error');
    },
    [setStatus],
  );

  const removeStatus = useCallback((documentId: string) => {
    setStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[documentId];
      return newStatuses;
    });
    processingDocsRef.current.delete(documentId);
  }, []);

  const hasProcessingDocuments = useCallback(() => {
    return processingDocsRef.current.size > 0;
  }, []);

  const getProcessingCount = useCallback(() => {
    return processingDocsRef.current.size;
  }, []);

  const simulateProcessing = useCallback(
    (documentId: string, duration: number = 5000) => {
      startProcessing(documentId);

      setTimeout(() => {
        if (Math.random() > 0.1) {
          markReady(documentId);
        } else {
          markError(documentId);
        }
      }, duration);
    },
    [startProcessing, markReady, markError],
  );

  useEffect(() => {
    const currentPolling = pollingRef.current;
    return () => {
      if (currentPolling) {
        clearInterval(currentPolling);
      }
    };
  }, []);

  return {
    statuses,
    getStatus,
    setStatus,
    startUpload,
    startProcessing,
    markReady,
    markError,
    removeStatus,
    hasProcessingDocuments,
    getProcessingCount,
    simulateProcessing,
  };
}

export default useDocumentStatus;
