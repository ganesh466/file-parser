import Papa from 'papaparse';

self.onmessage = (e) => {
  Papa.parse(e.data, {
    header: true,
    skipEmptyLines: true,
    chunkSize: 1024 * 1024, // 1MB
    step: (results) => {
      if (results.data) {
        self.postMessage({ results });
      }
    },
    complete: () => {
      self.postMessage({ done: true });
    },
    error: (error) => {
      self.postMessage({ error: error.message });
    }
  });
};
