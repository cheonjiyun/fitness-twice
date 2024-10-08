import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Today from "./src/screen/Today";
import Weight from "./src/screen/Weight";
import Diet from "./src/screen/Diet";
import Pedometer from "./src/screen/Pedometer";
import Exercise from "./src/screen/Exercise";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DIET, EXERCISE, PEDOMETER, TODAY, WEIGHT } from "./src/constants/tab";
import { theme } from "./src/style/theme";
import { SQLiteProvider } from "expo-sqlite";

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SQLiteProvider databaseName="weight.db">
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName: IconName = "home";

                            if (route.name == TODAY) {
                                iconName = "home";
                            } else if (route.name == WEIGHT) {
                                iconName = "monitor-weight";
                            } else if (route.name == DIET) {
                                iconName = "local-dining";
                            } else if (route.name == PEDOMETER) {
                                iconName = "directions-walk";
                            } else if (route.name == EXERCISE) {
                                iconName = "fitness-center";
                            }

                            return <MaterialIcons name={iconName} size={24} color={color} />;
                        },
                        tabBarActiveTintColor: theme.color.primary,
                        tabBarInactiveTintColor: theme.color.grey[700],
                    })}
                >
                    <Tab.Screen name={TODAY} component={Today} />
                    <Tab.Screen name={WEIGHT} component={Weight} />
                    <Tab.Screen name={DIET} component={Diet} />
                    <Tab.Screen name={PEDOMETER} component={Pedometer} />
                    <Tab.Screen name={EXERCISE} component={Exercise} />
                </Tab.Navigator>
            </NavigationContainer>
        </SQLiteProvider>
    );
}
