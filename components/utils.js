import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export async function pickImg() {
  askForCameraPermission();
  let result = ImagePicker.launchCameraAsync();
  return result;
}
export async function askForMediaLibPermission() {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("status medialib", status);
    return status;
  } catch (error) {
    console.log("error", error);
  }
}
export async function askForCameraPermission() {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log("status camera", status);
    return status;
  } catch (error) {
    console.log("error", error);
  }
}
export async function uploadImage(uri, path, fName) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
  const fileName = fName || nanoid();
  const imageRef = ref(storage, `${path}/${fileName}.jpeg`);

  const snapshot = await uploadBytes(imageRef, blob, {
    contentType: "image/jpeg",
  });
  blob.close();
  const url = await getDownloadURL(snapshot.ref);
  return { url, fileName };
}
