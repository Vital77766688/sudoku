function keyDownListener(event, item, object) {
	const key = event.key
	if ('123456789'.includes(key) && !item.fixed) {
		item.value = parseInt(key)
	} else if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Tab'].includes(key)) {
		const row = object.getRow(item.y)
		const column = object.getColumn(item.x)
		switch (key) {
			case 'ArrowUp':
				if (item.y > 0) column[item.y-1].element.focus()
				break
			case 'ArrowRight':
				if (item.x < 8) row[item.x+1].element.focus()
				break
			case 'ArrowDown':
				if (item.y < 8) column[item.y+1].element.focus()
				break
			case 'ArrowLeft':
				if (item.x > 0) row[item.x-1].element.focus()
				break
			case 'Tab':
				event.preventDefault()
				if (item.id < 80) {
					object.body[item.id+1].element.focus()
				} else {
					object.body[0].element.focus()
				}
				break
		}
	} else if (['Backspace', 'Delete'].includes(key)) {
		item.value = 0
	} else if (['F5', 'F12'].includes(key)) {
		
	} else {
		event.preventDefault()
	}
	object.updateView()
}


function addLines(event, item, object) {
	item.selected = true
	object.getRow(item.y)
		.filter(x => x.id != item.id)
		.map(x => x.supported =true)
	object.getColumn(item.x)
		.filter(x => x.id != item.id)
		.map(x => x.supported = true)
	object.updateView()
}


function removeLines(event, item, object) {
	item.selected = false
	object.getRow(item.y)
		.filter(x => x.id != item.id)
		.map(x => x.supported =false)
	object.getColumn(item.x)
		.filter(x => x.id != item.id)
		.map(x => x.supported = false)
	object.updateView()
}


class Item {
	constructor(id, value) {
		this.id = id
		this.x = id % 9
		this.y = parseInt(id / 9)
		this.segment = parseInt(this.y / 3) * 3 + parseInt(this.x / 3)
		this.value = value
		this.fixed = this.value ? true : false
		this.selected = false
		this.supported = false
		this.element = this.getElement()
	}

	getElement() {
		const div = document.createElement('input')
		div.classList.add('item')
		div.setAttribute('type', 'text')
		div.setAttribute('maxlength', '1')
		div.setAttribute('data-cell-id', this.id)
		return div
	}
}


class Sudoku {
	constructor(data) {
		this.data = data
		this.body = []

		const values = [...this.data]

		for (let i=0; i<81; i++) {
			const value = values.shift()
			this.body.push(new Item(i, value))
		}
		this.updateView()
	}

	getRow(n) {
		return this.body.filter(cell => cell.y === n)
	}

	getColumn(n) {
		return this.body.filter(cell => cell.x === n)
	}

	getSegment(n) {
		return this.body.filter(cell => cell.segment === n)
	}

	getCurrentBoard() {
		const board = []
		this.body.forEach(item => {
			board.push(item.value)
		})
		return board
	}

	getHTML() {
		const root = document.createElement('div')
		root.classList.add('game');

		for (let i=0; i<9; i++) {
			const segmentDiv = document.createElement('div')
			segmentDiv.classList.add('segment')

			const segment = this.getSegment(i)

			for (let item of segment) {
				item.element.addEventListener('keydown', event => keyDownListener(event, item, this))
				item.element.addEventListener('mouseover', event => addLines(event, item, this))
				item.element.addEventListener('mouseleave', event => removeLines(event, item, this))
				segmentDiv.append(item.element)
			}

			root.append(segmentDiv)
		}
		return root
	}

	updateView() {
		for (let item of this.body) {
			item.element.value = item.value ? item.value : ''
			if (item.fixed) item.element.classList.add('start')
			item.element.classList.remove('selected')
			if (item.selected) item.element.classList.add('selected')
			item.element.classList.remove('supported')
			if (item.supported) item.element.classList.add('supported')
		}
	}
}


board0 = [4,2,7,1,9,6,5,3,8,
	      3,5,9,8,2,4,1,7,6,
          1,6,8,3,5,7,2,9,4,
          9,4,2,5,8,1,7,6,3,
          6,8,3,9,7,2,4,5,1,
          5,7,1,6,4,3,9,8,2,
          8,1,5,4,3,9,6,2,7,
          7,3,6,2,1,5,8,4,9,
          2,9,4,7,6,8,3,1,5]


board = [4,0,0,0,9,6,0,0,8,
         0,5,9,0,2,4,0,0,6,
         0,6,0,3,0,0,0,9,4,
         0,0,2,0,0,0,0,6,0,
         6,8,0,0,0,0,4,5,1,
         0,7,0,0,0,0,0,8,0,
         8,1,5,4,0,0,6,2,7,
         7,0,0,0,0,0,8,0,0,
         2,0,0,0,6,8,0,1,5]


const sudoku_init = new Sudoku(board0)

const sudoku = new Sudoku(board)
const app = document.querySelector("#app")


//app.append(sudoku_init.getHTML())
app.append(sudoku.getHTML())



board0_0 = [...board]

function findEmpty(board) {
	return board.indexOf(0)
}


function validNumber(board, num, pos) {
	const sudoku = new Sudoku(board)
	const item = sudoku.body.filter(x => x.id === pos)[0]
	if (sudoku.getRow(item.y).filter(x => x.value === num)[0]) return false
	if (sudoku.getColumn(item.x).filter(x => x.value === num)[0]) return false
	if (sudoku.getSegment(item.segment).filter(x => x.value === num)[0]) return false
	return true
}

function solve(board) {
	const empty = findEmpty(board)
	if (empty === -1) return true

	for (let i=1; i<10; i++) {
		if (validNumber(board, i, empty)) {
			board[empty] = i
			if (solve(board)) return true
			board[empty] = 0
		}
	}

	return false
}


// solve(board0_0)

// const sudoku_solved = new Sudoku(board0_0)
// app.append(sudoku_solved.getHTML())

check_btn = document.querySelector('#check')
check_btn.addEventListener('click', () => {
	console.log('TODO')
})




const test02 = [0,8,9,0,4,0,6,0,5,
				0,7,0,0,0,8,0,4,1,
				5,6,0,9,0,0,0,0,8,
				0,0,0,7,0,5,0,9,0,
				0,9,0,4,0,1,0,5,0,
				0,3,0,9,0,6,0,1,0,
				8,0,0,0,0,0,0,0,7,
				0,2,0,8,0,0,0,6,0,
				0,0,6,0,7,0,0,8,0]