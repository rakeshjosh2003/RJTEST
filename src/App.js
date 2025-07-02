import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TextInput, Button, ScrollView, Picker } from 'react-native';
import { migrateCode } from './services/CodeMigrationService';

const App = () => {
  const [sourceLanguage, setSourceLanguage] = useState('java');
  const [targetLanguage, setTargetLanguage] = useState('cpp');
  const [sourceCode, setSourceCode] = useState('');
  const [resultCode, setResultCode] = useState('');
  
  const languages = [
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'COBOL', value: 'cobol' },
    { label: 'Pascal', value: 'pascal' },
    { label: 'Go', value: 'go' }
  ];
  
  const handleMigration = () => {
    if (!sourceCode.trim()) {
      alert('Please enter source code');
      return;
    }
    
    const result = migrateCode(sourceCode, sourceLanguage, targetLanguage);
    setResultCode(result);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Code Migrator</Text>
      
      <View style={styles.languageSelectors}>
        <View style={styles.languageSelector}>
          <Text>Source Language:</Text>
          <Picker
            selectedValue={sourceLanguage}
            onValueChange={(value) => setSourceLanguage(value)}
            style={styles.picker}
          >
            {languages.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
        
        <View style={styles.languageSelector}>
          <Text>Target Language:</Text>
          <Picker
            selectedValue={targetLanguage}
            onValueChange={(value) => setTargetLanguage(value)}
            style={styles.picker}
          >
            {languages.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.codeContainer}>
        <Text>Source Code:</Text>
        <TextInput
          style={styles.codeInput}
          multiline
          placeholder="Enter your code here"
          value={sourceCode}
          onChangeText={setSourceCode}
        />
      </View>
      
      <Button title="Migrate Code" onPress={handleMigration} />
      
      <View style={styles.codeContainer}>
        <Text>Result:</Text>
        <ScrollView style={styles.codeResult}>
          <Text>{resultCode}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageSelectors: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  languageSelector: {
    flex: 1,
  },
  picker: {
    height: 150,
    width: '100%',
  },
  codeContainer: {
    marginBottom: 16,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    height: 150,
    textAlignVertical: 'top',
  },
  codeResult: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    height: 150,
  },
});

export default App;