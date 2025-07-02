/**
 * Pascal parser implementation
 * Parses Pascal code into an abstract syntax tree (AST)
 */

export const parsePascal = (sourceCode) => {
  // This is a simplified implementation
  // In a real application, this would use a proper parser library
  
  try {
    // Create a basic AST structure
    const ast = {
      type: 'Program',
      language: 'pascal',
      programName: null,
      uses: [],
      constants: [],
      types: [],
      variables: [],
      procedures: [],
      functions: [],
      main: null,
    };
    
    // Extract program name
    const programRegex = /program\s+(\w+);/i;
    const programMatch = sourceCode.match(programRegex);
    if (programMatch) {
      ast.programName = programMatch[1];
    }
    
    // Extract uses clause
    const usesRegex = /uses\s+([^;]+);/i;
    const usesMatch = sourceCode.match(usesRegex);
    if (usesMatch) {
      ast.uses = usesMatch[1].split(',').map(u => u.trim());
    }
    
    // Extract constants
    const constRegex = /const\s+([\s\S]*?)(?=\bvar\b|\btype\b|\bbegin\b|\bprocedure\b|\bfunction\b)/i;
    const constMatch = sourceCode.match(constRegex);
    if (constMatch) {
      const constSection = constMatch[1];
      const constDeclRegex = /(\w+)\s*=\s*([^;]+);/g;
      let match;
      while ((match = constDeclRegex.exec(constSection)) !== null) {
        ast.constants.push({
          type: 'Constant',
          name: match[1],
          value: match[2].trim(),
        });
      }
    }
    
    // Extract variable declarations
    const varRegex = /var\s+([\s\S]*?)(?=\bbegin\b|\bprocedure\b|\bfunction\b)/i;
    const varMatch = sourceCode.match(varRegex);
    if (varMatch) {
      const varSection = varMatch[1];
      const varDeclRegex = /([\w,\s]+):\s*([^;]+);/g;
      let match;
      while ((match = varDeclRegex.exec(varSection)) !== null) {
        const names = match[1].split(',').map(n => n.trim());
        const dataType = match[2].trim();
        
        for (const name of names) {
          ast.variables.push({
            type: 'Variable',
            name: name,
            dataType: dataType,
          });
        }
      }
    }
    
    // Extract procedures
    const procedureRegex = /procedure\s+(\w+)\s*\(([^)]*)?\)\s*;\s*([\s\S]*?)\s*begin\s*([\s\S]*?)\s*end;/gi;
    let procMatch;
    while ((procMatch = procedureRegex.exec(sourceCode)) !== null) {
      ast.procedures.push({
        type: 'Procedure',
        name: procMatch[1],
        parameters: parsePascalParameters(procMatch[2] || ''),
        declarations: procMatch[3] || '',
        body: procMatch[4] || '',
      });
    }
    
    // Extract functions
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)?\)\s*:\s*(\w+)\s*;\s*([\s\S]*?)\s*begin\s*([\s\S]*?)\s*end;/gi;
    let funcMatch;
    while ((funcMatch = functionRegex.exec(sourceCode)) !== null) {
      ast.functions.push({
        type: 'Function',
        name: funcMatch[1],
        parameters: parsePascalParameters(funcMatch[2] || ''),
        returnType: funcMatch[3],
        declarations: funcMatch[4] || '',
        body: funcMatch[5] || '',
      });
    }
    
    // Extract main program body
    const mainBodyRegex = /begin\s*([\s\S]*?)\s*end\./i;
    const mainMatch = sourceCode.match(mainBodyRegex);
    if (mainMatch) {
      ast.main = mainMatch[1].trim();
    }
    
    return ast;
  } catch (error) {
    console.error('Error parsing Pascal code:', error);
    throw new Error(`Failed to parse Pascal code: ${error.message}`);
  }
};

/**
 * Helper function to parse procedure/function parameters
 */
const parsePascalParameters = (paramsString) => {
  if (!paramsString.trim()) {
    return [];
  }
  
  const params = [];
  const paramGroups = paramsString.split(';');
  
  for (const group of paramGroups) {
    if (!group.trim()) continue;
    
    const parts = group.split(':');
    if (parts.length !== 2) continue;
    
    const names = parts[0].split(',').map(n => n.trim());
    const typeInfo = parts[1].trim();
    
    const isVar = typeInfo.toLowerCase().startsWith('var ');
    const dataType = isVar ? typeInfo.substring(4).trim() : typeInfo;
    
    for (const name of names) {
      params.push({
        name: name,
        dataType: dataType,
        byRef: isVar,
      });
    }
  }
  
  return params;
};