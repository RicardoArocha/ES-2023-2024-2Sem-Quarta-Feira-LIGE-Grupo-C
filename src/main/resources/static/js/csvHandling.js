document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    parseFile(file);
}

function parseFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const rows = parseCSV(contents);
        displayTable(rows); // Exibe a tabela
        createColumnCheckboxes(rows[0]); // Cria as checkboxes
    };
    reader.readAsText(file);
}

function parseCSV(csvData) {
    const rows = csvData.split('\n').map(row => {
        return row.split(';').map(field => field.trim());
    });
    return rows;
}

function displayTable(rows) {
    const table = document.createElement('table');
    table.id = 'csvDataTable';
    table.className = 'csv-table';

    // Adiciona cabeçalho
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    rows[0].forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Adiciona corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    rows.slice(1).forEach(rowData => {
        const row = tbody.insertRow();
        rowData.forEach((cellData, index) => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });

    // Adiciona a tabela ao container
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    container.appendChild(table);
}

function createColumnCheckboxes(headers) {
    const container = document.getElementById('checkboxesContainer');
    container.innerHTML = '';

    headers.forEach((header, index) => {
        const checkboxWrapper = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'columnToggleCheckbox';
        checkbox.id = 'checkbox' + index;
        checkbox.checked = true;
        checkbox.dataset.columnIndex = index;
        checkbox.addEventListener('change', toggleColumnVisibility);

        const label = document.createElement('label');
        label.htmlFor = 'checkbox' + index;
        label.textContent = header;

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        container.appendChild(checkboxWrapper);
    });
}

function toggleColumnVisibility(event) {
    const columnIndex = event.target.dataset.columnIndex;
    const table = document.getElementById('csvDataTable');
    const allRows = table.getElementsByTagName('tr'); // Pega todas as linhas da tabela

    // Itera por todas as linhas da tabela e alterna a visibilidade da coluna específica
    for (let row of allRows) {
        let cells = row.getElementsByTagName('th').length > 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
        if (cells.length > columnIndex) {
            cells[columnIndex].style.display = cells[columnIndex].style.display === 'none' ? '' : 'none';
        }
    }
}
