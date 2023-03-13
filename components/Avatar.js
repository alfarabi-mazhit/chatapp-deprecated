import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import { storage } from "../config/firebase";
import { ref, getDownloadURL } from "firebase/storage";

export default function Avatar({ size, user }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    (async () => {
      const downloadUrl = await getDownloadURL(
        ref(
          storage,
          `images/users/${user.userDoc?.uid || user.uid}/profilePicture.jpeg`
        )
      );
      setImageUrl(downloadUrl);
    })();
  }, [user]);

  return (
    <Image
      style={{
        width: size,
        height: size,
        borderRadius: size,
      }}
      source={imageUrl ? { uri: imageUrl } : require("../assets/icon.png")}
      resizeMode="cover"
    />
  );
}
