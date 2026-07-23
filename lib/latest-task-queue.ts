export type MergePendingTask<T> = (current: T, incoming: T) => T;

export type LatestTaskQueue<T, R> = {
  enqueue(task: T): Promise<R>;
  clearPending(): void;
  isRunning(): boolean;
};

export function createLatestTaskQueue<T, R>(
  worker: (task: T) => Promise<R>,
  mergePending: MergePendingTask<T> = (_current, incoming) => incoming
): LatestTaskQueue<T, R> {
  let pending: T | undefined;
  let running: Promise<R> | null = null;

  async function drain(): Promise<R> {
    let result: R | undefined;
    try {
      while (pending !== undefined) {
        const task = pending;
        pending = undefined;
        result = await worker(task);
      }
      return result as R;
    } catch (error) {
      pending = undefined;
      throw error;
    } finally {
      running = null;
    }
  }

  return {
    enqueue(task) {
      pending = pending === undefined ? task : mergePending(pending, task);
      if (!running) running = drain();
      return running;
    },
    clearPending() {
      pending = undefined;
    },
    isRunning() {
      return running !== null;
    }
  };
}
