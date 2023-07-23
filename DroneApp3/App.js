import React from 'react';
import { View, Button, StyleSheet, Text, TextInput, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createContext, useState,useEffect,useContext } from 'react';
import Paho from "paho-mqtt";


// setup MQTT context
// shares MQTT client instance globally
const MQTTContext = createContext();

// MQTT component
const MQTTProvider = ({ children }) => {
  const [mqttClient, setMqttClient] = useState(null);
  const [tasks, setTasks] = useState("none");
  const [enteredName, setEnteredName] = useState('');
  //const [buttonColor,setButtonColor] = useState(styles.redButton);
  const [buttonText,setButtonText] = useState('WAIT');
  const topicCallbacks = {
    'UAV/topic/tasks': onTaskHandler,
    'UAV/topic/start': onStart,
    'UAV/topic/done' : onDone 
  };

  const onMessageArrived = (message) => {
    const topic = message.destinationName;
    //console.log("topic",topic);
    if (topicCallbacks.hasOwnProperty(topic)) {
      //console.log('selecting callback');
      topicCallbacks[topic](message);
    }
  };

  //change the tasks displayed on the frontend
  function onTaskHandler(message) {
    console.log('Received message on task topic:', message.payloadString);
    const receivedTasks = (message.payloadString);
    setTasks(receivedTasks);
  }

  //change the button color 
  function onStart(message) {
    console.log('Received message for operator to run tests:', message.payloadString);
    setButtonText('Press When You Are Done!');
  }

  //change the button color 
  function onDone(message) {
    console.log('Received message for operator to stop:', message.payloadString);
    setButtonText('Thank You! Please Wait');
  }


  useEffect(() => {
    // Create the MQTT client instance
    const client = new Paho.Client("broker.hivemq.com", 8000, 'test_ID');
    // Connect to the MQTT broker
    client.onMessageArrived = onMessageArrived;
    client.connect({
      onSuccess: () => {
        console.log('Connected to MQTT broker');
        // this means that we subscribe to all topics that begin with UAV/
        client.subscribe('UAV/#');
      },
      onFailure: () => {
        console.log('Failed to connect to MQTT broker');
      },
    });
   
    // Store the MQTT client instance in the state
    setMqttClient(client);

    // Clean up the MQTT client on unmount
    return () => {
      console.log("unmount");
      client.disconnect();
    };
  }, []);

  return <MQTTContext.Provider value={[mqttClient,tasks,buttonText,enteredName,setEnteredName, setButtonText]}>{children}</MQTTContext.Provider>;
};


function HomeScreen({ navigation }) {
  const [enteredGoalText, setEnteredGoalText] = useState('');
  const [goalList, setGoalList] = useState([]);
  const children = useContext(MQTTContext);
  const setEnteredName = children[4];

  const [addButtonDisabled, setAddButtonDisabled] = useState(false);

  function goalInputHandler(enteredText) {
      setEnteredGoalText(enteredText);
      setEnteredName(enteredText);
  }

  function addGoalHandler() {
    if (!addButtonDisabled) {
      setGoalList((prevGoalList) => [...prevGoalList, enteredGoalText]);
      setEnteredGoalText('');
      setAddButtonDisabled(true)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Fuzz Testing</Text>
      <TextInput
        style={styles.textInput}
        placeholder='Type Your Name'
        onChangeText={goalInputHandler}
        value={enteredGoalText}
      />
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title='Add' onPress={addGoalHandler} color="#b180f0" />
        </View>
      </View>
      <FlatList
        data={goalList}
        renderItem={({ item }) => <Text style={styles.listItem}> Welcome, {item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.listContainer}
      />
      <Text style={styles.infoText}> Which role are you?</Text>
      <View style={styles.buttonsGroup}>
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
    </View>
  );
}

function AwarenessScreen() {
  const children = useContext(MQTTContext);
  const enteredName = children[3];

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}> {enteredName}</Text>
      {/* JSX for ThirdScreen */}
    </View>
  );
}

function TasksScreen({navigation}) {
  const children = useContext(MQTTContext);
  const tasks = children[1];
  const globalButtonText = children[2];
  const enteredName = children[3];
  const setButtonText = children[4];

  const [buttonText, setLocalButtonText] = useState(globalButtonText);

  useEffect(() => {
    // Update the local state when the global state (globalButtonText) changes
    setLocalButtonText(globalButtonText);
  }, [globalButtonText]);

  let buttonColorStyle;
  if (buttonText === 'WAIT') {
    buttonColorStyle = styles.red;
  } else if (buttonText === 'Press When You Are Done') {
    buttonColorStyle = styles.green;
  } else if (buttonText === 'Thank You! Please Wait') {
    buttonColorStyle = styles.blue;
  }

  function handleDonePress() {
    if (buttonText === 'Thank You! Please Wait') {
      navigation.navigate('Notes Screen');
    } else {
      // Handle the logic for WAIT to GO transition
      // and GO to DONE transition here
      if (buttonText === 'WAIT') {
        setLocalButtonText('Press When You Are Done');
      } else if (buttonText === 'Press When You Are Done') {
        setLocalButtonText('Thank You! Please Wait');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}> {enteredName}</Text>
      <Text style={styles.infoText}>{tasks}</Text>
      <View style={[styles.redButton, buttonColorStyle]}>
        <Button title={buttonText} color={'white'} onPress={handleDonePress} />
      </View>
    </View>
  );
}

function NotesScreen() {
  const [noteText, setNoteText] = useState('');
  const [noteList, setNoteList] = useState([]);

  function addNoteHandler() {
    if (noteText.trim() !== '') {
      setNoteList(prevNoteList => [...prevNoteList, noteText]);
      setNoteText('');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notes</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Type your notes here..."
        onChangeText={text => setNoteText(text)}
        value={noteText}
        multiline
      />
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Add Note" onPress={addNoteHandler} color="#b180f0" />
        </View>
      </View>
      <FlatList
        data={noteList}
        renderItem={({ item }) => <Text style={styles.listItem}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.listContainer}
      />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <MQTTProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Awareness Screen" component={AwarenessScreen} />
          <Stack.Screen name="Tasks Screen" component={TasksScreen} />
          <Stack.Screen name="Notes Screen" component={NotesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MQTTProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'light grey',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  textInput: {
    width: '80%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
  listContainer: {
    width: '80%',
    marginBottom: 20,
  },
  listItem: {
    fontSize: 18,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 26,
    marginBottom: 10,
  },
  redButton: {
    fontSize: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 70,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    width: 100,
    marginHorizontal: 8,
    marginBottom: 10,
  },
  buttonsGroup: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  red: {
    backgroundColor: 'red',
  },
  green: {
    backgroundColor: 'green',
  },
  blue: {
    backgroundColor: 'blue',
  },
});

export default App;

