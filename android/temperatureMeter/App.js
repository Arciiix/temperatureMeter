import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import Icon from "./Icons.js";
import { Notification } from "expo";
import registerForPushNotificationsAsync from "./notification.js";

const style = StyleSheet.create({
  container: {
    backgroundColor: "#3ead57",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  temperature: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  button: {
    marginTop: 60,
    backgroundColor: "#7ae965",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    width: 370
  },
  buttonText: {
    fontSize: 30,
    textAlign: "center",
    color: "white"
  },
  initText: {
    fontSize: 25,
    color: "#1ee3c8",
    marginTop: 200,
    textAlign: "center"
  },
  numberInput: {
    backgroundColor: "#3ead57",
    width: 100,
    height: 70,
    borderColor: "#3ead57",
    borderBottomColor: "#ffffff",
    borderWidth: 1,
    fontSize: 60,
    textAlign: "center",
    alignSelf: "center",
    color: "#ffffff"
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    textAlign: "center",
    marginBottom: 50
  },
  inputsText: {
    fontSize: 30,
    color: "#ffffff",
    textAlign: "center",
    alignSelf: "center"
  }
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      temperature: 0,
      roomTemperature: 0,
      isReady: false,
      loadingText: "",
      min: 19,
      max: 23,
      minO: 15
    };
  }
  static navigationOptions = {
    headerShown: false
  };

  componentDidMount() {
    this.setState({
      loadingText: "Wczytano komponenty"
    });
    //Get all data: in-room temperature, out-room temperature and max and min temperature values
    fetch(`http://192.168.0.120:5656/getData`)
      .then(data => data.json())
      .then(data => {
        this.setState({
          roomTemperature: parseFloat(data.temperature),
          min: parseFloat(data.limits.min),
          max: parseFloat(data.limits.max),
          minO: parseFloat(data.limits.minO),
          temperature: parseFloat(data.outsideTemperature),
          isReady: true
        });
      })
      .catch(err =>
        this.setState({ loadingText: "Błąd przy pobieraniu danych" })
      );
  }

  render() {
    if (this.state.isReady) {
      return (
        <View style={style.container}>
          <View style={style.temperature}>
            <Icon
              size={100}
              temperature={this.state.roomTemperature}
              min={this.state.min}
              max={this.state.max}
            />
            <Text
              style={{
                fontSize: 85,
                marginLeft: 20,
                color: this.colorTemp(this.state.roomTemperature)
              }}
            >
              {this.state.roomTemperature}
            </Text>
          </View>

          <View style={style.temperature}>
            <Icon
              size={100}
              name="weather-cloudy"
              color={this.colorTemp(this.state.temperature, true)}
            />
            <Text
              style={{
                fontSize: 85,
                marginLeft: 20,
                color: this.colorTemp(this.state.temperature, true)
              }}
            >
              {this.state.temperature}
            </Text>
          </View>

          <View>
            <TouchableOpacity
              style={style.button}
              onPress={this.setNotification}
            >
              <Text style={style.buttonText}>Ustaw powiadomienie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={style.button}
              onPress={() => this.props.navigation.navigate("Temperature")}
            >
              <Text style={style.buttonText}>Ustaw temperatury</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={style.button}
              onPress={() =>
                this.props.navigation.navigate("OutsideTemperature")
              }
            >
              <Text style={style.buttonText}>Ustaw zewnątrzną temperaturę</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          <ActivityIndicator size={100} color="#30a9cf" />
          <Text style={style.initText}>{this.state.loadingText}</Text>
        </View>
      );
    }
  }
  setNotification() {
    //SET NOTIFICATION TOKEN
    registerForPushNotificationsAsync();
    Alert.alert(
      "Ustawiono!",
      "Będziesz teraz otrzywywał powiadomienia o temperaturze."
    );
  }

  colorTemp(temp, isOutside) {
    if (isOutside) {
      if (temp < this.state.minO) {
        return "#25c2c4";
      } else {
        return "#3be11a";
      }
    } else {
      if (temp <= this.state.max && temp >= this.state.min) {
        return "#3be11a";
      } else if (temp >= this.state.max) {
        return "#d49d37";
      } else {
        return "#25c2c4";
      }
    }
  }
}

class Temperature extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minTemp: "19",
      maxTemp: "24"
    };
  }

  static navigationOptions = {
    title: "Zmień temperaturę",
    headerStyle: {
      backgroundColor: "#3ead57"
    },
    headerTintColor: "#ffffff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  };

  changeText(text, isMin) {
    let formattedText = text.replace(/[^0-9\.]/g, "");
    if (isMin) {
      this.setState({ minTemp: formattedText });
    } else {
      this.setState({ maxTemp: formattedText });
    }
  }

  setTemperature() {
    fetch(
      `http://192.168.0.120:5656/setTemp?min=${this.state.minTemp}&max=${this.state.maxTemp}`
    )
      .then(data => data.text())
      .then(data => {
        if (data === "good") {
          this.props.navigation.navigate("Home");
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <View style={style.container}>
        <View style={style.inputs}>
          <Text style={style.inputsText}>Minimalna temperatura</Text>

          <TextInput
            keyboardType="numeric"
            style={style.numberInput}
            onChangeText={text => this.changeText(text, true)}
            maxLength={5}
          />
        </View>

        <View style={style.inputs}>
          <Text style={style.inputsText}>Maksymalna temperatura</Text>

          <TextInput
            keyboardType="numeric"
            style={style.numberInput}
            onChangeText={text => this.changeText(text, false)}
            maxLength={5}
          />
        </View>

        <TouchableOpacity
          style={style.button}
          onPress={this.setTemperature.bind(this)}
        >
          <Text style={style.buttonText}>Zmień</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class OutsideTemperature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: "15"
    };
  }

  changeText(text) {
    this.setState({
      temp: text.replace(/[^0-9\.]/g, "")
    });
  }

  setTemperature() {
    fetch(`http://192.168.0.120:5656/setOutsideLimit?temp=${this.state.temp}`)
      .then(data => data.text())
      .then(data => {
        if (data === "good") {
          this.props.navigation.navigate("Home");
        }
      });
  }

  static navigationOptions = {
    title: "Zmień temperaturę zewnętrzną",
    headerStyle: {
      backgroundColor: "#3ead57"
    },
    headerTintColor: "#ffffff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  };

  render() {
    return (
      <View style={style.container}>
        <Text style={style.inputsText}>Minimalna temperatura</Text>

        <TextInput
          keyboardType="numeric"
          style={style.numberInput}
          onChangeText={text => this.changeText(text)}
          maxLength={5}
        />

        <TouchableOpacity
          style={style.button}
          onPress={this.setTemperature.bind(this)}
        >
          <Text style={style.buttonText}>Zmień</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
const AppNavigator = createStackNavigator(
  {
    Home: Home,
    Temperature: Temperature,
    OutsideTemperature: OutsideTemperature
  },
  {
    initialRouteName: "Home"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
