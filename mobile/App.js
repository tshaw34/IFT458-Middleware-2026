

// Manages screen navigation and user authentication state
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, ActivityIndicator } from 'react-native';

// Import all screen components
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AuthSuccessScreen from './screens/AuthSuccessScreen';
import BookExchangeScreen from './screens/BookExchangeScreen';
import AddBookScreen from './screens/AddBookScreen';
import LogoutScreen from './screens/LogoutScreen';

// Import API helper
import { getSavedUser } from './utils/api';



const loggermiddleware = require('./loggerMiddleware'); 

// Import AuthContext
import { AuthProvider, useAuth } from './AuthContext';

// Fix the web viewport so the app uses the full browser width
// Expo web by default constrains the app to a narrow mobile width
if (Platform.OS === 'web') {
    const style = document.createElement('style');
    style.textContent = `
        html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
        }
        #root > div:first-child {
            display: flex !important;
            min-height: 100vh !important;
            width: 100% !important;
            max-width: 100% !important;
        }
    `;
    document.head.appendChild(style);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Memoized screens for optimization
const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedLoginScreen = React.memo(LoginScreen);
const MemoizedRegisterScreen = React.memo(RegisterScreen);
const MemoizedAuthSuccessScreen = React.memo(AuthSuccessScreen);
const MemoizedBookExchangeScreen = React.memo(BookExchangeScreen);
const MemoizedAddBookScreen = React.memo(AddBookScreen);
const MemoizedLogoutScreen = React.memo(LogoutScreen);

// Auth Stack Navigator
function AuthStack() {
    const { login } = useAuth();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={MemoizedHomeScreen} />
            <Stack.Screen name="Login" component={MemoizedLoginScreen} />
            <Stack.Screen name="Register" component={MemoizedRegisterScreen} />
            <Stack.Screen
                name="AuthSuccess"
                component={MemoizedAuthSuccessScreen}
                initialParams={{ login }}
            />
        </Stack.Navigator>
    );
}

// Main Tab Navigator
function MainTabs({ user, token, onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    // You can add icons here if desired
                    return null;
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#adb5bd',
                tabBarStyle: styles.bottomNav,
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        accessibilityLabel={`Navigate to ${route.name}`}
                        accessibilityRole="button"
                    />
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={MemoizedHomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Books"
                component={MemoizedBookExchangeScreen}
                options={{ title: 'Books' }}
            />
            <Tab.Screen
                name="AddBook"
                component={MemoizedAddBookScreen}
                options={{ title: 'Add Book' }}
            />
            <Tab.Screen
                name="Logout"
                component={MemoizedLogoutScreen}
                options={{ title: 'Logout' }}
            />
        </Tab.Navigator>
    );
}

const AppNavigator = () => {
    const { user, token, login, logout, isLoading, error, setLoading, setAuthError } = useAuth();

    // Check for saved session on startup
    useEffect(() => {
        const checkSavedUser = async () => {
            try {
                console.log('Checking saved user');
                const savedData = await getSavedUser();
                if (savedData) {
                    login(savedData.user, savedData.token);
                }
            } catch (error) {
                console.log('Error checking saved user:', error);
                setAuthError('Failed to load saved session');
            } finally {
                setLoading(false);
            }
        };
        checkSavedUser();
    }, [login, setLoading, setAuthError]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d6efd" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => setAuthError(null)}>
                    <Text>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#0d6efd" />
            {user ? (
                <MainTabs user={user} token={token} onLogout={logout} />
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}


const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        color: '#dc3545',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    bottomNav: {
        backgroundColor: '#0d6efd',
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
    },
});