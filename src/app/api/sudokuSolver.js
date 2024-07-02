// src/app/api/sudokuSolver.js

import { DLX, addSudokuConstraints } from '../../lib/dlx';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { board } = req.body;
        const solution = solveSudoku(board);

        if (solution) {
            res.status(200).json({ solution });
        } else {
            res.status(400).json({ message: 'Unable to solve the Sudoku puzzle' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

function solveSudoku(board) {
    const dlx = new DLX(4 * 9 * 9);
    for (let row = 0; row < 9; ++row) {
        for (let col = 0; ++col < 9;) {
            if (board[row][col] !== 0) {
                addSudokuConstraints(dlx, row, col, board[row][col] - 1);
            } else {
                for (let num = 0; num < 9; ++num) {
                    addSudokuConstraints(dlx, row, col, num);
                }
            }
        }
    }

    if (dlx.solve()) {
        return dlx.board;
    } else {
        const backtrackingBoard = [...board];
        if (solveSudokuBacktrack(backtrackingBoard)) {
            return backtrackingBoard;
        } else {
            return null;
        }
    }
}

function solveSudokuBacktrack(board) {
    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num && i !== col) {
                return false;
            }
            if (board[i][col] === num && i !== row) {
                return false;
            }
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num && (i !== row || j !== col)) {
                    return false;
                }
            }
        }

        return true;
    }

    function solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    return solve(board);
}
