import React, { useEffect, useContext, useLayoutEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../colors";
import { Entypo } from "@expo/vector-icons";
import { WidthInView } from "../components/WidthInView";
import { LetterByLetterText } from "../components/LetterByLetter";
import { onSnapshot, collection, where, query } from "@firebase/firestore";
import { auth, database } from "../config/firebase";
import { Context } from "../components/Context";
import useContacts from "../components/useHooks";
import ListItem from "../components/ListItems";
import { signOut } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';
const catImageUrl =
  "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";
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
  const { rooms, setRooms, unfilteredRooms,setUnfilteredRooms } = useContext(Context);
  const chatsQuery = query(
    collection(database, "rooms"),
    where("participantsArray", "array-contains", currentUser.email)
  );
  useEffect(() => {
    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const parsedChats = querySnapshot.docs
        // .filter((doc) => doc.data().lastMessage)
        .map((doc, i) => {
          const userB =
            doc
              .data()
              .participants.find((p) => p.email !== currentUser.email) ||
            doc.data().participants.find((p) => p.email === currentUser.email);
          return {
            ...doc.data(),
            id: doc.id,
            userB,
          };
        });

      {
        console.log(parsedChats);
      }
      setUnfilteredRooms(parsedChats)
      setRooms(parsedChats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Object.assign({}, styles.chatButton, { marginLeft: 15 })}
        >
          <FontAwesome name="search" size={24} color={"#fff"} />
        </TouchableOpacity>
      ),headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10
          }}
          onPress={onSignOut}
        >
          <AntDesign name="logout" size={24} color={colors.gray} style={{marginRight: 10}}/>
        </TouchableOpacity>
      ),
      // headerRight: () => (
      //   <View style={Object.assign({}, styles.chatButton, { marginRight: 15 })}>
      //     <Image
      //       source={{ uri: catImageUrl }}
      //       style={{
      //         width: 40,
      //         height: 40,
      //         borderTopLeftRadius: 28,
      //         borderTopRightRadius: 28,
      //       }}
      //     />
      //   </View>
      // ),
      headerTitle: (props) => <LogoTitle />,
      headerStyle: { height: 100 },
      headerTitleContainerStyle: { paddingBottom: 10 },
      headerLeftContainerStyle: { paddingBottom: 10 },
      headerRightContainerStyle: { paddingBottom: 10 },
    });
  }, [navigation]);
  function getUserB(user, contacts) {
    const userContact = contacts.find((c) => c.email === user.email);
    if (userContact && userContact.contactName) {
      return { ...user, contactName: userContact.contactName };
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
