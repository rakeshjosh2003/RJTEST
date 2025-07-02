/**
 * Code syntax validator module
 * Validates the syntax of code in different programming languages
 */

// Import validation tools or libraries as needed
// Note: In a full implementation, you would integrate real language-specific validators

/**
 * Validates code for syntax errors
 * @param {string} code - The code to validate
 * @param {string} language - The language of the code (java, cpp, cobol, pascal, go)
 * @returns {Object} - Validation results including isValid, errors, and warnings
 */
export const validateCode = (code, language) => {
    // In a real implementation, this would use language-specific syntax checkers
    // For now, we'll do simple validation based on common syntax patterns
    
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

/**
 * Validates Java syntax
 */
const validateJavaSyntax = (code, result) => {
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
};

/**
 * Validates C++ syntax
 */
const validateCppSyntax = (code, result) => {
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
};

/**
 * Validates COBOL syntax
 */
const validateCobolSyntax = (code, result) => {
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
};

/**
 * Validates Pascal syntax
 */
const validatePascalSyntax = (code, result) => {
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
};

/**
 * Validates Go syntax
 */
const validateGoSyntax = (code, result) => {
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
    
    // No need to check for semicolons in Go
    
    // Check for main function in package main
    if (code.includes('package main') && !code.includes('func main()')) {
        result.warnings.push('Package main should have a main function');
    }
};