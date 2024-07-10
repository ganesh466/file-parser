import React, { useState, useRef, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import Header from './Header';
import '../css/FileUploader.css';

function FileUploader() {
    const [fileContent, setFileContent] = useState('');
    const [rows, setRows] = useState([]);
    const [displayRows, setDisplayRows] = useState([]);
    const [error, setError] = useState(null);
    const observer = useRef();

    const handleTextFileRead = async (file) => {
        const chunkSize = 1024 * 1024;
        let offset = 0;
        try {
            while (offset < file.size) {
                const slice = file.slice(offset, offset + chunkSize);
                const text = await slice.text();
                setFileContent(prevContent => prevContent + text);
                offset += chunkSize;
            }
        } catch (err) {
            setError(`Error reading text file: ${err.message}`);
        }
    };

    const handleCSVFileRead = (file) => {
        try {
            Papa.parse(file, {
                worker: true,
                chunkSize: 1024 * 1024,
                step: (results) => {
                    setRows(prevRows => [...prevRows, results.data]);
                },
                header: true,
                skipEmptyLines: true,
                complete: () => {
                    console.log('All chunks finished processing');
                },
                error: (err) => {
                    setError(`Error parsing CSV file: ${err.message}`);
                }
            });
        } catch (err) {
            setError(`Error reading CSV file: ${err.message}`);
        }
    };

    const handleFileChosen = (file) => {
        setFileContent('');
        setRows([]);
        setDisplayRows([]);
        setError(null);

        if (file.type === 'text/csv') {
            handleCSVFileRead(file);
        } else {
            handleTextFileRead(file);
        }
    };

    const lastRowElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setDisplayRows(prevDisplayRows => [
                    ...prevDisplayRows,
                    ...rows.slice(prevDisplayRows.length, prevDisplayRows.length + 20)
                ]);
            }
        });
        if (node) observer.current.observe(node);
    }, [rows]);

    useEffect(() => {
        if (rows.length > 0) {
            setDisplayRows(rows.slice(0, 20));
        }
    }, [rows]);

    return (
        <div className="file-uploader">
            <Header />
            <div className="content-container">
                <input type='file'
                    accept='.txt,.csv'
                    onChange={e => handleFileChosen(e.target.files[0])}
                />
                {error && <div className="error">{error}</div>}
                <div className="content">
                    {fileContent && <pre className="file-content">{fileContent}</pre>}
                    {displayRows.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    {Object.keys(displayRows[0]).map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayRows.map((row, index) => (
                                    <tr key={index} ref={index === displayRows.length - 1 ? lastRowElementRef : null}>
                                        {Object.values(row).map((cell, i) => (
                                            <td key={i}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FileUploader;
