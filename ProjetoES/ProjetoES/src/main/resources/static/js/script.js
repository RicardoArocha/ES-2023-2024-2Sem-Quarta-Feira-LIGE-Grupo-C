let table;

// Aguarda o carregamento do DOM para inicializar os componentes
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
    document.getElementById('saveFileButton').addEventListener('click', saveFileToServer);
    fetchScheduleFile(); 
});

// Manipula a seleção de arquivos CSV, dispara a leitura e processamento do arquivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    parseFile(file);
}

// Lê o arquivo CSV e carrega seus dados na tabela
function parseFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const data = parseCSV(contents);
        createTable(data.headers, data.data);
        createColumnControls(data.headers);
    };
    reader.readAsText(file);
}

function parseCSV(csvData) {
    const rows = csvData.trim().split('\n').map(row => row.split(';').map(field => field.trim()));
    const headers = rows.shift(); // Lê os cabeçalhos
    const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || ""; // Garante consistência
        });
        return obj;
    });

    return { headers, data };
}

// Calcula a semana do ano com base na data fornecida

function calculateWeekOfYear(dateStr) {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const start = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((date - start) / (24 * 60 * 60 * 1000) + start.getDay() + 1) / 7);
    return Math.max(weekNo, 1);
}

function calculateSemesterWeek(dateStr, semesterStartStr) {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const semesterStart = new Date(semesterStartStr);
    let weekNo = Math.floor((date - semesterStart) / (7 * 24 * 60 * 60 * 1000)) + 1;

    return (weekNo < 1 || weekNo > 18) ? "-" : weekNo;
}

function populateAdditionalColumns(data) {
    data.forEach((row, index) => {
        const dateStr = row['Data da aula'];
        if (dateStr) {
            const weekOfYear = calculateWeekOfYear(dateStr);
            const firstSemesterWeek = calculateSemesterWeek(dateStr, '2022-09-01');
            const secondSemesterWeek = calculateSemesterWeek(dateStr, '2023-01-01');

            row['Semana do Ano'] = weekOfYear;
            row['Semana do 1º Semestre'] = firstSemesterWeek;
            row['Semana do 2º Semestre'] = secondSemesterWeek;
            row['ID'] = index + 1; // Define o ID como o índice da linha + 1
        } else {
            row['Semana do Ano'] = "-";
            row['Semana do 1º Semestre'] = "-";
            row['Semana do 2º Semestre'] = "-";
            row['ID'] = index + 1; // Define o ID como o índice da linha + 1
        }
    });
}



function createTable(headers, data) {
    // Remover duplicatas para garantir colunas únicas
    const uniqueHeaders = Array.from(new Set(headers)); // Elimina cabeçalhos duplicados

    // Adiciona a coluna de ID e a coluna de ação
    const columns = [{
        title: "Apagar",
        formatter: "buttonCross", // Usa um ícone de cruz fornecido pelo Tabulator para o botão de apagar
        width: 100,
        align: "center",
        cellClick: function(e, cell) {
            cell.getRow().delete(); // Apaga a linha ao clicar no botão
        },
        download: false,  // Evita que esta coluna seja incluída na exportação para CSV
        headerSort: false  // Desativa a ordenação para esta coluna
    }];

    // Mapeia os cabeçalhos para as colunas
    columns.push(...uniqueHeaders.map(header => ({
        title: header,
        field: header,
        headerFilter: 'input',
        download: true  // Permite que estas colunas sejam incluídas na exportação para CSV
    })));

    // Configurações da Tabulator
    table = new Tabulator("#tableContainer", {
        data: data, // atribui os dados
        columns: columns, // atribui as colunas
        selectable: 1, // Permite a seleção de até 1 linha
        layout: "fitData",
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 20, 50],
        movableColumns: true,
        resizableRows: true,
        initialSort: [{ column: headers[0], dir: "asc" }],
        downloadDataFormatter: data => data,  // Formata os dados para download conforme necessário
        downloadConfig: {
            columnGroups: false,  // Desativa a inclusão de grupos de colunas
            rowGroups: false      // Desativa a inclusão de grupos de linhas
        }
    });
}



// Função chamada quando o botão 'Substituir' é clicado
function markSubstitution(data) {
    function markSubstitution(data) {
        // Armazena as informações da aula que precisa de substituição
        localStorage.setItem('substitutionData', JSON.stringify(data));
        // Redireciona para a página de salas
        window.location.href = '/salas.html'; // Substitua '/salas.html' pelo caminho correto da sua página de salas
    }
}
    table = new Tabulator("#tableContainer", {
        data: data,
        columns: columns,
        layout: "fitData",
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 20, 50],
        movableColumns: true,
        resizableRows: true,
        initialSort: [{ column: headers[0], dir: "asc" }]
    });


// Cria controles de coluna para manipular a visibilidade das colunas
function createColumnControls(headers) {
    const controlsContainer = document.getElementById('column-controls');
    controlsContainer.innerHTML = '';

    headers.forEach(header => {
        const button = document.createElement('button');
        button.textContent = header;
        button.setAttribute('data-column', header);
        button.onclick = () => toggleColumn(header);
        controlsContainer.appendChild(button);
    });
}

// Alterna a visibilidade de uma coluna
function toggleColumn(column) {
    const col = table.getColumn(column);
    col.toggle();
    const button = document.querySelector(`#column-controls button[data-column='${column}']`);
    if (!col.isVisible()) {
        button.classList.add('button-inactive');
    } else {
        button.classList.remove('button-inactive');
    }
}

// Aplica um filtro "OU" para buscar dados na tabela com base no valor inserido
function applyOrFilter() {
    const searchValue = document.getElementById('or-search-input').value.trim();
    if (searchValue) {
        const filterParams = {};
        table.getColumns().forEach(column => {
            filterParams[column.getField()] = searchValue;
        });
        table.setFilter(orFilterFunction, filterParams);
    } else {
        table.clearFilter();
    }
}

// Define a função de filtro para a pesquisa "OU"
function orFilterFunction(data, filterParams) {
    return Object.keys(filterParams).some(key => {
        return data[key] && data[key].toString().toLowerCase().includes(filterParams[key].toLowerCase());
    });
}

// Exporta dados visíveis do Tabulator para CSV e envia para o servidor
function uploadFile() {
    var updatedCSV = exportTabulatorToCSV2();
    var blob = new Blob([updatedCSV], { type: 'text/csv;charset=utf-8;' });

    var formData = new FormData();
    formData.append('file', blob, 'HorarioDeExemploAtualizado.csv');

    fetch('/upload-horarios', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if(response.ok) {
            return response.text();
        }
        throw new Error('Falha ao salvar o arquivo.');
    })
    .then(text => console.log(text))
    .catch(error => console.error(error));
}


function exportTabulatorToCSV() {
    // Adiciona as colunas adicionais ao CSV
    const headers = table.getColumns().map(column => column.getDefinition().title);

    const additionalHeaders = ['ID', 'Semana do Ano', 'Semana do 1º Semestre', 'Semana do 2º Semestre']; // Adiciona 'ID' como primeira coluna
    const uniqueHeaders = Array.from(new Set(additionalHeaders.concat(headers))); // Reorganiza para que 'ID' seja a primeira coluna

    const data = table.getData();

    // Preenche as colunas adicionais e o ID
    populateAdditionalColumns(data);

    const csvData = data.map(row => {
        const id = row['ID']; // Obtém o ID da linha
        return [id, ...uniqueHeaders.slice(1).map(header => row[header] || "")].join(";"); // Ignora 'ID' na parte de preenchimento dos dados
    });

    return [uniqueHeaders.join(';'), ...csvData].join('\n');
}





// Função para salvar o arquivo no servidor
function saveFileToServer() {
    try {
        const csvContent = exportTabulatorToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const formData = new FormData();
        formData.append('file', blob, 'HorarioDeExemploAtualizado.csv');

        fetch('/upload-horarios', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                alert("Ficheiro guardado com sucesso!");
                fetchScheduleFile();
            } else {
                throw new Error('Falha ao guardar o ficheiro.');
            }
        })
        .catch(error => {
            console.error('Erro ao guardar o ficheiro:', error);
            alert("Erro ao guardar o ficheiro.");
        });
    } catch (error) {
        console.error("Erro ao tentar salvar o ficheiro:", error);
        alert("Erro ao tentar salvar o ficheiro.");
    }
}

// Função para carregar o arquivo do servidor
function fetchScheduleFile() {
    fetch('/HorarioDeExemploAtualizado.csv') // Verifique se o caminho está correto
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error("Erro ao carregar o ficheiro do servidor");
        })
        .then(csvData => {
            const data = parseCSV(csvData);

            // Verifique se os dados são válidos
            if (!data || !data.headers || !data.data) {
                throw new Error("Dados inválidos ao carregar o CSV");
            }

            createTable(data.headers, data.data); // Criar tabela sem colunas extras
            createColumnControls(data.headers); // Configurar controle das colunas
        })
        .catch(error => {
            console.error('Erro ao carregar o ficheiro do servidor:', error);
        });
}
function exportTabulatorToCSV2() {
    var headers = table.getColumns().filter(column => column.isVisible()).map(column => column.getDefinition().title);
    var csvContent = [headers.join(';')];

    table.getData().forEach(row => {
        var rowData = headers.map(header => row[header]);
        csvContent.push(rowData.join(';'));
    });

    return csvContent.join('\n');
}
function markSubstitutionByID() {
    const substitutionID = document.getElementById('substitution-id').value; // Obtém o ID inserido
    if (substitutionID.trim() !== "") {
        localStorage.setItem('substitutionID', substitutionID); // Salva no armazenamento local
        window.location.href = '/salas'; // Redireciona para a página de substituição
        console.log("ID enviado:", localStorage.getItem("substitutionID"));
    } else {
        alert("Por favor, insira um ID válido."); // Alerta caso não seja inserido um ID
    }
}