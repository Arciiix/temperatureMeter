import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import {Alert} from 'react-native'



export default async function registerForPushNotificationsAsync() {
  const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  
  if (status !== 'granted') {
    Alert.alert('UWAGA',"Nie przydzielono uprawnień do powiadomień!");
    return;
  }

  let token = await Notifications.getExpoPushTokenAsync();

  //TRZEBA TEN TOKEN WYSLAC NA SERWA
  alert(token);
}