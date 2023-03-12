import React, { useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "./config/firebase";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Chat from "./screens/Chat";
import Home from "./screens/Home";
import SetProfile from "./screens/SetProfile";
import { Context, Provider } from "./components/Context";
import Contacts from "./screens/Contacts";

const Stack = createStackNavigator();
function ChatStack() {
  const { user, setUser } = useContext(Context);
  return (
    <Stack.Navigator /* defaultScreenOptions={Home} */>
      {!user.displayName && (
        <Stack.Screen name="setProfile" component={SetProfile} />
      )}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Contacts" component={Contacts} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser } = useContext(Context);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, [user]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider>
      <RootNavigator />
    </Provider>
  );
}
