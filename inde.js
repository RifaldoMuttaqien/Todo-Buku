const RENDER_EVENT = 'render-todo';
const STORAGE_KEY = 'books';

document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('inputBook');
    const titleInput = document.getElementById('inputBooktitle');
    const authorInput = document.getElementById('inputBookAuthor');
    const yearInput = document.getElementById('inputBookYear');
    const isCompleteCheckbox = document.getElementById('inputBookIsComplete');
    const unreadList = document.getElementById('incompleteBookshelfList');
    const readList = document.getElementById('completeBookshelfList');
    const searchForm = document.getElementById('searchBook');
    const searchInput = document.getElementById('searchBookTitle');

    function renderBook(book) {
        const id = book.id; 

        const titleText = document.createElement('h4');
        titleText.innerText = book.title;

        const authorText = document.createElement('p');
        authorText.innerText = `Penulis: ${book.author}`;

        const yearText = document.createElement('p');
        yearText.innerText = `Tahun: ${book.year}`;

        const textContainer = document.createElement('div');
        textContainer.classList.add('inner');
        textContainer.append(titleText, authorText, yearText);

        const container = document.createElement('div');
        container.classList.add('item', 'shadow');
        container.dataset.id = id; 
        container.append(textContainer);

        const button = document.createElement('button');
        button.textContent = book.isComplete ? 'Belum Selesai Baca' : 'Selesai Baca';
        button.classList.add('complete-button');
        button.addEventListener('click', function () {
            toggleCompleteStatus(book, container);
        });

        const buttonDelete = document.createElement('button');
        buttonDelete.textContent = 'Hapus';
        buttonDelete.classList.add('delete-button');
        buttonDelete.addEventListener('click', function () {
            if (confirm('Apakah Anda Yakin Menghapus buku ini?')) {
                deleteBook(book, container);
            }
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.append(button, buttonDelete);

        container.appendChild(buttonContainer);

        if (book.isComplete) {
            readList.appendChild(container);
        } else {
            unreadList.appendChild(container);
        }
    }

    function toggleCompleteStatus(book, li) {
    book.isComplete = !book.isComplete;
    const container = li.parentNode; 
    if (book.isComplete) {
        readList.appendChild(li); 
    } else {
        unreadList.appendChild(li); 
    }
    
    updateButtonText(book, li);
    saveDataToStorage();
    document.dispatchEvent(new Event(RENDER_EVENT));
}


    function updateButtonText(book, li) {
        const buttons = li.querySelectorAll('button');
        buttons.forEach(button => {
            if (book.isComplete) {
                if (button.classList.contains('complete-button')) {
                    button.textContent = 'Belum Selesai Baca';
                }
            } else {
                if (button.classList.contains('complete-button')) {
                    button.textContent = 'Selesai Baca';
                }
            }
        });
    }

    function deleteBook(book, li) {
        li.remove();
        saveDataToStorage();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function saveDataToStorage() {
        const books = Array.from(unreadList.children).concat(Array.from(readList.children)).map(li => {
            const book = {
                id: li.dataset.id, 
                title: li.querySelector('h4').innerText,
                author: li.querySelector('p:nth-child(2)').innerText.replace('Penulis: ', ''),
                year: parseInt(li.querySelector('p:nth-child(3)').innerText.replace('Tahun: ', '')),
                isComplete: li.parentNode.id === 'completeBookshelfList'
            };
            return book;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }

    function loadDataFromStorage() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function renderDataFromStorage() {
        const books = loadDataFromStorage();
        books.forEach(book => renderBook(book));
    }

    function addBook(title, author, year, isComplete) {
        const id = +new Date(); 
        const book = {
            id: id,
            title,
            author,
            year,
            isComplete
        };
        renderBook(book);
        saveDataToStorage();
        titleInput.value = '';
        authorInput.value = '';
        yearInput.value = '';
        isCompleteCheckbox.checked = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();

        unreadList.innerHTML = '';
        readList.innerHTML = '';

        const books = loadDataFromStorage();
        books.forEach(book => {
            if (book.title.toLowerCase().includes(searchTerm)) {
                renderBook(book);
            }
        });
    });

    bookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const year = parseInt(yearInput.value.trim(), 10);
        const isComplete = isCompleteCheckbox.checked;
        if (title && author && year) {
            addBook(title, author, year, isComplete);
        } else {
            alert('Mohon lengkapi data buku!');
        }
    });

    renderDataFromStorage();
});
