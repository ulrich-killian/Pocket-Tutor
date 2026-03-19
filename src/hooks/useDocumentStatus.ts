import { useState, useEffect, useCallback, useRef } from 'react';

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error';

interface DocumentStatusState {
  [documentId: string]: DocumentStatus;
}

interface UseDocumentStatusOptions {
  pollingInterval?: number; // in milliseconds
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
}

/**
 * Hook for managing document processing status with polling
 */
export function useDocumentStatus(options: UseDocumentStatusOptions = {}) {
  const { onStatusChange } = options;
  const [statuses, setStatuses] = useState<DocumentStatusState>({});
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const processingDocsRef = useRef<Set<string>>(new Set());

  /**
   * Set status for a document
   */
  const setStatus = useCallback(
    (documentId: string, status: DocumentStatus) => {
      setStatuses((prev) => {
        if (prev[documentId] !== status) {
          onStatusChange?.(documentId, status);
        }
        return { ...prev, [documentId]: status };
      });

      // Track processing documents
      if (status === 'processing' || status === 'uploading') {
        processingDocsRef.current.add(documentId);
      } else {
        processingDocsRef.current.delete(documentId);
      }
    },
    [onStatusChange],
  );

  /**
   * Get status for a document
   */
  const getStatus = useCallback(
    (documentId: string): DocumentStatus => {
      return statuses[documentId] || 'ready';
    },
    [statuses],
  );

  /**
   * Start tracking a document upload
   */
  const startUpload = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'uploading');
    },
    [setStatus],
  );

  /**
   * Mark upload complete, start processing
   */
  const startProcessing = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'processing');
    },
    [setStatus],
  );

  /**
   * Mark document as ready
   */
  const markReady = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'ready');
    },
    [setStatus],
  );

  /**
   * Mark document as error
   */
  const markError = useCallback(
    (documentId: string) => {
      setStatus(documentId, 'error');
    },
    [setStatus],
  );

  /**
   * Remove status tracking for a document
   */
  const removeStatus = useCallback((documentId: string) => {
    setStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[documentId];
      return newStatuses;
    });
    processingDocsRef.current.delete(documentId);
  }, []);

  /**
   * Check if any documents are processing
   */
  const hasProcessingDocuments = useCallback(() => {
    return processingDocsRef.current.size > 0;
  }, []);

  /**
   * Get count of processing documents
   */
  const getProcessingCount = useCallback(() => {
    return processingDocsRef.current.size;
  }, []);

  /**
   * Simulate processing completion (for demo/testing)
   * In production, this would poll the backend
   */
  const simulateProcessing = useCallback(
    (documentId: string, duration: number = 5000) => {
      startProcessing(documentId);

      setTimeout(() => {
        // 90% success rate simulation
        if (Math.random() > 0.1) {
          markReady(documentId);
        } else {
          markError(documentId);
        }
      }, duration);
    },
    [startProcessing, markReady, markError],
  );

  // Cleanup polling on unmount
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
