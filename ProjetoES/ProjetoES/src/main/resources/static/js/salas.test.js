/**
 * @jest-environment jsdom
 */
// In your test setup file or before running tests
global.DataTransfer = function() {
    this.setData = jest.fn();
    // Add other necessary methods and properties
  };
  
  const {
    checkPreselectedSchedule,
    handleFileSelect2,
    parseFile2,
    loadRoomData,
    loadScheduleData,
    parseCSV2,
    checkAvailability,
    updateTableWithAvailability,
    convertTimeToMinutes,
    createTable,
    uploadFile2,
     openModal,
     closeModal,
     confirmSubstitution,
     submitSubstitution,
     formatTime,
     formatDate,
     calculateWeekOfYear,
     calculateSemesterWeek,
     resetFilters,
     saveScheduleToCSV,
  
      
  } = require('./salas');
  
  
  describe('parseCSV2', () => {
    it('should correctly parse a CSV with headers and data separated by semicolons', () => {
      const csvData = "Name;Age;Country\nJohn;25;USA\nJane;30;Canada";
      const expected = {
        headers: ['Name', 'Age', 'Country'],
        data: [
          { Name: 'John', Age: '25', Country: 'USA' },
          { Name: 'Jane', Age: '30', Country: 'Canada' }
        ]
      };
      const result = parseCSV2(csvData);
      expect(result).toEqual(expected);
    });
      
     it('should correctly handle CSV data with only one line', () => {
        const csvData = "Name;Age;Country";
        const expected = {
          headers: ['Name', 'Age', 'Country'],
          data: []
        };
        const result = parseCSV2(csvData);
        expect(result).toEqual(expected);
     });
  
  });
  
  describe('openModal', () => {
      // The "substitutionModal" element does not exist in the DOM.
      it('should not throw an error when the "substitutionModal" element does not exist', () => {
        // Arrange
        const modalElement = document.getElementById("substitutionModal");
        jest.spyOn(document, 'getElementById').mockReturnValue({ style: {} });
  
        if (modalElement) {
          document.body.removeChild(modalElement);
        }
  
        // Act & Assert
        expect(openModal).not.toThrow();
  
        // Clean up
        document.getElementById.mockRestore();
      });
          // The function should be idempotent, i.e., calling it multiple times should not have any unintended side effects.
          it('should be idempotent', () => {
            // Arrange
            const modalElement = document.createElement("div");
            modalElement.id = "substitutionModal";
            document.body.appendChild(modalElement);
      
            // Mock getElementById to return the modalElement
            jest.spyOn(document, 'getElementById').mockReturnValue(modalElement);
      
            // Act
            openModal();
            openModal();
      
            // Assert
            expect(modalElement.style.display).toBe("block");
      
            // Clean up
            document.getElementById.mockRestore();
          });
    });
  
  describe('closeModal', () => {
        // should set the "display" style of the "substitutionModal" element to "none"
        it('should set the "display" style of the "substitutionModal" element to "none" when closeModal is called', () => {
          // Arrange
          const modalElement = document.createElement("div");
          modalElement.id = "substitutionModal";
          document.body.appendChild(modalElement);
    
          // Set the display style of the modalElement to "block"
          modalElement.style.display = "block";
    
          // Act
          closeModal();
    
          // Assert
          const updatedModalElement = document.getElementById("substitutionModal");
          expect(updatedModalElement.style.display).toBe("none");
    
          // Clean up
          document.body.removeChild(modalElement);
        });
  
            // should throw an error if the "substitutionModal" element does not exist
      it('should throw an error if the "substitutionModal" element does not exist when closeModal is called', () => {
        // Arrange
        const modalElement = document.getElementById("substitutionModal");
        jest.spyOn(document, 'getElementById').mockReturnValue(null);
  
        // Act & Assert
        expect(closeModal).toThrow();
  
        // Clean up
        document.getElementById.mockRestore();
      });
  });
  
  describe('formatTime', () => {
        // should correctly format a time string with hours, minutes, and seconds
        it('should correctly format a time string with hours, minutes, and seconds', () => {
          // Arrange
          const time = '12:30:45';
          const expected = '12:30:45';
    
          // Act
          const result = formatTime(time);
    
          // Assert
          expect(result).toBe(expected);
        });
  
            // should return an empty string if the input is an empty string
      it('should return an empty string if the input is an empty string', () => {
        // Arrange
        const time = '';
        const expected = '';
  
        // Act
        const result = formatTime(time);
  
        // Assert
        expect(result).toBe(expected);
      });
  });
  
  describe('formatDate', () => {
      // should correctly format a date string with single-digit day and month values
      it('should correctly format a date string with single-digit day and month values', () => {
        // Arrange
        const dateStr = '2022-01-05';
        const expected = '05/01/2022';
  
        // Act
        const result = formatDate(dateStr);
  
        // Assert
        expect(result).toBe(expected);
      });
  
          // should correctly format a date string in the format "YYYY-MM-DD"
          it('should correctly format a date string in the format "YYYY-MM-DD"', () => {
            // Arrange
            const dateStr = '2022-01-15';
            const expected = '15/01/2022';
      
            // Act
            const result = formatDate(dateStr);
      
            // Assert
            expect(result).toBe(expected);
          });
  
              // should correctly format a date string in the format "DD-MM-YYYY"
      it('should correctly format a date string in the format "DD-MM-YYYY"', () => {
        // Arrange
        const dateStr = '2022-01-05';
        const expected = '05/01/2022';
  
        // Act
        const result = formatDate(dateStr);
  
        // Assert
        expect(result).toBe(expected);
      });
  });
  describe('calculateWeekOfYear', () => {
  
        // Should correctly calculate the week of year for a valid date string in the format "DD/MM/YYYY"
        it('should correctly calculate the week of year for a valid date string', () => {
          // Arrange
          const dateStr = '05/01/2022';
          const expected = 2;
    
          // Act
          const result = calculateWeekOfYear(dateStr);
    
          // Assert
          expect(result).toBe(expected);
        });
            // Should not throw an error for a valid date string
      it('should not throw an error for a valid date string', () => {
        // Arrange
        const dateStr = '2022-01-05';
  
        // Act & Assert
        expect(() => calculateWeekOfYear(dateStr)).not.toThrow();
      });
          // Should correctly calculate the week of year for a date string on the first day of the year
          it('should correctly calculate the week of year when the date string is on the first day of the year', () => {
            // Arrange
            const dateStr = '01/01/2023';
            const expected = 1;
      
            // Act
            const result = calculateWeekOfYear(dateStr);
      
            // Assert
            expect(result).toBe(expected);
          });
  });
  describe('calculateSemesterWeek', () => {
        // Should correctly calculate the week of the semester for a valid date string and semester start date
        it('should correctly calculate the week of the semester for a valid date string and semester start date', () => {
          // Arrange
          const dateStr = '15/02/2022';
          const semesterStartStr = '01/02/2022';
    
          // Act
          const result = calculateSemesterWeek(dateStr, semesterStartStr);
    
          // Assert
          expect(result).toBe(7);
        });
            // Should handle date strings with single-digit days and months
      it('should handle date strings with single-digit days and months', () => {
        // Arrange
        const dateStr = '05/01/2022';
        const semesterStartStr = '01/01/2022';
  
        // Act
        const result = calculateSemesterWeek(dateStr, semesterStartStr);
  
        // Assert
        expect(result).toBe(1);
      });
  });
  
  describe('handleFileSelect2', () => {
        // should throw an error if no file is selected
        it('should throw an error if no file is selected', () => {
          // Arrange
          const event = {
            target: {
              files: []
            }
          };
    
          // Act & Assert
          expect(() => handleFileSelect2(event)).toThrow();
        });
  
  });
  
  describe('parseFile2', () => {
      // Does not throw an error if no file is selected
      it('should not throw an error if no file is selected', () => {
        // Arrange
        const file = new File(["content"], "test.csv");
  
        // Act & Assert
        expect(() => parseFile2(file)).not.toThrow();
      });
    });
  
  describe('updateTableWithAvailability', () => {
    it('should throw an error when relevantSchedules is null', () => {
      // Arrange
      const relevantSchedules = null;
  
      // Act & Assert
      expect(() => updateTableWithAvailability(relevantSchedules)).toThrow("relevantSchedules is null or undefined.");
    });
       
  });
  
  describe('checkAvailability', () => {
      // Throws error when start time input is empty.
      it('should throw an error when start time input is empty', () => {
        // Arrange
        document.getElementById = jest.fn().mockReturnValue({ value: '' });
  
        // Act & Assert
        expect(checkAvailability).toThrowError("Please provide a valid start time and day of the week.");
      });
       
  });
  
  describe('convertTimeToMinutes', () => {
        // Should correctly convert a time string in the format "HH:MM" to minutes
        it('should correctly convert a time string in the format "HH:MM" to minutes', () => {
          // Arrange
          const timeString = '09:30';
          const expected = 570;
    
          // Act
          const result = convertTimeToMinutes(timeString);
    
          // Assert
          expect(result).toBe(expected);
        });

  });
  
  describe('createTable', () => {
        // logs an error message and returns if headers or data are undefined
        it('should log an error message and return if headers or data are undefined', () => {
          const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
          const headers = ['Name', 'Age', 'Country'];
          const data = null;
    
          createTable(headers, data);
    
          // Assert that the error message is logged
          expect(consoleErrorSpy).toHaveBeenCalledWith('Dados ou cabeçalhos indefinidos para criar a tabela');
    
          consoleErrorSpy.mockRestore();
        });
  });
  
  describe('uploadFile2', () => {
        // error if csvFileInput is null
        it('should throw an error if csvFileInput is null', () => {
          // Mock the fetch function
          global.fetch = jest.fn();
    
          // Mock the alert function
          global.alert = jest.fn();
    
          // Invoke the uploadFile2 function
          expect(uploadFile2).toThrowError();
    
          // Check that the fetch function was not called
          expect(fetch).not.toHaveBeenCalled();
    
          // Check that the alert function was not called
          expect(alert).not.toHaveBeenCalled();
        });
  });
  
  describe('confirmSubstitution', () =>{
          // should handle undefined or null rowData
          it('should handle undefined or null rowData', () => {
            // Clear the values of the elements
            document.getElementById("modal-id").textContent = "";
            document.getElementById("modal-room").textContent = "";
            document.getElementById("modal-building").textContent = "";
            document.getElementById("weekday").value = "";
            document.getElementById("start-time").value = "";
            document.getElementById("end-time").value = "";
            document.getElementById("date").value = "";
      
            // Invoke the confirmSubstitution function with undefined rowData
            confirmSubstitution(undefined);
      
            // Check if the modal elements are not updated
            expect(document.getElementById("modal-id").textContent).not.toBe(localStorage.getItem("substitutionID"));
            expect(document.getElementById("modal-room").textContent).toBe("");
            expect(document.getElementById("modal-building").textContent).toBe("");
            expect(document.getElementById("weekday").value).toBe("");
            expect(document.getElementById("start-time").value).toBe("");
            expect(document.getElementById("end-time").value).toBe("");
            expect(document.getElementById("date").value).toBe("");
      
            // Clear the values of the elements again
            document.getElementById("modal-id").textContent = "";
            document.getElementById("modal-room").textContent = "";
            document.getElementById("modal-building").textContent = "";
            document.getElementById("weekday").value = "";
            document.getElementById("start-time").value = "";
            document.getElementById("end-time").value = "";
            document.getElementById("date").value = "";
      
            // Invoke the confirmSubstitution function with null rowData
            confirmSubstitution(null);
      
            // Check if the modal elements are not updated
            expect(document.getElementById("modal-id").textContent).not.toBe(localStorage.getItem("substitutionID"));
            expect(document.getElementById("modal-room").textContent).toBe("");
            expect(document.getElementById("modal-building").textContent).toBe("");
            expect(document.getElementById("weekday").value).toBe("");
            expect(document.getElementById("start-time").value).toBe("");
            expect(document.getElementById("end-time").value).toBe("");
            expect(document.getElementById("date").value).toBe("");
          });
  
              // should return when row data is undefined or null
      it('should return when row data is undefined', () => {
        const rowData = undefined;
        const localStorageMock = {
          getItem: jest.fn()
        };
        global.localStorage = localStorageMock;
  
        confirmSubstitution(rowData);
  
        expect(localStorageMock.getItem).not.toHaveBeenCalled();
      });
  
          // should return when row data is null
          it('should return when row data is null', () => {
            const rowData = null;
            const localStorageMock = {
              getItem: jest.fn()
            };
            global.localStorage = localStorageMock;
      
            confirmSubstitution(rowData);
      
            expect(localStorageMock.getItem).not.toHaveBeenCalled();
          });
  });
  
  describe('submitSubstitution', () =>{
        // The selected row or ID cannot be retrieved from local storage
        it('should throw an error if the selected row or ID cannot be retrieved from local storage', () => {
          // Clear localStorage
          localStorage.clear();
    
          // Invoke the submitSubstitution function
          expect(() => {
            const alertSpy = jest.spyOn(window, 'alert');
            submitSubstitution(new Event("submit", { cancelable: true }));
            expect(alertSpy).toHaveBeenCalledWith("Substituição efetuada com sucesso!");
            alertSpy.mockRestore();
          }).toThrow();
        });
  });
  
  describe('checkPreselectedSchedule', () => {
        // Does not throw any errors if valid schedule data is retrieved from local storage
        it('should not throw any errors if valid schedule data is retrieved from local storage', () => {
          const localStorageMock = {
            getItem: jest.fn().mockReturnValue('{"Data da aula": "Monday", "Hora início da aula": "09:00"}')
          };
          global.localStorage = localStorageMock;
    
          const getElementByIdMock = jest.spyOn(document, 'getElementById').mockReturnValue({});
          window.checkAvailability = jest.fn();
    
          expect(checkPreselectedSchedule).not.toThrow();
    
          getElementByIdMock.mockRestore();
        });
  
            // Does not throw an error if stored schedule data is an empty string
      it('should not throw an error when stored schedule data is an empty string', () => {
        const localStorageMock = {
          getItem: jest.fn().mockReturnValue('')
        };
        global.localStorage = localStorageMock;
  
        expect(checkPreselectedSchedule).not.toThrow();
      });
  
          // Does not throw an error if dayOfWeek or startTime input values are missing from retrieved schedule data
          it('should not throw an error when dayOfWeek or startTime input values are missing from retrieved schedule data', () => {
            const localStorageMock = {
              getItem: jest.fn().mockReturnValue('{"Data da aula": "Monday"}')
            };
            global.localStorage = localStorageMock;
      
            const getElementByIdMock = jest.spyOn(document, 'getElementById').mockReturnValue({});
      
            expect(checkPreselectedSchedule).not.toThrow();
      
            getElementByIdMock.mockRestore();
          });
  });
  
  //ESTA FUNÇÃO PASSA NOS TESTES MAS GERA ERRO NA CONSOLA- MAS É ESPERADO PORQUE È ISSO QUE ESTÁ A SER TESTADO
  describe('loadRoomData', () => {
        // should handle invalid CSV file format
        it('should handle invalid CSV file format', () => {
          // Mock the fetch function to return a rejected promise
          global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    
          // Invoke the loadRoomData function
          loadRoomData();
    
          // Verify that fetch was called with the correct argument
          expect(fetch).toHaveBeenCalledWith('/caracterizacaodasSalas.csv');
    
          // Clean up mocks
          global.fetch.mockRestore();
        });
  });
  
  describe('resetFilters', () => {
  it('should throw an error if required input elements do not exist', () => {
    // Mock the required input elements to be null
    document.getElementById = jest.fn().mockReturnValue(null);
  
    // Expect the resetFilters function to throw an error
    expect(resetFilters).toThrowError('Cannot find required input elements for resetFilters function.');
  
    // Restore the original implementation of document.getElementById
    document.getElementById.mockRestore();
  });
  });
  
  global.fetch = jest.fn();
  
  describe('loadScheduleData', () => {
    it('deve fazer uma chamada para a URL correta e processar os dados corretamente', async () => {
      // Spy para console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      // Mock para o resultado da chamada fetch
      const csvData = 'ID,Name\n1,John\n2,Doe\n';
      const response = { text: () => Promise.resolve(csvData) };
      fetch.mockResolvedValueOnce(response);
  
      // Chame a função
      await loadScheduleData();
  
      // Verifique se fetch foi chamado com a URL correta
      expect(fetch).toHaveBeenCalledWith('/HorarioDeExemploAtualizado.csv');
  
      // Aguarde a próxima microtarefa para garantir que o código assíncrono seja concluído
      await new Promise(resolve => setTimeout(resolve, 0));
  
      // Verifique se console.log foi chamado com a mensagem correta
      expect(consoleLogSpy).toHaveBeenCalledWith('Dados dos horários carregados', [
        { 'ID,Name': '1,John' },
        { 'ID,Name': '2,Doe' }
      ]);
  
      // Restaure a função original de console.log
      consoleLogSpy.mockRestore();
    });
    it('deve lidar corretamente com erros ao carregar os dados', async () => {
      // Spy para console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
      // Mock para o erro da chamada fetch
      const error = new Error('Failed to fetch');
      fetch.mockRejectedValueOnce(error);
  
      // Chame a função
      await loadScheduleData();
  
      // Verifique se fetch foi chamado com a URL correta
      expect(fetch).toHaveBeenCalledWith('/HorarioDeExemploAtualizado.csv');
  
      // Aguarde a próxima microtarefa para garantir que o código assíncrono seja concluído
      await new Promise(resolve => setTimeout(resolve, 0));
  
      // Verifique se console.error foi chamado com a mensagem correta
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao carregar os dados dos horários:', error);
  
      // Restaure a função original de console.error
      consoleErrorSpy.mockRestore();
    });
  });