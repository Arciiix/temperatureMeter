import React, {Component} from 'react';
import { StyleSheet, 
         Text, 
         View,
         TouchableOpacity,
         ActivityIndicator,
         Alert
        } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {api} from './api.js';
import {MaterialCommunityIcons, FontAwesome} from '@expo/vector-icons';
import Icon from './Icons.js';
import {Notification} from 'expo';
import registerForPushNotificationsAsync from './notification.js';

const style = StyleSheet.create({
  container:
  {
  backgroundColor: '#3ead57',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  },
  temperature:
  {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button:
  {
    marginTop: 60,
    backgroundColor: '#7ae965',
    height: 110,
    width: 370,
  },
  buttonText:
  {
  fontSize: 45,
  textAlign: 'center',
  color: 'white'
  }

});


class Home extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      temperature: 0,
      roomTemperature: 0,
      isReady: false,
    };

  }
  static navigationOptions = 
  {
    headerShown: false,
  };

  componentDidMount()
  {
    /*
    fetch('https://airapi.airly.eu/v2/measurements/point?lat=49.98844&lng=18.55807',
    {
      method: 'get',
      headers:
      {
        'apikey': api,
      }
    })
    .then(data => data.json())
    .then(data => 
      {
        let last = data.current.values.length; 
        this.setState({
          temperature: data.current.values[last - 1].value
        })
      })
      */


     this.setState({
       roomTemperature: 22,
       temperature: 10.22,
       isReady: true,
     }
     );

     registerForPushNotificationsAsync();

  }


render()
{
  if(this.state.isReady)
  {
  return(
    <View style={style.container}>

    <View style={style.temperature}>
      <Icon size = {100} temperature = {this.state.roomTemperature} />
      <Text style = {{
            fontSize: 85,
            marginLeft: 20,
            color: this.colorTemp(this.state.roomTemperature),
            }}>{this.state.roomTemperature}</Text>
    </View>

    <View style={style.temperature}>
      <Icon size = {100} name = 'weather-cloudy' color = {this.colorTemp(this.state.temperature)} />
      <Text style = {{
            fontSize: 85,
            marginLeft: 20,
            color: this.colorTemp(this.state.temperature),
            }}>{this.state.temperature}</Text>
    </View>

    <View>
    <TouchableOpacity style = {style.button} onPress = {this.setNotification}>
    <Text style = {style.buttonText}>Ustaw powiadomienie</Text>

    </TouchableOpacity>
    </View>

    </View>
  );
  }
  else
  {
    return(
      <View style = {style.container}>
        <ActivityIndicator size = {100} color = "#30a9cf"/>
      </View>
    )
  }
}
setNotification()
{
  //SET NOTIFICATION TOKEN  

  Alert.alert("Ustawiono!", "Będziesz teraz otrzywywał powiadomienia o temperaturze.");
}

colorTemp(temp)
{
if(temp < 24 && temp > 18)
{
return '#3be11a';
}
else if (temp > 24)
{
  return '#d49d37';
}
else
{
return '#25c2c4';
};
}
}

const AppNavigator = createStackNavigator(
  {
  Home: Home
},
{
  initialRouteName: 'Home',
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}