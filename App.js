import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ScrollView} from "react-native";
import {HomeScreen} from "./src/screens/HomeScreen";
import {SettingsScreen} from "./src/screens/ProfileScreen";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import {ScrollHomeScreen} from "./src/screens/ScrollHomeScreen";



export default function App() {
    const Tab = createBottomTabNavigator();

    return (
      <NavigationContainer>
        <StatusBar />
          <Tab.Navigator
              initialRouteName="Home"
              screenOptions={({ route }) => ({
                  showIcon: true,
                  tabBarIcon: ({ focused, color, size }) => {
                      let iconName

                      if (route.name === 'Home') {
                          iconName = focused ? 'home-outline' : 'home-outline'
                      } else if (route.name === 'Settings') {
                          iconName = focused ? 'cog-outline' : 'cog-outline'
                      } else if (route.name ==='List') {
                          iconName = focused ? 'apps-outline' : 'apps-outline'
                      }

                      // You can return any component that you like here!
                      return <Ionicons name={iconName} size={size} color={color} />
                  }
              })}
          >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
              <Tab.Screen name="List" component={ScrollHomeScreen} />
          </Tab.Navigator>
      </NavigationContainer>
  );
}
