import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '../contexts/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import ProductionScreen from '../screens/ProductionScreen'
import WeightScreen from '../screens/WeightScreen'
import StockScreen from '../screens/StockScreen'
import FinancialScreen from '../screens/FinancialScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const COLORS = {
  bg: '#0f172a',
  tabBar: '#0d1b2e',
  active: '#f59e0b',
  inactive: '#475569',
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.tabBar, borderTopColor: '#1e3a5f' },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Painel', tabBarIcon: ({ color }) => <TabIcon name="⚡" color={color} /> }}
      />
      <Tab.Screen
        name="Production"
        component={ProductionScreen}
        options={{ tabBarLabel: 'Produção', tabBarIcon: ({ color }) => <TabIcon name="🏭" color={color} /> }}
      />
      <Tab.Screen
        name="Weight"
        component={WeightScreen}
        options={{ tabBarLabel: 'Balança', tabBarIcon: ({ color }) => <TabIcon name="⚖️" color={color} /> }}
      />
      <Tab.Screen
        name="Stock"
        component={StockScreen}
        options={{ tabBarLabel: 'Estoque', tabBarIcon: ({ color }) => <TabIcon name="📦" color={color} /> }}
      />
      <Tab.Screen
        name="Financial"
        component={FinancialScreen}
        options={{ tabBarLabel: 'Financeiro', tabBarIcon: ({ color }) => <TabIcon name="💰" color={color} /> }}
      />
    </Tab.Navigator>
  )
}

function TabIcon({ name, color }: { name: string; color: string }) {
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 18, color }}>{name}</Text>
}

export default function Navigation() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.active} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
