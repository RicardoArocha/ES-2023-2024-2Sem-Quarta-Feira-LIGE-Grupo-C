let table;
let roomData = []; // Dados das salas
let scheduleData = []; // Dados dos horários

// Evento para inicializar a página

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('csvFileInput').addEventListener('change', handleFileSelect2, false);
    loadRoomData();
    loadScheduleData();
    checkPreselectedSchedule();
    loadSuggestions();
    const substitutionData = JSON.parse(localStorage.getItem('substitutionData'));
    if (substitutionData) {
        applySubstitutionFilters(substitutionData);
    }    
    const retrievedID = localStorage.getItem("substitutionID"); // Recuperar o ID do `localStorage`
    console.log("ID recuperado:", retrievedID)
    document.getElementById('suggestAllocationButton').addEventListener('click', function(event) {
        event.preventDefault(); // Prevents the form from being submitted
        const form = document.getElementById('substitutionForm'); 
        suggestAllocation(form); // Calls the suggestAllocation function
     //  location.reload();

    });


});


// Carrega os dados pré-selecionados de horários, se houver
function checkPreselectedSchedule() {
    const storedData = localStorage.getItem("scheduleData");
    if (storedData) {
        const scheduleData = JSON.parse(storedData);
        document.getElementById('dayOfWeek').value = scheduleData['Data da aula'];
        document.getElementById('startTime').value = scheduleData['Hora início da aula'];
        checkAvailability();
    }
}

// Manipula a seleção de arquivo e processa o arquivo CSV
function handleFileSelect2(event) {
    const file = event.target.files[0];
    parseFile2(file);
}

// Lê e processa o arquivo CSV carregado
function parseFile2(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const data = parseCSV2(contents);
        createTable(data.headers, data.data);
    };
    reader.readAsText(file);
}

// Carrega dados das salas a partir de um arquivo CSV
function loadRoomData() {
    const roomCsvUrl = '/caracterizacaodasSalas.csv';
    fetch(roomCsvUrl)
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV2(csvData); // Aqui é onde você deve capturar os dados parseados
            roomData = parsedData.data; // Agora roomData é apenas o array 'data'
            if(parsedData.headers && parsedData.data) { // Certifique-se de que ambos estão definidos
                createTable(parsedData.headers, parsedData.data);
            }
        })
        .catch(error => console.error('Erro ao carregar os dados das salas:', error));
}

// Carrega dados de horário a partir de um arquivo CSV
function loadScheduleData() {
    const scheduleCsvUrl = '/HorarioDeExemploAtualizado.csv';
    fetch(scheduleCsvUrl)
        .then(response => response.text())
        .then(csvData => {
            scheduleData = parseCSV2(csvData).data;
            console.log("Dados dos horários carregados", scheduleData);
            loadHeatMapDias();
            console.log(calcularSalasOcupadasMes(5, 2, "10:00:00", "10:30:00"));
        })
        .catch(error => console.error('Erro ao carregar os dados dos horários:', error));
}

function loadHeatMapDias() {

    let heatmapVisibleDias = false; // Variável para rastrear se o heatmap está visível ou não

    // Função para alternar entre mostrar e esconder o heatmap
    function toggleHeatmap() {
        if (heatmapVisibleDias) {
            hideHeatmap();
        } else {
            showHeatmap();
        }
    }

    // Função para mostrar o heatmap
    function showHeatmap() {
        criarHeatmapMatrizDias();
        heatmapVisibleDias = true;
        document.getElementById('showHeatmapButton').textContent = "Ocultar HeatMap Semanal";
    }

    // Função para esconder o heatmap
    function hideHeatmap() {
        // Remover o heatmap do DOM
        const heatmapContainer = document.getElementById('heatmap-containerDias');
        heatmapContainer.innerHTML = ""; // Remove todos os filhos do container

        heatmapVisibleDias = false; // Correção aqui
        document.getElementById('showHeatmapButton').textContent = "Visualizar HeatMap semanal";
    }
    // Adiciona um evento de clique ao botão para alternar o heatmap
    document.getElementById('showHeatmapButton').addEventListener('click', toggleHeatmap);
}

// Processa dados CSV em um formato utilizável
function parseCSV2(csvData) {
    const rows = csvData.trim().split('\n');
    const headers = rows.shift().split(';').map(header => header.trim());
    const data = rows.map(row => {
        const values = row.split(';').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || "";
            return obj;
        }, {});
    });
    return { headers, data };
}

// Verifica a disponibilidade das salas com base na seleção de data e hora
function checkAvailability() {
    const startTimeInput = document.getElementById('startTime').value;
    const dayInput = document.getElementById('dayOfWeek').value;
    const searchDate = dayInput.split('-').reverse().join('/');
    const searchStartTime = convertTimeToMinutes(startTimeInput);

       // Check if startTimeInput or dayInput is empty or invalid
       if (!startTimeInput.trim() || !dayInput.trim()) {
        throw new Error("Please provide a valid start time and day of the week.");
    }

    const relevantSchedules = scheduleData.filter(schedule => {
        let roomBookedDate = schedule['Data da aula'];
        let roomStartTime = convertTimeToMinutes(schedule['Hora início da aula']);
        let roomEndTime = convertTimeToMinutes(schedule['Hora fim da aula']);
        return roomBookedDate === searchDate && searchStartTime >= roomStartTime && searchStartTime < roomEndTime;
    });

    updateTableWithAvailability(relevantSchedules);
}

// Atualiza a tabela com salas disponíveis
function updateTableWithAvailability(relevantSchedules) {
    if (!relevantSchedules) {
        throw new Error("relevantSchedules is null or undefined.");
    }
    let availableRooms = roomData.filter(room => {
        return !relevantSchedules.some(schedule => schedule['Sala atribuída à aula'] === room['Nome sala']);
    });
    table.setData(availableRooms);
    console.log(`Salas disponíveis: ${availableRooms.map(r => r.roomName).join(', ')}`);
}

// Converte hora no formato HH:MM para minutos
function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
}

// Redefine os filtros para o estado original
function resetFilters() {
    const startTimeInput = document.getElementById('startTime');
    const dayOfWeekInput = document.getElementById('dayOfWeek');
    
    // Check if the required elements exist
    if (!startTimeInput || !dayOfWeekInput) {
      throw new Error('Cannot find required input elements for resetFilters function.');
    }
  
    // Reset the input values
    startTimeInput.value = '';
    dayOfWeekInput.value = '';
  
    // Check if the table exists
    if (table) {
      table.clearFilter(true); // remove filtros, mas mantém os dados da tabela
      table.setData(roomData); // redefine os dados da tabela para o conjunto de dados original
    }
}

// Cria a tabela com os dados das salas
function createTable(headers, data) {
    if (!headers || !data) {
        console.error('Dados ou cabeçalhos indefinidos para criar a tabela');
        return;
    }

    const columns = [{
        title: "Ações",
        headerSort: false,
        formatter: function(cell, formatterParams) {
            const button = document.createElement("button");
            button.textContent = localStorage.getItem("substitutionID") ? "Marcar Substituição" : "Marcar Aula";
            button.onclick = function() {
                const rowData = cell.getRow().getData();
                localStorage.setItem("selectedRow", JSON.stringify(rowData));
                console.log(button.textContent + " selecionada:", rowData);
                if (localStorage.getItem("substitutionID")) {
                    confirmSubstitution(rowData);
                } else {
                    openAddClassModal();
                    console.log("Aberto o modal de adição de aula");
                }
            };
            return button;
        },
        width: 200,
        hozAlign: "center",
    }];

    headers.forEach(header => {
        columns.push({
            title: header,
            field: header,
            headerFilter: 'input',
        });
    });

    table = new Tabulator("#tableContainer", {
        data: data,
        columns: columns,
        layout: "fitDataStretch",
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 20, 50],
        movableColumns: true,
        resizableRows: true,
        initialSort: [{ column: headers[0], dir: "asc" }],
    });
}






// Carrega os dados atualizados para o servidor
function uploadFile2() {
    var fileInput = document.getElementById('csvFileInput');
    var file = fileInput.files[0];
    
    var formData = new FormData();
    formData.append('file', file, 'caracterizacaodassalas.csv');

    fetch('/upload-salas', { // Endpoint atualizado para o upload de salas
        method: 'POST',
        body: formData
    })
    .then(response => {
        if(response.ok) {
            alert('Arquivo de salas salvo com sucesso.');
            loadRoomData(); // Recarregar os dados da sala após o sucesso do upload
        } else {
            throw new Error('Falha ao salvar o arquivo de salas.');
        }
    })
    .catch(error => {
        console.error('Erro ao salvar o arquivo de salas:', error);
        alert('Erro ao salvar o arquivo de salas.');
    });
}
// Criação do modal HTML
// Lista de características das salas
const roomCharacteristicsList = [
    "Anfiteatro aulas", "Apoio técnico eventos", "Arq 1", "Arq 2", "Arq 3", "Arq 4", "Arq 5", "Arq 6", "Arq 9",
    "BYOD (Bring Your Own Device)", "Focus Group", "Horário sala visível portal público",
    "Laboratório de Arquitetura de Computadores I", "Laboratório de Arquitetura de Computadores II",
    "Laboratório de Bases de Engenharia", "Laboratório de Eletrônica", "Laboratório de Informática",
    "Laboratório de Jornalismo", "Laboratório de Redes de Computadores I",
    "Laboratório de Redes de Computadores II", "Laboratório de Telecomunicações",
    "Sala Aulas Mestrado", "Sala Aulas Mestrado Plus", "Sala NEE", "Sala Provas", "Sala Reunião",
    "Sala de Arquitetura", "Sala de Aulas normal", "Videoconferência", "Átrio"
];

// Criação do modal HTML
const modalHTML = `
<div id="substitutionModal" class="modal" style="display: none;"> <!-- Modal começa fechado -->
  <div class="modal-content">
    <span class="close-btn" onclick="closeModal()">&times;</span>
    <h2>Inserir Dados de Substituição</h2>

    <!-- Informações da linha de substituição -->
    <div>
      <p><strong>ID:</strong> <span id="modal-id"></span></p>
      <p><strong>Sala:</strong> <span id="modal-room"></span></p>
      <p><strong>Edifício:</strong> <span id="modal-building"></span></p>
    </div>

    <form id="substitutionForm" onsubmit="submitSubstitution(event)">
      <label for="start-time">Hora início da aula:</label>
      <input type="time" id="start-time" name="start-time" required>

      <label for="end-time">Hora fim da aula:</label>
      <input type="time" id="end-time" name="end-time" required>

      <label for="date">Data da aula:</label>
      <input type="date" id="date" name="date" required>

      <!-- Menu suspenso com opção para múltiplas seleções -->
      <label for="room-attributes">Características da sala pedida para a aula:</label>
      <select id="room-attributes" name="room-attributes" multiple>
        ${roomCharacteristicsList.map(char => `<option value="${char}">${char}</option>`).join('')}
      </select>

      <button type="submit">Substituir</button>
      


    </form>
    <button id="suggestAllocationButton" button type= >Sugerir Alocação</button>
   

</div>
  </div>
</div>
`;
// Adiciona o modal ao corpo da página
document.body.insertAdjacentHTML('beforeend', modalHTML);

// Abre o modal
function openModal() {
    document.getElementById("substitutionModal").style.display = "block"; // Exibe o modal
}

function closeModal() {
    document.getElementById("substitutionModal").style.display = "none"; // Fecha o modal
}

// Função chamada ao clicar no botão "Marcar Substituição"
function confirmSubstitution(rowData) {
    if (rowData === undefined || rowData === null) {
        return;
      }
    // Obter informações para preencher o modal
    const selectedID = localStorage.getItem("substitutionID"); // ID recuperado
    const roomName = rowData['Nome sala']; // Sala
    const buildingName = rowData['Edifício']; // Edifício

    // Atualiza elementos no modal
    document.getElementById("modal-id").textContent = selectedID;
    document.getElementById("modal-room").textContent = roomName;
    document.getElementById("modal-building").textContent = buildingName;
    document.getElementById("start-time").value = rowData['Hora início da aula'] || ""; // Hora de início
    document.getElementById("end-time").value = rowData['Hora fim da aula'] || ""; // Hora de fim
    document.getElementById("date").value = rowData['Data da aula'] || ""; // Data da aula

    openModal(); // Abre o modal para permitir substituição
}
 

// Função para submeter a substituição
// Função para submeter a substituição
function submitSubstitution(event) {
    event.preventDefault(); // Prevenir comportamento padrão do formulário

    const form = document.getElementById("substitutionForm");
    const formData = new FormData(form);

    const selectedRow = JSON.parse(localStorage.getItem("selectedRow")); // Linha selecionada
    console.log(selectedRow);
    const selectedID = localStorage.getItem("substitutionID"); // ID do `localStorage`

    const rowToUpdate = scheduleData.find(row => row["ID"] === selectedID); // Encontra a linha pelo ID

    if (rowToUpdate) {
        const newDate = formData.get("date"); // Nova data para o cálculo das semanas

        // Atualiza campos do formulário
        rowToUpdate["Dia da semana"] = getWeekdayFromDate(formatDate(newDate));
        rowToUpdate["Hora início da aula"] = formatTime(formData.get("start-time")); // Formata para HH:MM:SS
        rowToUpdate["Hora fim da aula"] = formatTime(formData.get("end-time")); // Idem
        rowToUpdate["Data da aula"] = formatDate(newDate); // Formata para DD/MM/AAAA
        rowToUpdate["Sala atribuída à aula"] = selectedRow["Nome sala"]; // Preenche a sala atribuída
        // Atualiza as semanas
        rowToUpdate["Semana do Ano"] = calculateWeekOfYear(newDate); // Semana do ano
        rowToUpdate["Semana do 1º Semestre"] = calculateSemesterWeek(newDate, '2022-10-01'); // Semana do 1º semestre
        rowToUpdate["Semana do 2º Semestre"] = calculateSemesterWeek(newDate, '2023-02-01'); // Semana do 2º semestre
        // Obter as características selecionadas do menu suspenso
        const selectedCharacteristics = Array.from(
            formData.getAll("room-attributes")
        ).join(", "); // Converte para uma string separada por vírgulas
        
        rowToUpdate["Características da sala pedida para a aula"] = selectedCharacteristics; // Preenche o campo com as características

        saveScheduleToCSV(); // Salva o arquivo CSV atualizado
        closeModal(); // Fecha o modal

        alert("Substituição efetuada com sucesso!"); // Notifica o usuário sobre a substituição bem-sucedida
    }
}

// Função para garantir que a hora seja formatada corretamente
function formatTime(time) {
    const timeParts = time.split(':').map(part => part.padStart(2, '0'));
    if (timeParts.length === 3) {
        return timeParts.join(':');
    } else if (timeParts.length === 2) {
        return `${timeParts[0]}:${timeParts[1]}:00`; // Adiciona segundos se não estiverem presentes
    }
    return time; // Retorna como está se não puder formatar
}

// Função para formatar a data como DD/MM/AAAA
function formatDate(dateStr) {
    const dateParts = dateStr.split('-');
    if (dateParts.length === 3) {
        return `${dateParts[2].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[0]}`; // Inverte para DD/MM/AAAA
    }
    return dateStr; // Retorna como está se não puder formatar
}
//////////////////////////////////////////////////////////////////////////////////77






// Função para salvar o CSV com a formatação correta
function loadCSVHeaders(csvData) {
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(';').map(header => header.trim());
    return headers;
}

// Função para salvar o CSV com a formatação correta
function saveScheduleToCSV() {
    fetch('/HorarioDeExemploAtualizado.csv')
        .then(response => response.text())
        .then(csvData => {
            // Carrega os cabeçalhos dinamicamente do arquivo CSV de exemplo
            const headers = loadCSVHeaders(csvData);
            console.log(headers);
            // Cria o conteúdo CSV com os cabeçalhos dinâmicos
            const csvContent = [
                headers.join(";"), // Cabeçalho
                ...scheduleData.map(row => {
                    return headers.map(header => {
                        let value = row[header] || "";

                        // Formatando campos específicos
                        if (header === "Hora início da aula" || header === "Hora fim da aula") {
                            value = formatTime(value); // Formatar hora para HH:MM:SS
                        } else if (header === "Data da aula") {
                            value = formatDate(value); // Formatar data para DD/MM/AAAA
                        }

                        return value;
                    }).join(";"); // Mantém o formato correto para o CSV
                })
            ].join("\n");

            // Cria um Blob com o conteúdo CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Cria um FormData com o Blob e envia para o servidor
            const formData = new FormData();
            formData.append('file', blob, 'HorarioDeExemploAtualizado.csv');

            fetch('/upload-horarios', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (response.ok) {
                    console.log("Horário atualizado com sucesso.");
                } else {
                    throw new Error("Erro ao salvar o horário.");
                }
            })
            .catch(error => console.error("Erro ao salvar o horário:", error));
        })
        .catch(error => console.error('Erro ao carregar os cabeçalhos do arquivo CSV:', error));
}
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


function  calcularSalasOcupadasDias (diaSemana, horaInicio, horaFim) {
    const searchStartTime = convertTimeToMinutes(horaInicio);
    const searchEndTime = convertTimeToMinutes(horaFim);

    const horariosNoDia = scheduleData.filter(schedule => schedule['Dia da semana'] === diaSemana);

    let salasOcupadas = 0;

    for (const horario of horariosNoDia) {
        const roomStartTime = convertTimeToMinutes(horario['Hora início da aula']);
        const roomEndTime = convertTimeToMinutes(horario['Hora fim da aula']);

        if (
            //Se o tempo de inicio da procura for depois ou igual ao tempo de início da sala e antes do tempo de término da sala
            (searchStartTime >= roomStartTime && searchStartTime < roomEndTime) ||
            //Se o tempo de término da procura for após o tempo de início da sala e antes ou igual ao tempo de término da sala
            (searchEndTime > roomStartTime && searchEndTime <= roomEndTime) ||
            //Se o intervalo de procura envolver completamente o intervalo de tempo da sala 
            (searchStartTime <= roomStartTime && searchEndTime >= roomEndTime)
        ) {
            salasOcupadas++;
        }
    }
    return salasOcupadas;
}

// Função para criar o heatmap na forma de matriz
function criarHeatmapMatrizDias() {
    const diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const horas = Array.from({ length: 30 }, (_, index) => index + 8 * 2); // 8 horas (8 * 2 intervalos de meia hora)

    const heatmapContainer = document.getElementById('heatmap-containerDias');

    // Cria uma tabela para representar o heatmap
    const heatmapTable = document.createElement('table');
    heatmapTable.classList.add('heatmap-tableDias');

    // Cria uma linha para os rótulos dos dias da semana
    const diasLabelRow = document.createElement('tr');
    diasLabelRow.classList.add('dias-label-rowDias');

    // Cria uma célula vazia para o canto superior esquerdo
    const emptyCell = document.createElement('td');
    emptyCell.classList.add('empty-cellDias');
    diasLabelRow.appendChild(emptyCell);

    // Adiciona os rótulos dos dias da semana
    for (const dia of diasDaSemana) {
        const diaLabelCell = document.createElement('td');
        diaLabelCell.classList.add('dia-label-cellDias');
        diaLabelCell.textContent = dia;
        diasLabelRow.appendChild(diaLabelCell);
    }

    heatmapTable.appendChild(diasLabelRow);

    // Cria as linhas e colunas da tabela
    for (const hora of horas) {
        const horaRow = document.createElement('tr');
        horaRow.classList.add('heatmap-rowDias');

        // Adiciona o rótulo da hora para cada linha
        const horaLabelCell = document.createElement('td');
        horaLabelCell.classList.add('hora-label-cellDias');
        const horaInicio = `${Math.floor(hora / 2)}:${(hora % 2) * 30}`.padStart(2, '0');
        horaLabelCell.textContent = horaInicio;
        horaRow.appendChild(horaLabelCell);

        for (const dia of diasDaSemana) {
            const salaCell = document.createElement('td');
            salaCell.classList.add('heatmap-cellDias');

            const horaInicio = `${Math.floor(hora / 2)}:${(hora % 2) * 30}`.padStart(2, '0');
            const horaFim = `${Math.floor((hora + 1) / 2)}:${((hora + 1) % 2) * 30}`.padStart(2, '0');

            const salasOcupadas = calcularSalasOcupadasDias(dia, horaInicio, horaFim);

            // Define a cor do quadrado com base no número médio de salas ocupadas
            salaCell.style.backgroundColor = getColorForSalasOcupadas(salasOcupadas);

            // Adiciona um evento de hover para exibir o número de salas ao passar o cursor sobre a célula
            salaCell.addEventListener('mouseenter', () => {
                salaCell.textContent = `Salas: ${salasOcupadas}`;
            });
            salaCell.addEventListener('mouseleave', () => {
                salaCell.textContent = ''; // Remove o texto ao retirar o cursor da célula
            });

            horaRow.appendChild(salaCell);
        }

        heatmapTable.appendChild(horaRow);
    }

    heatmapContainer.appendChild(heatmapTable);

    // Create legend element
    const legendContainer = document.createElement('div');
    legendContainer.classList.add('legend-container');

    // Create legend title
    const legendTitle = document.createElement('div');
    legendTitle.textContent = 'Legend:';
    legendTitle.classList.add('legend-title');
    legendContainer.appendChild(legendTitle);

    // Create legend items
    const legendItems = document.createElement('div');
    legendItems.classList.add('legend-items');

    // Iterate through color ranges and create legend items
    const colorRanges = getColorRangesWeek();

    colorRanges.forEach(range => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        // Create colored square
        const colorSquare = document.createElement('div');
        colorSquare.style.backgroundColor = range.color;
        colorSquare.classList.add('color-square');
        legendItem.appendChild(colorSquare);

        // Create range text
        const rangeText = document.createElement('span');
        rangeText.textContent = `${range.min} - ${range.max}`;
        legendItem.appendChild(rangeText);

        legendItems.appendChild(legendItem);
    });

    legendContainer.appendChild(legendItems);

    heatmapContainer.appendChild(legendContainer);
}

// Função para definir a cor com base no número de salas ocupadas
function getColorForSalasOcupadas(salasOcupadas) {
    // Define intervalos de salas ocupadas e suas cores correspondentes

    const colorRanges = [
        { min: 0, max: 100, color: 'rgba(181, 242, 253, 0.7)' }, // Celeste Blue para até 100 salas
        { min: 101, max: 200, color: 'rgba(181, 233, 253, 1) ' }, // Non-photo Blue para até 200 salas
        { min: 201, max: 300, color: 'rgba(161, 213, 253, 1) ' }, // Light Sky Blue para até 300 salas
        { min: 301, max: 400, color: 'rgba(142, 194, 254, 1) ' }, // Jordy Blue para até 400 salas
        { min: 401, max: 500, color: 'rgba(122, 174, 254, 1)' }, // Jordy Blue 2 para até 500 salas
        { min: 501, max: 600, color: 'rgba(102, 155, 254, 1) ' }, // Cornflower Blue para até 600 salas
        { min: 601, max: 700, color: 'rgba(82, 136, 254, 1)' }, // Cornflower Blue 2 para até 700 salas
        { min: 701, max: 800, color: 'rgba(62, 116, 254, 1) ' }, // Blue Crayola para até 800 salas
        { min: 801, max: 900, color: 'rgba(43, 97, 255, 1)' }, // Neon Blue para até 900 salas
        { min: 901, max: 1000, color: 'rgba(23, 77, 255, 1) ' }, // RISD Blue para até 1000 salas
        { min: 1001, max: 2000, color: 'rgba(3, 58, 255, 1)' } // Palatinate Blue para até 2000 salas
    ];


    // Encontra o intervalo de cores correspondente ao número de salas ocupadas
    const range = colorRanges.find(range => salasOcupadas >= range.min && salasOcupadas <= range.max);

    // Retorna a cor com base no número de salas ocupadas
    return range ? `${range.color}${salasOcupadas / 2000})` : 'rgba(255, 255, 255, 0)'; // Cor branca para mais de 2000 salas
}

function getColorRangesWeek() {
    return [
        { min: 0, max: 100, color: 'rgba(181, 242, 253, 0.7)' }, // Celeste Blue for up to 100 rooms
        { min: 101, max: 200, color: 'rgba(181, 233, 253, 1)' }, // Non-photo Blue for up to 200 rooms
        { min: 201, max: 300, color: 'rgba(161, 213, 253, 1)' }, // Light Sky Blue for up to 300 rooms
        { min: 301, max: 400, color: 'rgba(142, 194, 254, 1)' }, // Jordy Blue for up to 400 rooms
        { min: 401, max: 500, color: 'rgba(122, 174, 254, 1)' }, // Jordy Blue 2 for up to 500 rooms
        { min: 501, max: 600, color: 'rgba(102, 155, 254, 1)' }, // Cornflower Blue for up to 600 rooms
        { min: 601, max: 700, color: 'rgba(82, 136, 254, 1)' }, // Cornflower Blue 2 for up to 700 rooms
        { min: 701, max: 800, color: 'rgba(62, 116, 254, 1)' }, // Blue Crayola for up to 800 rooms
        { min: 801, max: 900, color: 'rgba(43, 97, 255, 1)' }, // Neon Blue for up to 900 rooms
        { min: 901, max: 1000, color: 'rgba(23, 77, 255, 1)' }, // RISD Blue for up to 1000 rooms
        { min: 1001, max: 2000, color: 'rgba(3, 58, 255, 1)' } // Palatinate Blue for up to 2000 rooms
    ];
}

const addClassModal=`<div id="addClassModal" class="modal" style="display: none;">
  <div class="modal-content">
    <span class="close-btn" onclick="closeAddClassModal()">&times;</span>
    <h2>Adicionar Nova Aula</h2>
    <form id="addClassForm" onsubmit="submitNewClass(event)">

      <label for="course">Curso:</label>
      <input type="text" id="course" name="course" required>

      <label for="subject">Unidade Curricular:</label>
      <input type="text" id="subject" name="subject" required>

      <label for="shift">Turno:</label>
      <input type="text" id="shift" name="shift" required>

      <label for="class">Turma:</label>
      <input type="text" id="class" name="class" required>

      <label for="enrolled">Inscritos no turno:</label>
      <input type="number" id="enrolled" name="enrolled" required>
      <label for="start-time">Hora início da aula:</label>
      <input type="time" id="start-time" name="start-time" required>

      <label for="end-time">Hora fim da aula:</label>
      <input type="time" id="end-time" name="end-time" required>

      <label for="date">Data da aula:</label>
      <input type="date" id="date" name="date" required>

      <!-- Selecção de características da sala -->
      <label for="room-features">Características da sala pedida para a aula:</label>
      <select id="room-features" name="room-features" multiple>
        ${roomCharacteristicsList.map(char => `<option value="${char}">${char}</option>`).join('')}
      </select>

      <button type="submit">Adicionar Aula</button>
    </form>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', addClassModal);
function openAddClassModal() {
    document.getElementById("addClassModal").style.display = "block";
}

function closeAddClassModal() {
    document.getElementById("addClassModal").style.display = "none";
}

// Função chamada ao clicar no botão "Marcar Aula"
function markClass(rowData) {
    openAddClassModal();
    const selectedRowData = JSON.parse(localStorage.getItem("selectedRow"));
    console.log("Aula selecionada para marcação:", selectedRowData);
}

// Adicionando a função de submissão de nova aula
function submitNewClass(event) {
    event.preventDefault();
    const form = document.getElementById("addClassForm");
    const formData = new FormData(form);
    const selectedRow = JSON.parse(localStorage.getItem("selectedRow")); // Linha selecionada
    // Obter o próximo ID de horário
    fetchHighestId().then(highestId => {
        const selectedCharacteristics = Array.from(
            formData.getAll("room-attributes")
        ).join(", "); // Converte para uma string separada por vírgulas
        
        // Correção para lidar com o retorno de formData.get("room-features")
        const roomFeatures = formData.getAll("room-features");
        const roomFeaturesString = Array.isArray(roomFeatures) ? roomFeatures.join(", ") : roomFeatures;

        const newId = highestId + 1;
        const newRow = {
            "ID": newId,
            "Semana do Ano": calculateWeekOfYear(formData.get("date")),
            "Semana do 1º Semestre": calculateSemesterWeek(formData.get("date"), '2022-10-01'),
            "Semana do 2º Semestre": calculateSemesterWeek(formData.get("date"), '2023-02-01'),
            "Curso": formData.get("course"),
            "Unidade Curricular": formData.get("subject"),
            "Turno": formData.get("shift"),
            "Turma": formData.get("class"),
            "Inscritos no turno": formData.get("enrolled"),
            "Dia da semana": getWeekdayFromDate(formatDate(formData.get("date"))),
            "Hora início da aula": formatTime(formData.get("start-time")),
            "Hora fim da aula": formatTime(formData.get("end-time")),
            "Data da aula": formatDate(formData.get("date")),
            "Características da sala pedida para a aula": roomFeaturesString, // Utiliza a variável corrigida aqui
            "Sala atribuída à aula": selectedRow["Nome sala"], // Defina a sala atribuída conforme necessário
        };

        // Adiciona a nova linha ao CSV
        addToScheduleCSV(newRow);
        closeAddClassModal();
        alert("Aula adicionada com sucesso!");
    });
}



// Função para buscar o maior ID atual no arquivo CSV
function fetchHighestId() {
    return fetch('/HorarioDeExemploAtualizado.csv')
        .then(response => response.text())
        .then(csvData => {
            const rows = csvData.trim().split('\n').map(row => row.split(';'));
            const ids = rows.slice(1).map(row => parseInt(row[0])); // Supondo que o ID seja a primeira coluna
            return Math.max(...ids);
        });
}

// Função para adicionar a nova linha ao arquivo CSV
// Função para adicionar a nova linha ao arquivo CSV
function addToScheduleCSV(newRow) {
    // Obter os dados do arquivo CSV existente
    fetch('/HorarioDeExemploAtualizado.csv')
        .then(response => response.text())
        .then(csvContent => {
            // Obter cabeçalhos do CSV existente
            const headers = loadCSVHeaders(csvContent);

            // Preparar a nova linha usando a ordem dos cabeçalhos
            const newRowValues = headers.map(header => newRow[header] || ""); // Garante que todos os cabeçalhos tenham um valor ou sejam vazios se não estiverem presentes em newRow

            // Adicionar a nova linha ao conteúdo CSV existente
            const newCsvContent = `${csvContent}\n${newRowValues.join(";")}`;

            // Enviar o conteúdo CSV atualizado para o servidor
            const blob = new Blob([newCsvContent], { type: 'text/csv;charset=utf-8;' });
            const formData = new FormData();
            formData.append('file', blob, 'HorarioDeExemploAtualizado.csv');

            fetch('/upload-horarios', {
                method: 'POST',
                body: formData
            }).then(response => {
                if (!response.ok) throw new Error("Erro ao adicionar a aula.");
                alert("Aula adicionada com sucesso e CSV atualizado corretamente.");
            }).catch(error => console.error("Erro ao salvar a aula no arquivo:", error));
        })
        .catch(error => console.error("Erro ao ler o arquivo CSV existente:", error));
}

function calcularSalasOcupadasMes(dia, mes, horaInicio, horaFim) {
    const searchStartTime = convertTimeToMinutes(horaInicio);
    const searchEndTime = convertTimeToMinutes(horaFim);

    const horariosNoDia = scheduleData.filter(schedule => {
        const dataAula = schedule['Data da aula'];
        const [diaAula, mesAula, ano] = dataAula.split('/');
        return parseInt(diaAula) === dia && parseInt(mesAula) === mes;
    });

    let salasOcupadas = 0;

    for (const horario of horariosNoDia) {
        const roomStartTime = convertTimeToMinutes(horario['Hora início da aula']);
        const roomEndTime = convertTimeToMinutes(horario['Hora fim da aula']);

        if (
            // Se o horário de início da sala estiver dentro do intervalo de procura
            (roomStartTime >= searchStartTime && roomStartTime < searchEndTime) ||
            // Se o horário de término da sala estiver dentro do intervalo de procura
            (roomEndTime > searchStartTime && roomEndTime <= searchEndTime) ||
            // Se o intervalo de procura estiver completamente dentro do intervalo da sala
            (searchStartTime <= roomStartTime && searchEndTime >= roomEndTime)
        ) {
            salasOcupadas++;
        }
    }
    return salasOcupadas;
}


// Função para criar heatmap mensal selecionado pelo usuário
function criarHeatmapMensalSelecionado() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = parseInt(monthSelect.value);

    // Remove o heatmap atual, se existir
    const heatmapContainer = document.getElementById('heatmap-containerMes');
    heatmapContainer.innerHTML = '';

    // Cria o novo heatmap
    criarHeatmapMatrizMensal(selectedMonth);
}


function diasNoMes(mes) {
    return new Date(new Date().getFullYear(), mes, 0).getDate();
}
function criarHeatmapMatrizMensal(mes) {
    // Verifica se o número do mês é válido (de 1 a 12)
    if (mes < 1 || mes > 12) {
        console.error("Número de mês inválido. O mês deve ser um número entre 1 e 12.");
        return;
    }

    const diasDoMes = Array.from({ length: diasNoMes(mes) }, (_, index) => index + 1); // Obtém os dias do mês
    const horas = Array.from({ length: 30 }, (_, index) => index + 8 * 2); // 8 horas (8 * 2 intervalos de meia hora)

    const heatmapContainer = document.getElementById('heatmap-containerMes');

    // Cria uma tabela para representar o heatmap
    const heatmapTable = document.createElement('table');
    heatmapTable.classList.add('heatmap-tableMes');

    // Cria uma linha para os rótulos dos dias do mês
    const diasLabelRow = document.createElement('tr');
    diasLabelRow.classList.add('dias-label-rowMes');

    // Cria uma célula vazia para o canto superior esquerdo
    const emptyCell = document.createElement('td');
    emptyCell.classList.add('empty-cellMes');
    diasLabelRow.appendChild(emptyCell);

    // Adiciona os rótulos dos dias do mês
    for (const dia of diasDoMes) {
        const diaLabelCell = document.createElement('td');
        diaLabelCell.classList.add('dia-label-cellMes');
        diaLabelCell.textContent = dia;
        diasLabelRow.appendChild(diaLabelCell);
    }

    heatmapTable.appendChild(diasLabelRow);

    // Cria as linhas e colunas da tabela
    for (const hora of horas) {
        const horaRow = document.createElement('tr');
        horaRow.classList.add('heatmap-rowMes');

        // Adiciona o rótulo da hora para cada linha
        const horaLabelCell = document.createElement('td');
        horaLabelCell.classList.add('hora-label-cellMes');
        const horaInicio = `${Math.floor(hora / 2)}:${(hora % 2) * 30}`.padStart(2, '0');
        horaLabelCell.textContent = horaInicio;
        horaRow.appendChild(horaLabelCell);

        for (const dia of diasDoMes) {
            const salaCell = document.createElement('td');
            salaCell.classList.add('heatmap-cellMes');

            const horaInicio = `${Math.floor(hora / 2)}:${(hora % 2) * 30}`.padStart(2, '0');
            const horaFim = `${Math.floor((hora + 1) / 2)}:${((hora + 1) % 2) * 30}`.padStart(2, '0');

            const salasOcupadas = calcularSalasOcupadasMes(dia, mes, horaInicio, horaFim);

            // Define a cor do quadrado com base no número médio de salas ocupadas
            salaCell.style.backgroundColor = getColorForSalasOcupadasMes(salasOcupadas);

            // Adiciona um evento de hover para exibir o número de salas ao passar o cursor sobre a célula
            salaCell.addEventListener('mouseenter', () => {
                salaCell.textContent = `${salasOcupadas}`;
            });
            salaCell.addEventListener('mouseleave', () => {
                salaCell.textContent = ''; // Remove o texto ao retirar o cursor da célula
            });

            horaRow.appendChild(salaCell);
        }

        heatmapTable.appendChild(horaRow);
    }

    heatmapContainer.appendChild(heatmapTable);

    // Create legend element
    const legendContainer = document.createElement('div');
    legendContainer.classList.add('legend-container');

    // Create legend title
    const legendTitle = document.createElement('div');
    legendTitle.textContent = 'Legend:';
    legendTitle.classList.add('legend-title');
    legendContainer.appendChild(legendTitle);

    // Create legend items
    const legendItems = document.createElement('div');
    legendItems.classList.add('legend-items');

    // Iterate through color ranges and create legend items
    const colorRanges = getColorRangesMes(); // Define your color ranges function here

    colorRanges.forEach(range => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        // Create colored square
        const colorSquare = document.createElement('div');
        colorSquare.style.backgroundColor = range.color;
        colorSquare.classList.add('color-square');
        legendItem.appendChild(colorSquare);

        // Create range text
        const rangeText = document.createElement('span');
        rangeText.textContent = `${range.min} - ${range.max}`;
        legendItem.appendChild(rangeText);

        legendItems.appendChild(legendItem);
    });

    legendContainer.appendChild(legendItems);

    heatmapContainer.appendChild(legendContainer);
}

function getColorForSalasOcupadasMes(salasOcupadas) {
    // Define intervalos de salas ocupadas e suas cores correspondentes
   
    const colorRanges = [
        { min: 0, max: 5, color: 'rgba(181, 242, 253, 0.7)' }, 
        { min: 6, max: 20, color: 'rgba(181, 233, 253, 1) ' }, 
        { min: 21, max: 30, color: 'rgba(161, 213, 253, 1) ' }, 
        { min: 31, max: 40, color: 'rgba(142, 194, 254, 1) ' }, 
        { min: 41, max: 50, color: 'rgba(122, 174, 254, 1)' }, 
        { min: 51, max: 60, color: 'rgba(102, 155, 254, 1) ' }, 
        { min: 61, max: 70, color: 'rgba(82, 136, 254, 1)' }, 
        { min: 71, max: 80, color: 'rgba(62, 116, 254, 1) ' }, 
        { min: 81, max: 90, color: 'rgba(43, 97, 255, 1)' }, 
        { min: 91, max: 100, color: 'rgba(23, 77, 255, 1) ' }, 
        { min: 101, max: 200, color: 'rgba(3, 58, 255, 1)' } 
    ];
    

    // Encontra o intervalo de cores correspondente ao número de salas ocupadas
    const range = colorRanges.find(range => salasOcupadas >= range.min && salasOcupadas <= range.max);

    // Retorna a cor com base no número de salas ocupadas
    return range ? `${range.color}${salasOcupadas / 2000})` : 'rgba(255, 255, 255, 0)'; // Cor branca para mais de 2000 salas
}

function getColorRangesMes() {
    return [
        { min: 0, max: 5, color: 'rgba(181, 242, 253, 0.7)' }, 
        { min: 6, max: 20, color: 'rgba(181, 233, 253, 1)' }, 
        { min: 21, max: 30, color: 'rgba(161, 213, 253, 1)' }, 
        { min: 31, max: 40, color: 'rgba(142, 194, 254, 1)' }, 
        { min: 41, max: 50, color: 'rgba(122, 174, 254, 1)' }, 
        { min: 51, max: 60, color: 'rgba(102, 155, 254, 1)' }, 
        { min: 61, max: 70, color: 'rgba(82, 136, 254, 1)' }, 
        { min: 71, max: 80, color: 'rgba(62, 116, 254, 1)' }, 
        { min: 81, max: 90, color: 'rgba(43, 97, 255, 1)' }, 
        { min: 91, max: 100, color: 'rgba(23, 77, 255, 1)' }, 
        { min: 101, max: 200, color: 'rgba(3, 58, 255, 1)' } 
    ];
}


//Mostrar/Esconder HeatMap mensal
function toggleHeatmapSelector() {
    const monthSelectorContainer = document.getElementById('monthSelectorContainer');
    const toggleButton = document.getElementById('toggleHeatmapButton');
    if (monthSelectorContainer.style.display === 'none') {
        monthSelectorContainer.style.display = 'block'; // Mostra o seletor de mês e o botão
        toggleButton.textContent = 'Ocultar HeatMap mensal'; // Altera o texto do botão
    } else {
        monthSelectorContainer.style.display = 'none'; // Oculta o seletor de mês e o botão
        toggleButton.textContent = 'Visualizar HeatMap mensal'; // Altera o texto do botão
    }
} 

module.exports = {
    checkPreselectedSchedule,
    handleFileSelect2,
    parseFile2,
    loadRoomData,
    loadScheduleData,
    parseCSV2,
    updateTableWithAvailability,
    convertTimeToMinutes,
    createTable,
    uploadFile2,
    checkAvailability,
    openModal,
    closeModal,
    confirmSubstitution,
    submitSubstitution,
    formatTime,
    formatDate,
    calculateWeekOfYear,
    calculateSemesterWeek,
    saveScheduleToCSV,
    resetFilters,

};
function suggestAllocation(form) {
    fetchMaxSubID()  // Assume que esta função está definida e retorna uma Promise com o maior SubID.
        .then(maxId => {
            const SubID = maxId + 1;
            const formData = new FormData(form);
            const selectedRow = JSON.parse(localStorage.getItem("selectedRow") || '{}');
            const selectedID = localStorage.getItem("substitutionID");
            const rowToUpdate = scheduleData.find((row) => row["ID"] === selectedID); // Encontra a 
            console.log("teste",rowToUpdate);


            const novaData = formatDate(formData.get("date"));
            const novaHora = formatTime(formData.get("start-time"));
            const antigaData = rowToUpdate['Data da aula'];
            const antigaHora = rowToUpdate['Hora início da aula'];
            const sala = selectedRow['Nome sala'];
            const salaantiga = rowToUpdate['Sala atribuída à aula'];
            const unidadeCurricular = rowToUpdate['Unidade Curricular'];
            const horafim = formatTime(document.getElementById('end-time').value);
            const semanaAno = calculateWeekOfYear(novaData);
            const semana1sem = calculateSemesterWeek(novaData, '2022-10-01');
            const semana2sem = calculateSemesterWeek(novaData, '2023-02-01');
            const selectedCharacteristics = Array.from(formData.getAll("room-attributes")).join(", ");

            if (!novaData || !novaHora) {
                console.error('One or more date/time inputs are empty', {novaData, novaHora});
                alert('Erro: Um ou mais campos de data/hora estão vazios.');
                return;
            }

            // Constrói o conteúdo CSV
            const csvContent = `${SubID};${selectedID};${novaData};${antigaData};${novaHora};${antigaHora};${horafim};${sala};${salaantiga};${unidadeCurricular};${semanaAno};${semana1sem};${semana2sem};${selectedCharacteristics}\n`;

            // Envia os dados CSV para o servidor
            saveDataToServer(csvContent);
            console.log(csvContent);
        })
        .catch(error => {
            console.error('Erro ao obter o SubID máximo:', error);
            alert("Erro ao processar o arquivo de alocações.");
        });
}

function saveDataToServer(csvContent) {
    fetch('/save-csv', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: csvContent
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.text();
    })
    .then(message => {
        
        //location.reload();  // Optionally reload or update UI
    })
    .catch(error => {
        console.error('Error sending allocation suggestion:', error);
        
    });
}






function loadSuggestions() {
    const suggestionsUrl = '/sugestaoAlocacoes.csv'; // This should work if the file is in the static folder
    fetch(suggestionsUrl)
        .then(response => response.text())
        .then(csvData => {
            const { headers, data } = parseCSV2(csvData);
            initializeSuggestionsTable(headers, data);
        })
        .catch(error => console.error('Failed to load suggestions:', error));
}



function initializeSuggestionsTable(headers, data) {
    const columns = headers.map(header => ({ title: header, field: header }));

    // Adicionando a coluna de substituição
    columns.unshift({
        title: "Substituir",
        headerSort: false,
        formatter: function(cell, formatterParams) {
            var button = document.createElement("button");
            button.textContent = "Substituir";
            button.style.padding = "5px 10px";
            button.style.border = "none";
            button.style.borderRadius = "5px";
            button.style.background = "#4CAF50";
            button.style.color = "white";
            button.onclick = function() {
                const rowData = cell.getRow().getData();
                localStorage.setItem("selectedRow2", JSON.stringify(rowData));
                substituir(); // Suponha que esta função está definida em outro lugar
                DeleteAlocacaoByID(rowData.SubID);
                cell.getRow().delete();
            };
            return button;
        },
        width: 100,
        hozAlign: "center",
    });

    // Adicionando a coluna de remoção
    columns.unshift({
        title: "Remover",
        formatter: function(cell, formatterParams) {
            var button = document.createElement("button");
            button.textContent = "Remover";
            button.className = "btn btn-danger"; // Usando classes Bootstrap para estilo
            button.onclick = function() {
                const rowData = cell.getRow().getData();
                if (confirm("Tem certeza que deseja remover esta alocação?")) {
                    DeleteAlocacaoByID(rowData.SubID);
                    cell.getRow().delete(); // Remove a linha após a confirmação e o processamento
                }
            };
            return button;
        },
        width: 100,
        hozAlign: "center",
    });

    new Tabulator("#suggestionsTable", {
        data: data,
        columns: columns,
        layout: "fitColumns",
        tooltips: true,
        addRowPos: "top",
        history: true,
        pagination: "local",
        paginationSize: 5,
        movableColumns: true,
        resizableRows: true,
    });
}




// Função substituir


// Função substituir
function substituir() {
    const selectedRow = JSON.parse(localStorage.getItem("selectedRow2")); // Linha selecionada
    console.log(selectedRow);
    const selectedID = localStorage.getItem("substitutionID"); // ID do `localStorage`

    const rowToUpdate = scheduleData.find(row => row["ID"] === selectedID); // Encontra a linha pelo ID

    if (rowToUpdate) {
        // Atualiza campos do formulário
        rowToUpdate["Dia da semana"] = getWeekdayFromDate(selectedRow["Data da substituicao"]);
        rowToUpdate["Hora início da aula"] = selectedRow["Hora da substituicao"]; // Assume formato HH:MM:SS
        rowToUpdate["Hora fim da aula"] = selectedRow["Hora de fim da substituição"]; // Assume formato HH:MM:SS
        rowToUpdate["Data da aula"] = selectedRow["Data da substituicao"]; // Assume formato DD/MM/AAAA
        rowToUpdate["Sala atribuída à aula"] = selectedRow["Sala atribuida"]; // Preenche a sala atribuída
        // Atualiza as semanas (assumindo que você tenha a lógica para calcular isso corretamente)
        rowToUpdate["Semana do Ano"] = calculateWeekOfYear(selectedRow["Data da substituicao"]); // Semana do ano
        rowToUpdate["Semana do 1º Semestre"] = calculateSemesterWeek(selectedRow["Data da substituicao"], "2022-10-01"); // Semana do 1º semestre
        rowToUpdate["Semana do 2º Semestre"] = calculateSemesterWeek(selectedRow["Data da substituicao"], "2023-02-01"); // Semana do 2º semestre
        // Obter as características selecionadas do menu suspenso
        const selectedCharacteristics = selectedRow["Características da sala pedida para a aula"];
        
        rowToUpdate["Características da sala pedida para a aula"] = selectedCharacteristics; // Preenche o campo com as características

        saveScheduleToCSV(); // Salva o arquivo CSV atualizado
        closeModal(); // Fecha o modal

        alert("Substituição efetuada com sucesso!"); // Notifica o usuário sobre a substituição bem-sucedida
    }
}

function parseCSV3(csvData) {
    const rows = csvData.trim().split('\n');
    const headers = rows.shift().split(';').map(header => header.trim());
    const data = rows.map(row => {
        const values = row.split(';').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || "";
            return obj;
        }, {});
    });
    return { headers, data };
}
function getWeekdayFromDate(dateStr) {
    // Espera uma string de data no formato DD/MM/AAAA
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day); // JavaScript conta meses de 0 a 11
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    return weekdays[date.getDay()]; // getDay retorna um número de 0 (domingo) a 6 (sábado)
}
function parseCSV4(csvData) {
    const lines = csvData.split('\n');
    const headers = lines.shift().split(';');
    const data = lines.map(line => {
        const values = line.split(';');
        return headers.reduce((object, header, index) => {
            object[header] = values[index];
            return object;
        }, {});
    });
    return { headers, data };
}



function updateCSV1(csvData, idToRemove) {
    const rows = csvData.trim().split('\n');
    const headers = rows.shift(); // Mantém o cabeçalho original
    const filteredRows = rows.filter(row => !row.startsWith(idToRemove + ';')); // Assume que o ID é sempre o primeiro campo

    return [headers, ...filteredRows].join('\n');
}

function saveUpdatedCSV1(updatedCSV) {
    const formData = new FormData();
    const blob = new Blob([updatedCSV], { type: 'text/csv' });
    formData.append('file', blob, 'sugestaoAlocacoes.csv');

    fetch('/upload-alocacoes', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error("Falha ao salvar o arquivo de alocações.");
        return response.text();
    })
    .then(message => {
        alert("CSV de alocações atualizado com sucesso: " + message);
    })
    .catch(error => {
        console.error('Erro ao enviar o arquivo de alocações:', error);
        alert("Erro ao salvar o arquivo de alocações.");
    });
}

function DeleteAlocacaoByID(id) {
    fetch('/sugestaoAlocacoes.csv') // Caminho do arquivo de alocações
        .then(response => {
            if (!response.ok) throw new Error("Falha ao acessar o arquivo de alocações.");
            return response.text();
        })
        .then(csvData => {
            const updatedCSV = updateCSV1(csvData, id);
            saveUpdatedCSV1(updatedCSV);
        })
        .catch(error => {
            console.error('Erro ao carregar ou processar o arquivo de alocações:', error);
            alert("Erro ao processar o arquivo de alocações.");
        });
}

const fs = require('fs').promises;
const path = require('path');

function fetchMaxSubID() {
    const path = '/sugestaoAlocacoes.csv'; // Make sure 'path' is declared before usage

    return fetch(path)  // Correct use of 'path' after initialization
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            return response.text();
        })
        .then(csvData => {
            const rows = csvData.trim().split('\n');
            let maxId = 0;
            rows.slice(1).forEach(row => {
                const cells = row.split(';');
                const currentId = parseInt(cells[0], 10);
                if (currentId > maxId) maxId = currentId;
            });
            return maxId;
        })
        .catch(error => {
            console.error(`Error fetching maximum SubID: ${error}`);
            throw error;  // Make sure to re-throw the error to handle it in the calling function
        });
}



