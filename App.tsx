import { Button, StatusBar, StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
    DIET,
    EXERCISE,
    NEW_DIET,
    PEDOMETER,
    TABS,
    TODAY,
    WEIGHT,
} from "./src/constants/screenName";
import { theme } from "./src/style/theme";
import { SQLiteProvider } from "expo-sqlite";
// import "./gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import NewDiet from "./src/components/NewDiet";
import Tabs from "./src/components/Tabs";
import HeaderDone from "./src/components/HeaderDone";
import Today from "./src/screen/Today";

export type RootStackParamList = {
    [TABS]: undefined;
    // [TODAY]: undefined;
    [NEW_DIET]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SQLiteProvider databaseName="weight.db">
            <StatusBar barStyle={"dark-content"} backgroundColor={theme.color.white} />
            <NavigationContainer>
                <Stack.Navigator initialRouteName={TABS}>
                    <Stack.Screen name={TABS} component={Tabs} options={{ headerShown: false }} />
                    {/* <Stack.Screen name={TODAY} component={Today} options={{ headerShown: false }} /> */}
                    <Stack.Screen name={NEW_DIET} component={NewDiet} />
                </Stack.Navigator>
            </NavigationContainer>
        </SQLiteProvider>
    );
}
