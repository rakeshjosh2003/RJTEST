/**
 * Java code generator
 * Converts an AST into Java code
 */

export const generateJava = (ast) => {
  try {
    let code = '';
    
    // Add package declaration if coming from Go
    if (ast.language === 'go' && ast.package) {
      code += `package ${ast.package};
\n`;
    }
    
    // Generate imports
    if (ast.imports && ast.imports.length > 0 || ast.includes && ast.includes.length > 0) {
      // Handle Java imports
      if (ast.imports) {
        for (const imp of ast.imports) {
          code += `import ${imp.path};
`;
        }
      }
      
      // Convert C++ includes to Java imports
      if (ast.includes) {
        for (const inc of ast.includes) {
          let importPath = inc.path;
          // Map common C++ libraries to Java equivalents
          if (importPath === 'iostream') importPath = 'java.io.*';
          if (importPath === 'string') importPath = 'java.lang.String';
          if (importPath === 'vector') importPath = 'java.util.ArrayList';
          if (importPath === 'map') importPath = 'java.util.HashMap';
          
          code += `import ${importPath};
`;
        }
      }
      
      // Add an extra line after imports
      code += '\n';
    }
    
    // Convert COBOL program to Java class
    if (ast.language === 'cobol' && ast.identification) {
      code += `public class ${ast.identification.programId} {
`;
      
      // Convert WORKING-STORAGE variables to Java class fields
      if (ast.data && ast.data.workingStorage) {
        for (const variable of ast.data.workingStorage) {
          if (variable.level === '01' || variable.level === '77') {
            const javaType = cobolTypeToJava(variable.picture);
            const visibility = 'private';
            let defaultValue = '';
            
            if (variable.value) {
              defaultValue = ` = ${cobolValueToJava(variable.value, javaType)}`;
            }
            
            code += `    ${visibility} ${javaType} ${variable.name.toLowerCase()}${defaultValue};
`;
          }
        }
        code += '\n';
      }
      
      // Add main method
      code += `    public static void main(String[] args) {
        ${ast.identification.programId} program = new ${ast.identification.programId}();
        program.run();
    }\n\n`;
      
      // Add run method containing procedure division logic
      code += `    public void run() {
`;
      
      if (ast.procedure) {
        for (const paragraph of ast.procedure) {
          code += `        // ${paragraph.name}\n`;
          
          // Convert COBOL statements to Java
          const statements = paragraph.body.split('.');
          for (const stmt of statements) {
            if (!stmt.trim()) continue;
            
            // Convert common COBOL statements
            let javaStmt = stmt.trim();
            
            // DISPLAY statements
            if (javaStmt.startsWith('DISPLAY')) {
              const displayArg = javaStmt.substring('DISPLAY'.length).trim();
              code += `        System.out.println(${cobolExprToJava(displayArg)});
`;
            }
            
            // MOVE statements
            else if (javaStmt.startsWith('MOVE')) {
              const parts = javaStmt.match(/MOVE\s+(.+)\s+TO\s+(.+)/i);
              if (parts) {
                const source = cobolExprToJava(parts[1]);
                const target = parts[2].trim().toLowerCase();
                code += `        ${target} = ${source};
`;
              }
            }
            
            // IF statements
            else if (javaStmt.startsWith('IF')) {
              const condition = javaStmt.match(/IF\s+(.+)\s+THEN/i);
              if (condition) {
                const javaCondition = cobolConditionToJava(condition[1]);
                code += `        if (${javaCondition}) {
`;
                // TODO: Handle THEN logic
                code += `        }
`;
              }
            }
          }
          
          code += '\n';
        }
      }
      
      code += `    }
`;
      code += `}
`;
    }
    
    // Generate classes
    if (ast.classes && ast.classes.length > 0) {
      for (const cls of ast.classes) {
        // Class declaration with inheritance
        code += `public class ${cls.name}`;
        
        if (cls.extends) {
          code += ` extends ${cls.extends}`;
        }
        
        if (cls.implements && cls.implements.length > 0) {
          code += ` implements ${cls.implements.join(', ')}`;
        }
        
        code += ` {\n`;
        
        // Add variables
        if (ast.variables && ast.variables.length > 0) {
          for (const variable of ast.variables) {
            // Skip variables that aren't fields
            if (!variable.visibility && ast.language !== 'java') continue;
            
            const visibility = variable.visibility || 'private';
            let type = variable.dataType;
            
            // Map C++ types to Java types
            if (ast.language === 'cpp') {
              type = cppTypeToJava(type);
            }
            
            code += `    ${visibility} ${type} ${variable.name}`;
            
            if (variable.initialValue) {
              code += ` = ${variable.initialValue}`;
            }
            
            code += `;\n`;
          }
          code += '\n';
        }
        
        // Add methods
        if (ast.methods && ast.methods.length > 0) {
          for (const method of ast.methods) {
            const visibility = method.visibility || 'public';
            
            code += `    ${visibility} ${method.returnType} ${method.name}(`;
            
            // Add parameters
            if (method.parameters && method.parameters.length > 0) {
              code += method.parameters.map(p => `${p.type} ${p.name}`).join(', ');
            }
            
            code += `) {\n        // Method implementation\n    }\n\n`;
          }
        }
        
        // Add functions/methods from other languages
        if (ast.functions && ast.functions.length > 0) {
          for (const func of ast.functions) {
            // Skip main function as it's added separately
            if (func.name === 'main') continue;
            
            let returnType = func.returnType || 'void';
            
            // Map C++ or Go types to Java types
            if (ast.language === 'cpp' || ast.language === 'go') {
              returnType = cppTypeToJava(returnType);
            }
            
            code += `    public ${returnType} ${func.name}(`;
            
            // Add parameters
            if (func.parameters && func.parameters.length > 0) {
              code += func.parameters.map(p => {
                let paramType = p.type;
                // Map C++ or Go types to Java types
                if (ast.language === 'cpp' || ast.language === 'go') {
                  paramType = cppTypeToJava(paramType);
                }
                return `${paramType} ${p.name}`;
              }).join(', ');
            }
            
            code += `) {\n        // Method implementation\n    }\n\n`;
          }
        }
        
        // Close class
        code += `}\n`;
      }
    }
    
    // Generate Pascal program as Java class
    if (ast.language === 'pascal' && ast.programName) {
      code += `public class ${ast.programName} {\n`;
      
      // Convert constants
      if (ast.constants && ast.constants.length > 0) {
        for (const constant of ast.constants) {
          code += `    private static final var ${constant.name} = ${constant.value};\n`;
        }
        code += '\n';
      }
      
      // Convert variables
      if (ast.variables && ast.variables.length > 0) {
        for (const variable of ast.variables) {
          const javaType = pascalTypeToJava(variable.dataType);
          code += `    private ${javaType} ${variable.name};\n`;
        }
        code += '\n';
      }
      
      // Convert functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          const returnType = pascalTypeToJava(func.returnType);
          
          code += `    private ${returnType} ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              const paramType = pascalTypeToJava(p.dataType);
              return `${p.byRef ? 'final ' : ''}${paramType} ${p.name}`;
            }).join(', ');
          }
          
          code += `) {\n        // Function implementation\n        return ${getDefaultValue(returnType)};\n    }\n\n`;
        }
      }
      
      // Convert procedures
      if (ast.procedures && ast.procedures.length > 0) {
        for (const proc of ast.procedures) {
          code += `    private void ${proc.name}(`;
          
          // Add parameters
          if (proc.parameters && proc.parameters.length > 0) {
            code += proc.parameters.map(p => {
              const paramType = pascalTypeToJava(p.dataType);
              return `${p.byRef ? 'final ' : ''}${paramType} ${p.name}`;
            }).join(', ');
          }
          
          code += `) {\n        // Procedure implementation\n    }\n\n`;
        }
      }
      
      // Add main method
      code += `    public static void main(String[] args) {\n`;
      code += `        ${ast.programName} program = new ${ast.programName}();\n`;
      code += `        program.run();\n`;
      code += `    }\n\n`;
      
      // Add run method with the main program body
      code += `    public void run() {\n`;
      if (ast.main) {
        // Convert main body statements from Pascal to Java
        const statements = ast.main.split(';');
        for (const stmt of statements) {
          if (!stmt.trim()) continue;
          
          // Convert common Pascal statements to Java
          let javaStmt = stmt.trim();
          
          // writeln statements
          if (javaStmt.startsWith('writeln')) {
            const args = javaStmt.match(/writeln\((.*)\)/);
            if (args) {
              code += `        System.out.println(${args[1]});\n`;
            } else {
              code += `        System.out.println();\n`;
            }
          }
          
          // Assignment statements
          else if (javaStmt.includes(':=')) {
            javaStmt = javaStmt.replace(':=', '=');
            code += `        ${javaStmt};\n`;
          }
        }
      }
      code += `    }\n`;
      
      // Close class
      code += `}\n`;
    }
    
    // Generate Go program as Java class
    if (ast.language === 'go' && !ast.classes) {
      const className = ast.package ? pascalCase(ast.package) : 'GoProgram';
      
      code += `public class ${className} {\n`;
      
      // Convert constants
      if (ast.constants && ast.constants.length > 0) {
        for (const constant of ast.constants) {
          const type = constant.dataType ? constant.dataType : inferType(constant.value);
          code += `    private static final ${type} ${constant.name} = ${constant.value};\n`;
        }
        code += '\n';
      }
      
      // Convert variables
      if (ast.variables && ast.variables.length > 0) {
        for (const variable of ast.variables) {
          let type = variable.dataType || 'Object';
          if (!variable.dataType && variable.initialValue) {
            type = inferType(variable.initialValue);
          }
          
          code += `    private ${type} ${variable.name}`;
          if (variable.initialValue) {
            code += ` = ${variable.initialValue}`;
          }
          code += `;\n`;
        }
        code += '\n';
      }
      
      // Convert structs to classes
      if (ast.structs && ast.structs.length > 0) {
        for (const struct of ast.structs) {
          code += `    public static class ${struct.name} {\n`;
          
          for (const field of struct.fields) {
            let javaType = field.type;
            // Convert Go types to Java types
            if (javaType.startsWith('[]')) {
              javaType = javaType.substring(2) + '[]';
            } else if (javaType === 'interface{}') {
              javaType = 'Object';
            }
            
            code += `        private ${javaType} ${field.name};\n`;
          }
          
          // Add getters and setters
          for (const field of struct.fields) {
            let javaType = field.type;
            if (javaType.startsWith('[]')) {
              javaType = javaType.substring(2) + '[]';
            } else if (javaType === 'interface{}') {
              javaType = 'Object';
            }
            
            const methodSuffix = pascalCase(field.name);
            
            // Getter
            code += `\n        public ${javaType} get${methodSuffix}() {\n`;
            code += `            return ${field.name};\n`;
            code += `        }\n`;
            
            // Setter
            code += `\n        public void set${methodSuffix}(${javaType} ${field.name}) {\n`;
            code += `            this.${field.name} = ${field.name};\n`;
            code += `        }\n`;
          }
          
          code += `    }\n\n`;
        }
      }
      
      // Convert functions
      if (ast.functions && ast.functions.length > 0) {
        for (const func of ast.functions) {
          // Skip main function, handle it separately
          if (func.name === 'main') continue;
          
          let returnType = func.returnType || 'void';
          // Convert Go return types to Java
          if (returnType && returnType.startsWith('[]')) {
            returnType = returnType.substring(2) + '[]';
          } else if (returnType === 'interface{}') {
            returnType = 'Object';
          }
          
          code += `    public static ${returnType} ${func.name}(`;
          
          // Add parameters
          if (func.parameters && func.parameters.length > 0) {
            code += func.parameters.map(p => {
              let paramType = p.type;
              // Convert Go parameter types to Java
              if (paramType.startsWith('[]')) {
                paramType = paramType.substring(2) + '[]';
              } else if (paramType === 'interface{}') {
                paramType = 'Object';
              }
              
              return `${paramType} ${p.name || 'arg'}`;
            }).join(', ');
          }
          
          code += `) {\n        // Function implementation\n`;
          if (returnType !== 'void') {
            code += `        return ${getDefaultValue(returnType)};\n`;
          }
          code += `    }\n\n`;
        }
      }
      
      // Convert methods to class methods
      if (ast.methods && ast.methods.length > 0) {
        for (const method of ast.methods) {
          let returnType = method.returnType || 'void';
          // Convert Go return types to Java
          if (returnType && returnType.startsWith('[]')) {
            returnType = returnType.substring(2) + '[]';
          } else if (returnType === 'interface{}') {
            returnType = 'Object';
          }
          
          code += `    public ${returnType} ${method.name}(`;
          
          // Add parameters
          if (method.parameters && method.parameters.length > 0) {
            code += method.parameters.map(p => {
              let paramType = p.type;
              // Convert Go parameter types to Java
              if (paramType.startsWith('[]')) {
                paramType = paramType.substring(2) + '[]';
              } else if (paramType === 'interface{}') {
                paramType = 'Object';
              }
              
              return `${paramType} ${p.name || 'arg'}`;
            }).join(', ');
          }
          
          code += `) {\n        // Method implementation\n`;
          if (returnType !== 'void') {
            code += `        return ${getDefaultValue(returnType)};\n`;
          }
          code += `    }\n\n`;
        }
      }
      
      // Add main method
      code += `    public static void main(String[] args) {\n`;
      code += `        new ${className}().run();\n`;
      code += `    }\n\n`;
      
      // Add run method
      code += `    public void run() {\n`;
      code += `        // Main program logic\n`;
      code += `    }\n`;
      
      // Close class
      code += `}\n`;
    }
    
    return code;
  } catch (error) {
    console.error('Error generating Java code:', error);
    return `// Error generating Java code: ${error.message}\n`;
  }
};

// Helper function to convert COBOL data types to Java types
function cobolTypeToJava(picture) {
  if (picture.includes('9')) {
    if (picture.includes('V') || picture.includes('.')) {
      return 'double';
    }
    return 'int';
  }
  if (picture.includes('X')) {
    return 'String';
  }
  if (picture.includes('A')) {
    return 'String';
  }
  return 'String'; // Default
}

// Helper function to convert COBOL values to Java values
function cobolValueToJava(value, javaType) {
  if (javaType === 'String') {
    return `"${value.replace(/['"]/, '')}"`;
  }
  return value;
}

// Helper function to convert COBOL expressions to Java
function cobolExprToJava(expr) {
  // Remove quotes for string literals
  if (expr.startsWith('\'') && expr.endsWith('\'')) {
    return `"${expr.substring(1, expr.length - 1)}"`;
  }
  return expr;
}

// Helper function to convert COBOL conditions to Java
function cobolConditionToJava(condition) {
  // Replace COBOL operators with Java operators
  return condition
    .replace(/EQUAL TO|=/g, '==')
    .replace(/GREATER THAN/g, '>')
    .replace(/LESS THAN/g, '<')
    .replace(/NOT EQUAL/g, '!=');
}

// Helper function to convert C++ types to Java types
function cppTypeToJava(type) {
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'long';
    case 'float': return 'float';
    case 'double': return 'double';
    case 'char': return 'char';
    case 'bool': return 'boolean';
    case 'void': return 'void';
    case 'string': return 'String';
    case 'vector': return 'ArrayList';
    case 'map': return 'HashMap';
    default:
      if (type.includes('*')) {
        // Pointers generally become objects in Java
        return type.replace('*', '');
      }
      return type;
  }
}

// Helper function to convert Pascal types to Java types
function pascalTypeToJava(type) {
  if (!type) return 'Object';
  
  switch (type.toLowerCase()) {
    case 'integer': return 'int';
    case 'real': return 'double';
    case 'boolean': return 'boolean';
    case 'char': return 'char';
    case 'string': return 'String';
    case 'text': return 'PrintStream';
    default: return type;
  }
}

// Helper function to get default return values for Java types
function getDefaultValue(type) {
  switch (type) {
    case 'int': return '0';
    case 'long': return '0L';
    case 'float': return '0.0f';
    case 'double': return '0.0';
    case 'boolean': return 'false';
    case 'char': return '\'\\0\'';
    case 'String': return 'null';
    default:
      if (type.endsWith('[]')) {
        return 'null';
      }
      return 'null';
  }
}

// Helper function to infer Java type from a value
function inferType(value) {
  if (value === 'true' || value === 'false') {
    return 'boolean';
  }
  
  if (/^\d+$/.test(value)) {
    return 'int';
  }
  
  if (/^\d+\.\d+$/.test(value)) {
    return 'double';
  }
  
  if (/^".*"$/.test(value) || /^'.*'$/.test(value)) {
    return 'String';
  }
  
  return 'Object';
}

// Helper function to convert string to PascalCase
function pascalCase(str) {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}