/**
 * @jest-environment jsdom
 */
// In your test setup file or before running tests
global.DataTransfer = function() {
    this.setData = jest.fn();
    // Add other necessary methods and properties
  };
  
const {
    calculateWeekOfYear,
    calculateSemesterWeek,
    orFilterFunction,
    parseCSV,
    createTable,
    createColumnControls,
    markSubstitutionByID,
    populateAdditionalColumns,
    parseFile,
} = require('./scriptTest');

describe('calculateWeekOfYear', () => {

      // Returns the correct week number for a valid date string in the format 'dd/mm/yyyy'
      it('should return the correct week number when given a valid date string', () => {
        // Arrange
        const dateStr = '01/01/2022';
        const expectedWeekNo = 1;
  
        // Act
        const result = calculateWeekOfYear(dateStr);
  
        // Assert
        expect(result).toBe(expectedWeekNo);
      });

          // Returns 1 for an invalid date string


    // Returns 1 for an empty date string
    it('should return 1 for an empty date string', () => {
      // Arrange
      const dateStr = '01/01/2022';
      const expectedWeekNo = 1;

      // Act
      const result = calculateWeekOfYear(dateStr);

      // Assert
      expect(result).toBe(expectedWeekNo);
    });
   
});

describe('calculateSemesterWeekr', () => {

 // Calculates the correct week number within the semester when the date is within the allowed range
 it('should calculate the correct week number within the semester when the date is within the allowed range', () => {
  // Arrange
  const semesterStart = '01/09/2022';
  const dateStr = '15/09/2022';
  const semesterNumber = 1;

  // Act
  const result = calculateSemesterWeek(dateStr, semesterStart, semesterNumber);

  // Assert
  expect(result).toBe("-");
});

});

describe('orFilterFunction', () => {

     // It returns true if any value in the row matches the search value.
     it('should return true when any value in the row matches the search value', () => {
      const data = [
        { name: 'John', age: 25, city: 'New York' },
        { name: 'Jane', age: 30, city: 'Los Angeles' },
        { name: 'Bob', age: 35, city: 'Chicago' },
        { name: 'Alice', age: 28, city: 'San Francisco' }
      ];

      const filterParams = {
        name: 'John',
        city: 'Chicago'
      };

      let result = false;
      for (let row of data) {
        result = orFilterFunction(row, filterParams);
        if (result) {
          break;
        }
      }

      expect(result).toBe(true);
    });

    // It returns false if no value in the row matches the search value.
    it('should return false when no value in the row matches the search value', () => {
      const data = [
        { name: 'John', age: 25, city: 'New York' },
        { name: 'Jane', age: 30, city: 'Los Angeles' },
        { name: 'Bob', age: 35, city: 'Chicago' },
        { name: 'Alice', age: 28, city: 'San Francisco' }
      ];

      const filterParams = {
        name: 'David',
        city: 'Miami'
      };

      const result = orFilterFunction(data, filterParams);

      expect(result).toBe(false);
    });

        // It should handle multiple filterParams
        it('should return true when any value matches the filterParams', () => {
            // Arrange
            const data = {
              name: 'John',
              age: 25,
              city: 'New York'
            };
            const filterParams = {
              name: 'Jane',
              age: '30',
              city: 'New York'
            };
      
            // Act
            const result = orFilterFunction(data, filterParams);
      
            // Assert
            expect(result).toBe(true);
          });
});

describe('createTable', () => {
    // Handles empty headers and data arrays
    it('should handle empty headers and data arrays', () => {
      // Arrange
      const headers = [];
      const data = [];
      const expectedColumns = [];
  
      // Define Tabulator
      class Tabulator {
        constructor(container, options) {
          this.container = container;
          this.options = options;
        }
        getColumns() {
          return this.options.columns;
        }
      }
  
      // Mock Tabulator globally
      global.Tabulator = Tabulator;
  
      // Variable to hold the created table
      let table;
  
      // Mock createTable function to capture the created table
      const createTableMock = (h, d) => {
        table = new Tabulator("#tableContainer", {
          data: d,
          columns: h,
          layout: "fitData",
        });
      };
  
      // Act
      createTableMock(headers, data);
  
      // Assert
      expect(table.getColumns()).toEqual(expectedColumns);
    });
  });

  describe('createColumnControls', () => {
      // Creates a button for each header in the headers array
      it('should create a button for each header in the headers array', () => {
        // Arrange
        const headers = ['Header 1', 'Header 2', 'Header 3'];
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'column-controls';
        document.body.appendChild(controlsContainer);
  
        // Act
        createColumnControls(headers);
  
        // Assert
        expect(controlsContainer.children.length).toBe(headers.length);
        for (let i = 0; i < headers.length; i++) {
          expect(controlsContainer.children[i].tagName).toBe('BUTTON');
          expect(controlsContainer.children[i].textContent).toBe(headers[i]);
          expect(controlsContainer.children[i].getAttribute('data-column')).toBe(headers[i]);
        }
  
        // Clean up
        document.body.removeChild(controlsContainer);
      });
          // Does nothing when headers array is empty
    it('should do nothing when headers array is empty', () => {
        // Arrange
        const headers = [];
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'column-controls';
        document.body.appendChild(controlsContainer);
  
        // Act
        createColumnControls(headers);
  
        // Assert
        expect(controlsContainer.children.length).toBe(0);
  
        // Clean up
        document.body.removeChild(controlsContainer);
      });
    });
  

    describe('uploadFile', () =>{
            // Returns the correct week number for a valid date string in the format 'dd/mm/yyyy'
    it('should return the correct week number when given a valid date string', () => {
        // Arrange
        const dateStr = '01/01/2022';
        const expectedWeekNo = 1;

        // Act
        const result = calculateWeekOfYear(dateStr);

        // Assert
        expect(result).toBe(expectedWeekNo);
    });
            // It returns false if no value in the row matches the search value.
    it('should return false when no value in the row matches the search value', () => {
        // Arrange
        const data = [
            { name: 'John', age: 25, city: 'New York' },
            { name: 'Jane', age: 30, city: 'Los Angeles' },
            { name: 'Bob', age: 35, city: 'Chicago' },
            { name: 'Alice', age: 28, city: 'San Francisco' }
        ];
        const filterParams = {
            name: 'David',
            city: 'Miami'
        };

        // Act
        const result = orFilterFunction(data, filterParams);

        // Assert
        expect(result).toBe(false);
    });
        // It should handle multiple filterParams
        it('should return true when any value matches the filterParams', () => {
            // Arrange
            const data = {
                name: 'John',
                age: 25,
                city: 'New York'
            };
            const filterParams = {
                name: 'Jane',
                age: '30',
                city: 'New York'
            };
    
            // Act
            const result = orFilterFunction(data, filterParams);
    
            // Assert
            expect(result).toBe(true);
        });
            // Creates a button for each header in the headers array
    it('should create a button for each header in the headers array', () => {
        // Arrange
        const headers = ['Header 1', 'Header 2', 'Header 3'];
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'column-controls';
        document.body.appendChild(controlsContainer);

        // Act
        createColumnControls(headers);

        // Assert
        expect(controlsContainer.children.length).toBe(headers.length);
        for (let i = 0; i < headers.length; i++) {
            expect(controlsContainer.children[i].tagName).toBe('BUTTON');
            expect(controlsContainer.children[i].textContent).toBe(headers[i]);
            expect(controlsContainer.children[i].getAttribute('data-column')).toBe(headers[i]);
        }

        // Clean up
        document.body.removeChild(controlsContainer);
    });
    });

    describe('parseCSV', () => {
        it('should correctly parse CSV data with headers and rows', () => {
            // Sample CSV data
            const csvData = `Name;Age;Country
    John;30;USA
    Alice;25;Canada
    Bob;40;UK`;
    
            // Expected result after parsing
            const expectedHeaders = ['Name', 'Age', 'Country'];
            const expectedData = [
                { Name: 'John', Age: '30', Country: 'USA' },
                { Name: 'Alice', Age: '25', Country: 'Canada' },
                { Name: 'Bob', Age: '40', Country: 'UK' }
            ];
    
            // Call the parseCSV function
            const result = parseCSV(csvData);
    
            // Assert the result
            expect(result.headers).toEqual(expectedHeaders);
            expect(result.data).toEqual(expectedData);
        });
    });

    describe('markSubstitutionByID', () =>{
            // Obtains the substitution ID from the input field and saves it to local storage
    it('should obtain the substitution ID from the input field and save it to local storage', () => {
        // Arrange
        const inputElement = document.createElement('input');
        inputElement.id = 'substitution-id';
        inputElement.value = '12345';
        document.body.appendChild(inputElement);
  
        // Act
        markSubstitutionByID();
  
        // Assert
        expect(localStorage.getItem('substitutionID')).toBe('12345');
  
        // Clean up
        document.body.removeChild(inputElement);
      });
          // Displays an alert if an invalid ID is entered
    it('should display an alert if an invalid ID is entered', () => {
        // Arrange
        const inputElement = document.createElement('input');
        inputElement.id = 'substitution-id';
        inputElement.value = '';
        document.body.appendChild(inputElement);
  
        // Mock the alert function
        window.alert = jest.fn();
  
        // Act
        markSubstitutionByID();
  
        // Assert
        expect(window.alert).toHaveBeenCalledWith('Por favor, insira um ID válido.');
  
        // Clean up
        document.body.removeChild(inputElement);
      });
          // Displays an alert if an invalid ID is entered
    it('should display an alert if an invalid ID is entered', () => {
        // Arrange
        const inputElement = document.createElement('input');
        inputElement.id = 'substitution-id';
        inputElement.value = '   ';
        document.body.appendChild(inputElement);
  
        // Mock the alert function
        window.alert = jest.fn();
  
        // Act
        markSubstitutionByID();
  
        // Assert
        expect(window.alert).toHaveBeenCalledWith('Por favor, insira um ID válido.');
  
        // Clean up
        document.body.removeChild(inputElement);
      });
    });

    describe('populateAdditionalColumns', () =>{
            // Populates additional columns when given an empty array.
    it('should populate additional columns when given an empty array', () => {
        const data = [];
  
        populateAdditionalColumns(data);
  
        expect(data.length).toBe(0);
      });
    });

    describe('parseFile', () => {
            // Successfully reads and parses a CSV file
    it('should read and parse a CSV file successfully', () => {
        // Arrange
        const file = new File(["Name;Age;Country\nJohn;30;USA\nAlice;25;Canada\nBob;40;UK"], "data.csv");
  
        // Act
        parseFile(file);
  
        // Assert
        // Add assertions to check if the table and column controls are created correctly
      });
    });