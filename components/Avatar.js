import React from "react";
import { Image } from "react-native";

export default function Avatar({ size, user }) {
  return (
    <Image
      style={{
        width: size,
        height: size,
        borderRadius: size,
      }}
      source={
          { uri: (user.userDoc?.photoURL||user.photoURL) }
          // : require("../assets/icon.png")
      }
      resizeMode="cover"
    />
  );
}