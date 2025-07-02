/**
 * Module shim for the web version
 * This allows ES modules to work directly in browsers without requiring bundling
 */

// Store module exports
window.CodeMigratorModules = {};

// Parsers
import { parseJava } from '../parsers/JavaParser.js';
import { parseCpp } from '../parsers/CppParser.js';
import { parseCobol } from '../parsers/CobolParser.js';
import { parsePascal } from '../parsers/PascalParser.js';
import { parseGo } from '../parsers/GoParser.js';

// Generators
import { generateJava } from '../generators/JavaGenerator.js';
import { generateCpp } from '../generators/CppGenerator.js';
import { generateCobol } from '../generators/CobolGenerator.js';
import { generatePascal } from '../generators/PascalGenerator.js';
import { generateGo } from '../generators/GoGenerator.js';

// Make modules available globally
window.CodeMigratorModules.parseJava = parseJava;
window.CodeMigratorModules.parseCpp = parseCpp;
window.CodeMigratorModules.parseCobol = parseCobol;
window.CodeMigratorModules.parsePascal = parsePascal;
window.CodeMigratorModules.parseGo = parseGo;

window.CodeMigratorModules.generateJava = generateJava;
window.CodeMigratorModules.generateCpp = generateCpp;
window.CodeMigratorModules.generateCobol = generateCobol;
window.CodeMigratorModules.generatePascal = generatePascal;
window.CodeMigratorModules.generateGo = generateGo;

// Create migration service interface
window.CodeMigratorModules.migrateCode = (sourceCode, sourceLanguage, targetLanguage) => {
  try {
    // Parse the source code into an abstract syntax tree (AST)
    let ast;
    
    switch (sourceLanguage) {
      case 'java':
        ast = window.CodeMigratorModules.parseJava(sourceCode);
        break;
      case 'cpp':
        ast = window.CodeMigratorModules.parseCpp(sourceCode);
        break;
      case 'cobol':
        ast = window.CodeMigratorModules.parseCobol(sourceCode);
        break;
      case 'pascal':
        ast = window.CodeMigratorModules.parsePascal(sourceCode);
        break;
      case 'go':
        ast = window.CodeMigratorModules.parseGo(sourceCode);
        break;
      default:
        throw new Error(`Unsupported source language: ${sourceLanguage}`);
    }
    
    // Generate code in the target language from the AST
    let result;
    
    switch (targetLanguage) {
      case 'java':
        result = window.CodeMigratorModules.generateJava(ast);
        break;
      case 'cpp':
        result = window.CodeMigratorModules.generateCpp(ast);
        break;
      case 'cobol':
        result = window.CodeMigratorModules.generateCobol(ast);
        break;
      case 'pascal':
        result = window.CodeMigratorModules.generatePascal(ast);
        break;
      case 'go':
        result = window.CodeMigratorModules.generateGo(ast);
        break;
      default:
        throw new Error(`Unsupported target language: ${targetLanguage}`);
    }
    
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    return `Error during migration: ${error.message}`;
  }
};

// Create validator interface
window.CodeMigratorModules.validateCode = (code, language) => {
  // Basic validation function from validator.js
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!code || !code.trim()) {
    result.isValid = false;
    result.errors.push('Code cannot be empty');
    return result;
  }
  
  // Basic language-specific syntax validation
  switch (language) {
    case 'java':
      validateJavaSyntax(code, result);
      break;
    case 'cpp':
      validateCppSyntax(code, result);
      break;
    case 'cobol':
      validateCobolSyntax(code, result);
      break;
    case 'pascal':
      validatePascalSyntax(code, result);
      break;
    case 'go':
      validateGoSyntax(code, result);
      break;
    default:
      result.warnings.push(`No specific validation available for ${language}`);
  }
  
  // Add a note about the validation being limited
  result.warnings.push('Note: This is a basic syntax check. For complete validation, please use a dedicated compiler or linter.');
  
  return result;
};

// Validation functions copied from validator.js
function validateJavaSyntax(code, result) {
  // Check for unbalanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    result.isValid = false;
    result.errors.push(`Unbalanced braces: ${openBraces} opening and ${closeBraces} closing braces`);
  }
  
  // Check for missing semicolons (simple heuristic)
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.endsWith('{') && !line.endsWith('}') && 
        !line.endsWith(';') && !line.startsWith('//') && 
        !line.startsWith('/*') && !line.startsWith('*') && 
        !line.endsWith('*/') && !line.startsWith('import') && 
        !line.startsWith('package') && !line.startsWith('public class')) {
      result.warnings.push(`Line ${i+1} may be missing a semicolon: "${line}"`);
    }
  }
  
  // Check for proper class declaration
  if (!code.includes('class ')) {
    result.warnings.push('No class declaration found');
  }
}

function validateCppSyntax(code, result) {
  // Check for unbalanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    result.isValid = false;
    result.errors.push(`Unbalanced braces: ${openBraces} opening and ${closeBraces} closing braces`);
  }
  
  // Check for missing semicolons (simple heuristic)
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.endsWith('{') && !line.endsWith('}') && 
        !line.endsWith(';') && !line.startsWith('//') && 
        !line.startsWith('/*') && !line.startsWith('*') && 
        !line.endsWith('*/') && !line.startsWith('#include')) {
      result.warnings.push(`Line ${i+1} may be missing a semicolon: "${line}"`);
    }
  }
  
  // Check for main function
  if (!code.includes('main')) {
    result.warnings.push('No main function found');
  }
}

function validateCobolSyntax(code, result) {
  // Check for required divisions
  if (!code.includes('IDENTIFICATION DIVISION')) {
    result.isValid = false;
    result.errors.push('Missing IDENTIFICATION DIVISION');
  }
  
  if (!code.includes('PROCEDURE DIVISION')) {
    result.isValid = false;
    result.errors.push('Missing PROCEDURE DIVISION');
  }
  
  // Check for PROGRAM-ID
  if (!code.includes('PROGRAM-ID')) {
    result.warnings.push('No PROGRAM-ID found');
  }
  
  // Check for proper line termination (periods)
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, comments, and division headers
    if (line && !line.endsWith('.') && 
        !line.includes('DIVISION') && 
        !line.includes('SECTION') && 
        line.length > 0) {
      result.warnings.push(`Line ${i+1} may be missing a period: "${line}"`);
    }
  }
}

function validatePascalSyntax(code, result) {
  // Check for proper program structure
  if (!code.toLowerCase().includes('program ')) {
    result.warnings.push('No program declaration found');
  }
  
  // Check for begin/end balance
  const beginCount = (code.toLowerCase().match(/\bbegin\b/g) || []).length;
  const endCount = (code.toLowerCase().match(/\bend\b/g) || []).length;
  
  if (beginCount !== endCount) {
    result.isValid = false;
    result.errors.push(`Unbalanced begin/end: ${beginCount} begin and ${endCount} end keywords`);
  }
  
  // Check for proper termination
  if (!code.trim().endsWith('.')) {
    result.warnings.push('Program should end with a period');
  }
  
  // Check for semicolons in proper places
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    if (line && !line.endsWith('begin') && !line.endsWith('end;') && 
        !line.endsWith('end.') && !line.endsWith(';') && 
        !line.startsWith('program') && line.length > 0) {
      result.warnings.push(`Line ${i+1} may be missing a semicolon: "${line}"`);
    }
  }
}

function validateGoSyntax(code, result) {
  // Check for package declaration
  if (!code.includes('package ')) {
    result.isValid = false;
    result.errors.push('Missing package declaration');
  }
  
  // Check for unbalanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    result.isValid = false;
    result.errors.push(`Unbalanced braces: ${openBraces} opening and ${closeBraces} closing braces`);
  }
  
  // Check for imports
  if (code.includes('fmt.') && !code.includes('import "fmt"')) {
    result.warnings.push('Using fmt package but no import statement found');
  }
  
  // Check for main function in package main
  if (code.includes('package main') && !code.includes('func main()')) {
    result.warnings.push('Package main should have a main function');
  }
}