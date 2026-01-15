import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, StyleSheet, Platform } from 'react-native'

import HomeScreen from './src/screens/HomeScreen'
import CalendarScreen from './src/screens/CalendarScreen'
import AnalyticsScreen from './src/screens/AnalyticsScreen'

const Tab = createBottomTabNavigator()

interface TabIconProps {
  focused: boolean
  icon: string
  label: string
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
)

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="🏠" label="Hari Ini" />
            ),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="📅" label="Kalender" />
            ),
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="📊" label="Statistik" />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#141420',
    borderTopWidth: 0,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    height: Platform.OS === 'ios' ? 85 : 65,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabIconActive: {
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
})
