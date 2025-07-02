import { migrateCode } from '../services/CodeMigrationService.js';
import { validateCode } from './validator.js';

document.addEventListener('DOMContentLoaded', () => {
    const sourceLanguageSelect = document.getElementById('sourceLanguage');
    const targetLanguageSelect = document.getElementById('targetLanguage');
    const sourceCodeTextarea = document.getElementById('sourceCode');
    const resultCodeTextarea = document.getElementById('resultCode');
    const migrateButton = document.getElementById('migrateButton');
    const validateButton = document.getElementById('validateButton');
    const validationResult = document.getElementById('validationResult');

    // Example code templates for each language
    const codeExamples = {
        java: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
        cobol: `IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO.

PROCEDURE DIVISION.
    DISPLAY "Hello, World!".
    STOP RUN.`,
        pascal: `program HelloWorld;
begin
  WriteLn('Hello, World!');
end.`,
        go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`
    };

    // Set default example code based on selected source language
    sourceLanguageSelect.addEventListener('change', () => {
        const language = sourceLanguageSelect.value;
        sourceCodeTextarea.value = codeExamples[language] || '';
    });

    // Initialize with default example
    sourceCodeTextarea.value = codeExamples[sourceLanguageSelect.value] || '';

    // Handle migration button click
    migrateButton.addEventListener('click', () => {
        const sourceLanguage = sourceLanguageSelect.value;
        const targetLanguage = targetLanguageSelect.value;
        const sourceCode = sourceCodeTextarea.value;

        if (!sourceCode.trim()) {
            alert('Please enter source code');
            return;
        }

        try {
            const result = migrateCode(sourceCode, sourceLanguage, targetLanguage);
            resultCodeTextarea.value = result;
        } catch (error) {
            console.error('Migration error:', error);
            resultCodeTextarea.value = `Error during migration: ${error.message}`;
        }
    });

    // Handle validate button click
    validateButton.addEventListener('click', () => {
        const targetLanguage = targetLanguageSelect.value;
        const codeToValidate = resultCodeTextarea.value;

        if (!codeToValidate.trim()) {
            alert('Please migrate code first');
            return;
        }

        try {
            const validationResults = validateCode(codeToValidate, targetLanguage);
            
            if (validationResults.isValid) {
                validationResult.className = 'validation-result validation-success';
                validationResult.innerHTML = `<p>✓ Code is syntactically valid</p>`;
                if (validationResults.warnings.length > 0) {
                    validationResult.innerHTML += `<p><strong>Warnings:</strong></p><ul>${validationResults.warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;
                }
            } else {
                validationResult.className = 'validation-result validation-error';
                validationResult.innerHTML = `<p>✗ Syntax errors detected</p><ul>${validationResults.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
            }
        } catch (error) {
            console.error('Validation error:', error);
            validationResult.className = 'validation-result validation-error';
            validationResult.innerHTML = `<p>Error during validation: ${error.message}</p>`;
        }
    });
});