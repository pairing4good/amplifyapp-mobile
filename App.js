import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button
} from 'react-native'
import { API } from 'aws-amplify';
import { listNotes } from './src/graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './src/graphql/mutations';
import Amplify from 'aws-amplify'
import config from './src/aws-exports'
Amplify.configure(config)

const initialFormState = { name: '', description: '' }

const App = () => {

  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes()
  }, [])

  function setInput(key, value) {
    setFormData({ ...formData, [key]: value })
  }

  async function fetchNotes() {
    try {
      const noteData = await API.graphql({ query: listNotes });
      const notes = noteData.data.listNotes.items
      setNotes(notes)
    } catch (err) { console.log('error fetching notes') }
  }

  async function addNote() {
    try {
      const note = { ...formData }
      setNotes([...notes, note])
      setFormData(initialFormState)
      await API.graphql({ query: createNoteMutation, variables: { input: note } });
    } catch (err) {
      console.log('error creating note:', err)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formData.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formData.description}
        placeholder="Description"
      />
      <Button title="Create Note" onPress={addNote} />
      {
        notes.map((note, index) => (
          <View key={note.id ? note.id : index} style={styles.note}>
            <Text style={styles.noteName}>{note.name}</Text>
            <Text>{note.description}</Text>
          </View>
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  note: {  marginBottom: 15 },
  input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
  noteName: { fontSize: 18 }
})

export default App

