import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import { Alert } from "react-native";

export default async function registerForPushNotificationsAsync() {
  const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

  if (status !== "granted") {
    Alert.alert("UWAGA", "Nie przydzielono uprawnień do powiadomień!");
    return;
  }

  let token = await Notifications.getExpoPushTokenAsync();
  //TRZEBA TEN TOKEN WYSLAC NA SERWER
  fetch(`http://192.168.0.120:5656/token?token=${token}`)
    .then(data => data.text())
    .then(data => console.log(data));
}
