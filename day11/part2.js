const fs = require('fs');
const data = fs.readFileSync('./input.txt', { encoding: 'utf8' }).trim().split('\n');

const emptySeat = 'L';
const occupiedSeat = '#';
class Vector {
  constructor(x, y, label) {
    this.label = label;
    this._x = x;
    this._y = y;
    this._magnitude = 1;
  }

  get x() {
    return this._x * this._magnitude;
  }

  get y() {
    return this._y * this._magnitude;
  }

  set magnitude(newMagnitude) {
    this._magnitude = newMagnitude;
  }
}

const directions = () => new Set([
 new Vector(-1, -1, 'nw'), // nw
 new Vector(0, -1, 'n'), //n
 new Vector(1, -1, 'ne'), //ne
 new Vector(1, 0, 'e'), // e
 new Vector(1, 1, 'se'), // se
 new Vector(0, 1, 's'), // s
 new Vector(-1, 1, 'sw'), // sw
 new Vector(-1, 0, 'w'), // w
])

class Position {
  constructor(initialType) {
    this.type = initialType;
  }

  shouldFlip(adjacentSeats) {
    const occupiedSeats = adjacentSeats.reduce((acc, pos) => {
      if (pos.type === occupiedSeat) {
        acc++;
      }
      return acc;
    }, 0);

    return this.type === emptySeat && occupiedSeats === 0 || this.type === occupiedSeat && occupiedSeats >= 5;
  }

  nextState(adjacentSeats) {
    if (this.shouldFlip(adjacentSeats)) return this.type === emptySeat ? occupiedSeat : emptySeat;
    return this.type;
  }
}

const createGrid = (data) => {
  const grid = [];
  // i row, j col
  for (let i = 0; i < data.length; i++) {
    grid.push([]);
    for (let j = 0; j < data[i].length; j++) {
      const seatType = data[i][j];
      grid[i][j] = new Position(seatType);
    }
  }
  return grid;
}

const getAdjacentSeats = (grid, currentRow, currentCol) => {
  const seats = [];
  const allDirections = directions();
  for (let r = 1; allDirections.size !== 0; r++) {
    allDirections.forEach(direction => {
      direction.magnitude = r;

      let newRow = currentRow + direction.y;
      let newCol = currentCol + direction.x;

      if (newRow < 0 || newRow > grid.length - 1 || newCol < 0 || newCol > grid[0].length - 1) {
        allDirections.delete(direction);
      } else if (grid[newRow][newCol].type === occupiedSeat || grid[newRow][newCol].type === emptySeat) {
        allDirections.delete(direction);
        seats.push(grid[newRow][newCol])
      }
    })
  }
  return seats;
}

const runModel = (grid) => {
  let anySeatsFlipped = false
  const seatsChanged = {};
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const adjacentSeats = getAdjacentSeats(grid, i, j);
      const currentState = grid[i][j].type;
      const nextState = grid[i][j].nextState(adjacentSeats);

      if (currentState !== nextState) {
        anySeatsFlipped = true;
        seatsChanged[`${i}:${j}`] = nextState;
      }
    }
  }

  return {
    seatsChanged,
    anySeatsFlipped,
  }
}

const label = 'seating system';
console.time(label);

let anySeatsFlipped;
let grid = createGrid(data);

do {
  const res = runModel(grid);
  
  if (res.anySeatsFlipped) {
    Object.entries(res.seatsChanged).map(([key, newState]) => {
      const [i, j] = key.split(':')
      grid[i][j].type = newState;
    })
  }
  
  anySeatsFlipped = res.anySeatsFlipped;

} while (anySeatsFlipped);

let occupiedSeats = 0;
for (let row of grid) {
  for (let pos of row) {
    if (pos.type === occupiedSeat) {
      occupiedSeats++;
    }
  }
}
console.timeEnd(label);

console.log(occupiedSeats);