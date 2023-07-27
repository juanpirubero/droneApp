import React from 'react';
import { View, Button, StyleSheet, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
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
  const [buttonText,setButtonText] = useState('Press When You Are Done');
  const topicCallbacks = {
    'UAV/topic/tasks': onTaskHandler,
    'UAV/topic/start': onStart,
    'UAV/topic/done' : onDone 
  };

  const [showPressButton, setShowPressButton] = useState(false);
  const [showPressButtonText, setShowPressButtonText] = useState('');

  const onMessageArrived = (message) => {
    const topic = message.destinationName;
    //console.log("topic",topic);
    if (topicCallbacks.hasOwnProperty(topic)) {
      //console.log('selecting callback');
      topicCallbacks[topic](message);
    }
    if (topic === 'UAV/topic/tasks') {
      setShowPressButton(true);
      setShowPressButtonText('Press When You Are Done')
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

  return <MQTTContext.Provider value={[mqttClient,tasks,buttonText,enteredName,setEnteredName, setButtonText, showPressButton, setShowPressButtonText]}>{children}</MQTTContext.Provider>;
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
  const  [showPressButton, setShowPressButton] = useState(false);
  const [showPressButtonText, setShowPressButtonText] = useState('');
  const children = useContext(MQTTContext);
  const tasks = children[1];
  const globalButtonText = children[2];
  const enteredName = children[3];
  const setButtonText = children[5];
  const showPressButtonFromContext = children[6];
  const showPressButtonTextFromContext = children[7];

  const [buttonText, setLocalButtonText] = useState(globalButtonText);

  useEffect(() => {
    // Update the local state when the global state (globalButtonText) changes
    setLocalButtonText(globalButtonText);
  }, [globalButtonText]);

  useEffect(() => {
    // Listen for the changes in the showPressButton value from the MQTT context
    setShowPressButton(showPressButtonFromContext);
    setShowPressButtonText(showPressButtonTextFromContext);
  }, [showPressButtonFromContext, showPressButtonTextFromContext]);

  let buttonColorStyle;
  if (buttonText === 'WAIT') {
    buttonColorStyle = styles.red;
  } else if (showPressButton && showPressButtonText === 'Press When You Are Done') {
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

function RadioButton({ label, isSelected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radioButtonContainer}>
      <View
        style={[
          styles.radioButton,
          { backgroundColor: isSelected ? 'green' : 'white' },
        ]}
      >
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function NotesScreen() {
  const [radioOptions, setRadioOptions] = useState([
    { label: 'Mission Completed Successfully', selected: false },
    { label: 'Drone Flew Off Course', selected: false },
    { label: 'Drone Crashed', selected: false },
    { label: 'Mission Aborted', selected: false },
    { label: 'User Failed To Respond', selected: false },
  ]);

  function handleRadioPress(index) {
    const updatedOptions = radioOptions.map((option, idx) =>
      idx === index ? { ...option, selected: true } : { ...option, selected: false }
    );
    setRadioOptions(updatedOptions);
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerText}>Mission Done!</Text>
        <Text style={styles.subHeaderText}>What Was The Mission Outcome?</Text>
      </View>
      <View style={styles.radioButtonsContainer}>
        {radioOptions.map((option, index) => (
          <View key={index} style={styles.radioButtonContainer}>
            <RadioButton
              isSelected={option.selected}
              onPress={() => handleRadioPress(index)}
            />
            <Text style={styles.radioButtonLabel}>{option.label}</Text>
          </View>
        ))}
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
  titleContainer: {
    alignItems: 'center', // Align the text to the center
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
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  radioButtonsContainer: {
    alignItems: 'flex-start', 
    marginLeft: 20, 
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  radioButtonLabel: {
    fontSize: 16,
    marginLeft: 2,
  },
});

export default App;

