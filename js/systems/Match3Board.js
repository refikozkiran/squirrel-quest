// Match3Board.js
// Saf mantık katmanı: render/animasyon işi yok. GameScene bu sınıfın verdiği
// olaylara (matches, moves, spawns) bakarak Phaser animasyonlarını oynatır.

export class Match3Board {
  /**
   * @param {number} rows
   * @param {number} cols
   * @param {number} gemTypeCount - kaç farklı sembol tipi olduğu (GEM_TYPES.length)
   */
  constructor(rows, cols, gemTypeCount) {
    this.rows = rows;
    this.cols = cols;
    this.gemTypeCount = gemTypeCount;
    this.grid = this._generateInitialGrid();
  }

  _randomType() {
    return Phaser.Math.Between(0, this.gemTypeCount - 1);
  }

  _generateInitialGrid() {
    const grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        let type;
        do {
          type = this._randomType();
        } while (this._wouldMatchAt(grid, row, r, c, type));
        row.push(type);
      }
      grid.push(row);
    }
    return grid;
  }

  // grid henüz tam oluşmamışken (satır satır dolduruyoruz), o hücreye bu tip konursa
  // hemen bir eşleşme oluşur mu diye bakar. Sadece sol ve yukarı komşulara bakmak yeterli.
  // `row`: şu an inşa edilmekte olan, henüz grid'e eklenmemiş satır.
  // `grid`: önceden tamamlanmış satırlar (dikey kontrol için).
  _wouldMatchAt(grid, row, r, c, type) {
    if (c >= 2 && row[c - 1] === type && row[c - 2] === type) return true;
    if (r >= 2 && grid[r - 1][c] === type && grid[r - 2][c] === type) return true;
    return false;
  }

  inBounds(r, c) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr + dc) === 1;
  }

  swap(r1, c1, r2, c2) {
    const tmp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = tmp;
  }

  // Swap sonrası herhangi bir eşleşme oluşuyor mu (geçerli hamle mi)?
  wouldCreateMatch(r1, c1, r2, c2) {
    this.swap(r1, c1, r2, c2);
    const matches = this.findMatches();
    this.swap(r1, c1, r2, c2); // geri al
    return matches.length > 0;
  }

  // Tüm eşleşen grupları bulur. Her grup {r,c} hücrelerinden oluşan bir Set döner.
  findMatches() {
    const matched = new Set();

    // Yatay
    for (let r = 0; r < this.rows; r++) {
      let runStart = 0;
      for (let c = 1; c <= this.cols; c++) {
        const sameAsPrev = c < this.cols && this.grid[r][c] === this.grid[r][runStart];
        if (!sameAsPrev) {
          const runLength = c - runStart;
          if (runLength >= 3) {
            for (let k = runStart; k < c; k++) matched.add(`${r},${k}`);
          }
          runStart = c;
        }
      }
    }

    // Dikey
    for (let c = 0; c < this.cols; c++) {
      let runStart = 0;
      for (let r = 1; r <= this.rows; r++) {
        const sameAsPrev = r < this.rows && this.grid[r][c] === this.grid[runStart][c];
        if (!sameAsPrev) {
          const runLength = r - runStart;
          if (runLength >= 3) {
            for (let k = runStart; k < r; k++) matched.add(`${k},${c}`);
          }
          runStart = r;
        }
      }
    }

    return Array.from(matched).map(key => {
      const [r, c] = key.split(',').map(Number);
      return { r, c, type: this.grid[r][c] };
    });
  }

  removeMatches(matchedCells) {
    matchedCells.forEach(({ r, c }) => {
      this.grid[r][c] = null;
    });
  }

  // Boşlukları düşürür. Her kolon için { fromRow, toRow } hareket listesi döner (animasyon için).
  collapse() {
    const moves = [];
    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (writeRow !== r) {
            this.grid[writeRow][c] = this.grid[r][c];
            this.grid[r][c] = null;
            moves.push({ col: c, fromRow: r, toRow: writeRow });
          }
          writeRow--;
        }
      }
    }
    return moves;
  }

  // Boşları yeni rastgele taşlarla doldurur. Spawn listesi (animasyon için) döner.
  refill() {
    const spawns = [];
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[r][c] === null) {
          const type = this._randomType();
          this.grid[r][c] = type;
          spawns.push({ row: r, col: c, type });
        }
      }
    }
    return spawns;
  }

  hasAvailableMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (c < this.cols - 1 && this.wouldCreateMatch(r, c, r, c + 1)) return true;
        if (r < this.rows - 1 && this.wouldCreateMatch(r, c, r + 1, c)) return true;
      }
    }
    return false;
  }

  shuffle() {
    const flat = [];
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        flat.push(this.grid[r][c]);
    Phaser.Utils.Array.Shuffle(flat);
    let i = 0;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        this.grid[r][c] = flat[i++];
  }
}
