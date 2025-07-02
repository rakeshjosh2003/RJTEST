/**
 * Go code generator
 * Converts an AST into Go code
 */

export const generateGo = (ast) => {
  try {
    let code = '';
    
    // Package declaration
    let packageName = 'main';
    
    if (ast.language === 'go' && ast.package) {
      packageName = ast.package;
    } else if (ast.language === 'java' && ast.classes && ast.classes.length > 0) {
      packageName = camelCase(ast.classes[0].name);
    } else if (ast.language === 'cpp' && ast.classes && ast.classes.length > 0) {
      packageName = camelCase(ast.classes[0].name);
    } else if (ast.language === 'pascal' && ast.programName) {
      packageName = camelCase(ast.programName);
    } else if (ast.language === 'cobol' && ast.identification) {
      packageName = camelCase(ast.identification.programId);
    }
    
    code += `package ${packageName}\n\n`;
    
    // Import packages
    let imports = new Set(['fmt']);
    
    // Map Java imports or C++ includes to Go imports
    if (ast.language === 'java' && ast.imports) {
      for (const imp of ast.imports) {
        const path = imp.path;
        if (path.includes('java.io')) imports.add('os');
        if (path.includes('java.util.ArrayList') || path.includes('java.util.List')) imports.add('container/list');
        if (path.includes('java.util.Map')) imports.add('container/map');
      }
    } else if (ast.language === 'cpp' && ast.includes) {
      for (const inc of ast.includes) {
        const path = inc.path;
        if (path === 'iostream') imports.add('os');
        if (path === 'vector') imports.add('container/list');
        if (path === 'map') imports.add('container/map');
        if (path === 'string') imports.add('strings');
      }
    } else if (ast.language === 'go' && ast.imports) {
      for (const imp of ast.imports) {
        imports.add(imp.path);
      }
    }
    
    if (imports.size > 0) {
      code += 'import (\n';
      for (const imp of imports) {
        code += `\t"${imp}"\n`;
      }
      code += ')\n\n';
    }
    
    // Add struct definitions
    if (ast.language === 'java' || ast.language === 'cpp') {
      if (ast.classes && ast.classes.length > 0) {
        for (const cls of ast.classes) {
          // Convert class to Go struct
          code += `// ${cls.name} represents a ${ast.language} class\n`;
          code += `type ${cls.name} struct {\n`;
          
          // Add fields
          if (ast.variables && ast.variables.length > 0) {
            for (const variable of ast.variables) {
              // Skip static variables or methods
              if (variable.visibility === 'static') continue;
              
              const fieldName = capitalizeFirstLetter(variable.name);
              const type = mapTypeToGo(variable.dataType);
              code += `\t${fieldName} ${type} \`json:"${variable.name}"\`\n`;
            }
          }
          
          code += `}\n\n`;
          
          // Add methods
          if (ast.methods && ast.methods.length > 0) {
            for (const method of ast.methods) {
              // Skip main method
              if (method.name === 'main') continue;
              
              const returnType = mapTypeToGo(method.returnType);
              
              code += `// ${method.name} implements the ${method.name} method\n`;
              code += `func (${method.name[0].toLowerCase()} *${cls.name}) ${capitalizeFirstLetter(method.name)}(`;
              
              // Add parameters
              if (method.parameters && method.parameters.length > 0) {
                code += method.parameters.map(p => {
                  const paramType = mapTypeToGo(p.type);
                  return `${p.name} ${paramType}`;
                }).join(', ');
              }
              
              code += `) ${returnType} {\n`;
              code += `\t// Method implementation\n`;
              
              if (returnType !== '') {
                code += `\treturn ${getDefaultGoValue(returnType)}\n`;
              }
              
              code += `}\n\n`;
            }
          }
        }
      }
    } else if (ast.language === 'go' && ast.structs) {
      // Copy Go structs directly
      for (const struct of ast.structs) {
        code += `// ${struct.name} struct definition\n`;
        code += `type ${struct.name} struct {\n`;
        
        for (const field of struct.fields) {
          const fieldName = capitalizeFirstLetter(field.name);
          code += `\t${fieldName} ${field.type} \`json:"${field.name}"\`\n`;
        }
        
        code += `}\n\n`;
      }
    } else if (ast.language === 'pascal') {
      // Convert Pascal record to Go struct
      if (ast.variables && ast.variables.length > 0) {
        code += `// ${ast.programName} represents a Pascal program\n`;
        code += `type ${ast.programName} struct {\n`;
        
        for (const variable of ast.variables) {
          const fieldName = capitalizeFirstLetter(variable.name);
          const type = mapPascalTypeToGo(variable.dataType);
          code += `\t${fieldName} ${type} \`json:"${variable.name}"\`\n`;
        }
        
        code += `}\n\n`;
      }
    } else if (ast.language === 'cobol') {
      // Convert COBOL data to Go struct
      if (ast.data && ast.data.workingStorage) {
        code += `// ${ast.identification.programId} represents a COBOL program\n`;
        code += `type ${ast.identification.programId} struct {\n`;
        
        for (const variable of ast.data.workingStorage) {
          if (variable.level === '01' || variable.level === '77') {
            const fieldName = capitalizeFirstLetter(variable.name.toLowerCase());
            const type = mapCobolTypeToGo(variable.picture);
            code += `\t${fieldName} ${type} \`json:"${variable.name.toLowerCase()}"\`\n`;
          }
        }
        
        code += `}\n\n`;
      }
    }
    
    // Add interface definitions
    if (ast.language === 'go' && ast.interfaces) {
      for (const iface of ast.interfaces) {
        code += `// ${iface.name} interface definition\n`;
        code += `type ${iface.name} interface {\n`;
        
        for (const method of iface.methods) {
          code += `\t${method.name}(`;
          
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => {
              return `${p.name || '_'} ${p.type}`;
            }).join(', ');
          }
          
          code += `)`;
          
          if (method.returnType) {
            code += ` ${method.returnType}`;
          }
          
          code += `\n`;
        }
        
        code += `}\n\n`;
      }
    }
    
    // Add constants
    if (ast.language === 'go' && ast.constants && ast.constants.length > 0) {
      code += `// Constants\n`;
      code += `const (\n`;
      
      for (const constant of ast.constants) {
        if (constant.dataType) {
          code += `\t${constant.name} ${constant.dataType} = ${constant.value}\n`;
        } else {
          code += `\t${constant.name} = ${constant.value}\n`;
        }
      }
      
      code += `)\n\n`;
    } else if ((ast.language === 'java' || ast.language === 'cpp' || ast.language === 'pascal') && 
               ast.constants && ast.constants.length > 0) {
      code += `// Constants\n`;
      code += `const (\n`;
      
      for (const constant of ast.constants) {
        code += `\t${constant.name} = ${constant.value}\n`;
      }
      
      code += `)\n\n`;
    }
    
    // Add variable declarations
    let hasVars = false;
    let varCode = '// Variables\n';
    varCode += 'var (\n';
    
    if (ast.language === 'go' && ast.variables && ast.variables.length > 0) {
      hasVars = true;
      
      for (const variable of ast.variables) {
        if (variable.dataType) {
          varCode += `\t${variable.name} ${variable.dataType}`;
        } else {
          varCode += `\t${variable.name}`;
        }
        
        if (variable.initialValue) {
          varCode += ` = ${variable.initialValue}`;
        }
        
        varCode += `\n`;
      }
    } else if ((ast.language === 'java' || ast.language === 'cpp') && 
               ast.variables && ast.variables.length > 0) {
      // Only include global/static variables
      const globalVars = ast.variables.filter(v => v.visibility === 'static' || !v.visibility);
      
      if (globalVars.length > 0) {
        hasVars = true;
        
        for (const variable of globalVars) {
          const type = mapTypeToGo(variable.dataType);
          varCode += `\t${variable.name} ${type}`;
          
          if (variable.initialValue) {
            varCode += ` = ${variable.initialValue}`;
          }
          
          varCode += `\n`;
        }
      }
    }
    
    varCode += ')\n\n';
    
    if (hasVars) {
      code += varCode;
    }
    
    // Add functions
    if (ast.language === 'java' || ast.language === 'cpp') {
      // Convert static methods to functions
      if (ast.methods) {
        const staticMethods = ast.methods.filter(m => m.visibility === 'static');
        
        for (const method of staticMethods) {
          // Skip main method, it will be handled separately
          if (method.name === 'main') continue;
          
          const returnType = mapTypeToGo(method.returnType);
          
          code += `// ${method.name} implements a static method\n`;
          code += `func ${method.name}(`;
          
          // Add parameters
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => {
              const paramType = mapTypeToGo(p.type);
              return `${p.name} ${paramType}`;
            }).join(', ');
          }
          
          code += `)`;
          
          if (returnType !== '') {
            code += ` ${returnType}`;
          }
          
          code += ` {\n`;
          code += `\t// Function implementation\n`;
          
          if (returnType !== '') {
            code += `\treturn ${getDefaultGoValue(returnType)}\n`;
          }
          
          code += `}\n\n`;
        }
      }
    } else if (ast.language === 'go' && ast.functions) {
      // Copy Go functions directly
      for (const func of ast.functions) {
        // Skip main function, it will be handled separately
        if (func.name === 'main') continue;
        
        code += `// ${func.name} function definition\n`;
        code += `func ${func.name}(`;
        
        if (func.parameters && func.parameters.length > 0) {
          code += func.parameters.map(p => `${p.name || '_'} ${p.type}`).join(', ');
        }
        
        code += `)`;
        
        if (func.returnType) {
          code += ` ${func.returnType}`;
        }
        
        code += ` {\n`;
        code += `\t// Function implementation\n`;
        
        if (func.returnType) {
          code += `\treturn ${getDefaultGoValue(func.returnType)}\n`;
        }
        
        code += `}\n\n`;
      }
      
      // Copy Go methods directly
      if (ast.methods) {
        for (const method of ast.methods) {
          code += `// ${method.name} method for ${method.receiverType}\n`;
          code += `func (${method.receiverName} ${method.receiverType}) ${method.name}(`;
          
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => `${p.name || '_'} ${p.type}`).join(', ');
          }
          
          code += `)`;
          
          if (method.returnType) {
            code += ` ${method.returnType}`;
          }
          
          code += ` {\n`;
          code += `\t// Method implementation\n`;
          
          if (method.returnType) {
            code += `\treturn ${getDefaultGoValue(method.returnType)}\n`;
          }
          
          code += `}\n\n`;
        }
      }
    } else if (ast.language === 'pascal') {
      // Convert Pascal functions to Go
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          const returnType = mapPascalTypeToGo(func.returnType);
          
          code += `// ${func.name} converts a Pascal function\n`;
          code += `func ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              const paramType = mapPascalTypeToGo(p.dataType);
              return `${p.name} ${paramType}`;
            }).join(', ');
          }
          
          code += `) ${returnType} {\n`;
          code += `\t// Function implementation\n`;
          code += `\treturn ${getDefaultGoValue(returnType)}\n`;
          code += `}\n\n`;
        }
      }
      
      // Convert Pascal procedures to Go
      if (ast.procedures && ast.procedures.length > 0) {
        for (const proc of ast.procedures) {
          code += `// ${proc.name} converts a Pascal procedure\n`;
          code += `func ${proc.name}(`;
          
          // Add parameters
          if (proc.parameters && proc.parameters.length > 0) {
            code += proc.parameters.map(p => {
              const paramType = mapPascalTypeToGo(p.dataType);
              return `${p.name} ${paramType}`;
            }).join(', ');
          }
          
          code += `) {\n`;
          code += `\t// Procedure implementation\n`;
          code += `}\n\n`;
        }
      }
    } else if (ast.language === 'cobol' && ast.procedure) {
      // Convert COBOL paragraphs to Go functions
      for (const paragraph of ast.procedure) {
        // Skip MAIN paragraph, handle main separately
        if (paragraph.name === 'MAIN') continue;
        
        code += `// ${paragraph.name} converts a COBOL paragraph\n`;
        code += `func ${camelCase(paragraph.name)}() {\n`;
        
        // Convert COBOL statements to Go
        const statements = paragraph.body.split('.');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common COBOL statements
          let goStmt = stmt.trim();
          
          // DISPLAY statements
          if (goStmt.startsWith('DISPLAY')) {
            const displayArg = goStmt.substring('DISPLAY'.length).trim();
            code += `\tfmt.Println(${cobolExprToGo(displayArg)})\n`;
          }
          
          // MOVE statements
          else if (goStmt.startsWith('MOVE')) {
            const parts = goStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
            if (parts) {
              const source = cobolExprToGo(parts[1]);
              const target = camelCase(parts[2].trim());
              code += `\t${target} = ${source}\n`;
            }
          }
          
          // IF statements
          else if (goStmt.startsWith('IF')) {
            const condition = goStmt.match(/IF\s+(.+)\s+THEN/i);
            if (condition) {
              const goCondition = cobolConditionToGo(condition[1]);
              code += `\tif ${goCondition} {\n`;
              // TODO: Handle THEN logic
              code += `\t}\n`;
            }
          }
        }
        
        code += `}\n\n`;
      }
    }
    
    // Add main function
    code += `// main function is the entry point of the program\n`;
    code += `func main() {\n`;
    code += `\tfmt.Println("Program started")\n`;
    
    if (ast.language === 'java' || ast.language === 'cpp') {
      // For class-based languages, instantiate the main class and call methods
      if (ast.classes && ast.classes.length > 0) {
        const mainClass = ast.classes[0];
        code += `\t// Create a new instance of ${mainClass.name}\n`;
        code += `\tinstance := &${mainClass.name}{}\n`;
        
        // If there's a run or process method, call it
        const processMethods = ast.methods ? ast.methods.filter(m => 
          m.name === 'run' || m.name === 'process' || m.name === 'execute') : [];
        
        if (processMethods.length > 0) {
          code += `\t// Call the process method\n`;
          code += `\tinstance.${capitalizeFirstLetter(processMethods[0].name)}()\n`;
        }
      }
    } else if (ast.language === 'pascal') {
      // For Pascal, simply add the main code logic
      code += `\t// Main program logic\n`;
      
      if (ast.main) {
        // Try to convert simple Pascal statements to Go
        const statements = ast.main.split(';');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common Pascal statements
          let goStmt = stmt.trim();
          
          // WriteLn statements
          if (goStmt.toLowerCase().startsWith('writeln')) {
            const match = goStmt.match(/writeln\((.*)\)/i);
            if (match) {
              code += `\tfmt.Println(${match[1]})\n`;
            } else {
              code += `\tfmt.Println()\n`;
            }
          }
          
          // Assignment statements
          else if (goStmt.includes(':=')) {
            goStmt = goStmt.replace(':=', '=');
            code += `\t${goStmt}\n`;
          }
        }
      }
    } else if (ast.language === 'cobol') {
      // For COBOL, call the main paragraph
      code += `\t// Call the main program logic\n`;
      
      const mainPara = ast.procedure ? ast.procedure.find(p => p.name === 'MAIN') : null;
      
      if (mainPara) {
        // Convert simple COBOL statements from MAIN paragraph
        const statements = mainPara.body.split('.');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common COBOL statements
          let goStmt = stmt.trim();
          
          // DISPLAY statements
          if (goStmt.startsWith('DISPLAY')) {
            const displayArg = goStmt.substring('DISPLAY'.length).trim();
            code += `\tfmt.Println(${cobolExprToGo(displayArg)})\n`;
          }
          
          // MOVE statements
          else if (goStmt.startsWith('MOVE')) {
            const parts = goStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
            if (parts) {
              const source = cobolExprToGo(parts[1]);
              const target = camelCase(parts[2].trim());
              code += `\t${target} = ${source}\n`;
            }
          }
        }
      } else {
        // If no MAIN paragraph, just add a generic message
        code += `\tfmt.Println("Processing COBOL program")\n`;
      }
    }
    
    code += `\tfmt.Println("Program completed")\n`;
    code += `}\n`;
    
    return code;
  } catch (error) {
    console.error('Error generating Go code:', error);
    return `// Error generating Go code: ${error.message}\n`;
  }
};

// Helper function to map Java/C++ types to Go types
function mapTypeToGo(type) {
  if (!type) return 'interface{}';
  
  switch (type.toLowerCase()) {
    case 'int':
    case 'integer':
      return 'int';
    case 'long':
      return 'int64';
    case 'float':
      return 'float32';
    case 'double':
      return 'float64';
    case 'boolean':
      return 'bool';
    case 'char':
      return 'rune';
    case 'string':
    case 'String':
      return 'string';
    case 'void':
      return '';
    default:
      if (type.includes('[]')) {
        return '[]' + mapTypeToGo(type.replace('[]', ''));
      }
      if (type.includes('ArrayList') || type.includes('vector')) {
        return '[]' + mapTypeToGo(type.replace('ArrayList<', '').replace('vector<', '').replace('>', ''));
      }
      if (type.includes('Map') || type.includes('HashMap')) {
        return 'map[string]interface{}';
      }
      return type;
  }
}

// Helper function to map Pascal types to Go types
function mapPascalTypeToGo(type) {
  if (!type) return 'interface{}';
  
  switch (type.toLowerCase()) {
    case 'integer':
      return 'int';
    case 'real':
      return 'float64';
    case 'boolean':
      return 'bool';
    case 'char':
      return 'rune';
    case 'string':
      return 'string';
    default:
      return 'interface{}';
  }
}

// Helper function to map COBOL types to Go types
function mapCobolTypeToGo(picture) {
  if (picture.includes('9')) {
    if (picture.includes('V') || picture.includes('.')) {
      return 'float64';
    }
    return 'int';
  }
  if (picture.includes('X')) {
    return 'string';
  }
  if (picture.includes('A')) {
    return 'string';
  }
  return 'string'; // Default
}

// Helper function to get default values for Go types
function getDefaultGoValue(type) {
  if (!type) return '';
  
  switch (type) {
    case 'int':
    case 'int64':
    case 'uint':
    case 'uint64':
      return '0';
    case 'float32':
    case 'float64':
      return '0.0';
    case 'bool':
      return 'false';
    case 'rune':
      return '\'\\0\'';
    case 'string':
      return '""';
    default:
      if (type.startsWith('[]')) {
        return 'nil';
      }
      if (type.startsWith('map[')) {
        return 'nil';
      }
      return 'nil';
  }
}

// Helper function to convert COBOL expressions to Go
function cobolExprToGo(expr) {
  // Remove quotes for string literals
  if (expr.startsWith('\'') && expr.endsWith('\'')) {
    return `"${expr.substring(1, expr.length - 1)}"`;
  }
  return expr;
}

// Helper function to convert COBOL conditions to Go
function cobolConditionToGo(condition) {
  // Replace COBOL operators with Go operators
  return condition
    .replace(/EQUAL TO|=/g, '==')
    .replace(/GREATER THAN/g, '>')
    .replace(/LESS THAN/g, '<')
    .replace(/NOT EQUAL/g, '!=');
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to convert string to camelCase
function camelCase(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word, index) => {
      return index === 0 ? word : capitalizeFirstLetter(word);
    })
    .join('');
}