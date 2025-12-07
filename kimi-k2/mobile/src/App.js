import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import { Provider } from 'react-redux';
import { store } from './store';

// Screens
import HomeScreen from './screens/HomeScreen';
import ExcursionsScreen from './screens/ExcursionsScreen';
import BookingScreen from './screens/BookingScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReservationDetailScreen from './screens/ReservationDetailScreen';
import QRCodeScreen from './screens/QRCodeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ExcursionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExcursionsList" component={ExcursionsScreen} options={{ title: 'Nos Excursions' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Réserver' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Détails' }} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} options={{ title: 'QR Code' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ title: 'Détails' }} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Accueil') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Excursions') {
                iconName = focused ? 'ship' : 'ship-outline';
              } else if (route.name === 'Profil') {
                iconName = focused ? 'person' : 'person-outline';
              }
              return <Icon name={iconName} type="ionicon" size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0077b6',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Accueil" component={HomeScreen} />
          <Tab.Screen name="Excursions" component={ExcursionsStack} options={{ headerShown: false }} />
          <Tab.Screen name="Profil" component={ProfileStack} options={{ headerShown: false }} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;