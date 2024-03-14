let table;

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
        const data = parseCSV(contents);
        createTable(data.headers, data.data);
    };
    reader.readAsText(file);
}

function parseCSV(csvData) {
    const rows = csvData.trim().split('\n').map(row => row.split(';').map(field => field.trim()));
    const headers = rows.shift(); // Remove a primeira linha e considera-a como cabecalhos
    const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });
    return { headers, data };
}

function createTable(headers, data) {
    table = new Tabulator("#tableContainer", {
        data: data,
        columns: headers.map(header => {
            return { 
                title: header, 
                field: header,
                headerFilter: 'input' // Adiciona uma barra de filtro de entrada em todas as colunas
            };
        }),
        layout: "fitData",
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 20, 50],
        movableColumns: true,
        resizableRows: true,
        initialSort: [{ column: headers[0], dir: "asc" }]
    });
}