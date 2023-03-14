# ChatApp


# node_modules/.../MessageContainer.js

this.attachKeyboardListeners = () => {
    const { invertibleScrollViewProps: invertibleProps } = this.props;
    if (invertibleProps) {
-        Keyboard.addListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);
-        Keyboard.addListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);
-        Keyboard.addListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);
-        Keyboard.addListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);
+        this.willShowSub = Keyboard.addListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);
+        this.didShowSub = Keyboard.addListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);
+        this.willHideSub = Keyboard.addListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);
+        this.didHideSub = Keyboard.addListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);
    }
};
this.detachKeyboardListeners = () => {
    const { invertibleScrollViewProps: invertibleProps } = this.props;
-    Keyboard.removeListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);
-    Keyboard.removeListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);
-    Keyboard.removeListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);
-    Keyboard.removeListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);
+    this.willShowSub?.remove();
+    this.didShowSub?.remove();
+    this.willHideSub?.remove();
+    this.didHideSub?.remove();
};
