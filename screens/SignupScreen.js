// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { connect } from 'react-redux';
// import { signUpWithEmail } from '../redux/ActionCreators';

// function SignupScreen({ navigation, auth, signUpWithEmail }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   return (
//     <View style={styles.root}>
//       <Text style={styles.title}>Sign Up</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         placeholderTextColor="#A39AD5"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         placeholderTextColor="#A39AD5"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       {!!auth.errMess && <Text style={styles.err}>{auth.errMess}</Text>}
//       {auth.isLoading && <Text style={styles.info}>Loading...</Text>}

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={() => signUpWithEmail(email.trim(), password)}
//       >
//         <Text style={styles.btnText}>Create Account</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.link}>Back to login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const mapStateToProps = (state) => ({ auth: state.auth });
// export default connect(mapStateToProps, { signUpWithEmail })(SignupScreen);

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: '#120A2A', padding: 20, justifyContent: 'center' },
//   title: { color: 'white', fontSize: 26, fontWeight: '800', marginBottom: 20 },
//   input: {
//     backgroundColor: '#251C51',
//     color: 'white',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     marginBottom: 12,
//   },
//   btn: { backgroundColor: '#5B4AE6', padding: 14, borderRadius: 14, marginTop: 6 },
//   btnText: { color: 'white', textAlign: 'center', fontWeight: '800' },
//   link: { color: '#A39AD5', marginTop: 14, textAlign: 'center' },
//   err: { color: '#FFB4B4', marginTop: 6, marginBottom: 6 },
//   info: { color: '#A39AD5', marginBottom: 6 },
// });
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { signUpWithEmail } from '../redux/ActionCreators';

function SignupScreen({ navigation, auth, signUpWithEmail }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.length > 0 && password.length >= 6 && !auth.isLoading;
  }, [email, password, auth.isLoading]);

  const onSubmit = () => {
    const e = email.trim();
    if (!e || password.length < 6) return;
    signUpWithEmail(e, password);
  };

  return (
    <ImageBackground
      source={require('../assets/night-sky.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.85}>
                <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>Use email to register</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#A39AD5" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A39AD5"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputRow}>
              <MaterialIcons name="lock" size={20} color="#A39AD5" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 chars)"
                placeholderTextColor="#A39AD5"
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPw((s) => !s)}
                style={styles.rightIconBtn}
                activeOpacity={0.8}
              >
                <MaterialIcons name={showPw ? 'visibility-off' : 'visibility'} size={20} color="#A39AD5" />
              </TouchableOpacity>
            </View>

            {!!auth.errMess && <Text style={styles.err}>{auth.errMess}</Text>}

            <TouchableOpacity
              style={[styles.btn, !canSubmit && styles.btnDisabled]}
              onPress={onSubmit}
              activeOpacity={0.9}
              disabled={!canSubmit}
            >
              {auth.isLoading ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator />
                  <Text style={styles.btnText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Text style={styles.link}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const mapStateToProps = (state) => ({ auth: state.auth });
export default connect(mapStateToProps, { signUpWithEmail })(SignupScreen);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1, justifyContent: 'center', paddingHorizontal: 18 },

  card: {
    backgroundColor: 'rgba(52, 37, 97, 0.92)',
    borderRadius: 26,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 10,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#251C51',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#A39AD5', marginTop: 4, fontSize: 12 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#251C51',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  rightIconBtn: { padding: 4, marginLeft: 8 },

  err: { color: '#FFB4B4', marginTop: 2, marginBottom: 8 },

  btn: {
    backgroundColor: '#5B4AE6',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '900' },
  btnRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },

  link: { color: '#A39AD5', marginTop: 14, textAlign: 'center', fontWeight: '700' },
});
