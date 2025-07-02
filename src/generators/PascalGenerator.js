/**
 * Pascal code generator
 * Converts an AST into Pascal code
 */

export const generatePascal = (ast) => {
  try {
    let code = '';
    
    // Determine program name
    let programName = 'Program1';
    
    if (ast.language === 'java' && ast.classes && ast.classes.length > 0) {
      programName = ast.classes[0].name;
    } else if (ast.language === 'cpp' && ast.classes && ast.classes.length > 0) {
      programName = ast.classes[0].name;
    } else if (ast.language === 'pascal' && ast.programName) {
      programName = ast.programName;
    } else if (ast.language === 'go' && ast.package) {
      programName = pascalCase(ast.package);
    } else if (ast.language === 'cobol' && ast.identification) {
      programName = pascalCase(ast.identification.programId);
    }
    
    // Program declaration
    code += `program ${programName};\n\n`;
    
    // Uses clause
    let usesClauses = [];
    
    // Map Java imports or C++ includes to Pascal units
    if (ast.language === 'java' && ast.imports) {
      for (const imp of ast.imports) {
        const path = imp.path;
        if (path.includes('java.io')) usesClauses.push('SysUtils');
        if (path.includes('java.util')) usesClauses.push('Classes');
      }
    } else if (ast.language === 'cpp' && ast.includes) {
      for (const inc of ast.includes) {
        const path = inc.path;
        if (path === 'iostream') usesClauses.push('SysUtils');
        if (path === 'vector') usesClauses.push('Classes');
        if (path === 'string') usesClauses.push('SysUtils');
      }
    } else if (ast.language === 'pascal' && ast.uses) {
      usesClauses = ast.uses;
    } else if (ast.language === 'go' && ast.imports) {
      for (const imp of ast.imports) {
        const path = imp.path;
        if (path.includes('fmt')) usesClauses.push('SysUtils');
        if (path.includes('container')) usesClauses.push('Classes');
      }
    }
    
    // Add default SysUtils if not already present
    if (!usesClauses.includes('SysUtils')) {
      usesClauses.push('SysUtils');
    }
    
    if (usesClauses.length > 0) {
      code += `uses\n  ${usesClauses.join(', ')};\n\n`;
    }
    
    // Add type definitions section if needed
    if ((ast.language === 'java' || ast.language === 'cpp') && ast.classes && ast.classes.length > 0) {
      code += 'type\n';
      
      for (const cls of ast.classes) {
        // Map class to Pascal record
        code += `  ${cls.name} = record\n`;
        
        // Add fields
        if (ast.variables && ast.variables.length > 0) {
          for (const variable of ast.variables) {
            // Skip static or methods, only include instance variables
            if (variable.visibility === 'static') continue;
            
            const type = mapTypeToPascal(variable.dataType);
            code += `    ${variable.name}: ${type};\n`;
          }
        }
        
        code += `  end;\n\n`;
      }
    } else if (ast.language === 'go' && ast.structs && ast.structs.length > 0) {
      code += 'type\n';
      
      for (const struct of ast.structs) {
        // Map struct to Pascal record
        code += `  ${struct.name} = record\n`;
        
        // Add fields
        for (const field of struct.fields) {
          const type = mapGoTypeToPascal(field.type);
          code += `    ${field.name}: ${type};\n`;
        }
        
        code += `  end;\n\n`;
      }
    }
    
    // Convert Go interfaces to Pascal class types
    if (ast.language === 'go' && ast.interfaces && ast.interfaces.length > 0) {
      if (!code.includes('type\n')) {
        code += 'type\n';
      }
      
      for (const iface of ast.interfaces) {
        code += `  ${iface.name} = class\n`;
        code += `    public\n`;
        
        // Add method signatures
        for (const method of iface.methods) {
          const returnType = mapGoTypeToPascal(method.returnType || '');
          code += `      function ${method.name}(`;
          
          // Add parameters
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => {
              const paramType = mapGoTypeToPascal(p.type);
              return `${p.name || 'arg'}: ${paramType}`;
            }).join('; ');
          }
          
          if (returnType) {
            code += `): ${returnType};\n`;
          } else {
            code += `);\n`;
          }
        }
        
        code += `  end;\n\n`;
      }
    }
    
    // Constant section
    let hasConstants = false;
    
    if (ast.language === 'pascal' && ast.constants && ast.constants.length > 0) {
      code += 'const\n';
      hasConstants = true;
      
      for (const constant of ast.constants) {
        code += `  ${constant.name} = ${constant.value};\n`;
      }
      
      code += '\n';
    } else if (ast.language === 'go' && ast.constants && ast.constants.length > 0) {
      code += 'const\n';
      hasConstants = true;
      
      for (const constant of ast.constants) {
        code += `  ${constant.name} = ${constant.value};\n`;
      }
      
      code += '\n';
    }
    
    // Variable section
    if (ast.language === 'java' || ast.language === 'cpp') {
      // Only include global/static variables
      const globalVars = ast.variables ? ast.variables.filter(v => v.visibility === 'static' || !v.visibility) : [];
      
      if (globalVars.length > 0) {
        code += 'var\n';
        
        for (const variable of globalVars) {
          const type = mapTypeToPascal(variable.dataType);
          code += `  ${variable.name}: ${type}`;      
          
          if (variable.initialValue) {
            code += ` = ${mapValueToPascal(variable.initialValue, variable.dataType)}`;
          }
          
          code += ';\n';
        }
        
        code += '\n';
      }
    } else if (ast.language === 'pascal' && ast.variables && ast.variables.length > 0) {
      code += 'var\n';
      
      for (const variable of ast.variables) {
        code += `  ${variable.name}: ${variable.dataType};\n`;
      }
      
      code += '\n';
    } else if (ast.language === 'go' && ast.variables && ast.variables.length > 0) {
      code += 'var\n';
      
      for (const variable of ast.variables) {
        const type = mapGoTypeToPascal(variable.dataType || '');
        code += `  ${variable.name}: ${type}`;    
        
        if (variable.initialValue) {
          code += ` = ${mapValueToPascal(variable.initialValue, variable.dataType)}`;
        }
        
        code += ';\n';
      }
      
      code += '\n';
    } else if (ast.language === 'cobol' && ast.data && ast.data.workingStorage) {
      code += 'var\n';
      
      for (const variable of ast.data.workingStorage) {
        if (variable.level === '01' || variable.level === '77') {
          const type = mapCobolTypeToPascal(variable.picture);
          code += `  ${variable.name.toLowerCase()}: ${type}`;   
          
          if (variable.value) {
            code += ` = ${mapCobolValueToPascal(variable.value, variable.picture)}`;
          }
          
          code += ';\n';
        }
      }
      
      code += '\n';
    }
    
    // Add function declarations
    if (ast.language === 'java' || ast.language === 'cpp') {
      if (ast.methods) {
        for (const method of ast.methods) {
          // Skip main methods, they'll be handled in the main program body
          if (method.name === 'main') continue;
          
          const returnType = mapTypeToPascal(method.returnType);
          
          if (returnType === 'void') {
            code += `procedure ${method.name}(`;
          } else {
            code += `function ${method.name}(`;
          }
          
          // Add parameters
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => {
              const paramType = mapTypeToPascal(p.type);
              return `${p.name}: ${paramType}`;
            }).join('; ');
          }
          
          if (returnType !== 'void') {
            code += `): ${returnType};\n`;
          } else {
            code += `);\n`;
          }
          
          // Procedure/function body
          code += 'begin\n';
          code += `  WriteLn('${method.name} called');\n`;
          
          if (returnType !== 'void') {
            code += `  ${method.name} := ${getDefaultPascalValue(returnType)};\n`;
          }
          
          code += 'end;\n\n';
        }
      }
    } else if (ast.language === 'pascal') {
      // Add functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          code += `function ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              return `${p.byRef ? 'var ' : ''}${p.name}: ${p.dataType}`;
            }).join('; ');
          }
          
          code += `): ${func.returnType};\n`;
          
          // Add declarations section if present
          if (func.declarations && func.declarations.trim()) {
            code += func.declarations.trim() + '\n';
          }
          
          // Function body
          code += 'begin\n';
          
          if (func.body && func.body.trim()) {
            // Split the body into statements
            const statements = func.body.split(';');
            for (const stmt of statements) {
              if (stmt.trim()) {
                code += `  ${stmt.trim()};\n`;
              }
            }
          } else {
            code += `  WriteLn('${func.name} called');\n`;
            code += `  ${func.name} := ${getDefaultPascalValue(func.returnType)};\n`;
          }
          
          code += 'end;\n\n';
        }
      }
      
      // Add procedures
      if (ast.procedures && ast.procedures.length > 0) {
        for (const proc of ast.procedures) {
          code += `procedure ${proc.name}(`;
          
          // Add parameters
          if (proc.parameters && proc.parameters.length > 0) {
            code += proc.parameters.map(p => {
              return `${p.byRef ? 'var ' : ''}${p.name}: ${p.dataType}`;
            }).join('; ');
          }
          
          code += `);\n`;
          
          // Add declarations section if present
          if (proc.declarations && proc.declarations.trim()) {
            code += proc.declarations.trim() + '\n';
          }
          
          // Procedure body
          code += 'begin\n';
          
          if (proc.body && proc.body.trim()) {
            // Split the body into statements
            const statements = proc.body.split(';');
            for (const stmt of statements) {
              if (stmt.trim()) {
                code += `  ${stmt.trim()};\n`;
              }
            }
          } else {
            code += `  WriteLn('${proc.name} called');\n`;
          }
          
          code += 'end;\n\n';
        }
      }
    } else if (ast.language === 'go') {
      // Add functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          // Skip main function, it will be part of the main program
          if (func.name === 'main') continue;
          
          const returnType = mapGoTypeToPascal(func.returnType || '');
          
          if (!returnType) {
            code += `procedure ${func.name}(`;
          } else {
            code += `function ${func.name}(`;
          }
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              const paramType = mapGoTypeToPascal(p.type);
              return `${p.name || 'arg'}: ${paramType}`;
            }).join('; ');
          }
          
          if (returnType) {
            code += `): ${returnType};\n`;
          } else {
            code += `);\n`;
          }
          
          // Function/procedure body
          code += 'begin\n';
          code += `  WriteLn('${func.name} called');\n`;
          
          if (returnType) {
            code += `  ${func.name} := ${getDefaultPascalValue(returnType)};\n`;
          }
          
          code += 'end;\n\n';
        }
      }
      
      // Add methods as standalone functions with receiver as first parameter
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          const returnType = mapGoTypeToPascal(method.returnType || '');
          const receiverType = mapGoTypeToPascal(method.receiverType);
          
          if (!returnType) {
            code += `procedure ${method.name}(`;
          } else {
            code += `function ${method.name}(`;
          }
          
          // Add receiver as first parameter
          code += `${method.receiverName}: ${receiverType}`;
          
          // Add other parameters
          if (method.parameters && method.parameters.length > 0) {
            code += '; ' + method.parameters.map(p => {
              const paramType = mapGoTypeToPascal(p.type);
              return `${p.name || 'arg'}: ${paramType}`;
            }).join('; ');
          }
          
          if (returnType) {
            code += `): ${returnType};\n`;
          } else {
            code += `);\n`;
          }
          
          // Method body
          code += 'begin\n';
          code += `  WriteLn('${method.name} called');\n`;
          
          if (returnType) {
            code += `  ${method.name} := ${getDefaultPascalValue(returnType)};\n`;
          }
          
          code += 'end;\n\n';
        }
      }
    }
    
    // COBOL paragraphs as Pascal procedures
    if (ast.language === 'cobol' && ast.procedure) {
      for (const paragraph of ast.procedure) {
        // Skip MAIN paragraph as it will be part of the main program
        if (paragraph.name === 'MAIN') continue;
        
        code += `procedure ${paragraph.name.toLowerCase()};\n`;
        code += 'begin\n';
        
        // Convert COBOL statements to Pascal
        const statements = paragraph.body.split('.');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common COBOL statements
          let pascalStmt = stmt.trim();
          
          // DISPLAY statements
          if (pascalStmt.startsWith('DISPLAY')) {
            const displayArg = pascalStmt.substring('DISPLAY'.length).trim();
            code += `  WriteLn(${cobolExprToPascal(displayArg)});\n`;
          }
          
          // MOVE statements
          else if (pascalStmt.startsWith('MOVE')) {
            const parts = pascalStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
            if (parts) {
              const source = cobolExprToPascal(parts[1]);
              const target = parts[2].trim().toLowerCase();
              code += `  ${target} := ${source};\n`;
            }
          }
          
          // IF statements
          else if (pascalStmt.startsWith('IF')) {
            const condition = pascalStmt.match(/IF\s+(.+)\s+THEN/i);
            if (condition) {
              const pascalCondition = cobolConditionToPascal(condition[1]);
              code += `  if ${pascalCondition} then\n  begin\n`;
              // TODO: Handle THEN logic
              code += `  end;\n`;
            }
          }
        }
        
        code += 'end;\n\n';
      }
    }
    
    // Main program body
    code += 'begin\n';
    
    // Output standard initialization
    code += `  WriteLn('${programName} started');\n`;
    
    // Add appropriate main body based on source language
    if (ast.language === 'java' || ast.language === 'cpp') {
      // Look for a main method
      const mainMethod = ast.methods ? ast.methods.find(m => m.name === 'main') : null;
      
      if (mainMethod) {
        code += '  // Main method implementation\n';
        code += '  WriteLn(\'Hello from Java/C++ main\');\n';
      }
    } else if (ast.language === 'pascal' && ast.main) {
      // Include the original Pascal main body
      const statements = ast.main.split(';');
      for (const stmt of statements) {
        if (stmt.trim()) {
          code += `  ${stmt.trim()};\n`;
        }
      }
    } else if (ast.language === 'go') {
      // Look for a main function
      const mainFunc = ast.functions ? ast.functions.find(f => f.name === 'main') : null;
      
      if (mainFunc) {
        code += '  // Go main function implementation\n';
        code += '  WriteLn(\'Hello from Go main\');\n';
      }
    } else if (ast.language === 'cobol' && ast.procedure) {
      // Look for a MAIN paragraph
      const mainPara = ast.procedure.find(p => p.name === 'MAIN');
      
      if (mainPara) {
        // Convert COBOL statements to Pascal
        const statements = mainPara.body.split('.');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common COBOL statements
          let pascalStmt = stmt.trim();
          
          // DISPLAY statements
          if (pascalStmt.startsWith('DISPLAY')) {
            const displayArg = pascalStmt.substring('DISPLAY'.length).trim();
            code += `  WriteLn(${cobolExprToPascal(displayArg)});\n`;
          }
          
          // MOVE statements
          else if (pascalStmt.startsWith('MOVE')) {
            const parts = pascalStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
            if (parts) {
              const source = cobolExprToPascal(parts[1]);
              const target = parts[2].trim().toLowerCase();
              code += `  ${target} := ${source};\n`;
            }
          }
        }
      } else {
        code += '  WriteLn(\'Processing COBOL program\');\n';
      }
    }
    
    // Add final program message
    code += `  WriteLn('${programName} completed');\n`;
    code += 'end.';
    
    return code;
  } catch (error) {
    console.error('Error generating Pascal code:', error);
    return `// Error generating Pascal code: ${error.message}\n`;
  }
};

// Helper function to map Java/C++ types to Pascal types
function mapTypeToPascal(type) {
  if (!type) return 'String';
  
  switch (type.toLowerCase()) {
    case 'int':
    case 'integer':
    case 'long':
      return 'Integer';
    case 'float':
    case 'double':
      return 'Real';
    case 'boolean':
      return 'Boolean';
    case 'char':
      return 'Char';
    case 'string':
    case 'String':
      return 'String';
    case 'void':
      return 'void';
    default:
      if (type.includes('[]') || type.includes('vector') || type.includes('ArrayList')) {
        return 'array of ' + mapTypeToPascal(type.replace('[]', '').replace('vector<', '').replace('>', '').replace('ArrayList<', '').replace('>', ''));
      }
      return type;
  }
}

// Helper function to map Go types to Pascal types
function mapGoTypeToPascal(type) {
  if (!type) return 'String';
  
  switch (type) {
    case 'int':
    case 'int64':
    case 'uint':
    case 'uint64':
      return 'Integer';
    case 'float32':
    case 'float64':
      return 'Real';
    case 'bool':
      return 'Boolean';
    case 'byte':
    case 'rune':
      return 'Char';
    case 'string':
      return 'String';
    case 'error':
      return 'String';
    case 'interface{}':
      return 'TObject';
    default:
      if (type.startsWith('[]')) {
        return 'array of ' + mapGoTypeToPascal(type.substring(2));
      }
      if (type.startsWith('map[')) {
        const parts = type.substring(4, type.length - 1).split(']');
        if (parts.length === 2) {
          return 'TDictionary';
        }
      }
      if (type.startsWith('chan ')) {
        return 'TQueue';
      }
      return type;
  }
}

// Helper function to convert Java/C++ values to Pascal values
function mapValueToPascal(value, type) {
  if (value === 'null' || value === 'nullptr' || value === 'NULL') {
    return 'nil';
  }
  
  if (type === 'boolean' || type === 'Boolean') {
    if (value === 'true') return 'True';
    if (value === 'false') return 'False';
  }
  
  if ((type === 'String' || type === 'string') && value.startsWith('"') && value.endsWith('"')) {
    // Replace double quotes with single quotes for Pascal string literals
    return `'${value.substring(1, value.length - 1)}'`;
  }
  
  return value;
}

// Helper function to convert COBOL data types to Pascal types
function mapCobolTypeToPascal(picture) {
  if (picture.includes('9')) {
    if (picture.includes('V') || picture.includes('.')) {
      return 'Real';
    }
    return 'Integer';
  }
  if (picture.includes('X')) {
    return 'String';
  }
  if (picture.includes('A')) {
    return 'String';
  }
  return 'String'; // Default
}

// Helper function to convert COBOL values to Pascal values
function mapCobolValueToPascal(value, picture) {
  if (mapCobolTypeToPascal(picture) === 'String') {
    return `'${value.replace(/['"]/, '')}'`;
  }
  return value;
}

// Helper function to convert COBOL expressions to Pascal
function cobolExprToPascal(expr) {
  // Remove quotes for string literals and convert to Pascal string literals
  if (expr.startsWith('\'') && expr.endsWith('\'')) {
    return `'${expr.substring(1, expr.length - 1)}'`;
  }
  return expr.toLowerCase();
}

// Helper function to convert COBOL conditions to Pascal
function cobolConditionToPascal(condition) {
  // Replace COBOL operators with Pascal operators
  return condition.toLowerCase()
    .replace(/equal to|=/g, '=')
    .replace(/greater than/g, '>')
    .replace(/less than/g, '<')
    .replace(/not equal/g, '<>');
}

// Helper function to get default values for Pascal types
function getDefaultPascalValue(type) {
  if (!type) return '\'\'';
  
  switch (type.toLowerCase()) {
    case 'integer': return '0';
    case 'real': return '0.0';
    case 'boolean': return 'False';
    case 'char': return '\'\\0\'';
    case 'string': return '\'\'';
    default:
      if (type.toLowerCase().startsWith('array of')) {
        return 'nil';
      }
      return 'nil';
  }
}

// Helper function to convert string to PascalCase
function pascalCase(str) {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}