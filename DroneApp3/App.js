import React, {useEffect} from 'react';
import { useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// Define your screens
function HomeScreen({ navigation }) {
  const [enteredGoalText, setEnteredGoalText] = useState('');

  function goalInputHandler(enteredText) {
    setEnteredGoalText(enteredText);
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Notes Screen');
    }, 30000);
  
    return () => clearTimeout(timer); // Clear the timer if the component unmounts
  }, [navigation]);
    

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} placeholder='Your Name' onChangeText={goalInputHandler} value={enteredGoalText} />
      <Text> Which role are you?</Text>
      <Button
        title="Mission Commander"
        onPress={() => navigation.navigate('Awareness Screen')}
      />
      <Button
        title="Safety Operator"
        onPress={() => navigation.navigate('Awareness Screen')}
      />
      <Button
        title="RPIC"
        onPress={() => navigation.navigate('Tasks Screen')}
      />
    </View>
  );
}

function AwarenessScreen() {
  return (
    <View style={styles.container}>
      {/* JSX for ThirdScreen */}
    </View>
  );
}

function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text>Your tasks are: </Text>
      <Text>1.........................</Text>
      <Text>2.........................</Text>
      <Text>3.........................</Text>
      <View style={styles.redButton}>
        <Button title='WAIT' color={'white'} />
      </View>
    </View>
  );
}

function NotesScreen({navigation}) {
  const [enteredNotesText, setEnteredNotesText] = useState('');
  const [notesList, setNotesList] = useState([]);

    function NotesInputHandler(enteredText) {
        setEnteredNotesText(enteredText);
    }
    
    function addNotesHandler() {
      setNotesList(prevNotesList => [...prevNotesList, enteredNotesText]);
      setEnteredNotesText('');
    }

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} placeholder='Add notes on your tasks' onChangeText={NotesInputHandler} value={enteredNotesText} />
      <View style = {styles.buttonContainer}>
        <View style = {styles.button}>
          <Button title='Add Note' onPress={addNotesHandler} color="#b180f0" />
        </View>
      </View>
      <Text>Your Notes:</Text>  
      <FlatList
        data={notesList}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Awareness Screen" component={AwarenessScreen} />
        <Stack.Screen name="Tasks Screen" component={TasksScreen} />
        <Stack.Screen name="Notes Screen" component={NotesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redButton: {
    fontSize: 26,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'red',
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 80,
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e4d0ff',
    backgroundColor: '#e4d0ff',
    color: '#120438',
    borderRadius: 6,
    width: '100%',
    padding: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8
  },
  button: {
    width: 100,
    marginHorizontal: 8
  },
});

export default App;

