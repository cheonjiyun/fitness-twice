import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DIET, EXERCISE, PEDOMETER, TODAY, WEIGHT } from "../constants/screenName";
import { theme } from "../style/theme";
import Today from "../screen/Today";
import Weight from "../screen/Weight";
import Diet from "../screen/Diet";
import Pedometer from "../screen/Pedometer";
import Exercise from "../screen/Exercise";

export type RootTabParamList = {
    [TODAY]: undefined;
    [WEIGHT]: undefined;
    [DIET]: undefined;
    [PEDOMETER]: undefined;
    [EXERCISE]: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function Tabs() {
    return (
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
                tabBarActiveTintColor: theme.color.primary[500],
                tabBarInactiveTintColor: theme.color.grey[700],
            })}
        >
            <Tab.Screen name={TODAY} component={Today} options={{ headerShown: false }} />
            <Tab.Screen name={WEIGHT} component={Weight} options={{ headerShown: false }} />
            <Tab.Screen name={DIET} component={Diet} options={{ headerShown: false }} />
            <Tab.Screen name={PEDOMETER} component={Pedometer} options={{ headerShown: false }} />
            <Tab.Screen name={EXERCISE} component={Exercise} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}
