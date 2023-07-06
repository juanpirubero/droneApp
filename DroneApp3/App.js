import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// Define your screens
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Awareness Screen" component={AwarenessScreen} />
        <Stack.Screen name="Tasks Screen" component={TasksScreen} />
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
  }
});

export default App;

