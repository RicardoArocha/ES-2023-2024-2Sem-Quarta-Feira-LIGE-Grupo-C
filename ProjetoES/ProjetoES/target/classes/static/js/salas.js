let table;
let roomData = []; // Dados das salas
let scheduleData = []; // Dados dos horários

// Evento para inicializar a página

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('csvFileInput').addEventListener('change', handleFileSelect2, false);
    loadRoomData();
    loadScheduleData();
    checkPreselectedSchedule();
    const substitutionData = JSON.parse(localStorage.getItem('substitutionData'));
    if (substitutionData) {
        applySubstitutionFilters(substitutionData);
    }
    const retrievedID = localStorage.getItem("substitutionID"); // Recuperar o ID do `localStorage`
    console.log("ID recuperado:", retrievedID)
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
        })
        .catch(error => console.error('Erro ao carregar os dados dos horários:', error));
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
    document.getElementById('startTime').value = '';
    document.getElementById('dayOfWeek').value = '';
    if(table) {
        table.clearFilter(true); // remove filtros, mas mantém os dados da tabela
        table.setData(roomData); // redefine os dados da tabela para o conjunto de dados original
    }
}

// Cria a tabela com os dados das salas
function createTable(headers, data) {
    if(!headers || !data) {
        console.error('Dados ou cabeçalhos indefinidos para criar a tabela');
        return; // Sai da função se headers ou data não estiverem definidos
    }

    // Adiciona uma coluna de ação com botões para marcar a substituição como a primeira coluna
    const columns = [{
        title: "Ações",
        headerSort: false,
        formatter: function(cell, formatterParams) {
            const button = document.createElement("button");
            button.textContent = "Marcar Substituição";
            button.onclick = function() {
                confirmSubstitution(cell.getRow().getData());
            };
            return button;
        },
        width: 200,
        hozAlign: "center",
    }];

    // Adiciona as colunas restantes ao array 'columns'
    headers.forEach(header => {
        columns.push({
            title: header,
            field: header,
            headerFilter: 'input',
        });
    });

    // Configura a tabela com as colunas e os dados
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

      <!-- Alteração para lista suspensa para o dia da semana -->
      <label for="weekday">Dia da semana:</label>
      <select id="weekday" name="weekday" required>
        <option value="Seg">Segunda-feira</option>
        <option value="Ter">Terça-feira</option>
        <option value="Qua">Quarta-feira</option>
        <option value="Qui">Quinta-feira</option>
        <option value="Sex">Sexta-feira</option>
        <option value="Sab">Sábado</option>
        <option value="Dom">Domingo</option>
      </select>

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
    // Obter informações para preencher o modal
    const selectedID = localStorage.getItem("substitutionID"); // ID recuperado
    const roomName = rowData['Nome sala']; // Sala
    const buildingName = rowData['Edifício']; // Edifício

    // Atualiza elementos no modal
    document.getElementById("modal-id").textContent = selectedID;
    document.getElementById("modal-room").textContent = roomName;
    document.getElementById("modal-building").textContent = buildingName;

    // Preenche campos do formulário com valores de `rowData`
    document.getElementById("weekday").value = rowData['Dia da semana'] || ""; // Dia da semana
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
    const selectedID = localStorage.getItem("substitutionID"); // ID do `localStorage`

    const rowToUpdate = scheduleData.find(row => row["ID"] === selectedID); // Encontra a linha pelo ID

    if (rowToUpdate) {
        const newDate = formData.get("date"); // Nova data para o cálculo das semanas

        // Atualiza campos do formulário
        rowToUpdate["Dia da semana"] = formData.get("weekday");
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
/**
 * 
 */
// Função para salvar o CSV com a formatação correta
function saveScheduleToCSV() {
    const headers = [
        "ID", "Curso", "Unidade Curricular", "Número de Inscritos no Turno", "Turno", "Turma",
        "Dia da semana", "Hora início da aula", "Hora fim da aula", "Data da aula",
        "Características da sala pedida para a aula", "Sala atribuída à aula",
        "Semana do Ano", "Semana do 1º Semestre", "Semana do 2º Semestre"
    ]; // Ordem correta dos cabeçalhos

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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

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

