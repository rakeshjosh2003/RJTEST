/**
 * COBOL code generator
 * Converts an AST into COBOL code
 */

export const generateCobol = (ast) => {
  try {
    let code = '';
    
    // IDENTIFICATION DIVISION
    code += 'IDENTIFICATION DIVISION.\n';
    
    // Determine program name
    let programName = 'PROGRAM1';
    
    if (ast.language === 'java' && ast.classes && ast.classes.length > 0) {
      programName = ast.classes[0].name;
    } else if (ast.language === 'cpp' && ast.classes && ast.classes.length > 0) {
      programName = ast.classes[0].name;
    } else if (ast.language === 'pascal' && ast.programName) {
      programName = ast.programName;
    } else if (ast.language === 'go' && ast.package) {
      programName = ast.package.toUpperCase();
    } else if (ast.language === 'cobol' && ast.identification) {
      programName = ast.identification.programId;
    }
    
    code += `PROGRAM-ID. ${programName}.\n\n`;
    
    // ENVIRONMENT DIVISION
    code += 'ENVIRONMENT DIVISION.\n';
    code += 'CONFIGURATION SECTION.\n';
    code += 'SOURCE-COMPUTER. COMPUTER.\n';
    code += 'OBJECT-COMPUTER. COMPUTER.\n\n';
    
    // DATA DIVISION
    code += 'DATA DIVISION.\n';
    code += 'WORKING-STORAGE SECTION.\n';
    
    // Convert variables to COBOL data items
    if (ast.language === 'java' || ast.language === 'cpp') {
      if (ast.variables && ast.variables.length > 0) {
        let levelCounter = 1;
        
        for (const variable of ast.variables) {
          const level = levelCounter++ === 1 ? '01' : '05';
          const varName = variable.name.toUpperCase();
          const type = convertTypeToCobol(variable.dataType);
          let initialValue = '';
          
          if (variable.initialValue) {
            initialValue = ` VALUE ${convertValueToCobol(variable.initialValue, variable.dataType)}`;
          }
          
          code += `${level} ${varName} PIC ${type}${initialValue}.\n`;
        }
      }
    } else if (ast.language === 'pascal') {
      if (ast.variables && ast.variables.length > 0) {
        let levelCounter = 1;
        
        for (const variable of ast.variables) {
          const level = levelCounter++ === 1 ? '01' : '05';
          const varName = variable.name.toUpperCase();
          const type = convertPascalTypeToCobol(variable.dataType);
          
          code += `${level} ${varName} PIC ${type}.\n`;
        }
      }
    } else if (ast.language === 'go') {
      if (ast.variables && ast.variables.length > 0) {
        let levelCounter = 1;
        
        for (const variable of ast.variables) {
          const level = levelCounter++ === 1 ? '01' : '05';
          const varName = variable.name.toUpperCase();
          const type = convertGoTypeToCobol(variable.dataType);
          let initialValue = '';
          
          if (variable.initialValue) {
            initialValue = ` VALUE ${convertValueToCobol(variable.initialValue, variable.dataType)}`;
          }
          
          code += `${level} ${varName} PIC ${type}${initialValue}.\n`;
        }
      }
      
      // Add struct fields as group items
      if (ast.structs && ast.structs.length > 0) {
        for (const struct of ast.structs) {
          code += `01 ${struct.name.toUpperCase()}.\n`;
          
          for (const field of struct.fields) {
            const type = convertGoTypeToCobol(field.type);
            code += `   05 ${field.name.toUpperCase()} PIC ${type}.\n`;
          }
        }
      }
    } else if (ast.language === 'cobol' && ast.data && ast.data.workingStorage) {
      // Direct copy of COBOL working storage
      for (const variable of ast.data.workingStorage) {
        code += `${variable.level} ${variable.name} PIC ${variable.picture}`;
        
        if (variable.value) {
          code += ` VALUE ${variable.value}`;
        }
        
        code += `.\n`;
      }
    }
    
    code += '\n';
    
    // PROCEDURE DIVISION
    code += 'PROCEDURE DIVISION.\n';
    
    // Add MAIN paragraph
    code += 'MAIN.\n';
    
    // Convert Java/C++ methods/functions to COBOL paragraphs
    if (ast.language === 'java' || ast.language === 'cpp') {
      // Add standard initialization
      code += '    DISPLAY "PROGRAM STARTED".\n';
      
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          if (method.name === 'main') {
            code += `    PERFORM ${method.name.toUpperCase()}-PARA.\n`;
          }
        }
      }
      
      code += '    STOP RUN.\n\n';
      
      // Add method paragraphs
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          code += `${method.name.toUpperCase()}-PARA.\n`;
          code += '    DISPLAY "METHOD CALLED".\n';
          code += '    EXIT.\n\n';
        }
      }
    } else if (ast.language === 'pascal') {
      // Add standard initialization
      code += '    DISPLAY "PROGRAM STARTED".\n';
      
      // Simulate calling main program logic
      code += '    PERFORM MAIN-LOGIC.\n';
      code += '    STOP RUN.\n\n';
      
      // Add main program logic paragraph
      code += 'MAIN-LOGIC.\n';
      
      if (ast.main) {
        // Convert Pascal main body statements to COBOL
        const statements = ast.main.split(';');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common Pascal statements to COBOL
          let cobolStmt = stmt.trim();
          
          // writeln statements
          if (cobolStmt.startsWith('writeln')) {
            const args = cobolStmt.match(/writeln\((.*)\)/);
            if (args) {
              code += `    DISPLAY ${args[1]}.\n`;
            } else {
              code += `    DISPLAY " ".\n`;
            }
          }
          
          // Assignment statements
          else if (cobolStmt.includes(':=')) {
            const parts = cobolStmt.split(':=');
            if (parts.length === 2) {
              const target = parts[0].trim();
              const source = parts[1].trim();
              code += `    MOVE ${source} TO ${target}.\n`;
            }
          }
        }
      }
      
      code += '    EXIT.\n\n';
      
      // Add procedures as paragraphs
      if (ast.procedures && ast.procedures.length > 0) {
        for (const proc of ast.procedures) {
          code += `${proc.name.toUpperCase()}-PARA.\n`;
          code += '    DISPLAY "PROCEDURE CALLED".\n';
          code += '    EXIT.\n\n';
        }
      }
      
      // Add functions as paragraphs
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          code += `${func.name.toUpperCase()}-FUNC.\n`;
          code += '    DISPLAY "FUNCTION CALLED".\n';
          code += '    EXIT.\n\n';
        }
      }
    } else if (ast.language === 'go') {
      // Add standard initialization
      code += '    DISPLAY "PROGRAM STARTED".\n';
      
      // Simulate calling main function
      code += '    PERFORM MAIN-LOGIC.\n';
      code += '    STOP RUN.\n\n';
      
      // Add main program logic paragraph
      code += 'MAIN-LOGIC.\n';
      code += '    DISPLAY "MAIN FUNCTION EXECUTED".\n';
      code += '    EXIT.\n\n';
      
      // Add functions as paragraphs
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          if (func.name === 'main') continue; // Skip main, already handled
          
          code += `${func.name.toUpperCase()}-FUNC.\n`;
          code += '    DISPLAY "FUNCTION CALLED".\n';
          code += '    EXIT.\n\n';
        }
      }
      
      // Add methods as paragraphs
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          code += `${method.name.toUpperCase()}-METHOD.\n`;
          code += `    DISPLAY "METHOD ${method.name} CALLED".\n`;
          code += '    EXIT.\n\n';
        }
      }
    } else if (ast.language === 'cobol' && ast.procedure) {
      // Add standard initialization
      code += '    DISPLAY "PROGRAM STARTED".\n';
      
      // Reference first paragraph or section if present
      if (ast.procedure.length > 0) {
        code += `    PERFORM ${ast.procedure[0].name}.\n`;
      }
      
      code += '    STOP RUN.\n\n';
      
      // Add original paragraphs
      for (const paragraph of ast.procedure) {
        if (paragraph.isSection) {
          code += `${paragraph.name} SECTION.\n`;
        } else {
          code += `${paragraph.name}.\n`;
        }
        
        // Split body into statements
        const statements = paragraph.body.split('.');
        for (const stmt of statements) {
          const trimmed = stmt.trim();
          if (trimmed) {
            code += `    ${trimmed}.\n`;
          }
        }
        
        code += '\n';
      }
    }
    
    return code;
  } catch (error) {
    console.error('Error generating COBOL code:', error);
    return `* Error generating COBOL code: ${error.message}\n`;
  }
};

// Helper function to convert Java/C++ types to COBOL PIC clauses
function convertTypeToCobol(type) {
  if (!type) return 'X(10)';
  
  switch (type.toLowerCase()) {
    case 'int':
    case 'integer':
    case 'long':
      return '9(10)';
    case 'float':
    case 'double':
      return '9(10)V9(2)';
    case 'boolean':
      return '9';
    case 'char':
      return 'X';
    case 'string':
      return 'X(50)';
    default:
      if (type.includes('[]') || type.includes('vector') || type.includes('ArrayList')) {
        return 'X(100)';
      }
      return 'X(20)';
  }
}

// Helper function to convert Pascal types to COBOL PIC clauses
function convertPascalTypeToCobol(type) {
  if (!type) return 'X(10)';
  
  switch (type.toLowerCase()) {
    case 'integer':
      return '9(10)';
    case 'real':
      return '9(10)V9(2)';
    case 'boolean':
      return '9';
    case 'char':
      return 'X';
    case 'string':
      return 'X(50)';
    default:
      return 'X(20)';
  }
}

// Helper function to convert Go types to COBOL PIC clauses
function convertGoTypeToCobol(type) {
  if (!type) return 'X(10)';
  
  switch (type) {
    case 'int':
    case 'int64':
    case 'uint':
    case 'uint64':
      return '9(10)';
    case 'float32':
    case 'float64':
      return '9(10)V9(2)';
    case 'bool':
      return '9';
    case 'byte':
    case 'rune':
      return 'X';
    case 'string':
      return 'X(50)';
    default:
      if (type.startsWith('[]')) {
        return 'X(100)';
      }
      return 'X(20)';
  }
}

// Helper function to convert values to COBOL format
function convertValueToCobol(value, type) {
  if (!value) return 'SPACES';
  
  // Handle string literals
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith('\'') && value.endsWith('\''))) {
    return `"${value.substring(1, value.length - 1)}"`;
  }
  
  // Handle boolean values
  if (value === 'true' || value === 'false') {
    return value === 'true' ? '1' : '0';
  }
  
  // Handle null/nullptr
  if (value === 'null' || value === 'nullptr' || value === 'NULL') {
    return 'SPACES';
  }
  
  return value;
}