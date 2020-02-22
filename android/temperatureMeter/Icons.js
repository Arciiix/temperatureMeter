import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import React, { Component } from "react";
import { Text } from "react-native";

export default class Icon extends React.Component {
  constructor(props) {
    super(props);
    const defaultOptions = {
      name: null,
      color: null,
      size: null,
      temperature: null,
      fontLibrary: "MaterialCommunityIcons",
      min: 19,
      max: 24
    };
    this.state = { ...defaultOptions, ...props };
    if (this.state.temperature != null) {
      if (
        this.state.temperature <= this.state.max &&
        this.state.temperature >= this.state.min
      ) {
        this.state = {
          color: "#3be11a",
          fontLibrary: "FontAwesome",
          name: "thermometer-3"
        };
      } else if (this.state.temperature >= this.state.max) {
        this.state = {
          color: "#d49d37",
          fontLibrary: "FontAwesome",
          name: "thermometer-full"
        };
      } else {
        this.state = {
          color: "#25c2c4",
          fontLibrary: "FontAwesome",
          name: "thermometer-1"
        };
      }
    }
  }
  render() {
    if (this.state.fontLibrary === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={this.state.name}
          size={this.state.size}
          color={this.state.color}
        />
      );
    } else {
      return (
        <FontAwesome
          name={this.state.name}
          size={this.props.size}
          color={this.state.color}
        />
      );
    }
  }
}
