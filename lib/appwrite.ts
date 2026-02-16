import { Account, Client, Databases } from "react-native-appwrite"


const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform("co.yasirtech.HabitTrackerapp")

export const account= new Account(client)