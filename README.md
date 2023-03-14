# ChatApp




# node_modules/.../MessageContainer.js
this.attachKeyboardListeners = () => {
    const { invertibleScrollViewProps: invertibleProps } = this.props;
if (invertibleProps) {

(delete)Keyboard.addListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);

(delete)Keyboard.addListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);

(delete)Keyboard.addListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);

(delete)Keyboard.addListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);


(add)this.willShowSub = Keyboard.addListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);

(add)this.didShowSub = Keyboard.addListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);

(add)this.willHideSub = Keyboard.addListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);

(add)this.didHideSub = Keyboard.addListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);

    }

};
this.detachKeyboardListeners = () => {
    const { invertibleScrollViewProps: invertibleProps } = this.props;
(delete)Keyboard.removeListener('keyboardWillShow', invertibleProps.onKeyboardWillShow);

(delete)Keyboard.removeListener('keyboardDidShow', invertibleProps.onKeyboardDidShow);

(delete)Keyboard.removeListener('keyboardWillHide', invertibleProps.onKeyboardWillHide);

(delete)Keyboard.removeListener('keyboardDidHide', invertibleProps.onKeyboardDidHide);

(add)this.willShowSub?.remove();

(add)this.didShowSub?.remove();

(add)this.willHideSub?.remove();

(add)this.didHideSub?.remove();

};

