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


board = [5,7,6,8,9,1,4,2,3,
	     8,1,9,2,3,4,7,5,6,
         2,4,3,5,6,7,1,8,9,
         1,3,2,4,5,6,9,7,8,
         7,9,8,1,2,3,6,4,5,
         4,6,5,7,8,9,3,1,2,
         3,5,4,6,7,8,2,9,1,
         6,8,7,9,1,2,5,3,4,
         9,2,1,3,4,5,8,6,7]

const sudoku = new Sudoku(board)
const app = document.querySelector("#app")

app.append(sudoku.getHTML())

check_btn = document.querySelector('#check')
check_btn.addEventListener('click', () => {
	console.log('TODO')
})