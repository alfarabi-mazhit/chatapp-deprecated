import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text, View, StyleSheet, Image } from "react-native";
import "dayjs/locale/kk";
import { Ionicons } from "@expo/vector-icons";
import { pickImg, uploadImage } from "../components/utils";
import {
  GiftedChat,
  Send,
  Bubble,
  Time,
  Actions,
} from "react-native-gifted-chat";
import { 
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import { HeaderBackButton } from "@react-navigation/elements";
import { auth, database } from "../config/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import Avatar from "../components/Avatar";
import ImageView from "react-native-image-viewing";
const randomId = nanoid();
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = auth;
  const room = route.params.room;
  const userB = route.params.user;
  const roomId = room ? room.id : randomId;
  const roomRef = doc(database, "rooms", roomId);
  const roomMessagesRef = collection(database, "rooms", roomId, "messages");
  const [modalVisible,setModalVisible] = useState(false);
  const [selectedImageView,setSeletedImageView] = useState("");
  useEffect(() => {
    (async () => {
      if (!room) {
        const currentUserData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
        };
        if (currentUser.photoURL) {
          currentUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          uid: userB.userDoc.uid,
          displayName: userB.userDoc.displayName,
          email: userB.userDoc.email,
        };
        if (userB.userDoc.photoURL) {
          userBData.photoURL = userB.userDoc.photoURL;
        }
        const roomData = {
          participants: [currentUserData, userBData],
          participantsArray: [currentUser.email, userB.email],
        };
        try {
          console.log(roomRef);
          console.log(roomData);
          await setDoc(roomRef, roomData);
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, []);
  const Title = () => {
    return (
      <View
        style={Object.assign({}, styles.chatButton, styles.headerChatButton)}
      >
        <View>
          <Avatar size={40} user={route.params.user} />
        </View>
        <View
          style={{
            marginLeft: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>
            {route.params.user.contactName || route.params.user.displayName}
          </Text>
        </View>
      </View>
    );
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => Title(),
      headerBackTitleVisible: false,
      headerLeft: (props) => (
        <View
          style={Object.assign(
            { width: 50, alignItems: "center", marginLeft: 5, paddingLeft: 10 },
            styles.chatButton
          )}
        >
          <HeaderBackButton
            {...props}
            tintColor="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>
      ),
      headerStyle: { height: 100 },
      headerTitleContainerStyle: { paddingBottom: 10 },
      headerLeftContainerStyle: { paddingBottom: 10 },
      headerRightContainerStyle: { paddingBottom: 10 },
    });
  }, [navigation]);

  useEffect(() => {
    const q = query(roomMessagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }))
      );
    });
    return unsubscribe;
  }, []);

  const onSend = useCallback(async (messagess = []) => {
    const { _id, createdAt, text, user } = messagess[0];
    await Promise.all([
      addDoc(roomMessagesRef, {
        _id,
        createdAt,
        text,
        user,
      }),
      updateDoc(roomRef, { lastMessage: messagess[0] }),
    ])
      .catch((e) => alert("Ошибка отправки..." + e))
      .then(
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messagess)
        )
      );
  }, []);

  function renderSend(props) {
    return (
      <Send {...props}>
        <View
          style={{
            marginBottom: 2,
            marginRight: 20,
            marginLeft: 35,
            borderRadius: 100,
            borderColor: "transparent",
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "#f57c00",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            Отправить
          </Text>
        </View>
      </Send>
    );
  }
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f57c00",
          },
        }}
        textStyle={{
          left: {
            color: "#fff",
          },
        }}
      />
    );
  }
  function renderTime(props) {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: {
            color: "#fff",
          },
          right: {
            color: "#fff",
          },
        }}
      />
    );
  }
  async function sendImage(uri) {
    const { url, fileName } = await uploadImage(
      uri,
      `images/rooms/${roomId}`
    );
    const message = {
      _id: fileName,
      text: "",
      createdAt: new Date(),
      user: {
        name: auth?.currentUser?.displayName,
        _id: auth?.currentUser?.email,
        avatar: auth?.currentUser?.photoURL ? auth.currentUser.photoURL : "",
      },
      image: url,
    };
    const lastMessage = { ...message, text: "Image" };
    await Promise.all([
      addDoc(roomMessagesRef, message),
      updateDoc(roomRef, { lastMessage }),
    ]);
  }
  async function handlePhotoPicker() {
    const result = await pickImg();
    if (!result.canceled) {
      await sendImage(result.assets[0].uri);
    }
  }
  function renderActions(props) {
    return (
      <Actions
        {...props}
        containerStyle={{
          position: "absolute",
          right: 125,
          bottom: 0,
          zIndex: 9999,
        }}
        onPressActionButton={handlePhotoPicker}
        icon={() => <Ionicons name="camera" size={27} />}
      />
    );
  }
  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      alwaysShowSend
      locale="kk"
      renderSend={renderSend}
      renderBubble={renderBubble}
      renderActions={renderActions}
      renderTime={renderTime}
      renderMessageImage={(props) => {
        return (
          <View style={{ borderRadius: 15, padding: 2 }}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setSeletedImageView(props.currentMessage.image);
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: 200,
                  height: 200,
                  padding: 6,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={{ uri: props.currentMessage.image }}
              />
              {selectedImageView ? (
                <ImageView
                  imageIndex={0}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                  images={[{ uri: selectedImageView }]}
                />
              ) : null}
            </TouchableOpacity>
          </View>
        );
      }}
      timeFormat="LT"
      dateFormat="LLLL"
      onSend={(messages) => {
        if (messages.length) {
          onSend(messages);
        }
      }}
      messagesContainerStyle={{
        backgroundColor: "#fff",
      }}
      textInputStyle={{
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
      user={{
        name: auth?.currentUser?.displayName,
        _id: auth?.currentUser?.email,
        avatar: auth?.currentUser?.photoURL ? auth?.currentUser?.photoURL : "",
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerChatButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: 5,
  },
  chatButton: {
    backgroundColor: "#f57c00",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    shadowColor: "#f57c00",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
