/**
 * C++ code generator
 * Converts an AST into C++ code
 */

export const generateCpp = (ast) => {
  try {
    let code = '';
    
    // Generate includes
    if (ast.includes && ast.includes.length > 0) {
      for (const inc of ast.includes) {
        code += `#include <${inc.path}>\n`;
      }
      code += '\n';
    }
    
    // Convert Java imports to C++ includes
    if (ast.imports && ast.imports.length > 0) {
      const includeMap = {
        'java.io.*': 'iostream',
        'java.util.ArrayList': 'vector',
        'java.util.List': 'vector',
        'java.util.HashMap': 'map',
        'java.util.Map': 'map',
        'java.lang.String': 'string',
      };
      
      const includes = new Set();
      
      for (const imp of ast.imports) {
        const path = imp.path;
        let cppInclude = includeMap[path];
        
        if (cppInclude) {
          includes.add(cppInclude);
        } else if (path.includes('java.util')) {
          includes.add('algorithm');
        } else {
          // We'll add iostream by default for most Java conversions
          includes.add('iostream');
        }
      }
      
      // Also add string header by default for most Java conversions
      includes.add('string');
      
      for (const inc of includes) {
        code += `#include <${inc}>\n`;
      }
      code += '\n';
    }
    
    // Add using namespace std for readability
    code += 'using namespace std;\n\n';
    
    // Convert Go to C++
    if (ast.language === 'go') {
      // Convert structs to classes
      if (ast.structs && ast.structs.length > 0) {
        for (const struct of ast.structs) {
          code += `class ${struct.name} {\npublic:\n`;
          
          // Add fields
          for (const field of struct.fields) {
            let cppType = goTypeToCpp(field.type);
            code += `    ${cppType} ${field.name};\n`;
          }
          
          // Add default constructor
          code += `\n    ${struct.name}() {}`;
          
          // Add constructor with all fields
          if (struct.fields.length > 0) {
            code += `\n\n    ${struct.name}(`;
            code += struct.fields.map(f => `${goTypeToCpp(f.type)} ${f.name}_`).join(', ');
            code += `) {\n`;
            
            for (const field of struct.fields) {
              code += `        ${field.name} = ${field.name}_; \n`;
            }
            
            code += `    }`;
          }
          
          code += `\n};\n\n`;
        }
      }
      
      // Convert interfaces to abstract classes
      if (ast.interfaces && ast.interfaces.length > 0) {
        for (const iface of ast.interfaces) {
          code += `class ${iface.name} {\npublic:\n    virtual ~${iface.name}() {}\n`;
          
          for (const method of iface.methods) {
            const returnType = goTypeToCpp(method.returnType || 'void');
            code += `    virtual ${returnType} ${method.name}(`;
            
            if (method.parameters && method.parameters.length > 0) {
              code += method.parameters.map(p => `${goTypeToCpp(p.type)} ${p.name || 'arg'}`).join(', ');
            }
            
            code += `) = 0;\n`;
          }
          
          code += `};\n\n`;
        }
      }
    }
    
    // Convert Java classes to C++ classes
    if (ast.language === 'java' && ast.classes) {
      for (const cls of ast.classes) {
        code += `class ${cls.name}`;
        
        if (cls.extends) {
          code += ` : public ${cls.extends}`;
        }
        
        code += ` {\npublic:\n`;
        
        // Add variables
        if (ast.variables && ast.variables.length > 0) {
          // First collect private variables
          const privateVars = ast.variables.filter(v => v.visibility === 'private');
          if (privateVars.length > 0) {
            code += 'private:\n';
            
            for (const variable of privateVars) {
              const type = javaTypeToCpp(variable.dataType);
              code += `    ${type} ${variable.name}`;
              
              if (variable.initialValue) {
                code += ` = ${convertValueToCpp(variable.initialValue, variable.dataType)}`;
              }
              
              code += `;\n`;
            }
            code += '\npublic:\n';
          }
          
          // Then add public variables
          const publicVars = ast.variables.filter(v => v.visibility === 'public');
          for (const variable of publicVars) {
            const type = javaTypeToCpp(variable.dataType);
            code += `    ${type} ${variable.name}`;
            
            if (variable.initialValue) {
              code += ` = ${convertValueToCpp(variable.initialValue, variable.dataType)}`;
            }
            
            code += `;\n`;
          }
          code += '\n';
        }
        
        // Add methods
        if (ast.methods && ast.methods.length > 0) {
          for (const method of ast.methods) {
            const returnType = javaTypeToCpp(method.returnType);
            
            code += `    ${returnType} ${method.name}(`;
            
            // Add parameters
            if (method.parameters && method.parameters.length > 0) {
              code += method.parameters.map(p => `${javaTypeToCpp(p.type)} ${p.name}`).join(', ');
            }
            
            code += `) {\n        // Method implementation\n    }\n\n`;
          }
        }
        
        // Close class
        code += `};\n\n`;
      }
    }
    
    // Convert COBOL program to C++ program
    if (ast.language === 'cobol' && ast.identification) {
      // Add COBOL program as a class
      code += `class ${ast.identification.programId} {\nprivate:\n`;
      
      // Convert WORKING-STORAGE variables to C++ member variables
      if (ast.data && ast.data.workingStorage) {
        for (const variable of ast.data.workingStorage) {
          if (variable.level === '01' || variable.level === '77') {
            const cppType = cobolTypeToCpp(variable.picture);
            let defaultValue = '';
            
            if (variable.value) {
              defaultValue = ` = ${cobolValueToCpp(variable.value, cppType)}`;
            }
            
            code += `    ${cppType} ${variable.name.toLowerCase()}${defaultValue};\n`;
          }
        }
        code += '\n';
      }
      
      code += 'public:\n';
      
      // Add run method containing procedure division logic
      code += `    void run() {\n`;
      
      if (ast.procedure) {
        for (const paragraph of ast.procedure) {
          code += `        // ${paragraph.name}\n`;
          
          // Convert COBOL statements to C++
          const statements = paragraph.body.split('.');
          for (const stmt of statements) {
            if (!stmt.trim()) continue;
            
            // Convert common COBOL statements
            let cppStmt = stmt.trim();
            
            // DISPLAY statements
            if (cppStmt.startsWith('DISPLAY')) {
              const displayArg = cppStmt.substring('DISPLAY'.length).trim();
              code += `        cout << ${cobolExprToCpp(displayArg)} << endl;\n`;
            }
            
            // MOVE statements
            else if (cppStmt.startsWith('MOVE')) {
              const parts = cppStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
              if (parts) {
                const source = cobolExprToCpp(parts[1]);
                const target = parts[2].trim().toLowerCase();
                code += `        ${target} = ${source};\n`;
              }
            }
            
            // IF statements
            else if (cppStmt.startsWith('IF')) {
              const condition = cppStmt.match(/IF\s+(.+)\s+THEN/i);
              if (condition) {
                const cppCondition = cobolConditionToCpp(condition[1]);
                code += `        if (${cppCondition}) {\n`;
                // TODO: Handle THEN logic
                code += `        }\n`;
              }
            }
          }
          
          code += '\n';
        }
      }
      
      code += `    }\n`;
      code += `};\n\n`;
      
      // Add main function
      code += `int main() {\n`;
      code += `    ${ast.identification.programId} program;\n`;
      code += `    program.run();\n`;
      code += `    return 0;\n`;
      code += `}\n`;
    }
    
    // Convert Pascal program to C++
    if (ast.language === 'pascal' && ast.programName) {
      // Add program as a class
      code += `class ${ast.programName} {\nprivate:\n`;
      
      // Convert constants
      if (ast.constants && ast.constants.length > 0) {
        for (const constant of ast.constants) {
          code += `    static constexpr auto ${constant.name} = ${constant.value};\n`;
        }
        code += '\n';
      }
      
      // Convert variables
      if (ast.variables && ast.variables.length > 0) {
        for (const variable of ast.variables) {
          const cppType = pascalTypeToCpp(variable.dataType);
          code += `    ${cppType} ${variable.name};\n`;
        }
        code += '\n';
      }
      
      code += 'public:\n';
      
      // Convert functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          const returnType = pascalTypeToCpp(func.returnType);
          
          code += `    ${returnType} ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              const paramType = pascalTypeToCpp(p.dataType);
              return `${p.byRef ? paramType + '&' : paramType} ${p.name}`;
            }).join(', ');
          }
          
          code += `) {\n        // Function implementation\n        return ${getDefaultCppValue(returnType)};\n    }\n\n`;
        }
      }
      
      // Convert procedures
      if (ast.procedures && ast.procedures.length > 0) {
        for (const proc of ast.procedures) {
          code += `    void ${proc.name}(`;
          
          // Add parameters
          if (proc.parameters && proc.parameters.length > 0) {
            code += proc.parameters.map(p => {
              const paramType = pascalTypeToCpp(p.dataType);
              return `${p.byRef ? paramType + '&' : paramType} ${p.name}`;
            }).join(', ');
          }
          
          code += `) {\n        // Procedure implementation\n    }\n\n`;
        }
      }
      
      // Add run method
      code += `    void run() {\n`;
      if (ast.main) {
        // Convert main body statements from Pascal to C++
        const statements = ast.main.split(';');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common Pascal statements to C++
          let cppStmt = stmt.trim();
          
          // writeln statements
          if (cppStmt.startsWith('writeln')) {
            const args = cppStmt.match(/writeln\((.*)\)/);
            if (args) {
              code += `        cout << ${args[1]} << endl;\n`;
            } else {
              code += `        cout << endl;\n`;
            }
          }
          
          // Assignment statements
          else if (cppStmt.includes(':=')) {
            cppStmt = cppStmt.replace(':=', '=');
            code += `        ${cppStmt};\n`;
          }
        }
      }
      code += `    }\n`;
      
      // Close class
      code += `};\n\n`;
      
      // Add main function
      code += `int main() {\n`;
      code += `    ${ast.programName} program;\n`;
      code += `    program.run();\n`;
      code += `    return 0;\n`;
      code += `}\n`;
    }
    
    // Convert Go program to C++
    if (ast.language === 'go' && ast.package) {
      // First add any constants, variables, and functions not already handled
      
      // Constants
      if (ast.constants && ast.constants.length > 0) {
        for (const constant of ast.constants) {
          const type = constant.dataType ? goTypeToCpp(constant.dataType) : inferCppType(constant.value);
          code += `const ${type} ${constant.name} = ${constant.value};\n`;
        }
        code += '\n';
      }
      
      // Global variables
      if (ast.variables && ast.variables.length > 0) {
        for (const variable of ast.variables) {
          let type = goTypeToCpp(variable.dataType || 'auto');
          if (!variable.dataType && variable.initialValue) {
            type = inferCppType(variable.initialValue);
          }
          
          code += `${type} ${variable.name}`;
          if (variable.initialValue) {
            code += ` = ${variable.initialValue}`;
          }
          code += `;\n`;
        }
        code += '\n';
      }
      
      // Functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          // Skip main function, handle it separately
          if (func.name === 'main') continue;
          
          const returnType = goTypeToCpp(func.returnType || 'void');
          
          // Function declaration
          code += `${returnType} ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              const paramType = goTypeToCpp(p.type);
              return `${paramType} ${p.name || 'arg'}`;
            }).join(', ');
          }
          
          code += `) {\n    // Function implementation\n`;
          if (returnType !== 'void') {
            code += `    return ${getDefaultCppValue(returnType)};\n`;
          }
          code += `}\n\n`;
        }
      }
      
      // Methods (implemented as free functions with the receiver as first parameter)
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          const returnType = goTypeToCpp(method.returnType || 'void');
          const receiverType = goTypeToCpp(method.receiverType);
          
          // Method declaration as a free function
          code += `${returnType} ${method.name}(${receiverType}${method.receiverType.includes('*') ? '' : '&'} ${method.receiverName}`;
          
          // Add other parameters
          if (method.parameters && method.parameters.length > 0) {
            code += ', ' + method.parameters.map(p => {
              const paramType = goTypeToCpp(p.type);
              return `${paramType} ${p.name || 'arg'}`;
            }).join(', ');
          }
          
          code += `) {\n    // Method implementation\n`;
          if (returnType !== 'void') {
            code += `    return ${getDefaultCppValue(returnType)};\n`;
          }
          code += `}\n\n`;
        }
      }
      
      // Add main function
      code += `int main() {\n`;
      code += `    // Main program logic\n`;
      code += `    return 0;\n`;
      code += `}\n`;
    }
    
    return code;
  } catch (error) {
    console.error('Error generating C++ code:', error);
    return `// Error generating C++ code: ${error.message}\n`;
  }
};

// Helper function to convert Java types to C++ types
function javaTypeToCpp(type) {
  if (!type) return 'auto';
  
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'long';
    case 'float': return 'float';
    case 'double': return 'double';
    case 'char': return 'char';
    case 'boolean': return 'bool';
    case 'void': return 'void';
    case 'String': return 'string';
    case 'Integer': return 'int';
    case 'ArrayList': 
    case 'List': return 'vector<auto>';
    case 'HashMap': 
    case 'Map': return 'map<auto, auto>';
    default:
      if (type.endsWith('[]')) {
        return `vector<${javaTypeToCpp(type.substring(0, type.length - 2))}>`;
      }
      return type;
  }
}

// Helper function to convert Go types to C++ types
function goTypeToCpp(type) {
  if (!type) return 'auto';
  
  switch (type) {
    case 'int': return 'int';
    case 'int64': return 'int64_t';
    case 'uint': return 'unsigned int';
    case 'uint64': return 'uint64_t';
    case 'float32': return 'float';
    case 'float64': return 'double';
    case 'byte': return 'unsigned char';
    case 'rune': return 'char32_t';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'error': return 'std::exception';
    case 'interface{}': return 'auto';
    default:
      if (type.startsWith('[]')) {
        // Array types: []int becomes vector<int>
        return `vector<${goTypeToCpp(type.substring(2))}>`;
      }
      if (type.startsWith('map[')) {
        // Map types: map[string]int becomes map<string, int>
        const parts = type.substring(4, type.length - 1).split(']');
        if (parts.length === 2) {
          return `map<${goTypeToCpp(parts[0])}, ${goTypeToCpp(parts[1])}>`;
        }
      }
      if (type.startsWith('chan ')) {
        // Channel types have no direct C++ equivalent, use std::queue as approximation
        return `queue<${goTypeToCpp(type.substring(5))}>`;
      }
      return type;
  }
}

// Helper function to convert Java values to C++ values
function convertValueToCpp(value, javaType) {
  if (value === 'null') {
    return 'nullptr';
  }
  
  if (javaType === 'boolean') {
    return value; // true/false are the same in Java and C++
  }
  
  if (javaType === 'String') {
    // Ensure string literals use double quotes
    if (value.startsWith('\'') && value.endsWith('\'')) {
      return `"${value.substring(1, value.length - 1)}"`;
    }
    return value;
  }
  
  return value;
}

// Helper function to convert COBOL data types to C++ types
function cobolTypeToCpp(picture) {
  if (picture.includes('9')) {
    if (picture.includes('V') || picture.includes('.')) {
      return 'double';
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

// Helper function to convert COBOL values to C++ values
function cobolValueToCpp(value, cppType) {
  if (cppType === 'string') {
    return `"${value.replace(/['"]/, '')}"`;
  }
  return value;
}

// Helper function to convert COBOL expressions to C++
function cobolExprToCpp(expr) {
  // Remove quotes for string literals
  if (expr.startsWith('\'') && expr.endsWith('\'')) {
    return `"${expr.substring(1, expr.length - 1)}"`;
  }
  return expr;
}

// Helper function to convert COBOL conditions to C++
function cobolConditionToCpp(condition) {
  // Replace COBOL operators with C++ operators
  return condition
    .replace(/EQUAL TO|=/g, '==')
    .replace(/GREATER THAN/g, '>')
    .replace(/LESS THAN/g, '<')
    .replace(/NOT EQUAL/g, '!=');
}

// Helper function to convert Pascal types to C++ types
function pascalTypeToCpp(type) {
  if (!type) return 'auto';
  
  switch (type.toLowerCase()) {
    case 'integer': return 'int';
    case 'real': return 'double';
    case 'boolean': return 'bool';
    case 'char': return 'char';
    case 'string': return 'string';
    case 'text': return 'ofstream';
    default: return type;
  }
}

// Helper function to get default values for C++ types
function getDefaultCppValue(type) {
  switch (type) {
    case 'int': 
    case 'long':
    case 'int64_t':
    case 'unsigned int':
    case 'uint64_t': return '0';
    case 'float': 
    case 'double': return '0.0';
    case 'bool': return 'false';
    case 'char': 
    case 'char32_t': return '\'\\0\'';
    case 'string': return '""';
    default:
      if (type.startsWith('vector<') || type.startsWith('map<')) {
        return '{}';
      }
      return '{}';
  }
}

// Helper function to infer C++ type from a value
function inferCppType(value) {
  if (value === 'true' || value === 'false') {
    return 'bool';
  }
  
  if (/^\d+$/.test(value)) {
    return 'int';
  }
  
  if (/^\d+\.\d+$/.test(value)) {
    return 'double';
  }
  
  if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
    return 'string';
  }
  
  if (value === 'nullptr' || value === 'NULL') {
    return 'auto*';
  }
  
  return 'auto';
}