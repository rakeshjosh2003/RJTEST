// Language-specific parsers
import { parseJava } from '../parsers/JavaParser';
import { parseCpp } from '../parsers/CppParser';
import { parseCobol } from '../parsers/CobolParser';
import { parsePascal } from '../parsers/PascalParser';
import { parseGo } from '../parsers/GoParser';

// Language-specific generators
import { generateJava } from '../generators/JavaGenerator';
import { generateCpp } from '../generators/CppGenerator';
import { generateCobol } from '../generators/CobolGenerator';
import { generatePascal } from '../generators/PascalGenerator';
import { generateGo } from '../generators/GoGenerator';

/**
 * Main service function to migrate code between languages
 * @param {string} sourceCode - The original code to migrate
 * @param {string} sourceLanguage - The language of the source code (java, cpp, cobol, pascal, go)
 * @param {string} targetLanguage - The language to migrate to (java, cpp, cobol, pascal, go)
 * @returns {string} - The migrated code in the target language
 */
export const migrateCode = (sourceCode, sourceLanguage, targetLanguage) => {
  try {
    // Parse the source code into an abstract syntax tree (AST)
    const ast = parseSourceCode(sourceCode, sourceLanguage);
    
    // Generate code in the target language from the AST
    return generateTargetCode(ast, targetLanguage);
  } catch (error) {
    console.error('Migration error:', error);
    return `Error during migration: ${error.message}`;
  }
};

/**
 * Parse source code into an abstract syntax tree
 * @param {string} sourceCode - The code to parse
 * @param {string} language - The language of the code
 * @returns {Object} - The abstract syntax tree
 */
const parseSourceCode = (sourceCode, language) => {
  switch (language) {
    case 'java':
      return parseJava(sourceCode);
    case 'cpp':
      return parseCpp(sourceCode);
    case 'cobol':
      return parseCobol(sourceCode);
    case 'pascal':
      return parsePascal(sourceCode);
    case 'go':
      return parseGo(sourceCode);
    default:
      throw new Error(`Unsupported source language: ${language}`);
  }
};

/**
 * Generate code in the target language from an abstract syntax tree
 * @param {Object} ast - The abstract syntax tree
 * @param {string} language - The target language
 * @returns {string} - The generated code
 */
const generateTargetCode = (ast, language) => {
  switch (language) {
    case 'java':
      return generateJava(ast);
    case 'cpp':
      return generateCpp(ast);
    case 'cobol':
      return generateCobol(ast);
    case 'pascal':
      return generatePascal(ast);
    case 'go':
      return generateGo(ast);
    default:
      throw new Error(`Unsupported target language: ${language}`);
  }
};