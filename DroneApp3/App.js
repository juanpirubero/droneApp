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
    setButtonText('GO');
  }

  //change the button color 
  function onDone(message) {
    console.log('Received message for operator to stop:', message.payloadString);
    setButtonText('DONE');
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

  return <MQTTContext.Provider value={[mqttClient,tasks,buttonText,enteredName,setEnteredName]}>{children}</MQTTContext.Provider>;
};


function HomeScreen({ navigation }) {
  const [enteredGoalText, setEnteredGoalText] = useState('');
  const [goalList, setGoalList] = useState([]);
  const children = useContext(MQTTContext);
  const setEnteredName = children[4];

    function goalInputHandler(enteredText) {
      setEnteredGoalText(enteredText);
      setEnteredName(enteredText);
    }
    
    function addGoalHandler() {
      setGoalList((prevGoalList) => [...prevGoalList, enteredGoalText]);
      setEnteredGoalText('');
    }

  return (
    <View style={styles.container}>
      <TextInput style={styles.textInput} placeholder='Type Your Name' onChangeText={goalInputHandler} value={enteredGoalText} />
      <View style = {styles.buttonContainer}>
        <View style = {styles.button}>
          <Button title='Add' onPress={addGoalHandler} color="#b180f0" />
        </View>
      </View>
      <FlatList
        data={goalList}
        renderItem={({ item }) => <Text style={styles.listItem}> Welcome, {item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.listContainer}
      />
      <Text> Which one are you?</Text>
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
  const children = useContext(MQTTContext);
  const enteredName = children[3];

  return (
    <View style={styles.container}>
      <Text>{enteredName}</Text>
      {/* JSX for ThirdScreen */}
    </View>
  );
}

function TasksScreen() {
  const children = useContext(MQTTContext);
  const tasks = children[1];
  const buttonText = children[2];
  const enteredName = children[3];

  return (
    <View style={styles.container}>
      <Text>{enteredName}</Text>
      <Text>Your tasks are {tasks}</Text>
      <View style = {styles.redButton}>
          <Button title={buttonText} color={"white"} />
        </View>
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
      </Stack.Navigator>
    </NavigationContainer>
    </MQTTProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  textInput: {
    width: '80%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  listContainer: {
    flexGrow: 0, // Ensure the FlatList takes up remaining space
    width: '80%',
  },
  listItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Add margin bottom between list items
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10
  },
  button: {
    width: 100,
    marginHorizontal: 8,
    marginBottom: 10
  },
});

export default App;

