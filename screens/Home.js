import React, { useEffect, useContext, useLayoutEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../colors";
import { Entypo } from "@expo/vector-icons";
import { WidthInView } from "../components/WidthInView";
import { LetterByLetterText } from "../components/LetterByLetter";
import {
  onSnapshot,
  collection,
  where,
  query,
  orderBy,
} from "@firebase/firestore";
import { auth, database, timestamp } from "../config/firebase";
import { Context } from "../components/Context";
import useContacts from "../components/useHooks";
import ListItem from "../components/ListItems";
import { signOut } from "firebase/auth";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const onSignOut = () => {
  signOut(auth).catch((error) => console.log("Error logging out: ", error));
};
function LogoTitle() {
  return (
    <WidthInView
      style={Object.assign({}, styles.chatButton, styles.headerChatButton)}
    >
      <LetterByLetterText
        textStyle={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
      >
        Chats
      </LetterByLetterText>
      <Entypo name="chat" size={24} color={colors.lightGray} />
    </WidthInView>
  );
}
const Home = () => {
  const navigation = useNavigation();
  const contacts = useContacts();
  const { currentUser } = auth;
  const { rooms, setRooms } = useContext(Context);

  const chatsQuery = query(
    collection(database, "rooms"),
    where("participantsArray", "array-contains", currentUser.email),
    orderBy("lastMessage.createdAt", "desc")
  );

  const LAST_UPDATED_AT = "roomsUPD";
  useEffect(() => {
    (async () => {
      try {
        // await AsyncStorage.clear();
        let storedRooms = JSON.parse(await AsyncStorage.getItem("rooms"));
        if (storedRooms !== null && storedRooms > 0) {
          setRooms(storedRooms);
          // console.log(storedRooms);
        } else {
          setRooms([]);
          // console.log('пусто');
        }
      } catch (error) {
        console.error("Error getting stored rooms:", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const lastUpdatedAt = await AsyncStorage.getItem(LAST_UPDATED_AT);
        // console.log(lastUpdatedAt);
        const queryWithLastUpdatedAt = (!rooms && lastUpdatedAt)
          ? query(
              chatsQuery,
              where(
                "lastMessage.createdAt",
                ">",
                timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime())
              )
            )
          : chatsQuery;
        const unsubscribe = onSnapshot(
          queryWithLastUpdatedAt,
          (querySnapshot) => {
            const parsedChats = querySnapshot.docs.map((doc, i) => {
              const userB =
                doc
                  .data()
                  .participants.find((p) => p.email !== currentUser.email) ||
                doc
                  .data()
                  .participants.find((p) => p.email === currentUser.email);

              return {
                ...doc.data(),
                id: doc.id,
                userB,
              };
            });
            // console.log(parsedChats,'parsedChats');
            if (parsedChats.length > 0) {
              const lastChatUpdatedAt = parsedChats[0].lastMessage.createdAt;
              AsyncStorage.setItem(
                LAST_UPDATED_AT,
                JSON.stringify(lastChatUpdatedAt.toDate())
              );
              const updatedRooms = parsedChats;
              // console.log(rooms,'rooms');
              if (rooms > 0) {
                updatedRooms = rooms.map((room) => {
                  const updatedChat = parsedChats.find(
                    (chat) => chat.id === room.id
                  );
                  return updatedChat ? updatedChat : room;
                });
              }
              AsyncStorage.setItem("rooms", JSON.stringify(updatedRooms));
              setRooms(updatedRooms);
            }
          }
        );
        return unsubscribe;
      } catch (error) {
        console.error("Error loading chats:", error);
      }
    })();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Object.assign({}, styles.chatButton, { marginLeft: 15 })}
        >
          <FontAwesome name="search" size={24} color={"#fff"} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
      headerTitle: (props) => <LogoTitle />,
      headerStyle: { height: 100 },
      headerTitleContainerStyle: { paddingBottom: 10 },
      headerLeftContainerStyle: { paddingBottom: 10 },
      headerRightContainerStyle: { paddingBottom: 10 },
    });
  }, [navigation]);
  function getUserB(user, contacts) {
    let userContact;
    if (contacts.length > 0) {
      userContact = contacts.find((c) => c.email === user.email);
      if (userContact && userContact.contactName) {
        return { ...user, contactName: userContact.contactName };
      }
    }
    return user;
  }
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 5, paddingRight: 10 }}>
        {rooms.map((room) => (
          <ListItem
            type="chat"
            description={room.lastMessage?.text}
            key={room.id}
            room={room}
            time={room.lastMessage?.createdAt}
            user={getUserB(room.userB, contacts)}
          ></ListItem>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Contacts")}
        style={Object.assign({}, styles.chatButton, styles.chatButton1)}
      >
        <Entypo name="plus" size={24} color={colors.lightGray} />
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerChatButton: {
    flexDirection: "row",
    width: 200,
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  chatButton1: {
    position: "absolute",
    right: 20,
    bottom: 50,
  },
});
