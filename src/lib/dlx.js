// src/lib/dlx.js

class Node {
    constructor() {
        this.left = this.right = this.up = this.down = this.column = this;
        this.rowID = this.colID = 0;
        this.nodeCount = 0;
    }
}

class DLX {
    constructor(columns) {
        this.headerCount = columns;
        this.nodes = new Array(9 * 9 * 9 * 4 + columns).fill(null).map(() => new Node());
        this.nodeIndex = columns;
        this.rowHeaders = new Array(9 * 9 * 9).fill(null);

        this.header = this.nodes[0];
        for (let i = 0; i <= columns; ++i) {
            this.nodes[i].left = this.nodes[(i - 1 + columns + 1) % (columns + 1)];
            this.nodes[i].right = this.nodes[(i + 1) % (columns + 1)];
            this.nodes[i].up = this.nodes[i];
            this.nodes[i].down = this.nodes[i];
            this.nodes[i].column = this.nodes[i];
            this.nodes[i].nodeCount = 0;
        }

        this.answer = [];
        this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
    }

    addNode(row, col) {
        const columnHeader = this.nodes[col];
        const newNode = this.nodes[this.nodeIndex++];

        newNode.up = columnHeader.up;
        newNode.down = columnHeader;
        newNode.up.down = newNode;
        newNode.down.up = newNode;

        newNode.column = columnHeader;
        columnHeader.nodeCount++;

        if (!this.rowHeaders[row]) {
            this.rowHeaders[row] = newNode;
            newNode.left = newNode;
            newNode.right = newNode;
        } else {
            const rowHeader = this.rowHeaders[row];
            newNode.left = rowHeader;
            newNode.right = rowHeader.right;
            rowHeader.right.left = newNode;
            rowHeader.right = newNode;
        }

        newNode.rowID = row;
        newNode.colID = col;
    }

    cover(colHeader) {
        colHeader.right.left = colHeader.left;
        colHeader.left.right = colHeader.right;

        for (let rowNode = colHeader.down; rowNode !== colHeader; rowNode = rowNode.down) {
            for (let rightNode = rowNode.right; rightNode !== rowNode; rightNode = rightNode.right) {
                rightNode.down.up = rightNode.up;
                rightNode.up.down = rightNode;
                rightNode.column.nodeCount--;
            }
        }
    }

    uncover(colHeader) {
        for (let rowNode = colHeader.up; rowNode !== colHeader; rowNode = rowNode.up) {
            for (let leftNode = rowNode.left; leftNode !== rowNode; leftNode = leftNode.left) {
                leftNode.column.nodeCount++;
                leftNode.down.up = leftNode;
                leftNode.up.down = leftNode;
            }
        }
        colHeader.right.left = colHeader;
        colHeader.left.right = colHeader;
    }

    solve(depth = 0) {
        if (this.header.right === this.header) {
            this.answer.forEach((rowID) => {
                const row = Math.floor(rowID / 81);
                const col = Math.floor((rowID % 81) / 9);
                const num = rowID % 9 + 1;
                this.board[row][col] = num;
            });
            return true;
        }

        let colHeader = this.header.right;
        for (let rightNode = colHeader.right; rightNode !== this.header; rightNode = rightNode.right) {
            if (rightNode.nodeCount < colHeader.nodeCount) {
                colHeader = rightNode;
            }
        }

        this.cover(colHeader);

        for (let rowNode = colHeader.down; rowNode !== colHeader; rowNode = rowNode.down) {
            this.answer[depth] = rowNode.rowID;

            for (let rightNode = rowNode.right; rightNode !== rowNode; rightNode = rightNode.right) {
                this.cover(rightNode.column);
            }

            if (this.solve(depth + 1)) {
                return true;
            }

            for (let leftNode = rowNode.left; leftNode !== rowNode; leftNode = leftNode.left) {
                this.uncover(leftNode.column);
            }
        }

        this.uncover(colHeader);
        return false;
    }
}

function addSudokuConstraints(dlx, row, col, num) {
    const rowIndex = row * 9 * 9 + col * 9 + num;
    dlx.addNode(rowIndex, row * 9 + col + 1);
    dlx.addNode(rowIndex, 81 + row * 9 + num + 1);
    dlx.addNode(rowIndex, 162 + col * 9 + num + 1);
    dlx.addNode(rowIndex, 243 + (Math.floor(row / 3) * 3 + Math.floor(col / 3)) * 9 + num + 1);
}

export { DLX, addSudokuConstraints };
