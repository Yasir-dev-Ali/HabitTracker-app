// import { HeaderShownContext } from "@react-navigation/elements";
// import { Stack, useRouter, useSegments } from "expo-router";
// import React, { useEffect, useState } from "react";

// function RootGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const segments = useSegments();
//   const [isReady, setIsReady] = useState(false);

//   const isAuth = false; // replace with real auth state

//   useEffect(() => {
//     const inAuthRoute = segments[0] === "Auth";

//     if (!isAuth && !inAuthRoute) {
//       router.replace("/Auth");
//     }

//     setIsReady(true);
//   }, [isAuth, segments]);

//   if (!isReady) return null;

//   return <>{children}</>;
// }

// export default function RootLayout() {
//   return (
    
//     <RootGuard>
//       <Stack >
//         <Stack.Screen name="(tabs)" options={{headerShown:false}} />
        
//       </Stack>
//     </RootGuard>
//   );
// }

// app/_layout.tsx

// import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
// import { useEffect, useState } from "react";

// function RootGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const segments = useSegments();
//   const rootNavigationState = useRootNavigationState(); // ✅ Check this
//   const [isMounted, setIsMounted] = useState(false);

//   const isAuth = false;

//   useEffect(() => {
//     // ✅ Wait for navigator to be ready
//     if (!rootNavigationState?.key) return;

//     const inAuthRoute = segments[0] === "Auth";

//     if (!isAuth && !inAuthRoute) {
//       router.replace("/Auth");
//     }
    
//     setIsMounted(true);
//   }, [isAuth, segments, rootNavigationState?.key]); // ✅ Depend on key

//   // Show nothing until navigation is ready and check is done
//   if (!rootNavigationState?.key || !isMounted) return null;

//   return <>{children}</>;
// }

// export default function RootLayout() {
//   return (
//     <RootGuard>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
//       </Stack>
//     </RootGuard>
//   );
// }

// app/_layout.tsx
import { AuthProvider } from "@/lib/auth-context";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";

function RootGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const isAuth = false; // Replace with real auth state

  useEffect(() => {
    // ✅ CRITICAL: Check if navigation is ready using the key
    if (!rootNavigationState?.key) {
      return; // Don't navigate yet - navigator not mounted
    }

    // Now it's safe to navigate
    if (!isNavigationReady) {
      setIsNavigationReady(true);
      return;
    }

    const inAuthRoute = segments[0] === "Auth";

    if (!isAuth && !inAuthRoute) {
      router.replace("/Auth");
    } else if (isAuth && inAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [isAuth, segments, rootNavigationState?.key, isNavigationReady]);

  // Show nothing or loading until navigation is ready
  if (!rootNavigationState?.key) {
    return null; // Or return <LoadingScreen />
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
    <RootGuard>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Auth" options={{ headerShown: false }} />
      </Stack>
    </RootGuard>
    </AuthProvider>
  );
}