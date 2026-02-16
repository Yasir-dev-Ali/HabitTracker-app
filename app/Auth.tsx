import { 
  KeyboardAvoidingView, 
  Platform, 
  View, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  Alert 
} from "react-native";
import { 
  Text, 
  TextInput, 
  Button, 
  Surface,
  Divider,
  IconButton,
  useTheme,
  HelperText
} from "react-native-paper";
import { useState } from "react";
import { useAuth } from "../lib/auth-context"; // Adjust path as needed
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(""); // Added for signup
  
  // UI states
  const [isSignUp, setIsSignUp] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (isSignUp) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    let result: string | null;
    
    if (isSignUp) {
      result = await signUp(email, password, name);
    } else {
      result = await signIn(email, password);
    }
    
    if (result) {
      Alert.alert("Error", result);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    // Clear form when switching
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setErrors({});
    setSecureText(true);
    setSecureConfirmText(true);
  };

  const isFormValid = isSignUp 
    ? email && password && confirmPassword && name && password === confirmPassword
    : email && password;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <Surface style={styles.headerSurface} elevation={0}>
          <View style={styles.iconContainer}>
            <IconButton
              icon={isSignUp ? "account-plus" : "account-check"}
              size={50}
              iconColor={theme.colors.primary}
              style={styles.avatarIcon}
            />
          </View>
          
          <Text variant="headlineMedium" style={styles.title}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {isSignUp 
              ? "Join us today and get started" 
              : "Sign in to continue your journey"}
          </Text>
        </Surface>

        {/* Form Section */}
        <Surface style={styles.formCard} elevation={2}>
          {/* Name field - only for Sign Up */}
          {isSignUp && (
            <View>
              <TextInput
                mode="outlined"
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                error={!!errors.name}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
            </View>
          )}

          <TextInput
            mode="outlined"
            label="Email"
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            error={!!errors.email}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={secureText ? "eye-off" : "eye"} 
                onPress={() => setSecureText(!secureText)}
              />
            }
            style={styles.input}
            outlineStyle={styles.inputOutline}
            error={!!errors.password}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          {/* Confirm Password - only for Sign Up */}
          {isSignUp && (
            <View>
              <TextInput
                mode="outlined"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirmText}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon 
                    icon={secureConfirmText ? "eye-off" : "eye"} 
                    onPress={() => setSecureConfirmText(!secureConfirmText)}
                  />
                }
                style={styles.input}
                outlineStyle={styles.inputOutline}
                error={!!errors.confirmPassword}
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            </View>
          )}

          {/* Forgot Password - only for Sign In */}
          {!isSignUp && (
            <Text 
              style={[styles.forgotPassword, { color: theme.colors.primary }]}
              onPress={() => console.log("Forgot password")}
            >
              Forgot Password?
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || !isFormValid}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={isSignUp ? "account-plus" : "login"}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>

          {isSignUp && (
            <View style={styles.termsContainer}>
              <Text variant="bodySmall" style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={[styles.link, { color: theme.colors.primary }]}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text style={[styles.link, { color: theme.colors.primary }]}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          )}
        </Surface>

        {/* Social Login Section */}
        <View style={styles.socialSection}>
          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.orText}>
            Or continue with
          </Text>
          <Divider style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
          <Button
            mode="outlined"
            onPress={() => handleSocialLogin("google")}
            style={styles.socialButton}
            icon="google"
            textColor="#DB4437"
          >
            Google
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleSocialLogin("apple")}
            style={styles.socialButton}
            icon="apple"
            textColor="#000000"
          >
            Apple
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodyMedium">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <Text
              style={[styles.link, { color: theme.colors.primary }]}
              onPress={switchMode}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerSurface: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  iconContainer: {
    marginBottom: 16,
  },
  avatarIcon: {
    margin: 0,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    opacity: 0.7,
    textAlign: "center",
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#ffffff",
  },
  inputOutline: {
    borderRadius: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    height: 50,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  termsContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  termsText: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 20,
  },
  link: {
    fontWeight: "600",
  },
  socialSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 10,
    opacity: 0.6,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingVertical: 20,
  },
});