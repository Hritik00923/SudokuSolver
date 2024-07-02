"use client";

import { useState } from 'react';

const initialBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

export default function Home() {
    const [board, setBoard] = useState(initialBoard);
    const [solution, setSolution] = useState(null);
    const [userInputs, setUserInputs] = useState(initialBoard.map(row => row.map(cell => (cell !== 0 ? true : false))));
    const [isValid, setIsValid] = useState(null);

    const handleChange = (e, row, col) => {
        const value = e.target.value;
        const newBoard = [...board];
        newBoard[row][col] = value === '' ? 0 : parseInt(value, 10);
        setBoard(newBoard);
    };

    const handleKeyDown = (e, row, col) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setBoard(prevBoard => {
                const newBoard = [...prevBoard];
                newBoard[row][col] = (newBoard[row][col] % 9) + 1;
                return newBoard;
            });
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setBoard(prevBoard => {
                const newBoard = [...prevBoard];
                newBoard[row][col] = (newBoard[row][col] + 8) % 9 + 1;
                return newBoard;
            });
        }
    };

    const handleSubmit = async () => {
        const response = await fetch('/api/sudokuSolver', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ board }),
        });

        const data = await response.json();
        setSolution(data.solution);
        setIsValid(null);
    };

    const handleVerify = () => {
        const newInputs = [...userInputs];
        let allCorrect = true;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] !== 0 && board[row][col] !== initialBoard[row][col]) {
                    if (board[row][col] === solution[row][col]) {
                        newInputs[row][col] = true;
                    } else {
                        newInputs[row][col] = false;
                        allCorrect = false;
                    }
                }
            }
        }
        setUserInputs(newInputs);
        setIsValid(allCorrect);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Sudoku Solver</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 50px)', gap: '5px' }}>
                    {board.map((row, rowIndex) => (
                        row.map((cell, colIndex) => (
                            <input
                                key={`${rowIndex}-${colIndex}`}
                                type="text"
                                maxLength="1"
                                value={cell === 0 ? '' : cell}
                                onChange={(e) => handleChange(e, rowIndex, colIndex)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    backgroundColor: userInputs[rowIndex][colIndex] ? '#fff' : '#ffcccc',
                                    border: '1px solid #ccc',
                                    color: '#000',
                                    transition: 'all 0.2s ease-in-out',
                                    outline: 'none'
                                }}
                            />
                        ))
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleSubmit} style={{ padding: '10px 20px', fontSize: '1rem' }}>Submit</button>
                    <button onClick={handleVerify} style={{ padding: '10px 20px', fontSize: '1rem' }}>Verify</button>
                </div>
            </div>
            {solution && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Solution</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 50px)', gap: '5px' }}>
                        {solution.map((row, rowIndex) => (
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        backgroundColor: '#f0f0f0',
                                        color: '#000'
                                    }}
                                >
                                    {cell}
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            )}
            {isValid !== null && (
                <div style={{ marginTop: '20px', color: isValid ? 'green' : 'red' }}>
                    {isValid ? 'The solution is correct!' : 'Some inputs are incorrect. Please try again.'}
                </div>
            )}
        </div>
    );
}
