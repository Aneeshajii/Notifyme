const fs = require('fs');
let code = fs.readFileSync('app/(app)/contact.tsx', 'utf8');

code = code.replace(
  `import React, { useState } from 'react';\nimport { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';`,
  `import React, { useState } from 'react';\nimport { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';\nimport api from '../../services/api';`
);

const oldSubmit = `  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    Alert.alert('Success', 'Your support ticket has been submitted successfully! We will contact you soon.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };`;

const newSubmit = `  const [issueType, setIssueType] = useState('Other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/tickets', {
        subject: issueType,
        description: description,
        priority: 'medium'
      });
      Alert.alert('Success', 'Your support ticket has been submitted successfully! We will contact you soon.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(oldSubmit, newSubmit);

code = code.replace(
  `<TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
            <Text style={styles.btnPrimaryText}>Submit Ticket</Text>
          </TouchableOpacity>`,
  `<TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>Submit Ticket</Text>}
          </TouchableOpacity>`
);

fs.writeFileSync('app/(app)/contact.tsx', code);
console.log('patched contact.tsx');
