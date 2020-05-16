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
		this.segment = parseInt(this.y / 3) * 3 +parseInt(this.x / 3)
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

		const values = this.data.split('').map(x => parseInt(x))

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
		// this.body.map(x => x.element.value = x.value ? x.value : '')
		// this.body.filter(x => x.fixed).map(x => x.element.classList.add('start'))
		// this.body.map(x => x.element.classList.remove)
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


class SudoTask {
	constructor() {
		this.base = 3
		this.side = this.base * 3
		this.rows = this.getArray()
		this.columns = this.getArray()
	}

	pattern(r, c) {
		return (this.base * (r % this.base) + parseInt(r / this.base) + c) % this.side
	}

	shuffle(s) {
	    let j, x, i;
	    for (i = s.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1))
	        x = s[i]
	        s[i] = s[j]
	        s[j] = x
	    }
	    return s
	}

	getArray() {
		const arr = []
		for (let i of this.shuffle([...Array(this.base).keys()])) {
			for (let j of this.shuffle([...Array(this.base).keys()])) {
				arr.push(j * this.base + i)
			}
		}
		return arr
	}

	getBoard() {
		const board = []
		const cells = this.side * this.side
		const empties = parseInt((cells * 3) / 5) 
		const nums = [...Array(this.base*this.base).keys()].map(x=>x+1)
		for (let c of this.columns) {
			for (let r of this.rows) {
				board.push(nums[this.pattern(r, c)])
			}
		}
		for (let s of this.shuffle([...Array(cells).keys()]).slice(0, empties)) {
			board[s] = 0
		}
		return board.join('')
	}

}


const sudoku_task = new SudoTask()
const sudoku = new Sudoku(sudoku_task.getBoard())
const app = document.querySelector("#app")

app.append(sudoku.getHTML())
