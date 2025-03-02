let movies = []
let currentSort = { column: null, direction: 1 };
let minYearGlobal = 0;
let maxYearGlobal = 0;

fetch('movies.json')
    .then(response => response.json())
    .then(data => {
        movies = data;
        initialize();
    })
    .catch(error => console.error('Error loading movie data:', error));

function initialize() {
    populateFilters();
    renderTable(movies);
    addEventListeners();
}

function populateFilters() {
    const directors = new Set();
    const years = movies.map(movie => movie.release_year);
    minYearGlobal = Math.min(...years);
    maxYearGlobal = Math.max(...years);

    movies.forEach(movie => {
        movie.director.split(/,\s*|\n/).forEach(d => {
            const director = d.trim();
            if (director) directors.add(director);
        });
    });

    populateDropdown('directorFilter', [...directors].sort());
            
    document.getElementById('minYear').placeholder = minYearGlobal;
    document.getElementById('maxYear').placeholder = maxYearGlobal;
    document.getElementById('minYear').min = minYearGlobal;
    document.getElementById('minYear').max = maxYearGlobal;
    document.getElementById('maxYear').min = minYearGlobal;
    document.getElementById('maxYear').max = maxYearGlobal;
}

function renderTable(data) {
    const tbody = document.getElementById('movieTable');
    tbody.innerHTML = '';

    data.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${movie.rank}</td>
            <td>${movie.title}</td>
            <td>${movie.director}</td>
            <td>${movie.release_year}</td>
            <td>${movie.box_office}</td>
        `;
        tbody.appendChild(row);
    });

    updateSortIndicators();
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction *= -1;
    } else {
        currentSort.column = column;
        currentSort.direction = 1;
    }

    const sorted = [...movies].sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (column === 'box_office') {
            valA = Number(valA.replace(/[^0-9]/g, ''));
            valB = Number(valB.replace(/[^0-9]/g, ''));
        }

        return valA > valB ? 1 * currentSort.direction : -1 * currentSort.direction;
    });

    renderTable(sorted);
}

function filterTable() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const director = document.getElementById('directorFilter').value;
    const minYear = parseInt(document.getElementById('minYear').value) || minYearGlobal;
    const maxYear = parseInt(document.getElementById('maxYear').value) || maxYearGlobal;

    const filtered = movies.filter(movie => {
        const matchesTitle = movie.title.toLowerCase().includes(searchTerm);
        const matchesDirector = director === '' || 
            movie.director.split(/,\s*|\n/).some(d => d.trim() === director);
        const matchesYear = movie.release_year >= minYear && 
            movie.release_year <= maxYear;

        return matchesTitle && matchesDirector && matchesYear;
    });

    renderTable(filtered);
}

function resetFilters() {
    document.getElementById('search').value = '';
    document.getElementById('directorFilter').value = '';
    document.getElementById('minYear').value = '';
    document.getElementById('maxYear').value = '';
    currentSort = { column: null, direction: 1 };
    renderTable(movies);
}

function populateDropdown(id, values) {
    const dropdown = document.getElementById(id);
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

function updateSortIndicators() {
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.textContent = '';
    });
            
    if (currentSort.column) {
        const header = document.querySelector(`th[onclick="sortTable('${currentSort.column}')"]`);
        if (header) {
            header.querySelector('.sort-indicator').textContent = 
                currentSort.direction === 1 ? '↑' : '↓';
        }
    }
}

function addEventListeners() {
    document.getElementById('search').addEventListener('input', filterTable);
    document.getElementById('directorFilter').addEventListener('change', filterTable);
    document.getElementById('minYear').addEventListener('change', filterTable);
    document.getElementById('maxYear').addEventListener('change', filterTable);
}

initialize();
