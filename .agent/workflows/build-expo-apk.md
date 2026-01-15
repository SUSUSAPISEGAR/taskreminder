---
description: Langkah build APK untuk Expo React Native project
---

# Build APK Expo

## Prerequisites
- Node.js installed
- EAS CLI (`npm install -g eas-cli`)
- Expo account (gratis di expo.dev)

## Steps

// turbo
1. Login ke EAS
```bash
eas login
```

// turbo
2. Configure EAS build
```bash
eas build:configure
```

// turbo
3. Build APK (preview profile)
```bash
eas build -p android --profile preview
```

4. Download APK dari link yang diberikan setelah build selesai

## Alternative: Local Build

Jika tidak mau pakai EAS cloud:

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK akan ada di `android/app/build/outputs/apk/release/`

## Notes
- Build di cloud EAS gratis tapi antri
- Local build butuh Android SDK + Java
