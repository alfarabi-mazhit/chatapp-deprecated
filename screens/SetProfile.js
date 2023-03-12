import { View, Text, Button, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FadeInView } from "../components/FadeInView";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  pickImg,
  askForMediaLibPermission,
  askForCameraPermission,
  uploadImage,
} from "../components/utils";
import { auth, database } from "../config/firebase";
import { updateProfile } from "@firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SetProfile() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState("");
  const [selectedImg, setSelectedImg] = useState(null);
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  async function handlePress() {
    const user = auth.currentUser;
    let photoURL;
    if (selectedImg) {
      const { url } = await uploadImage(
        selectedImg,
        `images/users/${user.uid}`,
        "profilePicture"
      );
      photoURL = url;
    }
    const userData = {
      displayName,
      email: user.email,
    };
    if (photoURL) {
      userData.photoURL = photoURL;
    }
    await Promise.all([
      updateProfile(user, userData),
      setDoc(doc(database, "users", user.uid), { ...userData, uid: user.uid }),
    ]).then(navigation.navigate("Home")).catch(e=>{alert('Ошибка соединения. Повторите позже')});
    
  }

  async function handleProfilePicture() {
    let status1 = await askForCameraPermission();
    let status2 = await askForMediaLibPermission();

    if (status1 === "granted" || status2 === "granted") {
      setCameraPermStatus(status1);
      setMediaLibPermStatus(status2);
      const result = await pickImg();
      if (!result.canceled) {
        setSelectedImg(result.assets[0].uri);
      }
    } else {
      return alert("Вам нужно дать разрешение в настройках телефона.");
    }
  }
  return (
    <View style={{ flex: 1 }}>
      {/*View style={{ flex: 1 }} || React.Fragment*/}
      <FadeInView
        style={{
          flex: 1,
          alignItems: "center",
          marginTop: 90,
          padding: 35,
        }}
      >
        <Text style={{ fontSize: 22 }}>Информация профиля</Text>
        <Text
          style={{
            fontSize: 14,
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          Введите ваше имя пользователя и фото:
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            width: 120,
            height: 120,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f57c00",
            borderRadius: 100,
          }}
        >
          {!selectedImg ? (
            <MaterialCommunityIcons size={45} name="camera-plus" />
          ) : (
            <Image
              source={{ uri: selectedImg }}
              style={{ width: 100, borderRadius: 100, height: 100 }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Имя пользователя"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            marginTop: 40,
            borderBottomWidth: 2,
            borderBottomColor: "#f57c00",
            width: "100%",
            height: 30,
            fontSize: 22,
          }}
        />
        <View style={{ marginTop: 20, width: 120 }}>
          <Button
            title="продолжить"
            color={"#f57c00"}
            disabled={!displayName}
            onPress={handlePress}
          />
        </View>
      </FadeInView>
    </View>
  );
}
